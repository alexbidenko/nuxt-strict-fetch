import { fileURLToPath } from 'node:url'
import { describe, it, beforeAll, afterAll, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils'

type Mode = 'standard' | 'yup' | 'zod'

const rootDir = fileURLToPath(new URL('../fixtures/matrix', import.meta.url))

const modes: Mode[] = ['standard', 'yup', 'zod']

describe('ssr matrix', () => {
  for (const mode of modes) {
    describe(mode, () => {
      const original = process.env.STRICT_FETCH_VALIDATOR

      beforeAll(async () => {
        process.env.STRICT_FETCH_VALIDATOR = mode === 'standard' ? '' : mode
        await setup({
          rootDir,
          server: true,
          browser: false,
        })
      })

      afterAll(() => {
        process.env.STRICT_FETCH_VALIDATOR = original
      })

      it('serves strict endpoint', async () => {
        const response = await $fetch<{ via: string; result: { validator: string; message: string } }>('/api/strict')
        expect(response.via).toBe('strict')
        expect(response.result.message).toBe('pong')
        expect(response.result.validator).toBe(mode === 'standard' ? 'standard' : mode)
      })
    })
  }
})
