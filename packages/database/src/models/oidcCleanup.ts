import { eq } from 'drizzle-orm';

import {
  oidcAccessTokens,
  oidcAuthorizationCodes,
  oidcGrants,
  oidcRefreshTokens,
} from '../schemas';
import { LobeChatDatabase } from '../type';

export class OIDCCleanupModel {
  private db: LobeChatDatabase;

  constructor(db: LobeChatDatabase) {
    this.db = db;
  }

  /**
   * Clean up all OIDC data for a specific client
   * This is called before a new authorization flow to ensure clean state
   * and prevent account mismatch errors when switching accounts
   *
   * @param clientId The OIDC client ID (e.g., 'lobehub-desktop')
   * @returns Count of deleted records for each table
   */
  cleanupForClient = async (clientId: string) => {
    const results = {
      accessTokens: 0,
      authCodes: 0,
      grants: 0,
      refreshTokens: 0,
    };

    // Delete grants for this client
    const grantsResult = await this.db.delete(oidcGrants).where(eq(oidcGrants.clientId, clientId));
    results.grants = grantsResult.rowCount || 0;

    // Delete refresh tokens for this client
    const refreshResult = await this.db
      .delete(oidcRefreshTokens)
      .where(eq(oidcRefreshTokens.clientId, clientId));
    results.refreshTokens = refreshResult.rowCount || 0;

    // Delete access tokens for this client
    const accessResult = await this.db
      .delete(oidcAccessTokens)
      .where(eq(oidcAccessTokens.clientId, clientId));
    results.accessTokens = accessResult.rowCount || 0;

    // Delete authorization codes for this client
    const authCodesResult = await this.db
      .delete(oidcAuthorizationCodes)
      .where(eq(oidcAuthorizationCodes.clientId, clientId));
    results.authCodes = authCodesResult.rowCount || 0;

    return results;
  };
}
