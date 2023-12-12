import type { Schema } from 'yup';
import type { FetchContext, FetchOptions } from 'ofetch';
import type { $Fetch } from "nitropack";

type InitialFetchOptions = FetchOptions;

type InitialFetchContext = FetchContext;

export enum Case {
  camel,
  snake,
}

export enum HTTPMethod {
  get = 'get',
  post = 'post',
  put = 'put',
  patch = 'patch',
  delete = 'delete',
}

export type StrictFetchContext = InitialFetchContext;

export type StrictFetchOptions = Omit<InitialFetchOptions, 'method'> & {
  method?: HTTPMethod;
  orderKey?: string;
  groupKey?: string;
  methodKey?: string;
  proxyServerCookies?: boolean;
  selfInterrupted?: boolean;
  formData?: boolean;
  onError?: (error: RequestError | ResponseError) => void;
  fetch?: $Fetch;
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
  (
    parameters?: RequestParametersType<B, P, Q> | null,
    additionalOptions?: StrictFetchOptions,
  ): Promise<R>;
  schemas?: SchemasType<R, B, P, Q>;
};

export type HookKey = `${'order' | 'method'}:${string}:${'finish' | 'start'}`;

export enum HTTPError {
  AbortError = 'AbortError',
}

export class FetchError extends Error {
  name = 'FetchError';
  context?: StrictFetchContext;
  body?: ErrorBodyType;

  constructor(message: string) {
    super(message);
  }

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
  name = 'RequestError';

  constructor(message: string) {
    super(message);
  }
}

export class ResponseError extends FetchError {
  name = 'ResponseError';

  constructor(message: string) {
    super(message);
  }
}
