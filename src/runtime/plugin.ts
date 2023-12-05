import { defineNuxtPlugin } from '#app'
import { StrictFetch } from './utils/request/base';

export default defineNuxtPlugin(() => {
  StrictFetch.autoInit();
})
