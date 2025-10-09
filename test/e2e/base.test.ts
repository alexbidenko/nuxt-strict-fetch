import { describe, it, expect } from 'vitest';
import { createPage, url } from '@nuxt/test-utils';

import { setupBase } from './utils/project';

await setupBase();

describe('ssr environment with base mode', async () => {
  it('simple request', async () => {
    const page = await createPage();

    const response = await page.goto(url('/'));

    expect(await response?.text()).contain('Test object item');
  });
});
