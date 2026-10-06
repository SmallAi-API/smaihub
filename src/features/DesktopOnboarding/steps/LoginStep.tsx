'use client';

import { type AuthorizationPhase, type AuthorizationProgress } from '@lobechat/electron-client-ipc';
import { useWatchBroadcast } from '@lobechat/electron-client-ipc';
import { Center, Flexbox } from '@lobehub/ui';
import { Alert, Button, Text } from '@lobehub/ui/base-ui';
import { cssVar } from 'antd-style';
import { Cloud, LogOutIcon, Undo2Icon } from 'lucide-react';
import { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import urlJoin from 'url-join';

import { OFFICIAL_SITE } from '@/const/url';
import { isDesktop } from '@/const/version';
import UserInfo from '@/features/User/UserInfo';
import { useSignOut } from '@/hooks/useSignOut';
import { remoteServerService } from '@/services/electron/remoteServer';
import { electronSystemService } from '@/services/electron/system';
import { useElectronStore } from '@/store/electron';
import { setDesktopAutoOidcFirstOpenHandled } from '@/utils/electron/autoOidc';

import LobeMessage from '../components/LobeMessage';

const LEGACY_LOCAL_DB_MIGRATION_GUIDE_URL = urlJoin(
  OFFICIAL_SITE,
  '/docs/usage/migrate-from-local-database',
);

// Cloud is the only way to sign in. `selfhost` only describes an already-stored
// legacy connection, so existing users still get a truthful status screen.
type LoginMethod = 'cloud' | 'selfhost';

// 登录状态类型
type LoginStatus = 'idle' | 'loading' | 'success' | 'error';

const authorizationPhaseI18nKeyMap: Record<AuthorizationPhase, string> = {
  browser_opened: 'screen5.auth.phase.browserOpened',
  cancelled: 'screen5.actions.cancel',
  verifying: 'screen5.auth.phase.verifying',
  waiting_for_auth: 'screen5.auth.phase.waitingForAuth',
};

// `status` hosts render this step as a connection panel for already-signed-in users,
// where the wizard's "back" and "next" have no meaning.
type LoginStepMode = 'onboarding' | 'status';

interface LoginStepProps {
  mode?: LoginStepMode;
  onBack: () => void;
  onNext: () => void;
}

const LoginStep = memo<LoginStepProps>(({ mode = 'onboarding', onBack, onNext }) => {
  const { t } = useTranslation('desktop-onboarding');
  const [cloudLoginStatus, setCloudLoginStatus] = useState<LoginStatus>('idle');
  const [authProgress, setAuthProgress] = useState<AuthorizationProgress | null>(null);
  const [isCloudAuthPending, setIsCloudAuthPending] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [remoteError, setRemoteError] = useState<string | null>(null);
  const [hasLegacyLocalDb, setHasLegacyLocalDb] = useState(false);
  const [localRemainingSeconds, setLocalRemainingSeconds] = useState<number | null>(null);

  const [
    dataSyncConfig,
    isConnectingServer,
    remoteServerSyncError,
    useDataSyncConfig,
    connectRemoteServer,
    refreshServerConfig,
    clearRemoteServerSyncError,
  ] = useElectronStore((s) => [
    s.dataSyncConfig,
    s.isConnectingServer,
    s.remoteServerSyncError,
    s.useDataSyncConfig,
    s.connectRemoteServer,
    s.refreshServerConfig,
    s.clearRemoteServerSyncError,
  ]);

  const signOut = useSignOut();

  useDataSyncConfig();

  useEffect(() => {
    if (!isDesktop) return;

    let mounted = true;
    electronSystemService
      .hasLegacyLocalDb()
      .then((value) => {
        if (mounted) setHasLegacyLocalDb(value);
      })
      .catch(() => undefined);

    return () => {
      mounted = false;
    };
  }, []);

  const isCloudAuthed = !!dataSyncConfig?.active && dataSyncConfig.storageMode === 'cloud';
  // A pre-existing self-host connection is still reported honestly, but it can no
  // longer be created from here.
  const isSelfHostAuthed = !!dataSyncConfig?.active && dataSyncConfig.storageMode === 'selfHost';
  const authorizedLoginMethod: LoginMethod | null = isCloudAuthed
    ? 'cloud'
    : isSelfHostAuthed
      ? 'selfhost'
      : null;

  const successLoginMethod: LoginMethod | null =
    cloudLoginStatus === 'success'
      ? 'cloud'
      : cloudLoginStatus === 'idle' && !isCloudAuthPending
        ? authorizedLoginMethod
        : null;

  // Determine if user can proceed
  const canStart = () => {
    return !!successLoginMethod;
  };

  // 处理云端登录
  const handleCloudLogin = async () => {
    if (!isDesktop) {
      setRemoteError(t('screen5.errors.desktopOnlyOidc'));
      setCloudLoginStatus('error');
      return;
    }

    setRemoteError(null);
    clearRemoteServerSyncError();
    setIsCloudAuthPending(true);
    setCloudLoginStatus('loading');
    setDesktopAutoOidcFirstOpenHandled();
    await connectRemoteServer({
      remoteServerUrl: dataSyncConfig?.remoteServerUrl,
      storageMode: 'cloud',
    });
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
    } finally {
      setIsSigningOut(false);
    }
  };

  // Sync local UI status with real remote config
  useEffect(() => {
    if (!isCloudAuthed && !isSelfHostAuthed) return;
    setCloudLoginStatus(isCloudAuthed ? 'success' : 'idle');
    setIsCloudAuthPending(false);
  }, [isCloudAuthed, isSelfHostAuthed]);

  // Surface requestAuthorization errors reported via store
  useEffect(() => {
    const message = remoteServerSyncError?.message;
    if (!message) return;
    setRemoteError(message);
    setIsCloudAuthPending(false);
    if (cloudLoginStatus === 'loading') setCloudLoginStatus('error');
  }, [remoteServerSyncError?.message, cloudLoginStatus]);

  // Watch broadcasts from main process (polling result)
  useWatchBroadcast('authorizationSuccessful', async () => {
    setRemoteError(null);
    clearRemoteServerSyncError();
    setAuthProgress(null);
    if (isCloudAuthPending) setCloudLoginStatus('success');
    setIsCloudAuthPending(false);
    await refreshServerConfig();
  });

  useWatchBroadcast('authorizationFailed', ({ error }) => {
    setRemoteError(error);
    setAuthProgress(null);
    setIsCloudAuthPending(false);
    if (cloudLoginStatus === 'loading') setCloudLoginStatus('error');
  });

  useWatchBroadcast('authorizationProgress', (progress) => {
    setAuthProgress(progress);
    if (progress.phase === 'cancelled') {
      setCloudLoginStatus('idle');
      setIsCloudAuthPending(false);
      setAuthProgress(null);
    }
  });

  // Sync local countdown from authProgress
  useEffect(() => {
    if (authProgress) {
      const seconds = Math.max(
        0,
        Math.ceil((authProgress.maxPollTime - authProgress.elapsed) / 1000),
      );
      setLocalRemainingSeconds(seconds);
    } else {
      setLocalRemainingSeconds(null);
    }
  }, [authProgress]);

  // Decrement local countdown every second for smooth UI updates
  useEffect(() => {
    if (localRemainingSeconds === null || localRemainingSeconds <= 0) return;

    const timer = setTimeout(() => {
      setLocalRemainingSeconds((prev) => {
        if (prev === null || prev <= 0) return prev;
        return prev - 1;
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [localRemainingSeconds]);

  const handleCancelAuth = async () => {
    setRemoteError(null);
    clearRemoteServerSyncError();

    setCloudLoginStatus('idle');
    setIsCloudAuthPending(false);
    setAuthProgress(null);
    await remoteServerService.cancelAuthorization();
  };

  const renderSuccessContent = (method: LoginMethod) => {
    const isStatusMode = mode === 'status';
    const serverUrl = dataSyncConfig?.remoteServerUrl;

    const title = isStatusMode
      ? [method === 'cloud' ? t('screen5.status.cloud.title') : t('screen5.status.selfhost.title')]
      : [t('screen5.title'), t('screen5.title2'), t('screen5.title3')];

    const description = !isStatusMode
      ? t('screen5.description')
      : method === 'selfhost' && serverUrl
        ? t('screen5.status.selfhost.description', { url: serverUrl })
        : t('screen5.status.description');

    return (
      <Center gap={32} style={{ height: '100%', minHeight: '100%' }}>
        <Flexbox align={'flex-start'} justify={'flex-start'} style={{ width: '100%' }}>
          <LobeMessage sentences={title} />
          <Text as={'p'}>{description}</Text>
        </Flexbox>

        <Flexbox gap={16} style={{ width: '100%' }}>
          <UserInfo
            style={{
              background: cssVar.colorFillSecondary,
              borderRadius: 8,
            }}
          />
        </Flexbox>

        <Flexbox horizontal justify={'space-between'} style={{ marginTop: 32 }}>
          {isStatusMode ? (
            <Button
              disabled={isSigningOut}
              icon={LogOutIcon}
              style={{ color: cssVar.colorTextDescription }}
              type={'text'}
              onClick={handleSignOut}
            >
              {isSigningOut ? t('screen5.actions.signingOut') : t('screen5.actions.signOut')}
            </Button>
          ) : (
            <Button
              icon={Undo2Icon}
              style={{ color: cssVar.colorTextDescription }}
              type={'text'}
              onClick={onBack}
            >
              {t('back')}
            </Button>
          )}
          <Button type={'primary'} onClick={onNext}>
            {isStatusMode ? t('screen5.actions.done') : t('next')}
          </Button>
        </Flexbox>
      </Center>
    );
  };

  // Render Cloud login content
  const renderCloudContent = () => {
    if (cloudLoginStatus === 'error') {
      const errorMessage = remoteError?.toLowerCase().includes('timed out')
        ? t('screen5.errors.timedOut')
        : remoteError || t('authResult.failed.desc');

      return (
        <Flexbox gap={16} style={{ width: '100%' }}>
          <Alert
            description={errorMessage}
            title={t('authResult.failed.title')}
            type={'secondary'}
          />
          <Button
            block
            icon={Cloud}
            size={'large'}
            type={'primary'}
            onClick={() => setCloudLoginStatus('idle')}
          >
            {t('screen5.actions.tryAgain')}
          </Button>
        </Flexbox>
      );
    }

    if (cloudLoginStatus === 'loading') {
      const phaseText = t(authorizationPhaseI18nKeyMap[authProgress?.phase ?? 'browser_opened'], {
        defaultValue: t('screen5.actions.signingIn'),
      });

      return (
        <Flexbox gap={8} style={{ width: '100%' }}>
          <Button block disabled={true} icon={Cloud} loading={true} size={'large'} type={'primary'}>
            {t('screen5.actions.signingIn')}
          </Button>
          <Text style={{ color: cssVar.colorTextDescription }} type={'secondary'}>
            {phaseText}
          </Text>
          <Flexbox horizontal align={'center'} justify={'space-between'}>
            {localRemainingSeconds !== null ? (
              <Text style={{ color: cssVar.colorTextDescription }} type={'secondary'}>
                {t('screen5.auth.remaining', {
                  time: localRemainingSeconds,
                })}
              </Text>
            ) : (
              <div />
            )}
            <Button size={'small'} type={'text'} onClick={handleCancelAuth}>
              {t('screen5.actions.cancel')}
            </Button>
          </Flexbox>
        </Flexbox>
      );
    }

    return (
      <Button
        block
        disabled={isConnectingServer}
        icon={Cloud}
        loading={false}
        size={'large'}
        type={'primary'}
        onClick={handleCloudLogin}
      >
        {t('screen5.actions.signInCloud')}
      </Button>
    );
  };

  if (successLoginMethod) return renderSuccessContent(successLoginMethod);

  return (
    <Center gap={32} style={{ height: '100%', minHeight: '100%' }}>
      <Flexbox align={'flex-start'} justify={'flex-start'} style={{ width: '100%' }}>
        <LobeMessage sentences={[t('screen5.title'), t('screen5.title2'), t('screen5.title3')]} />
        <Text as={'p'}>{t('screen5.description')}</Text>
      </Flexbox>

      <Flexbox align={'flex-start'} gap={16} style={{ width: '100%' }} width={'100%'}>
        {renderCloudContent()}
        <Flexbox horizontal justify={'center'} style={{ width: '100%' }}>
          {hasLegacyLocalDb && (
            <Button
              style={{ padding: 0 }}
              type={'link'}
              onClick={() =>
                electronSystemService.openExternalLink(LEGACY_LOCAL_DB_MIGRATION_GUIDE_URL)
              }
            >
              {t('screen5.legacyLocalDb.link', 'Migrate legacy local database')}
            </Button>
          )}
        </Flexbox>
      </Flexbox>
      {canStart() && (
        <Flexbox horizontal justify={'space-between'} style={{ marginTop: 32 }}>
          <Button
            icon={Undo2Icon}
            style={{ color: cssVar.colorTextDescription }}
            type={'text'}
            onClick={onBack}
          >
            {t('back')}
          </Button>
          <Button type={'primary'} onClick={onNext}>
            {t('next')}
          </Button>
        </Flexbox>
      )}
    </Center>
  );
});

LoginStep.displayName = 'LoginStep';

export default LoginStep;
