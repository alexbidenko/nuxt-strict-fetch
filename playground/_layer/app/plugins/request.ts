export default defineNuxtPlugin(() => {
  StrictFetch.init({
    onRequest(context) {
      context.options.headers.set('Custom-Key', 'value');
    },
  });
});
