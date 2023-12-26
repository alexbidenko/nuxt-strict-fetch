import { caseTransfer } from './cases';
import {mergeOptions, prepareRequestBody, validateParameters} from "./utils";
import type {
  IStrictFetch,
  HookKey,
  PluginOptionsType,
  PreparedRequestType,
  RequestBodyInitialType,
  RequestParamsInitialType,
  RequestQueryInitialType,
  SimpleNuxtApp,
  StrictFetchOptions,
  PrepareRequestSettings,
} from './types';
import {
  Case,
  FetchError,
  HTTPError,
  HTTPMethod,
  RequestError,
  ResponseError,
} from './types';

export class StrictFetchConstructor implements IStrictFetch {
  private readonly _useApp?: () => SimpleNuxtApp;

  constructor(useApp?: () => SimpleNuxtApp) {
    this._useApp = useApp;
  }

  get app() {
    return this._useApp?.();
  }

  autoInit = () => {
    this.app?.provide('strictFetch', {
      options: {},
      orderRequests: {},
      orderHooks: {},
      methodSignals: {},
    } as PluginOptionsType)
  };

  init = (options: StrictFetchOptions) => {
    const nuxtApp = this.app;

    if (nuxtApp) Object.assign(nuxtApp.$strictFetch.options, options);
  };

  hooks = {
    subscribe: (key: HookKey, handler: () => void) => {
      const options = this.app?.$strictFetch;
      if (options) options.orderHooks[key] = [...(options.orderHooks[key] || []), handler];
    },
    unsubscribe: (key: HookKey, handler: () => void) => {
      const options = this.app?.$strictFetch;
      if (options) options.orderHooks[key] = options.orderHooks[key]?.filter(
        (el) => el !== handler,
      );
    },
  };

  private setupDefaultOptions = (options: StrictFetchOptions | StrictFetchOptions[]) => {
    const mergedOptions = mergeOptions(options);

    if (!mergedOptions.method) mergedOptions.methodKey = crypto.randomUUID();

    return mergedOptions;
  };

  private execute = async <R>(
    url: string,
    {
      fetch = $fetch,
      orderKey,
      groupKey: _,
      methodKey,
      selfInterrupted,
      ...options
    }: StrictFetchOptions,
    pluginOptions?: PluginOptionsType,
  ): Promise<R> => {
    if (methodKey && pluginOptions) {
      pluginOptions.orderHooks[`method:${methodKey}:start`]?.forEach((el) =>
        el(),
      );
      if (selfInterrupted) {
        pluginOptions.methodSignals[methodKey]?.abort();
        pluginOptions.methodSignals[methodKey] = new AbortController();
      }
    }

    if (orderKey && pluginOptions) {
      await new Promise((r) => {
        if (pluginOptions.orderRequests[orderKey])
          pluginOptions.orderRequests[orderKey].push(r);
        else {
          pluginOptions.orderHooks[`order:${orderKey}:start`]?.forEach((el) => el());
          pluginOptions.orderRequests[orderKey] = [r];
        }

        if (pluginOptions.orderRequests[orderKey][0] === r) r(true);
      });
    }

    return fetch<R>(url, {
      signal: methodKey
        ? pluginOptions?.methodSignals[methodKey]?.signal
        : null,
      ...options,
    }).catch((error) => {
      if (options.catch) return options.catch<R>(error);
      throw error;
    }).finally(() => {
      if (!pluginOptions) return;

      if (methodKey) {
        pluginOptions.orderHooks[`method:${methodKey}:finish`]?.forEach((el) =>
          el(),
        );
        delete pluginOptions.methodSignals[methodKey];
      }

      if (orderKey) {
        pluginOptions.orderRequests[orderKey].shift();
        if (!pluginOptions.orderRequests[orderKey].length) {
          delete pluginOptions.orderRequests[orderKey];
          pluginOptions.orderHooks[`order:${orderKey}:finish`]?.forEach((el) =>
            el(),
          );
        } else pluginOptions.orderRequests[orderKey][0](true);
      }
    });
  };

  prepare = <
    R,
    B extends RequestBodyInitialType = undefined,
    P extends RequestParamsInitialType = undefined,
    Q extends RequestQueryInitialType = undefined,
  >({
    url,
    method = HTTPMethod.get,
    schemas,
    options = {},
  }: PrepareRequestSettings<R, B, P, Q>) => {
    options = this.setupDefaultOptions(options);

    const executor: PreparedRequestType<R, B, P, Q> = async (
      parameters,
      additionalOptions = {},
    ) => {
      const nuxtApp = this.app;
      const cookies = nuxtApp?.ssrContext?.event.headers?.get('cookie');

      const baseOptions = mergeOptions(
        options,
        additionalOptions,
        nuxtApp?.$config.public.strictFetchOptions,
        nuxtApp?.$strictFetch.options,
      );

      try {
        const [body, params, query] = await Promise.all([
          validateParameters(schemas, parameters, 'body' as const),
          validateParameters(schemas, parameters, 'params'),
          validateParameters(schemas, parameters, 'query'),
        ]);

        const data = await this.execute<R>(
          typeof url === 'function' ? url(params as P) : url,
          mergeOptions(baseOptions, {
            headers: baseOptions.proxyServerCookies && cookies ? { Cookie: cookies } : {},
            method,
            params: query,
            body: prepareRequestBody(body, baseOptions),
            onRequestError(context) {
              throw new RequestError(
                `Fetch request error: ${
                  context.error.message || 'Empty common "message" parameter'
                }`,
              )
                .from(context)
                .with(context.error);
            },
            onResponseError(context) {
              throw new ResponseError(
                `Fetch response error: ${
                  context.response?._data?.message ||
                  context.response?.statusText ||
                  context.error?.message ||
                  'Empty error message'
                }`,
              )
                .from(context, context.response?._data)
                .with(context.error);
            },
          }),
          nuxtApp?.$strictFetch,
        );

        const responseData = caseTransfer(data, Case.camel);
        return (
          schemas?.response
            ? await schemas.response.validate(responseData)
            : responseData
        ) as R;
      } catch (e) {
        const error = e as FetchError;
        if (error.name !== HTTPError.AbortError) {
          baseOptions.onError?.(error);
        }
        throw error;
      }
    };

    executor.schemas = schemas;

    return executor;
  };
}
