export default defineNitroPlugin(() => {
  StrictFetch.init({
    baseURL: 'https://official-joke-api.appspot.com/',
  })
})
