import { defineEventHandler } from 'h3'
import { StrictFetch } from '#imports'

const pingRequest = StrictFetch.prepare<{ message: string; validator: string; url: string }>({
  url: 'ping',
})

export default defineEventHandler(async () => {
  const result = await pingRequest()
  return {
    via: 'strict',
    result,
  }
})
