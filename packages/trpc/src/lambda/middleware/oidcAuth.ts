import { TRPCError } from '@trpc/server';

import { trpc } from '../init';

export const oidcAuth = trpc.middleware(async (opts) => {
  const { ctx, next } = opts;

  // 检查 OIDC 认证
  if (ctx.oidcAuth) {
    // hetero-operation tokens are long-lived (4h) and scoped exclusively to
    // heteroIngest / heteroFinish.  Reject them here so a leaked sandbox JWT
    // cannot be replayed against any other authed route.
    if (ctx.oidcAuth.purpose === 'hetero-operation') {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'hetero-operation tokens are not accepted on this endpoint',
      });
    }

    return next({
      ctx: { oidcAuth: ctx.oidcAuth, userId: ctx.oidcAuth.sub },
    });
  }

  return next();
});
