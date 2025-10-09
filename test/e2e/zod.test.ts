import { describe, it, expect } from 'vitest';
import { createPage, url } from '@nuxt/test-utils';

import { setupZod } from './utils/project';

await setupZod();

describe('ssr environment with yup mode', async () => {
  it('simple request', async () => {
    const page = await createPage();

    const response = await page.goto(url('/'));

    expect(await response?.text()).contain('Test object item');
  });
});
