import { fileURLToPath } from 'node:url'
import { ValidatorOption } from '../../../src/runtime/types'

export default defineNuxtConfig({
  extends: [fileURLToPath(new URL('../matrix', import.meta.url))],
  strictFetch: {
    validator: ValidatorOption.YUP,
  },
})
