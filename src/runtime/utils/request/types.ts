import type { Schema } from 'yup';

// TODO: import types from ofetch not working correctly
type InitialFetchOptions = Parameters<typeof $fetch.create>[0];

type InitialFetchContext = Parameters<NonNullable<InitialFetchOptions['onRequest']>>[0]

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

export type Options = InitialFetchOptions & {
  method?: HTTPMethod;
  orderKey?: string;
  methodKey?: string;
  groupKey?: string;
  proxyServerCookies?: boolean;
  selfInterrupted?: boolean;
  baseURLMapper?: URLMapItemType[];
  onError?: (error: RequestError | ResponseError) => void;
};

export type PluginOptionsType = {
  options: Options;
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

export type URLMapItemType = {
  prefix: RegExp;
  value: string;
};

export type SchemasType<R, B = undefined, P = undefined, Q = undefined> = {
  response?: Schema<R>;
  body?: Schema<B>;
  params?: Schema<P>;
  query?: Schema<Q>;
};

export type RequestParametersType<B, P, Q> = object &
  (B extends undefined ? object : { body: B }) &
  (P extends undefined ? object : { params: P }) &
  (Q extends undefined ? object : { query: Q });

export type PreparedRequestType<
  R,
  B = undefined,
  P extends object | undefined = undefined,
  Q extends Record<string, string> | undefined = undefined,
> = {
  (
    parameters?: RequestParametersType<B, P, Q> | null,
    additionalOptions?: Options,
  ): Promise<R>;
  schemas?: SchemasType<R, B, P, Q>;
};

export type HookKey = `${'order' | 'method'}:${string}:${'finish' | 'start'}`;

export enum HTTPError {
  AbortError = 'AbortError',
}

export class FetchError extends Error {
  name = 'FetchError';
  context?: InitialFetchContext;
  body?: ErrorBodyType;

  constructor(message: string) {
    super(message);
  }

  from(context: InitialFetchContext, body?: ErrorBodyType) {
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
