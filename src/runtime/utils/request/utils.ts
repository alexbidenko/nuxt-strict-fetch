import type {Options} from "./types";

export const mergeOptions = (...list: (Options | Options[] | undefined)[]): Options =>
  list.reduce<Options>((acc, options) => {
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
