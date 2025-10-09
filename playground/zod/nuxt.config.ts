export default defineNuxtConfig({
  extends: '../_layer',
  strictFetch: {
    baseURL: '/api/',
    validator: 'zod',
  },
  compatibilityDate: '2025-09-09',
});
