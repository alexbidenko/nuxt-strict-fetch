export default defineNuxtConfig({
  modules: ['../src/module'],
  strictFetch: {
    baseURL: '/api/',
  },
  devtools: { enabled: true },
})
