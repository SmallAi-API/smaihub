import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { getServerComposioAuthConfigId } from '@/config/composio';
import { ConnectorModel } from '@/database/models/connector';
import { PluginModel } from '@/database/models/plugin';
import { getComposioClient } from '@/libs/composio';
import { authedProcedure, publicProcedure, router } from '@/libs/trpc/lambda';
import { serverDatabase } from '@/libs/trpc/lambda/middleware';
import { MCPService } from '@/server/services/mcp';

const composioProcedure = authedProcedure.use(serverDatabase).use(async (opts) => {
  const composioClient = getComposioClient();
  const pluginModel = new PluginModel(opts.ctx.serverDB, opts.ctx.userId);
  const connectorModel = new ConnectorModel(opts.ctx.serverDB, opts.ctx.userId);
  return opts.next({ ctx: { ...opts.ctx, composioClient, connectorModel, pluginModel } });
});

export const composioToolsRouter = router({
  /**
   * Browse the full Composio toolkit catalog (1000+ toolkits), paginated.
   *
   * Uses the low-level `client.toolkits.list()` instead of the SDK's
   * `toolkits.get(query)` wrapper: the wrapper's `transformToolkitListResponse`
   * maps `items` to an array and DROPS `next_cursor`, so cursor pagination is
   * impossible through it. The raw client returns `{ items, next_cursor }`.
   */
  listCategories: publicProcedure.query(async () => {
    const client = getComposioClient();
    const response = await (client.toolkits as any).listCategories();
    const items = response?.items || response || [];
    return {
      categories: Array.isArray(items)
        ? items.map((c: any) => ({ name: c.name || c.slug || '', slug: c.slug || c.id || '' }))
        : [],
    };
  }),

  listToolkits: publicProcedure
    .input(
      z.object({
        category: z.string().optional(),
        cursor: z.string().optional(),
        limit: z.number().min(1).max(100).optional(),
        search: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      const client = getComposioClient();

      const response = await (client as any).client.toolkits.list({
        category: input.category,
        cursor: input.cursor,
        limit: input.limit ?? 30,
        managed_by: 'composio',
        search: input.search,
        sort_by: 'usage',
      });

      const items = response?.items || [];
      const toolkits = Array.isArray(items)
        ? items
            .map((item: any) => {
              const meta = item.meta || {};
              const slug: string = item.slug || '';
              const identifier = slug.toLowerCase();
              const noAuth = item.no_auth ?? item.noAuth ?? false;
              const composioManagedAuthSchemes =
                item.composio_managed_auth_schemes || item.composioManagedAuthSchemes || [];
              // A toolkit is connectable when it needs no auth, OR Composio has
              // managed credentials for it, OR an admin pinned a custom auth
              // config via COMPOSIO_AUTH_CONFIG_IDS. Otherwise connecting would
              // fail with `Auth_Config_DefaultAuthConfigNotFound` — hide it.
              const connectable =
                noAuth ||
                (Array.isArray(composioManagedAuthSchemes) &&
                  composioManagedAuthSchemes.length > 0) ||
                Boolean(getServerComposioAuthConfigId(identifier));
              return {
                appSlug: slug.toUpperCase(),
                authSchemes: item.auth_schemes || item.authSchemes || [],
                connectable,
                description: meta.description || '',
                icon: meta.logo || '',
                // identifier is the kebab-case slug used as the local plugin id.
                identifier,
                label: item.name || slug,
                noAuth,
                toolsCount: meta.tools_count ?? meta.toolsCount ?? 0,
              };
            })
            .filter((tk: { connectable: boolean }) => tk.connectable)
        : [];

      return {
        nextCursor: (response?.next_cursor ?? null) as string | null,
        toolkits,
      };
    }),

  executeAction: composioProcedure
    .input(
      z.object({
        identifier: z.string(),
        toolArgs: z.record(z.unknown()).optional(),
        toolSlug: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Resolve the connected account server-side from the caller's own records
      // (models are user-scoped). Never trust a connectedAccountId supplied by
      // the client — that would let a user drive another user's connection.
      // Connector metadata first (new path); plugin customParams as fallback for
      // connections created before the connector projection existed.
      const [connector] = await ctx.connectorModel.queryByIdentifiers([input.identifier]);
      let connectedAccountId = connector?.metadata?.composio?.connectedAccountId;
      // noAuth is only projected onto the plugin table (registerNoAuth never
      // writes a connector row), so a connector hit always implies auth-required.
      let isNoAuth = false;
      if (!connectedAccountId) {
        const plugin = await ctx.pluginModel.findById(input.identifier);
        connectedAccountId = plugin?.customParams?.composio?.connectedAccountId;
        isNoAuth = plugin?.customParams?.composio?.noAuth === true;
      }

      // No-auth toolkits (e.g. composio_search) have no connected account and are
      // executed with just the userId. Auth-requiring toolkits must resolve a
      // connected account first.
      if (!isNoAuth && !connectedAccountId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `No Composio connection found for "${input.identifier}".`,
        });
      }

      const result = await (ctx.composioClient.tools as any).execute(input.toolSlug, {
        arguments: input.toolArgs || {},
        // Omit connectedAccountId entirely for no-auth toolkits.
        ...(isNoAuth ? {} : { connectedAccountId }),
        // Toolkit version resolves to "latest"; allow manual execution without a
        // pinned version (Composio otherwise throws ComposioToolVersionRequiredError).
        dangerouslySkipVersionCheck: true,
        userId: ctx.userId,
      });

      if (!result) {
        return {
          content: 'Unknown error',
          state: { content: [{ text: 'Unknown error', type: 'text' }], isError: true },
          success: false,
        };
      }

      const data = result as any;
      const content = data?.data || data?.result || data;
      const contentStr = typeof content === 'string' ? content : JSON.stringify(content);

      return await MCPService.processToolCallResult({
        content: [{ text: contentStr, type: 'text' }],
        isError: false,
      });
    }),

  getActions: publicProcedure.input(z.object({ appSlug: z.string() })).query(async ({ input }) => {
    const client = getComposioClient();
    const response = await (client.tools as any).getRawComposioTools({
      toolkits: [input.appSlug],
    });

    const items = response?.items || response || [];
    const tools = Array.isArray(items)
      ? items.map((tool: any) => ({
          description: tool.description || '',
          inputSchema: tool.inputParameters ||
            tool.inputSchema || {
              properties: {},
              type: 'object',
            },
          name: tool.slug || tool.name || '',
        }))
      : [];

    return { tools };
  }),

  listActions: composioProcedure
    .input(z.object({ appSlug: z.string() }))
    .query(async ({ ctx, input }) => {
      // Use getRawComposioTools (raw tool defs with slug/inputParameters), NOT
      // tools.get() — the latter returns provider-wrapped (OpenAI-format) tools
      // whose name/params live under `.function`, so slug/name/inputSchema come
      // back empty and every tool collapses to the same `${identifier}____` name.
      const response = await (ctx.composioClient.tools as any).getRawComposioTools({
        toolkits: [input.appSlug],
      });

      const items = response?.items || response || [];
      const tools = Array.isArray(items)
        ? items.map((tool: any) => ({
            description: tool.description || '',
            inputSchema: tool.inputParameters ||
              tool.inputSchema || {
                properties: {},
                type: 'object',
              },
            name: tool.slug || tool.name || '',
          }))
        : [];

      return { tools };
    }),
});
