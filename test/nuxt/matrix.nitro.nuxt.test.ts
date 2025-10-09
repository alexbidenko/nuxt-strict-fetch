import { fileURLToPath } from 'node:url'
import { describe, it, beforeAll, afterAll, expect } from 'vitest'
import { setup, useTestContext } from '@nuxt/test-utils/e2e'
import { callWithNuxt } from '#app'
import { StrictFetch } from '#imports'

const fixtures = [
  {
    name: 'standard',
    rootDir: fileURLToPath(new URL('../fixtures/matrix-standard', import.meta.url)),
    validator: 'standard',
  },
  {
    name: 'yup',
    rootDir: fileURLToPath(new URL('../fixtures/matrix-yup', import.meta.url)),
    validator: 'yup',
  },
  {
    name: 'zod',
    rootDir: fileURLToPath(new URL('../fixtures/matrix-zod', import.meta.url)),
    validator: 'zod',
  },
] as const

describe('nitro matrix', () => {
  for (const fixture of fixtures) {
    describe(fixture.name, () => {
      beforeAll(async () => {
        await setup({
          rootDir: fixture.rootDir,
          dev: false,
          build: true,
          server: true,
          browser: false,
        })
      })

      afterAll(async () => {
        const ctx = useTestContext()
        await ctx.close?.()
      })

      it('resolves via StrictFetch in nitro', async () => {
        const ctx = useTestContext()
        const result = await callWithNuxt(ctx.nuxt!, async () => {
          const request = StrictFetch.prepare<{ message: string; validator: string }>({
            url: 'ping',
          })
          return await request()
        })

        expect(result.message).toBe('pong')
        expect(result.validator).toBe(fixture.validator)
      })
    })
  }
})
