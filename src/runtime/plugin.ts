import { defineNuxtPlugin } from '#app'
import { StrictFetch } from './utils/client/base';

export default defineNuxtPlugin(() => {
  StrictFetch.autoInit();
})
