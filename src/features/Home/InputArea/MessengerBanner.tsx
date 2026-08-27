'use client';

import { ClaudeCode, Codex, HermesAgent, OpenClaw, Pi } from '@lobehub/icons';
import { Flexbox, Icon } from '@lobehub/ui';
import { createStaticStyles } from 'antd-style';
import { Sparkles } from 'lucide-react';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { useWorkspaceAwareNavigate } from '@/features/Workspace/useWorkspaceAwareNavigate';

import { InputBanner } from './InputBanner';

// Bump this id when the banner content changes so dismissing the old
// variant does not hide the new one.
export const MESSENGER_BANNER_ID = 'messenger-v2';

const ICON_SIZE = 16;
const AVATAR_SIZE = 24;

/**
 * Coding agents shown in the avatar stack. ClaudeCode / Codex / OpenClaw ship
 * `Color` art; HermesAgent and Pi are mono-only — their `colorPrimary`
 * variants would disappear against the white avatar, so they use the bare
 * exports and inherit the avatar's current text color.
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

    color: ${cssVar.colorText};

    background: ${cssVar.colorBgContainer};
    box-shadow:
      0 0 8px -2px rgb(0 0 0 / 5%),
      0 0 0 1px ${cssVar.colorFillTertiary};
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

  const handleNavigateToApps = useCallback(() => {
    navigate('/apps');
  }, [navigate]);

  return (
    <InputBanner
      dismissId={MESSENGER_BANNER_ID}
      dismissTitle={t('messengerBanner.dismiss')}
      testId={'messenger-banner'}
      onClick={handleNavigateToApps}
    >
      <Flexbox horizontal align={'center'} flex={1} gap={8} justify={'space-between'}>
        <Flexbox horizontal align={'center'} gap={8}>
          <Icon className={styles.icon} icon={Sparkles} size={18} />
          <span className={styles.text}>{t('messengerBanner.title')}</span>
        </Flexbox>
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
      </Flexbox>
    </InputBanner>
  );
});

MessengerBanner.displayName = 'MessengerBanner';

export default MessengerBanner;
