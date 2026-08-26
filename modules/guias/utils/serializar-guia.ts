// modules\guias\utils\serializar-guia.ts

export function serializarGuia<T>(guia: T): T {
  return JSON.parse(
    JSON.stringify(guia, (_, value) => {
      if (
        value &&
        typeof value === "object" &&
        typeof value.toNumber === "function"
      ) {
        return value.toNumber()
      }

      return value
    })
  )
}