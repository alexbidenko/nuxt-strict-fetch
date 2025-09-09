import { caseTransfer } from './cases';
import { mergeOptions, prepareRequestBody, validateParameters, getValidatorAdapter } from './utils';
import type {
  IStrictFetch,
  HookKey,
  PluginOptionsType,
  PreparedRequestType,
  RequestBodyInitialType,
  RequestParamsInitialType,
  RequestQueryInitialType,
  StrictFetchOptions,
  PrepareRequestSettings,
  FetchError,
} from './types';
import { Case, HTTPError, HTTPMethod, RequestError, ResponseError } from './types';
import { useRuntimeConfig } from '#imports';

export class CommonStrictFetch implements IStrictFetch {
  private readonly _config: PluginOptionsType = {
    options: {},
    orderRequests: {},
    orderHooks: {},
    methodSignals: {},
  };

  protected get config(): PluginOptionsType {
    return this._config;
  }

  protected get additionalHeaders() {
    return {};
  }

  init = (options: StrictFetchOptions) => {
    Object.assign(this.config.options, options);
  };

  hooks = {
    subscribe: (key: HookKey, handler: () => void) => {
      this.config.orderHooks[key] = [...(this.config.orderHooks[key] || []), handler];
    },
    unsubscribe: (key: HookKey, handler: () => void) => {
      if (this.config.orderHooks[key]) {
        this.config.orderHooks[key] = this.config.orderHooks[key].filter((el) => el !== handler);
      }
    },
  };

  private setupDefaultOptions = (options: StrictFetchOptions | StrictFetchOptions[]) => {
    const mergedOptions = mergeOptions(options);

    if (!mergedOptions.method) mergedOptions.methodKey = crypto.randomUUID();

    return mergedOptions;
  };

  private execute = async <R>(
    url: string,
    { fetch = $fetch, orderKey, groupKey: _, methodKey, selfInterrupted, ...options }: StrictFetchOptions,
    pluginOptions?: PluginOptionsType,
  ): Promise<R> => {
    if (methodKey && pluginOptions) {
      pluginOptions.orderHooks[`method:${methodKey}:start`]?.forEach((el) => el());
      if (selfInterrupted) {
        pluginOptions.methodSignals[methodKey]?.abort();
        pluginOptions.methodSignals[methodKey] = new AbortController();
      }
    }

    if (orderKey && pluginOptions) {
      await new Promise((r) => {
        if (pluginOptions.orderRequests[orderKey]) pluginOptions.orderRequests[orderKey].push(r);
        else {
          pluginOptions.orderHooks[`order:${orderKey}:start`]?.forEach((el) => el());
          pluginOptions.orderRequests[orderKey] = [r];
        }

        if (pluginOptions.orderRequests[orderKey][0] === r) r(true);
      });
    }

    return fetch<R, string>(url, {
      signal: methodKey ? pluginOptions?.methodSignals[methodKey]?.signal : null,
      ...options,
    })
      .catch((error) => {
        if (options.catch) return options.catch<R>(error);
        throw error;
      })
      .finally(() => {
        if (!pluginOptions) return;

        if (methodKey) {
          pluginOptions.orderHooks[`method:${methodKey}:finish`]?.forEach((el) => el());
          delete pluginOptions.methodSignals[methodKey];
        }

        if (orderKey) {
          pluginOptions.orderRequests[orderKey]?.shift();
          if (!pluginOptions.orderRequests[orderKey]?.length) {
            delete pluginOptions.orderRequests[orderKey];
            pluginOptions.orderHooks[`order:${orderKey}:finish`]?.forEach((el) => el());
          } else pluginOptions.orderRequests[orderKey]?.[0]?.(true);
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
    method = HTTPMethod.GET,
    options = {},
    ...rest
  }: PrepareRequestSettings<R, B, P, Q>) => {
    options = this.setupDefaultOptions(options);

    const executor: PreparedRequestType<R, B, P, Q> = async (parameters, additionalOptions = {}) => {
      const runtimeConfig = useRuntimeConfig();
      const validator = getValidatorAdapter<R, B, P, Q>((rest as any).schemas);
      const config = this.config;
      const additionalHeaders = this.additionalHeaders;
      const baseOptions = mergeOptions(
        options,
        additionalOptions,
        runtimeConfig.public.strictFetchOptions,
        config.options,
      );

      try {
        const [body, params, query] = await Promise.all([
          validateParameters(validator, parameters, 'body'),
          validateParameters(validator, parameters, 'params'),
          validateParameters(validator, parameters, 'query'),
        ]);

        const data = await this.execute<R>(
          typeof url === 'function' ? url(params as P) : url,
          mergeOptions(baseOptions, {
            headers: additionalHeaders,
            method,
            params: query,
            body: prepareRequestBody(body, baseOptions),
            onRequestError(context) {
              throw new RequestError(
                `Fetch request error: ${context.error.message || 'Empty common "message" parameter'}`,
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
          config,
        );

        const responseData = caseTransfer(data, Case.CAMEL);
        return (validator?.response ? await validator.response.validate(responseData) : responseData) as R;
      } catch (e) {
        const error = e as FetchError;
        if (error.name !== HTTPError.AbortError) {
          baseOptions.onError?.(error);
        }
        throw error;
      }
    };

    executor.schemas = (rest as any).schemas;

    return executor;
  };
}
