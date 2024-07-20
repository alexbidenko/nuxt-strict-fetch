import { defineNuxtModule, addPlugin, createResolver, addImportsDir, addServerImportsDir } from '@nuxt/kit'

export interface ModuleOptions {
  baseURL?: string
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-strict-fetch',
    configKey: 'strictFetch',
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)
    nuxt.options.runtimeConfig.public.strictFetchOptions = options

    addPlugin(resolver.resolve('./runtime/plugin'))

    addImportsDir(resolver.resolve('./runtime/utils/common'))
    addImportsDir(resolver.resolve('./runtime/utils/client'))
    addImportsDir(resolver.resolve('./runtime/composables'))

    addServerImportsDir(resolver.resolve('./runtime/utils/common'))
    addServerImportsDir(resolver.resolve('./runtime/utils/server'))

    // addTypeTemplate({
    //   filename: 'types/nuxt-strict-fetch.d.ts',
    //   src: resolver.resolve('./global.d.ts'),
    // });
  },
})
