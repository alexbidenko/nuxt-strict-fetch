export default defineNuxtConfig({
  modules: ['../src/module'],
  strictFetch: {
    baseURL: '/api/',
    validator: 'zod',
  },
  devtools: { enabled: true },
  compatibilityDate: '2025-09-09',
});
