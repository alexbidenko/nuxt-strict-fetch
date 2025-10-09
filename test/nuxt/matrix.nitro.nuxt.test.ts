import { fileURLToPath } from 'node:url'
import { describe, it, beforeAll, afterAll, expect } from 'vitest'
import { setup, fetch } from '@nuxt/test-utils/e2e'

type Mode = 'standard' | 'yup' | 'zod'

const rootDir = fileURLToPath(new URL('../fixtures/matrix', import.meta.url))

const modes: Mode[] = ['standard', 'yup', 'zod']

describe('nitro matrix', () => {
  for (const mode of modes) {
    describe(mode, () => {
      const original = process.env.STRICT_FETCH_VALIDATOR

      beforeAll(async () => {
        process.env.STRICT_FETCH_VALIDATOR = mode === 'standard' ? '' : mode
        await setup({
          rootDir,
          dev: false,
          build: true,
          server: true,
          browser: false,
        })
      })

      afterAll(() => {
        process.env.STRICT_FETCH_VALIDATOR = original
      })

      it('responds through nitro fetch', async () => {
        const response = await fetch('/api/ping')
        const body = await response.json() as { message: string; validator: string }
        expect(body.message).toBe('pong')
        expect(body.validator).toBe(mode === 'standard' ? 'standard' : mode)
      })
    })
  }
})
