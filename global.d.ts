import type {NuxtPluginType} from "~/utils/request/types";

declare module '#app' {
    interface NuxtApp extends NuxtPluginType {}
}

declare module 'nuxt/dist/app/nuxt' {
    interface NuxtApp extends NuxtPluginType {}
}

export {};
