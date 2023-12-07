import type {
  RequestBodyInitialType,
  RequestParametersType,
  RequestParamsInitialType, RequestQueryInitialType,
  SchemasType,
  StrictFetchOptions
} from './types';

export const mergeOptions = (...list: (StrictFetchOptions | StrictFetchOptions[] | undefined)[]): StrictFetchOptions =>
  list.reduce<StrictFetchOptions>((acc, options) => {
    const mergedOptions = Array.isArray(options)
      ? mergeOptions(...options)
      : options;

    if (!mergedOptions) return acc;

    return {
      ...acc,
      ...mergedOptions,
      ...(acc.onRequest && mergedOptions.onRequest ? {
        onRequest: async (context) => {
          await acc.onRequest?.(context);
          await mergedOptions.onRequest?.(context);
        },
      } : {}),
      ...(acc.onResponse && mergedOptions.onResponse ? {
        onResponse: async (context) => {
          await acc.onResponse?.(context);
          await mergedOptions.onResponse?.(context);
        },
      } : {}),
      ...(acc.onRequestError && mergedOptions.onRequestError ? {
        onRequestError: async (context) => {
          await acc.onRequestError?.(context);
          await mergedOptions.onRequestError?.(context);
        }
      } : {}),
      ...(acc.onResponseError && mergedOptions.onResponseError ? {
        onResponseError: async (context) => {
          await acc.onResponseError?.(context);
          await mergedOptions.onResponseError?.(context);
        }
      } : {}),
      // TODO: headers might be function for global dynamic headers (like Authorization header for example)
      headers: { ...(acc.headers || {}), ...(mergedOptions.headers || {}) },
    };
  }, {});

export const validateParameters = async <
  R,
  B extends RequestBodyInitialType = undefined,
  P extends RequestParamsInitialType = undefined,
  Q extends RequestQueryInitialType = undefined,
>(
  schemas: SchemasType<R, B, P, Q> | undefined,
  parameters: RequestParametersType<B, P, Q> | undefined | null,
  field: 'body' | 'params' | 'query',
) => {
  const _parameters = parameters as any;
  const _schemas = schemas as any;

  return _parameters?.[field] && (_schemas?.[field]?.validate(_parameters[field]) || _parameters[field] || undefined);
};
