export function formatearHora(
  hora: Date | null | undefined,
): string {
  if (!hora) {
    return "";
  }

  const horas = String(
    hora.getUTCHours(),
  ).padStart(2, "0");

  const minutos = String(
    hora.getUTCMinutes(),
  ).padStart(2, "0");

  return `${horas}:${minutos}`;
}