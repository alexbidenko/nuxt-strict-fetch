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
