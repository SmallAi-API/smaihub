'use client';

import { Block, Button, Flexbox, Tag, Text } from '@lobehub/ui';
import { createStaticStyles } from 'antd-style';
import { Check, ExternalLink } from 'lucide-react';
import { type FC, memo, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { message } from '@/components/AntdStaticMethods';
import { FormPassword } from '@/components/FormInput';
import { useUserStore } from '@/store/user';
import { keyVaultsConfigSelectors } from '@/store/user/selectors';

const KLAVIS_PROVIDER = 'klavis';
const KLAVIS_KEY_URL = 'https://www.klavis.ai/home/api-keys';
const KLAVIS_LOGO_URL =
  'https://www.klavis.ai/_next/image?url=%2Fimages%2Ffavicon%2Ffavicon.ico&w=32&q=75';

const styles = createStaticStyles(({ css, cssVar }) => ({
  container: css`
    padding: 16px;
    border-radius: 12px;
  `,
  iconWrap: css`
    overflow: hidden;
    flex-shrink: 0;

    width: 32px;
    height: 32px;
    border-radius: 8px;
  `,
  logo: css`
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
  `,
  link: css`
    color: ${cssVar.colorTextSecondary};

    &:hover {
      color: ${cssVar.colorPrimary};
    }
  `,
  title: css`
    font-size: 15px;
    font-weight: 600;
    color: ${cssVar.colorText};
  `,
}));

const KlavisKeyCard: FC = memo(() => {
  const { t } = useTranslation('setting');

  const storedKey = useUserStore(
    (s) => keyVaultsConfigSelectors.getVaultByProvider(KLAVIS_PROVIDER)(s)?.apiKey,
  );
  const updateKeyVaultConfig = useUserStore((s) => s.updateKeyVaultConfig);

  const [draft, setDraft] = useState(storedKey ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraft(storedKey ?? '');
  }, [storedKey]);

  const isConfigured = Boolean(storedKey);
  const isDirty = draft.trim() !== (storedKey ?? '');

  const handleSave = async () => {
    const trimmed = draft.trim();
    setSaving(true);
    try {
      await updateKeyVaultConfig(KLAVIS_PROVIDER, { apiKey: trimmed || undefined });
      message.success(t('klavis.apiKey.saved'));
    } catch (error) {
      message.error(error instanceof Error ? error.message : String(error));
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    setSaving(true);
    try {
      await updateKeyVaultConfig(KLAVIS_PROVIDER, { apiKey: undefined });
      setDraft('');
      message.success(t('klavis.apiKey.cleared'));
    } catch (error) {
      message.error(error instanceof Error ? error.message : String(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Block className={styles.container} variant={'outlined'}>
      <Flexbox gap={16}>
        <Flexbox horizontal align={'center'} gap={12}>
          <div className={styles.iconWrap}>
            <img alt="Klavis" className={styles.logo} src={KLAVIS_LOGO_URL} />
          </div>
          <Flexbox flex={1} gap={2}>
            <Flexbox horizontal align={'center'} gap={8}>
              <span className={styles.title}>{t('klavis.apiKey.title')}</span>
              {isConfigured ? (
                <Tag color={'success'} icon={<Check size={12} />}>
                  {t('klavis.apiKey.configured')}
                </Tag>
              ) : (
                <Tag color={'warning'}>{t('klavis.apiKey.notConfigured')}</Tag>
              )}
            </Flexbox>
            <Text fontSize={12} type={'secondary'}>
              {t('klavis.apiKey.description')}
            </Text>
          </Flexbox>
        </Flexbox>

        <FormPassword
          autoComplete={'new-password'}
          disabled={saving}
          placeholder={t('klavis.apiKey.placeholder')}
          value={draft}
          onChange={(value) => setDraft(value)}
        />

        <Flexbox horizontal align={'center'} gap={8} justify={'space-between'}>
          <Text className={styles.link} fontSize={12}>
            <Trans i18nKey={'klavis.apiKey.getKey'} ns={'setting'}>
              Don&apos;t have a Klavis key yet?
              <a href={KLAVIS_KEY_URL} rel={'noreferrer'} target={'_blank'}>
                Get one at klavis.ai <ExternalLink size={12} />
              </a>
              .
            </Trans>
          </Text>
          <Flexbox horizontal gap={8}>
            {isConfigured && (
              <Button danger disabled={saving} size={'small'} onClick={handleClear}>
                {t('klavis.apiKey.clear')}
              </Button>
            )}
            <Button
              disabled={!isDirty}
              loading={saving}
              size={'small'}
              type={'primary'}
              onClick={handleSave}
            >
              {t('klavis.apiKey.save')}
            </Button>
          </Flexbox>
        </Flexbox>
      </Flexbox>
    </Block>
  );
});

KlavisKeyCard.displayName = 'KlavisKeyCard';

export default KlavisKeyCard;
