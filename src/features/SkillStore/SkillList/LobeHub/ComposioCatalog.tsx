'use client';

import { COMPOSIO_APP_TYPES } from '@lobechat/const';
import { Button, Flexbox } from '@lobehub/ui';
import isEqual from 'fast-deep-equal';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { createComposioSkillDetailModal } from '@/features/SkillStore/SkillDetail';
import { useToolStore } from '@/store/tool';
import { composioStoreSelectors } from '@/store/tool/selectors';
import { ComposioServerStatus } from '@/store/tool/slices/composioStore';

import { gridStyles } from '../style';
import Item from './Item';

interface ComposioCatalogProps {
  category?: string;
  keywords: string;
}

// Identifiers already shown by the static catalog section — skip them here to
// avoid rendering the same toolkit twice.
const STATIC_IDENTIFIERS = new Set(COMPOSIO_APP_TYPES.map((t) => t.identifier));

/**
 * Dynamic Composio catalog browser. Fetches the full 1000+ toolkit catalog with
 * cursor pagination, deduped against the static curated list. Server-side search
 * kicks in when the user types a keyword.
 */
const ComposioCatalog = memo<ComposioCatalogProps>(({ keywords, category }) => {
  const { t } = useTranslation('setting');
  const search = keywords.trim();

  const useFetchComposioCatalog = useToolStore((s) => s.useFetchComposioCatalog);
  const allComposioServers = useToolStore(composioStoreSelectors.getServers, isEqual);

  const { data, size, setSize, isLoading, isValidating } = useFetchComposioCatalog({
    category,
    search,
  });

  const toolkits = useMemo(() => {
    const pages = data || [];
    const seen = new Set<string>();
    const list: {
      appSlug: string;
      description: string;
      icon: string;
      identifier: string;
      label: string;
      noAuth: boolean;
    }[] = [];

    for (const page of pages) {
      for (const tk of page.toolkits) {
        if (STATIC_IDENTIFIERS.has(tk.identifier)) continue;
        if (seen.has(tk.identifier)) continue;
        seen.add(tk.identifier);
        list.push(tk);
      }
    }
    return list;
  }, [data]);

  const isReachingEnd = (data?.at(-1)?.nextCursor ?? null) === null && (data?.length ?? 0) > 0;
  const isLoadingMore = isLoading || (size > 0 && isValidating);

  const getServer = (identifier: string) =>
    allComposioServers.find((s) => s.identifier === identifier);

  if (toolkits.length === 0 && isReachingEnd) return null;

  return (
    <Flexbox gap={8}>
      <div className={gridStyles.grid}>
        {toolkits.map((tk) => {
          const server = getServer(tk.identifier);
          const isConnected = server?.status === ComposioServerStatus.ACTIVE;
          return (
            <Item
              description={tk.description}
              icon={tk.icon}
              identifier={tk.identifier}
              isConnected={isConnected}
              key={tk.identifier}
              label={tk.label}
              noAuth={tk.noAuth}
              serverName={tk.appSlug}
              type="composio"
              onOpenDetail={() =>
                createComposioSkillDetailModal({
                  identifier: tk.identifier,
                  serverName: tk.appSlug,
                })
              }
            />
          );
        })}
      </div>
      {!isReachingEnd && (
        <Flexbox align={'center'} paddingBlock={4} paddingInline={16}>
          <Button block loading={isLoadingMore} onClick={() => setSize(size + 1)}>
            {t('skillStore.composioCatalog.loadMore', { defaultValue: 'Load more' })}
          </Button>
        </Flexbox>
      )}
    </Flexbox>
  );
});

ComposioCatalog.displayName = 'ComposioCatalog';

export default ComposioCatalog;
