import { fileURLToPath } from 'node:url'
import { describe, it, beforeAll, afterAll, expect } from 'vitest'
import { setup, useTestContext } from '@nuxt/test-utils'
import { renderSuspended } from '@nuxt/test-utils/runtime'
import { defineComponent, h } from 'vue'
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

describe('browser matrix', () => {
  for (const fixture of fixtures) {
    describe(fixture.name, () => {
      beforeAll(async () => {
        await setup({
          rootDir: fixture.rootDir,
          server: false,
          build: true,
        })
      })

      afterAll(async () => {
        const ctx = useTestContext()
        await ctx.close?.()
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
        expect(html).toContain(`"validator":"${fixture.validator}"`)
      })
    })
  }
})
