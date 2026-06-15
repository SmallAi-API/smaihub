'use client';

import { type ComposioAppType, getComposioAppByIdentifier } from '@lobechat/const';
import { type ReactNode } from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useToolStore } from '@/store/tool';
import { composioStoreSelectors } from '@/store/tool/selectors';
import { ComposioServerStatus } from '@/store/tool/slices/composioStore';

import { type DetailContextValue } from './DetailContext';
import { DetailContext } from './DetailContext';

interface ComposioDetailProviderProps {
  children: ReactNode;
  /** Fallback description from the catalog item (for not-yet-connected dynamic toolkits). */
  fallbackDescription?: string;
  /** Fallback icon (logo URL) from the catalog item. */
  fallbackIcon?: string;
  /** Fallback label from the catalog item. */
  fallbackLabel?: string;
  identifier: string;
  serverName: string;
}

export const ComposioDetailProvider = ({
  children,
  fallbackDescription,
  fallbackIcon,
  fallbackLabel,
  identifier,
  serverName,
}: ComposioDetailProviderProps) => {
  const { t } = useTranslation(['setting']);

  const staticConfig = useMemo(() => getComposioAppByIdentifier(identifier), [identifier]);

  const composioServers = useToolStore(composioStoreSelectors.getServers);

  const serverState = useMemo(
    () => composioServers.find((s) => s.identifier === identifier),
    [identifier, composioServers],
  );

  // Dynamic catalog toolkits are not in the static list. Synthesize a config
  // from the catalog item (passed as fallbacks) or the connected server
  // metadata so the detail modal renders the correct icon/label, not the 🔌
  // placeholder.
  const config: ComposioAppType | undefined = useMemo(() => {
    if (staticConfig) return staticConfig;
    return {
      appSlug: serverName,
      author: 'Composio',
      authorUrl: 'https://composio.dev',
      description: fallbackDescription || '',
      icon: fallbackIcon || serverState?.icon || '🔌',
      identifier,
      label: fallbackLabel || serverState?.label || identifier,
      readme: '',
    };
  }, [
    staticConfig,
    serverName,
    serverState,
    identifier,
    fallbackIcon,
    fallbackLabel,
    fallbackDescription,
  ]);

  const isConnected = useMemo(
    () => serverState?.status === ComposioServerStatus.ACTIVE,
    [serverState],
  );

  const useFetchAppTools = useToolStore((s) => s.useFetchAppTools);
  const { data: tools = [], isLoading: toolsLoading } = useFetchAppTools(serverName);

  if (!config) return null;

  const { author, authorUrl, description, icon, readme, label } = config;

  const localizedDescription = t(`tools.composio.servers.${identifier}.description`, {
    defaultValue: description,
  });
  const localizedReadme = t(`tools.composio.servers.${identifier}.readme`, {
    defaultValue: readme,
  });

  const value: DetailContextValue = {
    author,
    authorUrl,
    config,
    description,
    icon,
    identifier,
    isConnected,
    label,
    localizedDescription,
    localizedReadme,
    readme,
    serverName,
    tools,
    toolsLoading,
  };

  return <DetailContext value={value}>{children}</DetailContext>;
};
