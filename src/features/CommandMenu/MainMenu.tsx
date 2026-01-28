import { Command } from 'cmdk';
import { Bot, FilePen, LibraryBig, MessageSquarePlusIcon, Monitor } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { getNavigableRoutes, getRouteById } from '@/config/routes';

import { useCommandMenuContext } from './CommandMenuContext';
import ContextCommands from './ContextCommands';
import { CommandItem } from './components';
import { useCommandMenu } from './useCommandMenu';

const MainMenu = memo(() => {
  const { pathname, menuContext, setPages, pages } = useCommandMenuContext();
  const { t } = useTranslation('common');

  const {
    handleCreateSession,
    handleCreateTopic,
    handleCreateLibrary,
    handleCreatePage,
    handleNavigate,

    handleCreateAgentTeam,
  } = useCommandMenu();

  return (
    <>
      <ContextCommands />

      <Command.Group>
        <CommandItem
          icon={<Bot />}
          onSelect={handleCreateSession}
          unpinned={menuContext === 'agent' || menuContext === 'page'}
          value="create new agent assistant"
        >
          {t('cmdk.newAgent')}
        </CommandItem>

        <CommandItem
          icon={<Bot />}
          onSelect={handleCreateAgentTeam}
          unpinned={menuContext === 'agent' || menuContext === 'page'}
          value="create new agent team"
        >
          {t('cmdk.newAgentTeam')}
        </CommandItem>

        {menuContext === 'agent' && (
          <CommandItem
            icon={<MessageSquarePlusIcon />}
            onSelect={handleCreateTopic}
            unpinned={menuContext !== 'agent'}
            value="create new topic"
          >
            {t('cmdk.newTopic')}
          </CommandItem>
        )}

        <CommandItem icon={<FilePen />} onSelect={handleCreatePage} value="create new page">
          {t('cmdk.newPage')}
        </CommandItem>

        <CommandItem
          icon={<LibraryBig />}
          onSelect={handleCreateLibrary}
          unpinned={menuContext !== 'resource'}
          value="create new library"
        >
          {t('cmdk.newLibrary')}
        </CommandItem>

        {menuContext !== 'settings' &&
          (() => {
            const settingsRoute = getRouteById('settings');
            const SettingsIcon = settingsRoute?.icon;
            const keywords = settingsRoute?.keywordsKey
              ? t(settingsRoute.keywordsKey as any).split(' ')
              : settingsRoute?.keywords;
            return (
              <CommandItem
                icon={SettingsIcon && <SettingsIcon />}
                keywords={keywords}
                onSelect={() => handleNavigate(settingsRoute?.path || '/settings')}
                value="settings"
              >
                {t('cmdk.settings')}
              </CommandItem>
            );
          })()}

        <CommandItem
          icon={<Monitor />}
          onSelect={() => setPages([...pages, 'theme'])}
          value="theme"
        >
          {t('cmdk.theme')}
        </CommandItem>
      </Command.Group>

      <Command.Group heading={t('cmdk.navigate')}>
        {getNavigableRoutes().map((route) => {
          const RouteIcon = route.icon;
          const keywords = route.keywordsKey
            ? t(route.keywordsKey as any).split(' ')
            : route.keywords;
          return (
            !pathname?.startsWith(route.pathPrefix) && (
              <CommandItem
                icon={<RouteIcon />}
                key={route.id}
                keywords={keywords}
                onSelect={() => handleNavigate(route.path)}
                value={route.id}
              >
                {t(route.cmdkKey as any)}
              </CommandItem>
            )
          );
        })}
      </Command.Group>
    </>
  );
});

MainMenu.displayName = 'MainMenu';

export default MainMenu;
