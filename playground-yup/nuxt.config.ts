export default defineNuxtConfig({
  modules: ['../src/module'],
  strictFetch: {
    baseURL: '/api/',
    validator: 'yup',
  },
  devtools: { enabled: true },
  compatibilityDate: '2025-09-09',
});
