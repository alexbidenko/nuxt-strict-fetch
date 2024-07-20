export default defineEventHandler(async (event) => {
  const body = await readBody<{ name: string }>(event)

  await new Promise(r => setTimeout(r, 1000))

  return {
    id: crypto.randomUUID(),
    name: body.name,
  }
})
