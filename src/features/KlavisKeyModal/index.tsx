'use client';

import { Button, Flexbox, InputPassword, Modal, Text } from '@lobehub/ui';
import { memo, useEffect, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { message } from '@/components/AntdStaticMethods';
import { useToolStore } from '@/store/tool';
import { useUserStore } from '@/store/user';

const KLAVIS_PROVIDER = 'klavis';
const KLAVIS_KEY_URL = 'https://www.klavis.ai/home/api-keys';
const PLACEHOLDER_OAUTH_URL = 'about:blank';

const KlavisKeyModal = memo(() => {
  const { t } = useTranslation('setting');
  const open = useToolStore((s) => s.keyModalOpen);
  const closeModal = useToolStore((s) => s.closeKlavisKeyModal);
  const confirmKey = useToolStore((s) => s.confirmKlavisKey);
  const pollAuth = useToolStore((s) => s.pollKlavisAuthStatus);
  const updateKeyVaultConfig = useUserStore((s) => s.updateKeyVaultConfig);

  const [value, setValue] = useState('');
  const [saving, setSaving] = useState(false);
  const popupRef = useRef<Window | null>(null);

  useEffect(() => {
    if (!open) {
      setValue('');
      setSaving(false);
      if (popupRef.current && !popupRef.current.closed) popupRef.current.close();
      popupRef.current = null;
    }
  }, [open]);

  const handleSave = async () => {
    const trimmed = value.trim();
    if (!trimmed) {
      message.error(t('klavis.modal.empty'));
      return;
    }

    // Pre-open a popup synchronously inside the click handler so Chrome's
    // popup blocker treats the later OAuth navigation as user-initiated.
    // We immediately repoint it to OAuth once we have the URL; if creation
    // fails or no OAuth is needed, we close the placeholder.
    const popup = window.open(PLACEHOLDER_OAUTH_URL, '_blank', 'width=600,height=700');
    popupRef.current = popup;

    setSaving(true);
    try {
      await updateKeyVaultConfig(KLAVIS_PROVIDER, { apiKey: trimmed });
      const newServer = await confirmKey();

      if (!newServer) {
        // Creation failed (server-side error already toasted via store).
        if (popup && !popup.closed) popup.close();
        return;
      }

      if (newServer.isAuthenticated) {
        if (popup && !popup.closed) popup.close();
        return;
      }

      if (newServer.oauthUrl && popup && !popup.closed) {
        popup.location.href = newServer.oauthUrl;
        // Kick off background polling so the row flips to CONNECTED on its
        // own once the user finishes OAuth in the popup.
        void pollAuth(newServer.identifier);
      } else if (newServer.oauthUrl) {
        // Popup was blocked despite the synchronous open — last resort fallback.
        window.open(newServer.oauthUrl, '_blank', 'width=600,height=700');
        void pollAuth(newServer.identifier);
      }
    } catch (error) {
      if (popup && !popup.closed) popup.close();
      message.error(error instanceof Error ? error.message : String(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      centered
      destroyOnHidden
      footer={null}
      open={open}
      title={t('klavis.modal.title')}
      width={480}
      onCancel={closeModal}
    >
      <Flexbox gap={16} paddingBlock={8}>
        <Text type={'secondary'}>{t('klavis.modal.description')}</Text>
        <InputPassword
          autoFocus
          autoComplete={'new-password'}
          disabled={saving}
          placeholder={t('klavis.apiKey.placeholder')}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onPressEnter={handleSave}
        />
        <Text fontSize={12} type={'secondary'}>
          <Trans i18nKey={'klavis.apiKey.getKey'} ns={'setting'}>
            Don&apos;t have a Klavis key yet?
            <a href={KLAVIS_KEY_URL} rel={'noreferrer'} target={'_blank'}>
              Get one at klavis.ai
            </a>
            .
          </Trans>
        </Text>
        <Flexbox horizontal align={'center'} gap={8} justify={'space-between'}>
          <Link to={'/settings/creds'} onClick={closeModal}>
            {t('klavis.modal.openSettings')}
          </Link>
          <Flexbox horizontal gap={8}>
            <Button disabled={saving} onClick={closeModal}>
              {t('klavis.modal.cancel')}
            </Button>
            <Button loading={saving} type={'primary'} onClick={handleSave}>
              {t('klavis.modal.saveAndContinue')}
            </Button>
          </Flexbox>
        </Flexbox>
      </Flexbox>
    </Modal>
  );
});

KlavisKeyModal.displayName = 'KlavisKeyModal';

export default KlavisKeyModal;
