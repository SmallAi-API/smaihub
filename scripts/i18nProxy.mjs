/**
 * Preload for `lobe-i18n`, which cannot reach the configured OpenAI gateway on its own.
 *
 * Two independent problems it works around:
 *
 * 1. Proxy. `lobe-i18n` pins `openai@4`, whose Node transport is `node-fetch`. It always hands
 *    node-fetch an explicit `agentkeepalive` agent (`core.js` -> `getDefaultAgent`), so neither
 *    HTTPS_PROXY, undici's global dispatcher, nor `https.globalAgent` is ever consulted, and the
 *    CLI exposes no way to pass `httpAgent`. See `i18nProxyHooks.mjs` for the interception point.
 *
 * 2. Credential shadowing. `dotenv.config()` inside the CLI does not override variables that are
 *    already set, so an OPENAI_API_KEY exported in the shell wins over the project `.env` one and
 *    the gateway answers 401 — which only surfaces once the proxy problem is fixed.
 *
 * Usage: NODE_OPTIONS="--import ./scripts/i18nProxy.mjs" lobe-i18n
 */
import { readFileSync } from 'node:fs';
import https from 'node:https';
import { register } from 'node:module';
import net from 'node:net';
import tls from 'node:tls';

import { parse } from 'dotenv';

const proxyUrl =
  process.env.I18N_HTTP_PROXY ||
  process.env.HTTPS_PROXY ||
  process.env.https_proxy ||
  process.env.HTTP_PROXY ||
  process.env.http_proxy;

/** An https.Agent that reaches its target through an HTTP CONNECT tunnel. */
const createTunnelAgent = (url) => {
  const proxy = new URL(url);
  const port = Number(proxy.port) || (proxy.protocol === 'https:' ? 443 : 80);
  const auth = proxy.username
    ? `Proxy-Authorization: Basic ${Buffer.from(
        `${decodeURIComponent(proxy.username)}:${decodeURIComponent(proxy.password)}`,
      ).toString('base64')}\r\n`
    : '';

  class TunnelAgent extends https.Agent {
    createConnection(options, callback) {
      const target = `${options.host}:${options.port || 443}`;
      const socket = net.connect(port, proxy.hostname, () => {
        socket.write(`CONNECT ${target} HTTP/1.1\r\nHost: ${target}\r\n${auth}\r\n`);
      });

      socket.once('data', (chunk) => {
        const status = chunk.toString('latin1').split('\r\n')[0];
        if (!/ 2\d\d/.test(status)) {
          socket.destroy();
          callback(new Error(`Proxy CONNECT to ${target} failed: ${status}`));
          return;
        }
        callback(
          null,
          tls.connect({ ...options, servername: options.servername || options.host, socket }),
        );
      });

      socket.on('error', (error) => callback(error));
    }
  }

  return new TunnelAgent({ keepAlive: true });
};

if (proxyUrl) {
  // The loader hook reads the agent from here; it runs in a separate module scope.
  globalThis.__i18nProxyAgent = createTunnelAgent(proxyUrl);
  register('./i18nProxyHooks.mjs', import.meta.url);
}

// Let the project `.env` win over shell-exported OpenAI credentials.
try {
  const fileEnv = parse(readFileSync('.env'));
  for (const key of ['OPENAI_API_KEY', 'OPENAI_PROXY_URL']) {
    if (fileEnv[key]) process.env[key] = fileEnv[key];
  }
} catch {
  // no .env in cwd, nothing to reconcile
}
