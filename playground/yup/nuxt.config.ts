export default defineNuxtConfig({
  extends: '../_layer',
  strictFetch: {
    baseURL: '/api/',
    validator: 'yup',
  },
  compatibilityDate: '2025-09-09',
});
