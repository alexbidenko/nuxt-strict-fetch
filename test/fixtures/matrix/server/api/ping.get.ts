import { defineEventHandler } from 'h3'

export default defineEventHandler((event) => {
  return {
    message: 'pong',
    validator: process.env.STRICT_FETCH_VALIDATOR || 'standard',
    url: event.path,
  }
})
