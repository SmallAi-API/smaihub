'use client';

import { ClaudeCode, Codex, HermesAgent, OpenClaw, Pi } from '@lobehub/icons';
import { ActionIcon, Flexbox, Icon } from '@lobehub/ui';
import { createStaticStyles } from 'antd-style';
import { Sparkles, X } from 'lucide-react';
import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { useWorkspaceAwareNavigate } from '@/features/Workspace/useWorkspaceAwareNavigate';
import { useGlobalStore } from '@/store/global';

// Bump this id when the banner content changes so dismissing the old
// variant does not hide the new one.
export const MESSENGER_BANNER_ID = 'messenger-v2';

const ICON_SIZE = 16;
const AVATAR_SIZE = 24;

/**
 * Coding agents shown in the avatar stack. ClaudeCode / Codex / OpenClaw ship
 * `Color` art; HermesAgent and Pi are mono-only — their `colorPrimary` is
 * `#fff` / `#000`, which would disappear against the white avatar — so those
 * two render as the bare Mono export and pick up `currentColor`.
 */
const BANNER_AGENTS = [
  { Icon: ClaudeCode.Color, key: 'ClaudeCode' },
  { Icon: Codex.Color, key: 'Codex' },
  { Icon: HermesAgent, key: 'HermesAgent' },
  { Icon: OpenClaw.Color, key: 'OpenClaw' },
  { Icon: Pi, key: 'Pi' },
] as const;

const styles = createStaticStyles(({ css, cssVar }) => ({
  avatar: css`
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;

    width: ${AVATAR_SIZE}px;
    height: ${AVATAR_SIZE}px;
    border-radius: 50%;

    /* Mono-only marks (Hermes, Pi) draw with currentColor. */
    color: ${cssVar.colorText};

    background: ${cssVar.colorBgContainer};
    box-shadow:
      0 0 8px -2px rgb(0 0 0 / 5%),
      0 0 0 1px ${cssVar.colorFillTertiary};
  `,
  banner: css`
    cursor: pointer;

    position: absolute;
    z-index: 0;
    inset-block-end: 0;
    inset-inline: 0;

    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: space-between;

    margin-block-end: -6px;
    padding-block: 42px 10px;
    padding-inline: 16px 12px;
    border: 1px solid ${cssVar.colorFillSecondary};
    border-radius: 20px;

    background: color-mix(in srgb, ${cssVar.colorFillQuaternary} 50%, ${cssVar.colorBgContainer});
  `,
  icon: css`
    color: ${cssVar.colorTextSecondary};
  `,
  iconGroup: css`
    display: flex;
    align-items: center;
  `,
  text: css`
    font-size: 13px;
    color: ${cssVar.colorTextSecondary};
  `,
}));

const MessengerBanner = memo(() => {
  const { t } = useTranslation('common');
  const navigate = useWorkspaceAwareNavigate();

  const updateSystemStatus = useGlobalStore((s) => s.updateSystemStatus);

  const handleNavigateToDownloads = useCallback(() => {
    navigate('/downloads');
  }, [navigate]);

  const handleDismiss = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const current = useGlobalStore.getState().status.dismissedBannerIds || [];
      if (current.includes(MESSENGER_BANNER_ID)) return;
      updateSystemStatus({
        dismissedBannerIds: [...current, MESSENGER_BANNER_ID],
      });
    },
    [updateSystemStatus],
  );

  return (
    <div
      className={styles.banner}
      data-testid="messenger-banner"
      onClick={handleNavigateToDownloads}
    >
      <Flexbox horizontal align="center" gap={8}>
        <Icon className={styles.icon} icon={Sparkles} size={18} />
        <span className={styles.text}>{t('messengerBanner.title')}</span>
      </Flexbox>
      <Flexbox horizontal align="center" gap={8}>
        <div className={styles.iconGroup}>
          {BANNER_AGENTS.map(({ Icon: AgentIcon, key }, index) => (
            <div
              className={styles.avatar}
              key={key}
              style={{ marginLeft: index === 0 ? 0 : -6, zIndex: index }}
            >
              <AgentIcon size={ICON_SIZE} />
            </div>
          ))}
        </div>
        <ActionIcon
          icon={X}
          size="small"
          title={t('messengerBanner.dismiss')}
          onClick={handleDismiss}
        />
      </Flexbox>
    </div>
  );
});

MessengerBanner.displayName = 'MessengerBanner';

export default MessengerBanner;
