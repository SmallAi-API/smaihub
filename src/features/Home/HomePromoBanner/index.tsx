import { ModelIcon } from '@lobehub/icons';
import { Button } from '@lobehub/ui/base-ui';
import { App } from 'antd';
import { createStaticStyles } from 'antd-style';
import { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useBusinessModelModeConfig } from '@/business/client/hooks/useBusinessAgentMode';
import { useResolvedHomeAgentId } from '@/features/Home/AgentSelect/useResolvedHomeAgentId';
import { useStarterModelDefaults } from '@/features/Home/NewModelShortcuts/useStarterModelDefaults';
import { usePermission } from '@/hooks/usePermission';
import { agentService } from '@/services/agent';
import { useAgentStore } from '@/store/agent';

const styles = createStaticStyles(({ css, cssVar }) => ({
  promo: css`
    display: flex;
    gap: 10px;
    align-items: center;
    min-height: 30px;
  `,
  cta: css`
    flex: none;

    height: 30px;
    padding-inline: 12px;
    border: 0;
    border-radius: ${cssVar.borderRadiusLG};

    font-size: 13px;
    font-weight: 600;
    color: ${cssVar.colorPrimary};

    background: ${cssVar.colorBgContainer};
    box-shadow: none;

    &:hover {
      color: ${cssVar.colorPrimaryHover} !important;
      background: ${cssVar.colorBgContainer} !important;
    }
  `,
  icon: css`
    flex: none;
    color: ${cssVar.colorPrimary};
  `,
  label: css`
    overflow: hidden;
    flex: 1;

    min-width: 0;

    font-size: 14px;
    line-height: 22px;
    color: ${cssVar.colorTextSecondary};
    text-overflow: ellipsis;
    white-space: nowrap;
  `,
}));

/**
 * Model announcement rendered in place of the Home greeting subtitle.
 *
 * The call-to-action uses the same model-selection path as the chat model
 * switcher, so it respects workspace member overrides and agent permissions.
 */
const HomePromoBanner = memo(() => {
  const { t } = useTranslation('home');
  const { message } = App.useApp();
  const { agentId } = useResolvedHomeAgentId();
  const { allowed: canCreateContent } = usePermission('create_content');
  const updateAgentConfigById = useAgentStore((state) => state.updateAgentConfigById);
  const { defaultHomeNewModels, fallbackChatProvider } = useStarterModelDefaults();
  const applyBusinessModelModeConfig = useBusinessModelModeConfig();
  const [loading, setLoading] = useState(false);

  const model = defaultHomeNewModels.find((item) => item.model === 'gpt-6-astra');
  const provider = model?.provider ?? fallbackChatProvider;

  const handleTryNow = useCallback(async () => {
    if (!model || !agentId || !canCreateContent || loading) return;

    setLoading(true);
    try {
      const agentState = useAgentStore.getState();
      if (!agentState.agentMap[agentId]) {
        const config = await agentService.getAgentConfigById(agentId);
        if (config) agentState.internal_dispatchAgentMap(agentId, config);
      }

      await updateAgentConfigById(
        agentId,
        applyBusinessModelModeConfig({ model: model.model, provider }),
        { rethrow: true },
      );
      message.success(t('homePromoBanner.success'));
    } catch {
      message.error(t('homePromoBanner.error'));
    } finally {
      setLoading(false);
    }
  }, [
    agentId,
    applyBusinessModelModeConfig,
    canCreateContent,
    loading,
    message,
    model,
    provider,
    t,
    updateAgentConfigById,
  ]);

  if (!canCreateContent || !agentId || !model) return null;

  return (
    <span className={styles.promo} data-testid={'home-promo-banner'}>
      <ModelIcon className={styles.icon} model={model.model} size={22} />
      <span className={styles.label}>{t('homePromoBanner.label', { model: model.title })}</span>
      <Button
        className={styles.cta}
        disabled={loading}
        loading={loading}
        type={'text'}
        onClick={handleTryNow}
      >
        {t('homePromoBanner.cta')}
      </Button>
    </span>
  );
});

HomePromoBanner.displayName = 'HomePromoBanner';

export default HomePromoBanner;
