import type { FetchContext, FetchOptions } from 'ofetch';
import type { $Fetch } from 'nitropack';

interface InitialFetchOptions extends FetchOptions {}

interface InitialFetchContext extends FetchContext {}

export enum ValidatorOption {
  YUP = 'yup',
  ZOD = 'zod',
}

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

export interface AbstractSchemas {
  response?: any;
  body?: any;
  params?: any;
  query?: any;
}

export interface StrictFetchContext extends InitialFetchContext {}

export interface DynamicFetchOptions extends Omit<InitialFetchOptions, 'method'> {}

export interface StrictFetchOptions<B = unknown, P = unknown, Q = unknown> extends DynamicFetchOptions {
  method?: HTTPMethod;
  orderKey?: string;
  groupKey?: string;
  methodKey?: string | ((parameters: RequestParametersType<B, P, Q>) => string);
  proxyServerCookies?: boolean;
  selfInterrupted?: boolean;
  formData?: boolean;
  onError?: (error: RequestError | ResponseError) => void;
  fetch?: $Fetch;
  catch?: <R>(error: RequestError | ResponseError) => Promise<R>;
}

export interface PluginOptionsType {
  options: StrictFetchOptions;
  orderRequests: Record<string, ((v: unknown) => void)[]>;
  orderHooks: Record<string, (() => void)[]>;
  methodSignals: Record<string, AbortController>;
}

export interface NuxtPluginType {
  $strictFetch: PluginOptionsType;
}

interface ErrorBodyType {
  data?: {
    message?: string;
  };
  message?: string;
}

export type RequestBodyInitialType = FormData | object | undefined | null;
export type RequestParamsInitialType = object | undefined | null;
export type RequestQueryInitialType = Record<string, unknown> | undefined | null;

export type RequestParametersType<B, P, Q> = object &
  (B extends undefined | null ? object : { body: B }) &
  (P extends undefined | null ? object : { params: P }) &
  (Q extends undefined | null ? object : { query: Q });

interface ValidatorObject<T> {
  validate: (v: unknown) => T;
  isValid: (v: unknown) => boolean;
}

export interface ValidatorAdapter<R, B = undefined, P = undefined, Q = undefined> {
  response?: ValidatorObject<R>;
  body?: ValidatorObject<B>;
  params?: ValidatorObject<P>;
  query?: ValidatorObject<Q>;
}

export interface PreparedRequestType<
  R,
  B extends RequestBodyInitialType = undefined,
  P extends RequestParamsInitialType = undefined,
  Q extends RequestQueryInitialType = undefined,
> {
  (parameters?: RequestParametersType<B, P, Q> | null, additionalOptions?: StrictFetchOptions): Promise<R>;
  schemas?: AbstractSchemas;
}

export type HookKey = `${'order' | 'method'}:${string}:${'finish' | 'start'}`;

export enum HTTPError {
  AbortError = 'AbortError',
}

export interface PrepareRequestSettings<_R, B, P, Q> {
  url: string | ((params: P) => string);
  method?: HTTPMethod;
  options?: StrictFetchOptions<B, P, Q> | StrictFetchOptions<B, P, Q>[];
}

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
