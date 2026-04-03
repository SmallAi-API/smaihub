import { defineMigration } from './defineMigration';

/**
 * Migration: Replace legacy LobeHub gateway URL with self-hosted smai.ai gateway URL.
 *
 * Before this migration, some installations stored the upstream default
 * `https://device-gateway.lobehub.com`. This migration silently rewrites it
 * to the correct self-hosted endpoint so users don't need to edit the JSON
 * config file manually.
 */
export default defineMigration({
  id: '002-fix-gateway-url',
  up: (store) => {
    const current = store.get('gatewayUrl');

    if (current === 'https://device-gateway.lobehub.com') {
      store.set('gatewayUrl', 'https://device-gateway.smai.ai');
    }
  },
});
