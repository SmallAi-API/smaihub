import debug from 'debug';
import { type NextRequest, NextResponse } from 'next/server';

import { OIDCCleanupModel } from '@/database/models/oidcCleanup';
import { serverDB } from '@/database/server';

const log = debug('lobe-oidc:cleanup');

/**
 * Allowed OIDC clients that can request cleanup
 * Only native clients (desktop, mobile) need this cleanup mechanism
 */
const ALLOWED_CLIENTS = new Set(['lobehub-desktop', 'lobehub-mobile']);

/**
 * POST /oidc/cleanup
 * Clean up OIDC data for a specific client before new authorization
 *
 * This endpoint is called by native clients (desktop/mobile) before initiating
 * a new OAuth authorization flow. It removes stale grants, tokens, and sessions
 * that may cause "accountId mismatch" errors when the user has switched accounts
 * on the web.
 *
 * Body: { clientId: string }
 */
export async function POST(request: NextRequest) {
  log('Received POST request for /oidc/cleanup');

  try {
    const body = await request.json();
    const { clientId } = body;

    if (!clientId) {
      log('Missing clientId in request body');
      return NextResponse.json({ error: 'clientId is required' }, { status: 400 });
    }

    // Only allow cleanup for known native clients
    if (!ALLOWED_CLIENTS.has(clientId)) {
      log('Cleanup rejected for unknown client: %s', clientId);
      return NextResponse.json({ error: 'Invalid client' }, { status: 403 });
    }

    log('Cleaning up OIDC data for client: %s', clientId);

    const cleanupModel = new OIDCCleanupModel(serverDB);
    const result = await cleanupModel.cleanupForClient(clientId);

    log('Cleanup completed: %O', result);

    return NextResponse.json({
      cleaned: result,
      success: true,
    });
  } catch (error) {
    log('Error during OIDC cleanup: %O', error);

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
