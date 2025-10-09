import { StrictFetch } from './utils/client/base';
import { defineNuxtPlugin } from '#imports';

export default defineNuxtPlugin(() => {
  StrictFetch.autoInit?.();
});
