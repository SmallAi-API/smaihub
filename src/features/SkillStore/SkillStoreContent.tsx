'use client';

import { Flexbox } from '@lobehub/ui';
import { Tabs, type TabsItem } from '@lobehub/ui/base-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { serverConfigSelectors, useServerConfigStore } from '@/store/serverConfig';
import { useToolStore } from '@/store/tool';

import Search from './Search';
import AddSkillButton from './SkillList/AddSkillButton';
import ComposioList from './SkillList/Composio';
import LobeHubList from './SkillList/LobeHub';
import MarketSkillList from './SkillList/MarketSkills';
import MCPList from './SkillList/MCP';

export enum SkillStoreTab {
  BuiltinMCP = 'builtinMcp',
  LobeHub = 'lobehub',
  MCP = 'mcp',
  Skills = 'skills',
}

interface SkillStoreContentProps {
  initialTab?: SkillStoreTab;
}

export const SkillStoreContent = ({ initialTab }: SkillStoreContentProps = {}) => {
  const { t } = useTranslation('setting');
  const isComposioEnabled = useServerConfigStore(serverConfigSelectors.enableComposio);
  // Honor a requested initial tab, but fall back to LobeHub when the BuiltinMCP
  // tab is requested while Composio is disabled (the tab isn't rendered then).
  const resolvedInitialTab =
    initialTab === SkillStoreTab.BuiltinMCP && !isComposioEnabled
      ? SkillStoreTab.LobeHub
      : (initialTab ?? SkillStoreTab.LobeHub);
  const [activeTab, setActiveTab] = useState<SkillStoreTab>(resolvedInitialTab);
  const [lobehubKeywords, setLobehubKeywords] = useState('');
  const [composioKeywords, setComposioKeywords] = useState('');
  const [skillKeywords, setSkillKeywords] = useState('');

  // Refresh builtin-tool install state for the active workspace whenever the
  // modal mounts, so entries opened from contexts that don't host the chat
  // input (e.g. Home banner) don't read leftover personal-scope state.
  const useFetchUninstalledBuiltinTools = useToolStore((s) => s.useFetchUninstalledBuiltinTools);
  useFetchUninstalledBuiltinTools(true);

  const options: TabsItem[] = [
    { key: SkillStoreTab.LobeHub, label: t('skillStore.tabs.lobehub') },
    ...(isComposioEnabled
      ? [{ key: SkillStoreTab.BuiltinMCP, label: t('skillStore.tabs.builtinMcp') }]
      : []),
    { key: SkillStoreTab.Skills, label: t('skillStore.tabs.skills') },
    { key: SkillStoreTab.MCP, label: t('skillStore.tabs.mcp') },
  ];

  const isLobeHub = activeTab === SkillStoreTab.LobeHub;
  const isBuiltinMCP = activeTab === SkillStoreTab.BuiltinMCP;
  const isSkills = activeTab === SkillStoreTab.Skills;
  const isMCP = activeTab === SkillStoreTab.MCP;

  return (
    <Flexbox gap={8} style={{ maxHeight: '75vh' }} width={'100%'}>
      <Flexbox gap={8}>
        <Flexbox horizontal align={'center'} gap={8}>
          <Tabs
            activeKey={activeTab}
            items={options}
            style={{ flex: 1 }}
            styles={{
              list: { display: 'flex', width: '100%' },
              tab: { flex: 1 },
            }}
            onChange={(key) => setActiveTab(key as SkillStoreTab)}
          />
          <AddSkillButton />
        </Flexbox>
        <Search
          activeTab={activeTab}
          onComposioSearch={setComposioKeywords}
          onLobeHubSearch={setLobehubKeywords}
          onSkillSearch={setSkillKeywords}
        />
      </Flexbox>
      <Flexbox height={496} style={{ marginBlockEnd: -12, marginInline: -16 }}>
        <Flexbox flex={1} style={{ display: isLobeHub ? 'flex' : 'none', overflow: 'auto' }}>
          <LobeHubList keywords={lobehubKeywords} />
        </Flexbox>
        {isComposioEnabled && (
          <Flexbox flex={1} style={{ display: isBuiltinMCP ? 'flex' : 'none', overflow: 'auto' }}>
            <ComposioList keywords={composioKeywords} />
          </Flexbox>
        )}
        <Flexbox flex={1} style={{ display: isSkills ? 'flex' : 'none', overflow: 'auto' }}>
          <MarketSkillList keywords={skillKeywords} />
        </Flexbox>
        <Flexbox flex={1} style={{ display: isMCP ? 'flex' : 'none', overflow: 'auto' }}>
          <MCPList />
        </Flexbox>
      </Flexbox>
    </Flexbox>
  );
};
