import { fileURLToPath } from 'node:url'
import { describe, it, beforeAll, afterAll, expect } from 'vitest'
import { setup } from '@nuxt/test-utils'
import { renderSuspended } from '@nuxt/test-utils/runtime'
import { defineComponent, h } from 'vue'
import { StrictFetch } from '#imports'

type Mode = 'standard' | 'yup' | 'zod'

const rootDir = fileURLToPath(new URL('../fixtures/matrix', import.meta.url))

const modes: Mode[] = ['standard', 'yup', 'zod']

describe('browser matrix', () => {
  for (const mode of modes) {
    describe(mode, () => {
      const original = process.env.STRICT_FETCH_VALIDATOR

      beforeAll(async () => {
        process.env.STRICT_FETCH_VALIDATOR = mode === 'standard' ? '' : mode
        await setup({
          rootDir,
          server: false,
          build: true,
        })
      })

      afterAll(() => {
        process.env.STRICT_FETCH_VALIDATOR = original
      })

      it('executes prepared request', async () => {
        const component = defineComponent({
          async setup() {
            const request = StrictFetch.prepare<{ message: string; validator: string }>({
              url: 'ping',
            })
            const payload = await request()
            return () => h('pre', JSON.stringify(payload))
          },
        })

        const html = await renderSuspended(component)
        expect(html).toContain('"message":"pong"')
        expect(html).toContain(`"validator":"${mode === 'standard' ? 'standard' : mode}"`)
      })
    })
  }
})
