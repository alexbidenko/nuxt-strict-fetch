import {CommonStrictFetch} from "../common/base";
import {useNuxtApp, useRuntimeConfig} from "#imports";
import type {IStrictFetch, PluginOptionsType} from "../common/types";
import {mergeOptions} from "../common/utils";

class ClientStrictFetch extends CommonStrictFetch {
  protected get config(): PluginOptionsType {
    return this.app.$strictFetch;
  }

  protected get app() {
    return useNuxtApp();
  }

  get additionalHeaders() {
    const config = useRuntimeConfig();

    const cookies = this.app.ssrContext?.event.headers?.get('cookie');

    const baseOptions = mergeOptions(
      config.public.strictFetchOptions,
      this.config.options,
    );

    return baseOptions.proxyServerCookies && cookies ? { Cookie: cookies } : {};
  }

  autoInit = () => {
    this.app.provide('strictFetch', {
      options: {},
      orderRequests: {},
      orderHooks: {},
      methodSignals: {},
    } as PluginOptionsType)
  };
}

export const StrictFetch: IStrictFetch = new ClientStrictFetch();
