import { type CreateKlavisServerParams, type KlavisServer } from './types';

/**
 * Klavis Store state interface
 *
 * NOTE: API Key is NOT stored in client-side state for security reasons.
 * It's only available on the server-side.
 */
export interface KlavisStoreState {
  /** Set of executing tool call IDs */
  executingToolIds: Set<string>;
  /** Whether initialization loading is complete */
  isServersInit: boolean;
  /** Whether the BYOK key modal is open */
  keyModalOpen: boolean;
  /** Set of loading server IDs */
  loadingServerIds: Set<string>;
  /** Connect params parked while waiting for the user to enter a key */
  pendingKlavisConnect?: CreateKlavisServerParams;
  /** List of created Klavis Servers */
  servers: KlavisServer[];
}

/**
 * Klavis Store initial state
 */
export const initialKlavisStoreState: KlavisStoreState = {
  executingToolIds: new Set(),
  isServersInit: false,
  keyModalOpen: false,
  loadingServerIds: new Set(),
  pendingKlavisConnect: undefined,
  servers: [],
};
