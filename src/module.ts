import {
  defineNuxtModule,
  addPlugin,
  createResolver,
  addImportsDir,
  addServerImportsDir,
  addTypeTemplate
} from '@nuxt/kit';
import { ValidatorOption } from './runtime/types';

export interface ModuleOptions {
  baseURL?: string;
  validator?: ValidatorOption | `${ValidatorOption}`;
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-strict-fetch',
    configKey: 'strictFetch',
    compatibility: {
      nuxt: '>=3.0.0',
    },
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url);
    const { resolve } = createResolver(import.meta.url);

    nuxt.options.runtimeConfig = nuxt.options.runtimeConfig || { public: {} };
    nuxt.options.runtimeConfig.public.strictFetchOptions = options as any;
    nuxt.options.alias = nuxt.options.alias || {};
    nuxt.options.alias['#strict-fetch'] = resolve('./runtime/utils/common/types');

    addPlugin(resolver.resolve('./runtime/plugin'));

    addImportsDir(resolver.resolve('./runtime/utils/common'));
    addImportsDir(resolver.resolve('./runtime/utils/client'));
    addImportsDir(resolver.resolve('./runtime/composables'));

    addServerImportsDir(resolver.resolve('./runtime/utils/common'));
    addServerImportsDir(resolver.resolve('./runtime/utils/server'));

    if (options.validator) {
      const validator = <ValidatorOption>options.validator;

      switch (validator) {
        case ValidatorOption.YUP: {
          addTypeTemplate({
            filename: 'types/nuxt-strict-fetch.d.ts',
            src: resolver.resolve('./runtime/schemas/yup-validator.d.ts'),
          });
          break;
        }
        case ValidatorOption.ZOD: {
          addTypeTemplate({
            filename: 'types/nuxt-strict-fetch.d.ts',
            src: resolver.resolve('./runtime/schemas/zod-validator.d.ts'),
          });
          break;
        }
        default: {
          const _: never = validator;
          return _;
        }
      }
    }
  },
});
