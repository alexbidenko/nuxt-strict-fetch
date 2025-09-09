import { StrictFetch } from './utils/client/base';
import { defineNuxtPlugin } from '#app';

export default defineNuxtPlugin(() => {
  StrictFetch.autoInit?.();
});
