import NuxtStrictFetch from '../../../src/module'
import type { ValidatorOption } from '../../../src/runtime/utils/common/types'

type Mode = 'standard' | `${ValidatorOption}`

const validator = process.env.STRICT_FETCH_VALIDATOR as Mode | undefined

export default defineNuxtConfig({
  modules: [NuxtStrictFetch],
  strictFetch: {
    baseURL: '/api/',
    ...(validator && validator !== 'standard' ? { validator } : {}),
  },
})
