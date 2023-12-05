import type {NuxtPluginType, Options} from "./runtime/utils/request/types";

declare module '#app' {
  interface NuxtApp extends NuxtPluginType {}
}

declare module 'nuxt/dist/app/nuxt' {
  interface NuxtApp extends NuxtPluginType {}
}

declare module 'nuxt/schema' {
  interface RuntimeConfig {}

  interface PublicRuntimeConfig {
    strictFetchOptions?: Options
  }
}

export {};
