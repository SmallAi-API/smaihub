'use client';

import { LOBEHUB_SKILL_PROVIDERS } from '@lobechat/const';
import { type BuiltinSkill, type LobeToolMeta } from '@lobechat/types';
import isEqual from 'fast-deep-equal';
import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import {
  createBuiltinAgentSkillDetailModal,
  createBuiltinSkillDetailModal,
  createLobehubSkillDetailModal,
} from '@/features/SkillStore/SkillDetail';
import { serverConfigSelectors, useServerConfigStore } from '@/store/serverConfig';
import { useToolStore } from '@/store/tool';
import { type ToolStoreState } from '@/store/tool/initialState';
import { lobehubSkillStoreSelectors } from '@/store/tool/selectors';
import { LobehubSkillStatus } from '@/store/tool/slices/lobehubSkillStore/types';

import BuiltinItem from '../Builtin/Item';
import Empty from '../Empty';
import { gridStyles } from '../style';
import Item from './Item';

interface LobeHubListProps {
  keywords: string;
}

// Selector to get only actual builtin tools (Composio lives in its own tab)
const getBuiltinToolsOnly = (s: ToolStoreState): LobeToolMeta[] => {
  return s.builtinTools
    .filter((item) => !item.hidden)
    .map((t) => ({
      author: 'LobeHub',
      identifier: t.identifier,
      meta: t.manifest.meta,
      type: 'builtin' as const,
    }));
};

export const LobeHubList = memo<LobeHubListProps>(({ keywords }) => {
  const { t } = useTranslation('setting');
  const isLobehubSkillEnabled = useServerConfigStore(serverConfigSelectors.enableLobehubSkill);
  const allLobehubSkillServers = useToolStore(lobehubSkillStoreSelectors.getServers, isEqual);
  const builtinTools = useToolStore(getBuiltinToolsOnly, isEqual);
  const builtinSkills = useToolStore((s) => s.builtinSkills, isEqual);

  const useFetchLobehubSkillConnections = useToolStore((s) => s.useFetchLobehubSkillConnections);

  useFetchLobehubSkillConnections(isLobehubSkillEnabled);

  const getLobehubSkillServerByProvider = useCallback(
    (providerId: string) => {
      return allLobehubSkillServers.find((server) => server.identifier === providerId);
    },
    [allLobehubSkillServers],
  );

  const filteredItems = useMemo(() => {
    const items: Array<
      | { provider: (typeof LOBEHUB_SKILL_PROVIDERS)[number]; type: 'lobehub' }
      | { skill: BuiltinSkill; type: 'builtinAgentSkill' }
      | { tool: LobeToolMeta; type: 'builtin' }
    > = [];

    // Add builtin agent skills first
    for (const skill of builtinSkills) {
      items.push({ skill, type: 'builtinAgentSkill' });
    }

    // Add builtin tools
    for (const tool of builtinTools) {
      items.push({ tool, type: 'builtin' });
    }

    // Add LobeHub skills
    if (isLobehubSkillEnabled) {
      for (const provider of LOBEHUB_SKILL_PROVIDERS) {
        items.push({ provider, type: 'lobehub' });
      }
    }

    // Filter by keywords
    const lowerKeywords = keywords.toLowerCase().trim();
    if (!lowerKeywords) return items;

    return items.filter((item) => {
      if (item.type === 'builtinAgentSkill') {
        const name = item.skill.name.toLowerCase();
        const identifier = item.skill.identifier.toLowerCase();
        return name.includes(lowerKeywords) || identifier.includes(lowerKeywords);
      }
      if (item.type === 'builtin') {
        const title = item.tool.meta?.title?.toLowerCase() || '';
        const identifier = item.tool.identifier?.toLowerCase() || '';
        return title.includes(lowerKeywords) || identifier.includes(lowerKeywords);
      }
      return item.provider.label.toLowerCase().includes(lowerKeywords);
    });
  }, [keywords, isLobehubSkillEnabled, builtinTools, builtinSkills]);

  const hasSearchKeywords = Boolean(keywords && keywords.trim());

  if (filteredItems.length === 0) return <Empty search={hasSearchKeywords} />;

  return (
    <div className={gridStyles.grid}>
      {filteredItems.map((item) => {
        if (item.type === 'builtinAgentSkill') {
          const localizedTitle = t(`tools.builtins.${item.skill.identifier}.title`, {
            defaultValue: item.skill.name,
          });
          const localizedDescription = t(`tools.builtins.${item.skill.identifier}.description`, {
            defaultValue: item.skill.description,
          });
          return (
            <BuiltinItem
              avatar={item.skill.avatar}
              description={localizedDescription}
              identifier={item.skill.identifier}
              key={item.skill.identifier}
              title={localizedTitle}
              onOpenDetail={() =>
                createBuiltinAgentSkillDetailModal({ identifier: item.skill.identifier })
              }
            />
          );
        }
        if (item.type === 'builtin') {
          const localizedTitle = t(`tools.builtins.${item.tool.identifier}.title`, {
            defaultValue: item.tool.meta?.title || item.tool.identifier,
          });
          const localizedDescription = t(`tools.builtins.${item.tool.identifier}.description`, {
            defaultValue: item.tool.meta?.description || '',
          });
          return (
            <BuiltinItem
              avatar={item.tool.meta?.avatar}
              description={localizedDescription}
              identifier={item.tool.identifier}
              key={item.tool.identifier}
              title={localizedTitle}
              onOpenDetail={() =>
                createBuiltinSkillDetailModal({ identifier: item.tool.identifier })
              }
            />
          );
        }
        const server = getLobehubSkillServerByProvider(item.provider.id);
        const isConnected = server?.status === LobehubSkillStatus.CONNECTED;
        return (
          <Item
            description={item.provider.description}
            icon={item.provider.icon}
            identifier={item.provider.id}
            isConnected={isConnected}
            key={item.provider.id}
            label={item.provider.label}
            type="lobehub"
            onOpenDetail={() => createLobehubSkillDetailModal({ identifier: item.provider.id })}
          />
        );
      })}
    </div>
  );
});

LobeHubList.displayName = 'LobeHubList';

export default LobeHubList;
