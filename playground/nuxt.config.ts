// eslint-disable-next-line nuxt/nuxt-config-keys-order
export default defineNuxtConfig({
  modules: ['../src/module'],
  strictFetch: {
    baseURL: '/api/',
  },
  devtools: { enabled: true },
})
