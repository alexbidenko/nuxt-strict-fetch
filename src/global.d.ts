import type { NuxtPluginType, StrictFetchOptions, ValidatorOption } from './runtime/types';

interface BasePublicRuntimeConfig {
  strictFetchOptions: {
    baseURL?: string;
    validator?: ValidatorOption | `${ValidatorOption}`;
  };
}

declare module '#app' {
  interface NuxtApp extends NuxtPluginType {}
}

declare module 'nuxt/dist/app/nuxt' {
  interface NuxtApp extends NuxtPluginType {}
}

declare module '@nuxt/schema' {
  interface PublicRuntimeConfig extends BasePublicRuntimeConfig {}
  interface UserPublicRuntimeConfig extends BasePublicRuntimeConfig {}
  interface SharedPublicRuntimeConfig extends BasePublicRuntimeConfig {}
}

declare module 'nuxt/schema' {
  interface PublicRuntimeConfig extends BasePublicRuntimeConfig {}
  interface UserPublicRuntimeConfig extends BasePublicRuntimeConfig {}
  interface SharedPublicRuntimeConfig extends BasePublicRuntimeConfig {}
}

export {};
