import type { NuxtPluginType, StrictFetchOptions } from './runtime/utils/common/types'

declare module '#app' {
  interface NuxtApp extends NuxtPluginType {}
}

declare module 'nuxt/dist/app/nuxt' {
  interface NuxtApp extends NuxtPluginType {}
}

declare module 'nuxt/schema' {
  interface RuntimeConfig {}

  interface PublicRuntimeConfig {
    strictFetchOptions: StrictFetchOptions
  }
}

export {}
