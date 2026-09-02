// modules/guias/utils/calcular-almacenamiento.ts

/**
 * Calcula los días de almacenamiento,
 * redondeando cualquier fracción de día hacia arriba.
 *
 * Ejemplos:
 *
 * 10:00 → 15:00 = 1 día
 * 10:00 → 10:00 día siguiente = 1 día
 * 10:00 → 11:00 día siguiente = 2 días
 */
export function calcularDiasAlmacenamiento(
  fechaIngreso: Date,
  horaIngreso: Date,
  fechaSalida: Date,
  horaSalida: Date
): number {
  const ingreso = combinarFechaHora(fechaIngreso, horaIngreso)

  const salida = combinarFechaHora(fechaSalida, horaSalida)

  if (salida <= ingreso) {
    throw new Error(
      "La fecha y hora de salida deben ser posteriores a la fecha y hora de ingreso"
    )
  }

  const diferenciaMilisegundos = salida.getTime() - ingreso.getTime()

  const horas = diferenciaMilisegundos / (1000 * 60 * 60)

  return Math.max(1, Math.ceil(horas / 24))
}

/**
 * Combina una fecha y una hora utilizando
 * exclusivamente componentes UTC.
 */
function combinarFechaHora(fecha: Date, hora: Date): Date {
  return new Date(
    Date.UTC(
      fecha.getUTCFullYear(),
      fecha.getUTCMonth(),
      fecha.getUTCDate(),
      hora.getUTCHours(),
      hora.getUTCMinutes(),
      hora.getUTCSeconds(),
      0
    )
  )
}
