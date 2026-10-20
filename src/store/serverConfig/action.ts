import { type SWRResponse } from 'swr';

import { useClientPollingSWR, useOnlyFetchOnceSWR } from '@/libs/swr';
import { serverConfigKeys } from '@/libs/swr/keys';
import { isAutoRetryable } from '@/libs/swr/normalizeError';
import { globalService } from '@/services/global';
import { type StoreSetter } from '@/store/types';
import { type GlobalBillboard, type GlobalRuntimeConfig } from '@/types/serverConfig';

import { type ServerConfigStore } from './store';

const CLOUD_DESKTOP_BUSINESS_FEATURES_FLAG = '__LOBECLOUD_DESKTOP_BUSINESS_FEATURES__';
const BILLBOARD_REFRESH_INTERVAL = 60_000;

const setDesktopBusinessFeaturesFlag = (enableBusinessFeatures: boolean | undefined) => {
  (globalThis as unknown as Record<string, boolean | undefined>)[
    CLOUD_DESKTOP_BUSINESS_FEATURES_FLAG
  ] = Boolean(enableBusinessFeatures);
};

type Setter = StoreSetter<ServerConfigStore>;
export const createServerConfigSlice = (
  set: Setter,
  get: () => ServerConfigStore,
  _api?: unknown,
) => new ServerConfigActionImpl(set, get, _api);

export class ServerConfigActionImpl {
  readonly #set: Setter;

  constructor(set: Setter, get: () => ServerConfigStore, _api?: unknown) {
    void _api;
    this.#set = set;
    void get;
  }

  useInitServerConfig = (): SWRResponse<GlobalRuntimeConfig> => {
    return useOnlyFetchOnceSWR<GlobalRuntimeConfig>(
      serverConfigKeys.get,
      () => globalService.getGlobalConfig(),
      {
        onError: () => {
          setDesktopBusinessFeaturesFlag(false);
          this.#set({ serverConfigInit: true }, false, 'initServerConfigFallback');
        },
        onSuccess: (data) => {
          setDesktopBusinessFeaturesFlag(data.serverConfig.enableBusinessFeatures);
          this.#set(
            {
              billboard: data.billboard ?? null,
              canAccessDevDock: data.serverFeatureFlags.enableDevDock === true,
              featureFlags: data.serverFeatureFlags,
              serverConfig: data.serverConfig,
              serverConfigInit: true,
              serverConfigLoaded: true,
            },
            false,
            'initServerConfig',
          );
        },
      },
    );
  };

  useFetchBillboard = (enabled: boolean): SWRResponse<GlobalBillboard | null> => {
    return useClientPollingSWR<GlobalBillboard | null>(
      enabled ? serverConfigKeys.billboard : null,
      () => globalService.getBillboard(),
      {
        focusThrottleInterval: 30_000,
        // A prolonged feed outage must not exhaust the shared hook's retry limit.
        // Focus/reconnect revalidation resumes retries after hidden/offline periods.
        onErrorRetry: (error, _key, config, revalidate, options) => {
          if (!isAutoRetryable(error)) return;
          setTimeout(() => {
            if (config.isVisible() && config.isOnline()) revalidate(options);
          }, BILLBOARD_REFRESH_INTERVAL);
        },
        onSuccess: (billboard) => {
          this.#set({ billboard }, false, 'refreshBillboard');
        },
        refreshInterval: BILLBOARD_REFRESH_INTERVAL,
        refreshWhenHidden: false,
      },
    );
  };
}

export type ServerConfigAction = Pick<ServerConfigActionImpl, keyof ServerConfigActionImpl>;
