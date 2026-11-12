import { Button, toast } from '@lobehub/ui';
import { cssVar } from '@lobehub/ui/stylex/cssVar.stylex';
import * as stylex from '@stylexjs/stylex';
import { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useBusinessModelModeConfig } from '@/business/client/hooks/useBusinessAgentMode';
import { ModelIcon } from '@/components/LobeIcons';
import { useResolvedHomeAgentId } from '@/features/Home/AgentSelect/useResolvedHomeAgentId';
import { useStarterModelDefaults } from '@/features/Home/NewModelShortcuts/useStarterModelDefaults';
import { usePermission } from '@/hooks/usePermission';
import { agentService } from '@/services/agent';
import { useAgentStore } from '@/store/agent';

const styles = stylex.create({
  promo: {
    display: 'flex',
    gap: 10,
    alignItems: 'center',
    minHeight: 30,
  },
  cta: {
    flex: 'none',
    height: 30,
    paddingInline: 12,
    borderWidth: 0,
    borderStyle: 'none',
    borderColor: 'currentcolor',
    borderRadius: cssVar.borderRadiusLG,
    fontSize: 13,
    fontWeight: 600,
    color: {
      'default': cssVar.colorPrimary,
      ':hover': `${cssVar.colorPrimaryHover} !important`,
    },
    backgroundColor: {
      'default': cssVar.colorBgContainer,
      ':hover': `${cssVar.colorBgContainer} !important`,
    },
    backgroundImage: {
      'default': 'none',
      ':hover': 'none !important',
    },
    boxShadow: 'none',
  },
  icon: {
    flex: 'none',
    color: cssVar.colorPrimary,
  },
  label: {
    overflow: 'hidden',
    flex: '1',
    minWidth: 0,
    fontSize: 14,
    lineHeight: '22px',
    color: cssVar.colorTextSecondary,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
});

/**
 * Model announcement rendered in place of the Home greeting subtitle.
 *
 * The call-to-action uses the same model-selection path as the chat model
 * switcher, so it respects workspace member overrides and agent permissions.
 */
const HomePromoBanner = memo(() => {
  const { t } = useTranslation('home');
  const { agentId } = useResolvedHomeAgentId();
  const { allowed: canCreateContent } = usePermission('create_content');
  const updateAgentConfigById = useAgentStore((state) => state.updateAgentConfigById);
  const { defaultHomeNewModels, fallbackChatProvider } = useStarterModelDefaults();
  const applyBusinessModelModeConfig = useBusinessModelModeConfig();
  const [loading, setLoading] = useState(false);

  const model = defaultHomeNewModels.find((item) => item.model === 'claude-fable-5-2');
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
      toast.success(t('homePromoBanner.success'));
    } catch {
      toast.error(t('homePromoBanner.error'));
    } finally {
      setLoading(false);
    }
  }, [
    agentId,
    applyBusinessModelModeConfig,
    canCreateContent,
    loading,
    model,
    provider,
    t,
    updateAgentConfigById,
  ]);

  if (!canCreateContent || !agentId || !model) return null;

  return (
    <span {...stylex.props(styles.promo)} data-testid={'home-promo-banner'}>
      <ModelIcon {...stylex.props(styles.icon)} model={model.model} size={22} />
      <span {...stylex.props(styles.label)}>
        {t('homePromoBanner.label', { model: model.title })}
      </span>
      <Button
        {...stylex.props(styles.cta)}
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
