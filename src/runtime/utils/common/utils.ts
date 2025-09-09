import {Case, ValidatorOption} from './types';
import type {
  AbstractSchemas,
  RequestBodyInitialType,
  RequestParametersType,
  RequestParamsInitialType,
  RequestQueryInitialType,
  StrictFetchOptions,
  ValidatorAdapter,
} from './types';
import { caseTransfer, isObject } from './cases';

export const mergeOptions = (...list: (StrictFetchOptions | StrictFetchOptions[] | undefined)[]): StrictFetchOptions =>
  list.reduce<StrictFetchOptions>((acc, options) => {
    const mergedOptions = Array.isArray(options) ? mergeOptions(...options) : options;

    if (!mergedOptions) return acc;

    return {
      ...acc,
      ...mergedOptions,
      ...(acc.onRequest && mergedOptions.onRequest ? ({
        onRequest: [
          ...(Array.isArray(acc.onRequest) ? acc.onRequest : [acc.onRequest]),
          ...(Array.isArray(mergedOptions.onRequest) ? mergedOptions.onRequest : [mergedOptions.onRequest]),
        ],
      }) : {}),
      ...(acc.onResponse && mergedOptions.onResponse ? ({
        onResponse: [
          ...(Array.isArray(acc.onResponse) ? acc.onResponse : [acc.onResponse]),
          ...(Array.isArray(mergedOptions.onResponse) ? mergedOptions.onResponse : [mergedOptions.onResponse]),
        ],
      }) : {}),
      ...(acc.onRequestError && mergedOptions.onRequestError ? ({
        onRequestError: [
          ...(Array.isArray(acc.onRequestError) ? acc.onRequestError : [acc.onRequestError]),
          ...(Array.isArray(mergedOptions.onRequestError) ? mergedOptions.onRequestError : [mergedOptions.onRequestError]),
        ],
      }) : {}),
      ...(acc.onResponseError && mergedOptions.onResponseError ? ({
        onResponseError: [
          ...(Array.isArray(acc.onResponseError) ? acc.onResponseError : [acc.onResponseError]),
          ...(Array.isArray(mergedOptions.onResponseError) ? mergedOptions.onResponseError : [mergedOptions.onResponseError]),
        ],
      }) : {}),
      // TODO: headers might be function for global dynamic headers (like Authorization header for example)
      headers: { ...acc.headers, ...mergedOptions.headers },
    };
  }, {});

export const validateParameters = <
  R,
  B extends RequestBodyInitialType = undefined,
  P extends RequestParamsInitialType = undefined,
  Q extends RequestQueryInitialType = undefined,
>(
  validator: ValidatorAdapter<R, B, P, Q> | undefined | null,
  parameters: RequestParametersType<B, P, Q> | undefined | null,
  field: 'body' | 'params' | 'query',
) => {
  const _parameters = parameters as any;
  const _validator = validator as any;

  return _parameters?.[field] && (_validator?.[field]?.validate(_parameters[field]) || _parameters[field] || undefined);
};

export const prepareRequestBody = <T extends RequestBodyInitialType = undefined>(
  body: T,
  options: StrictFetchOptions,
) => {
  if (!body || body instanceof FormData) return body;
  if (options.formData && isObject(body)) {
    const formData = new FormData();
    Object.entries(body).forEach(([key, value]) => {
      if (Array.isArray(value)) value.forEach((item) => formData.append(key, item));
      else formData.append(key, value);
    });
    return formData;
  }
  return caseTransfer(body, Case.SNAKE);
};

const tryValidate = <T>(validate: (value: T) => unknown) => (value: T) => {
  try {
    validate(value);
    return true;
  } catch {
    return false;
  }
};

export const getValidatorAdapter = <R, B, P, Q>(schemas?: AbstractSchemas): ValidatorAdapter<R, B, P, Q> | null => {
  const runtimeConfig = useRuntimeConfig();
  const validator = <ValidatorOption | null>runtimeConfig.public.strictFetchOptions.validator;

  if (!validator) return null;

  switch (validator) {
    case ValidatorOption.YUP: {
      return {
        response: schemas?.response && {
          validate: schemas.response.validateSync.bind(schemas.response),
          isValid: schemas.response.isValidSync.bind(schemas.response),
        },
        body: schemas?.body && {
          validate: schemas.body.validateSync.bind(schemas.body),
          isValid: schemas.body.isValidSync.bind(schemas.body),
        },
        params: schemas?.params && {
          validate: schemas.params.validateSync.bind(schemas.params),
          isValid: schemas.params.isValidSync.bind(schemas.params),
        },
        query: schemas?.query && {
          validate: schemas.query.validateSync.bind(schemas.query),
          isValid: schemas.query.isValidSync.bind(schemas.query),
        },
      };
    }
    case ValidatorOption.ZOD: {
      return {
        response: schemas?.response && {
          validate: schemas.response.parse.bind(schemas.response),
          isValid: tryValidate(schemas.response.parse.bind(schemas.response)),
        },
        body: schemas?.body && {
          validate: schemas.body.parse.bind(schemas.body),
          isValid: tryValidate(schemas.body.parse.bind(schemas.body)),
        },
        params: schemas?.params && {
          validate: schemas.params.parse.bind(schemas.params),
          isValid: tryValidate(schemas.params.parse.bind(schemas.params)),
        },
        query: schemas?.query && {
          validate: schemas.query.parse.bind(schemas.query),
          isValid: tryValidate(schemas.query.parse.bind(schemas.query)),
        },
      };
    }
    default: {
      const _: never = validator;
      return _;
    }
  }
};
