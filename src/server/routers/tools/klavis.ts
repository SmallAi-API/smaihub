import { z } from 'zod';

import { getKlavisClientForUser } from '@/libs/klavis';
import { authedProcedure, router } from '@/libs/trpc/lambda';
import { serverDatabase } from '@/libs/trpc/lambda/middleware';
import { MCPService } from '@/server/services/mcp';

/**
 * Klavis procedure with per-user API key resolution.
 *
 * Key resolution order: user keyVaults.klavis.apiKey → env KLAVIS_API_KEY → throw KLAVIS_KEY_REQUIRED.
 */
const klavisProcedure = authedProcedure.use(serverDatabase).use(async (opts) => {
  const klavisClient = await getKlavisClientForUser(opts.ctx.userId, opts.ctx.serverDB);

  return opts.next({
    ctx: { ...opts.ctx, klavisClient },
  });
});

/**
 * Klavis router for tools
 * Contains callTool and listTools which call external Klavis API
 */
export const klavisRouter = router({
  /**
   * Call a tool on a Klavis Strata server
   */
  callTool: klavisProcedure
    .input(
      z.object({
        serverUrl: z.string(),
        toolArgs: z.record(z.unknown()).optional(),
        toolName: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const response = await ctx.klavisClient.mcpServer.callTools({
        serverUrl: input.serverUrl,
        toolArgs: input.toolArgs,
        toolName: input.toolName,
      });

      // Handle error case
      if (!response.success || !response.result) {
        return {
          content: response.error || 'Unknown error',
          state: {
            content: [{ text: response.error || 'Unknown error', type: 'text' }],
            isError: true,
          },
          success: false,
        };
      }

      // Process the response using the common MCP tool call result processor
      const processedResult = await MCPService.processToolCallResult({
        content: (response.result.content || []) as any[],
        isError: response.result.isError,
      });

      return processedResult;
    }),

  /**
   * Get tools by server name. Authenticated so the per-user Klavis key is used
   * (BYOK) instead of leaking the env-only fallback to anonymous callers.
   */
  getTools: klavisProcedure
    .input(
      z.object({
        serverName: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const response = await ctx.klavisClient.mcpServer.getTools(input.serverName as any);

      return {
        tools: response.tools,
      };
    }),

  /**
   * List tools available on a Klavis Strata server
   */
  listTools: klavisProcedure
    .input(
      z.object({
        serverUrl: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const response = await ctx.klavisClient.mcpServer.listTools({
        serverUrl: input.serverUrl,
      });

      return {
        tools: response.tools,
      };
    }),
});
