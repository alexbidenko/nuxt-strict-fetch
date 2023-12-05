import { caseTransfer } from './cases';
import {mergeOptions} from "./utils";
import type {
  HookKey,
  Options,
  PluginOptionsType,
  PreparedRequestType,
  SchemasType,
} from './types';
import {
  Case,
  FetchError,
  HTTPError,
  HTTPMethod,
  RequestError,
  ResponseError,
} from './types';

export const StrictFetch = {
  autoInit: () => {
    const nuxtApp = useNuxtApp();

    nuxtApp.provide('strictFetch', {
      options: {},
      orderRequests: {},
      orderHooks: {},
      methodSignals: {},
    } as PluginOptionsType)
  },

  // TODO: need opportunity to replace default $fetch method for custom ($csrfFetch from nuxt-security for example)
  init: (options: Options) => {
    const nuxtApp = useNuxtApp();

    Object.assign(nuxtApp.$strictFetch.options, options);
  },

  hooks: {
    subscribe: (key: HookKey, handler: () => void) => {
      const { $strictFetch } = useNuxtApp();
      $strictFetch.orderHooks[key] = [...($strictFetch.orderHooks[key] || []), handler];
    },
    unsubscribe: (key: HookKey, handler: () => void) => {
      const { $strictFetch } = useNuxtApp();
      $strictFetch.orderHooks[key] = $strictFetch.orderHooks[key]?.filter(
        (el) => el !== handler,
      );
    },
  },

  execute: async <T>(
    url: string,
    {
      orderKey,
      methodKey,
      groupKey: _,
      selfInterrupted,
      baseURLMapper,
      ...options
    }: Options,
    pluginOptions?: PluginOptionsType,
  ) => {
    const mapper = baseURLMapper?.find((item) => item.prefix.test(url));

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
          pluginOptions.orderHooks[`order:${orderKey}:start`]?.forEach((el) =>
            el(),
          );
          pluginOptions.orderRequests[orderKey] = [r];
        }

        if (pluginOptions.orderRequests[orderKey][0] === r) r(true);
      });
    }

    return $fetch<T>(mapper ? url.replace(mapper.prefix, '') : url, {
      signal: methodKey
        ? pluginOptions?.methodSignals[methodKey]?.signal
        : null,
      baseURL: mapper?.value || options.baseURL,
      ...options,
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
  },

  prepare: <
    R,
    B extends object | undefined = undefined,
    P extends object | undefined = undefined,
    Q extends Record<string, string> | undefined = undefined,
  >({
    url,
    method = HTTPMethod.get,
    schemas,
    options = {},
  }: {
    url: string | ((params: P) => string);
    method?: HTTPMethod;
    schemas?: SchemasType<R, B, P, Q>;
    options?: Options | Options[];
  }) => {
    const executor: PreparedRequestType<R, B, P, Q> = async (
      parameters,
      additionalOptions = {},
    ) => {
      const nuxtApp =
        typeof useNuxtApp !== 'undefined' ? useNuxtApp() : undefined;
      const cookies = nuxtApp?.ssrContext?.event.headers?.get('cookie');

      const baseOptions = mergeOptions(
        options,
        additionalOptions,
        nuxtApp?.$config.public.strictFetchOptions,
        nuxtApp?.$strictFetch.options,
      );

      try {
        const [body, params] = await Promise.all([
          (parameters &&
            'body' in parameters &&
            schemas?.body?.validate(parameters.body)) ||
            undefined,
          (parameters &&
            'params' in parameters &&
            schemas?.params?.validate(parameters.params)) ||
            undefined,
        ]);

        const data = await StrictFetch.execute<R>(
          typeof url === 'function' ? url(params as P) : url,
          mergeOptions(baseOptions, {
            headers: baseOptions.proxyServerCookies && cookies ? { Cookie: cookies } : {},
            method,
            body: body && caseTransfer(body, Case.snake),
            onRequestError(context) {
              throw new RequestError(
                `Fetch request error: ${
                  context.error.message || 'Empty request "message" parameter'
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
  },
};
