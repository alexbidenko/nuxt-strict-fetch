import { defineEventHandler } from 'h3'
import { useRuntimeConfig } from '#imports'

export default defineEventHandler((event) => {
  const config = useRuntimeConfig()
  const validator = (config.public.strictFetchOptions?.validator as string | undefined) ?? 'standard'

  return {
    message: 'pong',
    validator,
    url: event.path,
  }
})
