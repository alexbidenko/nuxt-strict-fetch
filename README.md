# Nuxt Strict Fetch

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

My new Nuxt module for doing amazing things.

- [✨ &nbsp;Release Notes](/CHANGELOG.md)
<!-- - [🏀 Online playground](https://stackblitz.com/github/your-org/my-module?file=playground%2Fapp.vue) -->
<!-- - [📖 &nbsp;Documentation](https://example.com) -->

## Features

<!-- Highlight some of the features your module provide here -->
- ⛰ &nbsp;Foo
- 🚠 &nbsp;Bar
- 🌲 &nbsp;Baz

## Quick Setup

1. Add `nuxt-strict-fetch` dependency to your project

```bash
# Using pnpm
pnpm add -D nuxt-strict-fetch

# Using yarn
yarn add --dev nuxt-strict-fetch

# Using npm
npm install --save-dev nuxt-strict-fetch
```

2. Add `nuxt-strict-fetch` to the `modules` section of `nuxt.config.ts`

```ts
export default defineNuxtConfig({
  modules: [
    'nuxt-strict-fetch'
  ]
})
```

That's it! You can now use Nuxt Strict Fetch in your Nuxt app ✨

## Module Options

```ts
export default defineNuxtConfig({
  modules: [
    'nuxt-strict-fetch'
  ],
  strictFetch: {
    // base URL for all requests
    baseURL: '/api/',
    // check path prefix and replace prefix and baseURL
    // for example:
    // StrictFetch.prepare({ url: 'external' })
    // will be converted to:
    // StrictFetch.prepare({ url: 'https://external.com/api' })
    baseURLMapper: [
      {
        prefix: /^external/,
        value: 'https://external.com/api'
      }
    ],
  },
})
```

## Plugin Setup

If you wish to define some global options for all requests in plugin, you can use the `StrictFetch.init`:

```ts
export default defineNuxtPlugin(() => {
  StrictFetch.init({
    onRequest(context) {
      context.options.headers = {
        ...context.options.headers,
        Custom: 'Value',
      };
    }
  });
});
```

## Define Methods

Nuxt Strict Fetch module assumes the following method declaration:

```ts
// ~/api/common.ts for example

type Filter = { name?: string };

type Item = { id: number; name: string; };

type List = { items: Item[] };

type CreateItem = { name: string; };

const CommonAPI = {
  list: StrictFetch.prepare<List, null, null, Filter>({
    url: 'list',
  }),
  create: StrictFetch.prepare<Item, CreateItem>({
    url: 'list',
    method: HTTPMethod.post,
  }),
  details: StrictFetch.prepare<Item, null, { id: number }>({
    url: ({ id }) => `list/${id}`,
  }),
}
```

`prepare` method has the following generic types:

```ts
StrictFetch.prepare<R /* response body */, B /* request body */, P /* request params */, Q /* request query */>
```

Also, you may define API with validation schemas:

```ts
// ~/api/common.ts for example
import * as yup from 'yup';

const filterSchema = yup.object().shape({ name: yup.string() });

const itemSchema = yup.object().required().shape({
  id: yup.string().required(),
  name: yup.string().required(),
});

const listSchema = yup.array().required().of(itemSchema);

const createItemBodySchema = yup.object().required().shape({
  name: yup.string().required(),
});

const detailsParamsSchema = yup.object().required().shape({
  id: yup.number().required(),
});

const CommonAPI = {
  list: StrictFetch.prepare({
    url: 'list',
    schemas: { response: listSchema, query: filterSchema },
  }),
  create: StrictFetch.prepare({
    url: 'list',
    method: HTTPMethod.post,
    schemas: { response: itemSchema, body: createItemBodySchema },
  }),
  details: StrictFetch.prepare({
    url: ({ id }) => `list/${id}`,
    schemas: { response: itemSchema, params: detailsParamsSchema },
  }),
}
```

The second way also provide `useRequest` composable validation feature.

## Composables

Module provides the following composable methods:
- `useRequest` - method for using API method validation, state and TypeScript supporting for data.

```ts
const name = ref('');

const {
  execute, // execute request after validation (execution will return undefined if validation failed or loading is processed)
  parameters, // reactive data provided to second useRequest argument
  isValid, // reactive variable for validation result
  isLoading, // reactive variable for loading state
} = useRequest(CommonAPI.create, () => ({
  body: { name: name.value },
}));

const onSubmit = () => {
  execute()?.then( /* ... */ ).catch( /* ... */ );
};
```

## Development

```bash
# Install dependencies
npm install

# Generate type stubs
npm run dev:prepare

# Develop with the playground
npm run dev

# Build the playground
npm run dev:build

# Run ESLint
npm run lint

# Run Vitest
npm run test
npm run test:watch

# Release new version
npm run release
```

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/my-module/latest.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-version-href]: https://npmjs.com/package/my-module

[npm-downloads-src]: https://img.shields.io/npm/dm/my-module.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-downloads-href]: https://npmjs.com/package/my-module

[license-src]: https://img.shields.io/npm/l/my-module.svg?style=flat&colorA=18181B&colorB=28CF8D
[license-href]: https://npmjs.com/package/my-module

[nuxt-src]: https://img.shields.io/badge/Nuxt-18181B?logo=nuxt.js
[nuxt-href]: https://nuxt.com
