import { Case } from './types'

export const isObject = (o: unknown) =>
  o === Object(o) && !Array.isArray(o) && typeof o !== 'function'

export const toCamelCase = (s: string) =>
  s.replace(/([-_][a-z])/gi, $1 =>
    $1.toUpperCase().replace('-', '').replace('_', ''),
  )

export const toSnakeCase = (str: string) =>
  str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)

export const caseTransfer = (o: any, type: Case): any => {
  if (isObject(o)) {
    const n = {} as Record<string, unknown>

    Object.entries(o as object).forEach(([k, v]) => {
      n[(type === Case.camel ? toCamelCase : toSnakeCase)(k)] = caseTransfer(
        v,
        type,
      )
    })

    return n
  }
  if (Array.isArray(o)) {
    return o.map(i => caseTransfer(i, type))
  }

  return o
}
