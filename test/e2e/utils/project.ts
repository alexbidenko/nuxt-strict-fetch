import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { setup } from '@nuxt/test-utils';

const CURRENT_PATH = dirname(fileURLToPath(import.meta.url));

const ROOT_PATH = resolve(CURRENT_PATH, '../../..');

const PLAYGROUND_BASE_PATH = resolve(ROOT_PATH, 'playground/base');
const PLAYGROUND_YUP_PATH = resolve(ROOT_PATH, 'playground/yup');
const PLAYGROUND_ZOD_PATH = resolve(ROOT_PATH, 'playground/zod');

export const setupBase = () =>
  setup({
    rootDir: PLAYGROUND_BASE_PATH,
  });

export const setupYup = () =>
  setup({
    rootDir: PLAYGROUND_YUP_PATH,
  });

export const setupZod = () =>
  setup({
    rootDir: PLAYGROUND_ZOD_PATH,
  });
