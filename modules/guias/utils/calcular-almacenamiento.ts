// modules\guias\utils\calcular-almacenamiento.ts

/**
 * Calcula los dias de almacenamiento, redondeando cualquier fraccion hacia arriba.
 *
 * @throws {Error} Si la salida no ocurre despues del ingreso.
 */
export function calcularDiasAlmacenamiento(
  fechaIngreso: Date,
  horaIngreso: Date,
  fechaSalida: Date,
  horaSalida: Date
): number {
  const ingreso = combinarFechaHora(
    fechaIngreso,
    horaIngreso
  );

  const salida = combinarFechaHora(
    fechaSalida,
    horaSalida
  );

  if (salida <= ingreso) {
    throw new Error(
      "La fecha y hora de salida deben ser posteriores a la fecha y hora de ingreso"
    );
  }

  const diferenciaMilisegundos =
    salida.getTime() - ingreso.getTime();

  const horas =
    diferenciaMilisegundos / (1000 * 60 * 60);

  const dias = Math.ceil(horas / 24);

  return Math.max(1, dias);
}

/** Combina la fecha de un valor con la hora de otro sin modificar los originales. */
function combinarFechaHora(
  fecha: Date,
  hora: Date
): Date {
  const resultado = new Date(fecha);

  resultado.setHours(
    hora.getHours(),
    hora.getMinutes(),
    hora.getSeconds(),
    0
  );

  return resultado;
}