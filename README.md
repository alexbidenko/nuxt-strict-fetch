# Nuxt Strict Fetch

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

My new Nuxt module for doing amazing things.

- [✨ &nbsp;Release Notes](/CHANGELOG.md)
<!-- - [🏀 Online playground](https://stackblitz.com/github/alexbidenko/nuxt-strict-fetch?file=playground%2Fapp.vue) -->
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
  },
})
```

## Plugin Setup

If you wish to define some global options for all requests in plugin, you can use the `StrictFetch.init`:

```ts
export default defineNuxtPlugin(() => {
  const { $csrfFetch } = useNuxtApp(); // nuxt-csurf module $csrfFetch for example

  StrictFetch.init({
    onRequest(context) {
      context.options.headers = {
        ...context.options.headers,
        Custom: 'Value',
      };
    },
    fetch: $csrfFetch, // option for default Nuxt $fetch reassignment
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
StrictFetch.prepare<R /* response body */, B /* common body */, P /* common params */, Q /* common query */>
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
  execute, // execute common after validation (execution will return undefined if validation failed or loading is processed)
  parameters, // reactive data provided to second useRequest argument
  isValid, // reactive variable for validation result
  isLoading, // reactive variable for loading state
} = useRequest(
  CommonAPI.create,
  () => ({
    body: { name: name.value },
  }),
  {
    validation: () => false, // additional validation that will be included in isValid variable
  },
);

const onSubmit = () => {
  execute()?.then( /* ... */ ).catch( /* ... */ );
};
```

## Subscriptions

Nuxt Strict Fetch module provides the opportunity to subscribe to API events:

```ts
StrictFetch.hooks.subscribe('method:create:start', () => { /* ... */ });

StrictFetch.hooks.subscribe('method:create:finish', () => { /* ... */ });

StrictFetch.hooks.unsubscribe('method:create:start', () => { /* ... */ });

StrictFetch.hooks.unsubscribe('method:create:finish', () => { /* ... */ });

// where `create` is methodKey field of the method
```

## Order Requests

You can to create order of requests. When `orderKey: 'my-order'` key is added to methods, its will be executed only one by one.
In other words, when second request with `orderKey: 'my-order'` will be executed, request will be sent only after first finish.

```ts
const OrderAPI = {
  first: StrictFetch.prepare({
    url: 'first',
    orderKey: 'my-order',
  }),
  second: StrictFetch.prepare({
    url: 'second',
    orderKey: 'my-order',
  }),
};

OrderAPI.first();
OrderAPI.second(); // will wait for first common finish
```

## Other helpful options

```ts
const options = {
  selfInterrupted: true, // will interrupt previous requests when new common will be executed
  onError: () => { /* ... */ }, // will be called on error but ignored 'AbortError' error
  methodKey: 'my-method', // key of method for subscribing
  orderKey: 'my-order', // key of order for subscribing or ordering requests
  proxyServerCookies: true, // will send cookies from browser for common on server side
};

/** global options injected in StrictFetch */
StrictFetch.init(options);

// or

/** options for current common */
StrictFetch.prepare({
  url: 'url',
  ...options,
})
```

## Work with FormData

Nuxt Strict Fetch have three ways to work with FormData:

```ts
const FormDataAPI = {
  first: StrictFetch.prepare<null, FormData>({
    url: 'form-data-url',
    method: HTTPMethod.post,
  }),
  second: StrictFetch.prepare<null, { name: string; file: File; tags: string[] }>({
    url: 'form-data-url',
    method: HTTPMethod.post,
    // will be converted to FormData automatically
    // `name` and `file` as is
    // `tags` as array of FormData fields with the same key
    formData: true,
  })
};

// in plugin
// global declaration to use FormData common body
StrictFetch.init({ formData: true });

// in methods file
const CommonAPI = {
  formDataMethod: StrictFetch.prepare<null, { name: string; file: File; tags: string[] }>({
    url: 'form-data-url',
    method: HTTPMethod.post,
  }),
  jsonDataMethod: StrictFetch.prepare<null, { name: string; tags: string[] }>({
    url: 'json-data-url',
    method: HTTPMethod.post,
    formData: false, // disabling for current method
  }),
};
```

## Global catching

If you with to define some logic for request catching, you might do it in options:

```ts
StrictFetch.init({
  onRequest(context) {
    const expiredAt = localStorage.getItem('token')
    if (expiredAt) context.options.headers = { 'x-token': expiredAt }
  },
  catch(error) {
    if (error.context.response.status === 401) {
      const expiredAt = new Date()
      expiredAt.setSeconds(expiredAt.getSeconds() + 5)
      localStorage.setItem('token', expiredAt.toISOString())

      // Request repeating for example
      return $fetch(error.context.request, error.context.options);
    }

    throw error
  },
})
```

## Import types

You can import types from `nuxt-strict-fetch/types` path.

```ts
import type { StrictFetchOptions } from 'nuxt-strict-fetch/types';
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
[npm-version-src]: https://img.shields.io/npm/v/nuxt-strict-fetch/latest.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-version-href]: https://npmjs.com/package/nuxt-strict-fetch

[npm-downloads-src]: https://img.shields.io/npm/dm/nuxt-strict-fetch.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-downloads-href]: https://npmjs.com/package/nuxt-strict-fetch

[license-src]: https://img.shields.io/npm/l/nuxt-strict-fetch.svg?style=flat&colorA=18181B&colorB=28CF8D
[license-href]: https://npmjs.com/package/nuxt-strict-fetch

[nuxt-src]: https://img.shields.io/badge/Nuxt-18181B?logo=nuxt.js
[nuxt-href]: https://nuxt.com
