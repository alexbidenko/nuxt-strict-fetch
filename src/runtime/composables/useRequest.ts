import type { Ref } from 'vue';

import type {
  PreparedRequestType,
  RequestParametersType,
} from '../utils/request/types';

type UseRequestReturnType<
  R,
  B extends object | undefined | null = undefined,
  P extends object | undefined | null = undefined,
  Q extends undefined | null | Record<string, string | number> = undefined,
> = {
  execute: () => undefined | Promise<R>;
  isValid: Ref<boolean>;
  isLoading: Ref<boolean>;
  parameters: Ref<RequestParametersType<B, P, Q>>;
};

function useRequest<R>(
  request: PreparedRequestType<R>,
): UseRequestReturnType<R>;

function useRequest<
  R,
  B extends object | undefined | null,
  P extends object | undefined | null,
  Q extends undefined | null | Record<string, string | number>,
>(
  request: PreparedRequestType<R, B, P, Q>,
  parametersGetter: () => RequestParametersType<B, P, Q>,
  options?: {
    validation: () => boolean;
  },
): UseRequestReturnType<R, B, P, Q>;

function useRequest<
  R,
  B extends object | undefined | null,
  P extends object | undefined | null,
  Q extends undefined | null | Record<string, string | number>,
>(
  request: PreparedRequestType<R, B, P, Q>,
  parametersGetter?: () => RequestParametersType<B, P, Q>,
  options?: {
    validation: () => boolean;
  },
) {
  const isLoading = ref(false);

  const parameters = computed<RequestParametersType<B, P, Q>>(
    parametersGetter || (() => ({}) as RequestParametersType<B, P, Q>),
  );
  const additionalIsValid = computed(options?.validation || (() => true));

  const body = computed(() =>
    'body' in parameters.value ? parameters.value.body : undefined,
  );
  const params = computed(() =>
    'params' in parameters.value ? parameters.value.params : undefined,
  );
  const query = computed(() =>
    'query' in parameters.value ? parameters.value.query : undefined,
  );

  const isValid = computed(
    () =>
      (request.schemas?.body?.isValidSync(body.value) ?? true) &&
      (request.schemas?.params?.isValidSync(params.value) ?? true) &&
      (request.schemas?.query?.isValidSync(query.value) ?? true) &&
      additionalIsValid.value,
  );

  const execute = () => {
    if (!isValid.value || isLoading.value) return;
    isLoading.value = true;
    return request(parameters.value as RequestParametersType<B, P, Q>, {
      query: query.value,
    }).finally(() => (isLoading.value = false));
  };

  return {
    execute,
    isValid,
    isLoading,
    parameters,
  };
}

export default useRequest;
