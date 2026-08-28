// modules\guias\utils\formatear-numero-guia.ts

/**
 * Normaliza un número de guía al formato de 6 dígitos.
 *
 * Ejemplos:
 * 345    → 000345
 * 0345   → 000345
 * 00345  → 000345
 * 000345 → 000345
 */
export function formatearNumeroGuia(numeroGuia: string): string {
  const numero = numeroGuia.trim()

  // Validar que solo contenga números
  if (!/^\d+$/.test(numero)) {
    throw new Error("El número de guía solo puede contener números")
  }

  // Convertir a número para eliminar ceros innecesarios
  const numeroNormalizado = Number(numero)

  // Validar máximo de 6 dígitos
  if (numeroNormalizado > 999999) {
    throw new Error("El número de guía no puede tener más de 6 dígitos")
  }

  // Agregar ceros a la izquierda hasta completar 6 caracteres
  return numeroNormalizado.toString().padStart(6, "0")
}
