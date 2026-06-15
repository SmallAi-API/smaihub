'use client';

import { COMPOSIO_APP_TYPES } from '@lobechat/const';
import isEqual from 'fast-deep-equal';
import { memo, useCallback, useMemo } from 'react';

import { createComposioSkillDetailModal } from '@/features/SkillStore/SkillDetail';
import { useToolStore } from '@/store/tool';
import { composioStoreSelectors } from '@/store/tool/selectors';
import { ComposioServerStatus } from '@/store/tool/slices/composioStore';

import Empty from '../Empty';
import ComposioCatalog from '../LobeHub/ComposioCatalog';
import Item from '../LobeHub/Item';
import { gridStyles } from '../style';

interface ComposioListProps {
  keywords: string;
}

/**
 * Built-in MCP tab — Composio toolkits. Renders the curated static catalog
 * (filtered by keyword) followed by the dynamic full-catalog browser.
 */
export const ComposioList = memo<ComposioListProps>(({ keywords }) => {
  const allComposioServers = useToolStore(composioStoreSelectors.getServers, isEqual);

  const useFetchUserComposioConnections = useToolStore((s) => s.useFetchUserComposioConnections);
  useFetchUserComposioConnections(true);

  const getComposioServerByIdentifier = useCallback(
    (identifier: string) => allComposioServers.find((server) => server.identifier === identifier),
    [allComposioServers],
  );

  const filteredStaticItems = useMemo(() => {
    const lowerKeywords = keywords.toLowerCase().trim();
    if (!lowerKeywords) return COMPOSIO_APP_TYPES;
    return COMPOSIO_APP_TYPES.filter((type) => type.label.toLowerCase().includes(lowerKeywords));
  }, [keywords]);

  const hasSearchKeywords = Boolean(keywords && keywords.trim());

  return (
    <>
      {filteredStaticItems.length > 0 && (
        <div className={gridStyles.grid}>
          {filteredStaticItems.map((serverType) => {
            const server = getComposioServerByIdentifier(serverType.identifier);
            const isConnected = server?.status === ComposioServerStatus.ACTIVE;
            return (
              <Item
                description={serverType.description}
                icon={serverType.icon}
                identifier={serverType.identifier}
                isConnected={isConnected}
                key={serverType.identifier}
                label={serverType.label}
                serverName={serverType.appSlug}
                type="composio"
                onOpenDetail={() =>
                  createComposioSkillDetailModal({
                    identifier: serverType.identifier,
                    serverName: serverType.appSlug,
                  })
                }
              />
            );
          })}
        </div>
      )}
      <ComposioCatalog keywords={keywords} />
      {filteredStaticItems.length === 0 && hasSearchKeywords && <Empty search />}
    </>
  );
});

ComposioList.displayName = 'ComposioList';

export default ComposioList;
