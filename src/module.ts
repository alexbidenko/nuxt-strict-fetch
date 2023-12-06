import {defineNuxtModule, addPlugin, createResolver, addImportsDir} from '@nuxt/kit';
import type {Options} from "./runtime/utils/request/types";

export interface ModuleOptions extends Pick<Options, 'baseURL'> {}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-strict-fetch',
    configKey: 'strictFetch'
  },
  setup (options, nuxt) {
    const resolver = createResolver(import.meta.url);
    nuxt.options.runtimeConfig.public.strictFetchOptions = options;

    addPlugin(resolver.resolve('./runtime/plugin'));
    addImportsDir(resolver.resolve('./runtime/utils/request'));
    addImportsDir(resolver.resolve('./runtime/composables'));
  }
})
