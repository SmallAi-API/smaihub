import { UPDATE_CHANNEL } from '@/modules/updater/configs';

import { defineMigration } from './defineMigration';

export const stableUpdateChannelMigration = defineMigration({
  id: '003-stable-update-channel',
  up: (store) => {
    if (store.get('updateChannel') !== UPDATE_CHANNEL) {
      store.set('updateChannel', UPDATE_CHANNEL);
    }
  },
});
