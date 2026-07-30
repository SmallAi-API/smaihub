/**
 * Module customization hooks used by `i18nProxy.mjs`.
 *
 * `openai@4`'s ESM build does `import * as nf from 'node-fetch'` and calls `nf.default`, which
 * Node's CJS interop binds to node-fetch's `module.exports` function object. That identity cannot
 * be replaced from outside the module, so mutating the export has no effect on the SDK. Instead we
 * intercept resolution of `node-fetch` and hand back a tiny wrapper module that forwards to the
 * real implementation with a proxy agent attached.
 */
const SCHEME = 'i18n-proxy:';

export const resolve = async (specifier, context, nextResolve) => {
  const resolved = await nextResolve(specifier, context);

  // Only redirect the SDK's own import, never the wrapper's internal one.
  if (specifier === 'node-fetch' && !context.parentURL?.startsWith(SCHEME)) {
    return {
      format: 'module',
      shortCircuit: true,
      url: `${SCHEME}node-fetch?real=${encodeURIComponent(resolved.url)}`,
    };
  }

  return resolved;
};

export const load = async (url, context, nextLoad) => {
  if (!url.startsWith(SCHEME)) return nextLoad(url, context);

  const real = decodeURIComponent(new URL(url).searchParams.get('real'));

  return {
    format: 'module',
    shortCircuit: true,
    source: `
      import real from ${JSON.stringify(real)};
      export * from ${JSON.stringify(real)};
      const agent = globalThis.__i18nProxyAgent;
      const wrapped = (url, options = {}) =>
        real(url, {
          ...options,
          agent: String(url).startsWith('https') ? agent : options.agent,
        });
      Object.assign(wrapped, real);
      export default wrapped;
    `,
  };
};
