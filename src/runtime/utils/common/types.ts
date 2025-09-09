import type { Schema } from 'yup';
import type { FetchContext, FetchOptions } from 'ofetch';
import type { $Fetch } from 'nitropack';
import type { NuxtApp } from '#app';

type InitialFetchOptions = FetchOptions;

type InitialFetchContext = FetchContext;

export type SimpleNuxtApp = Pick<NuxtApp, 'provide' | 'ssrContext' | '$config' | '$strictFetch'>;

export enum Case {
  CAMEL,
  SNAKE,
}

export enum HTTPMethod {
  HEAD = 'head',
  GET = 'get',
  POST = 'post',
  PUT = 'put',
  PATCH = 'patch',
  DELETE = 'delete',
  CONNECT = 'connect',
  OPTIONS = 'options',
  TRACE = 'trace',
}

export type StrictFetchContext = InitialFetchContext;

export type DynamicFetchOptions = Omit<InitialFetchOptions, 'method'>;

export type StrictFetchOptions = DynamicFetchOptions & {
  method?: HTTPMethod;
  orderKey?: string;
  groupKey?: string;
  methodKey?: string;
  proxyServerCookies?: boolean;
  selfInterrupted?: boolean;
  formData?: boolean;
  onError?: (error: RequestError | ResponseError) => void;
  fetch?: $Fetch;
  catch?: <R>(error: RequestError | ResponseError) => Promise<R>;
};

export type PluginOptionsType = {
  options: StrictFetchOptions;
  orderRequests: Record<string, ((v: unknown) => void)[]>;
  orderHooks: Record<string, (() => void)[]>;
  methodSignals: Record<string, AbortController>;
};

export type NuxtPluginType = {
  $strictFetch: PluginOptionsType;
};

type ErrorBodyType = {
  data?: {
    message?: string;
  };
  message?: string;
};

export type SchemasType<R, B = undefined, P = undefined, Q = undefined> = {
  response?: Schema<R>;
  body?: Schema<B>;
  params?: Schema<P>;
  query?: Schema<Q>;
};

export type RequestBodyInitialType = FormData | object | undefined | null;
export type RequestParamsInitialType = object | undefined | null;
export type RequestQueryInitialType = Record<string, unknown> | undefined | null;

export type RequestParametersType<B, P, Q> = object &
  (B extends undefined | null ? object : { body: B }) &
  (P extends undefined | null ? object : { params: P }) &
  (Q extends undefined | null ? object : { query: Q });

export type PreparedRequestType<
  R,
  B extends RequestBodyInitialType = undefined,
  P extends RequestParamsInitialType = undefined,
  Q extends RequestQueryInitialType = undefined,
> = {
  (parameters?: RequestParametersType<B, P, Q> | null, additionalOptions?: StrictFetchOptions): Promise<R>;
  schemas?: SchemasType<R, B, P, Q>;
};

export type HookKey = `${'order' | 'method'}:${string}:${'finish' | 'start'}`;

export enum HTTPError {
  AbortError = 'AbortError',
}

export type PrepareRequestSettings<R, B, P, Q> = {
  url: string | ((params: P) => string);
  method?: HTTPMethod;
  schemas?: SchemasType<R, B, P, Q>;
  options?: StrictFetchOptions | StrictFetchOptions[];
};

export interface IStrictFetch {
  autoInit?: () => void;

  init: (options: StrictFetchOptions) => void;

  hooks: {
    subscribe: (key: HookKey, handler: () => void) => void;
    unsubscribe: (key: HookKey, handler: () => void) => void;
  };

  prepare: <
    R,
    B extends RequestBodyInitialType = undefined,
    P extends RequestParamsInitialType = undefined,
    Q extends RequestQueryInitialType = undefined,
  >(
    settings: PrepareRequestSettings<R, B, P, Q>,
  ) => PreparedRequestType<R, B, P, Q>;
}

export class FetchError extends Error {
  override name = 'FetchError';
  context?: StrictFetchContext;
  body?: ErrorBodyType;

  from(context: StrictFetchContext, body?: ErrorBodyType) {
    this.context = context;
    this.body = body;
    return this;
  }

  with(error?: Error) {
    if (error) {
      this.name = error.name;
      this.stack = error.stack;
    }
    return this;
  }
}

export class RequestError extends FetchError {
  override name = 'RequestError';
}

export class ResponseError extends FetchError {
  override name = 'ResponseError';
}
