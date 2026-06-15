export enum ComposioServerStatus {
  ACTIVE = 'active',
  ERROR = 'error',
  PENDING_AUTH = 'pending_auth',
}

export interface ComposioTool {
  description?: string;
  inputSchema: {
    properties?: Record<string, any>;
    required?: string[];
    type: string;
  };
  name: string;
}

export interface ComposioServer {
  appSlug: string;
  authConfigId: string;
  connectedAccountId: string;
  createdAt: number;
  errorMessage?: string;
  icon?: string;
  identifier: string;
  label: string;
  /** True when the toolkit requires no authentication. */
  noAuth?: boolean;
  redirectUrl?: string;
  status: ComposioServerStatus;
  tools?: ComposioTool[];
}

export interface CreateComposioServerParams {
  appSlug: string;
  identifier: string;
  label: string;
  /** Toolkit requires no authentication (from the catalog `noAuth` flag). */
  noAuth?: boolean;
}

export interface CallComposioToolParams {
  identifier: string;
  toolArgs?: Record<string, unknown>;
  toolSlug: string;
}

export interface CallComposioToolResult {
  data?: any;
  error?: string;
  success: boolean;
}

/**
 * A toolkit entry from the Composio catalog (the 1000+ browseable apps).
 * Shaped to be compatible with the static `ComposioAppType` so existing
 * connect flows (which only need appSlug/identifier/label) work unchanged.
 */
export interface ComposioCatalogToolkit {
  appSlug: string;
  authSchemes: string[];
  description: string;
  icon: string;
  identifier: string;
  label: string;
  noAuth: boolean;
  toolsCount: number;
}

export interface ComposioCatalogCategory {
  name: string;
  slug: string;
}
