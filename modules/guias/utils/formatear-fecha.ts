// modules/guias/utils/formatear-fecha.ts

export function formatearFecha(
  fecha: Date | null | undefined,
): string {
  if (!fecha) {
    return "";
  }

  const dia = String(
    fecha.getUTCDate(),
  ).padStart(2, "0");

  const mes = String(
    fecha.getUTCMonth() + 1,
  ).padStart(2, "0");

  const anio =
    fecha.getUTCFullYear();

  return `${dia}/${mes}/${anio}`;
}