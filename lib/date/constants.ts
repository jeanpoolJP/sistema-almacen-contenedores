// lib\date\constants.ts

/**
 * Zona horaria oficial utilizada por el sistema.
 *
 * El sistema KRENCO opera en Perú, por lo que todas las fechas
 * introducidas o mostradas al usuario deben interpretarse utilizando
 * esta zona horaria.
 *
 * IMPORTANTE:
 * PostgreSQL/Neon almacenará los instantes mediante `timestamptz`.
 * Esta constante NO significa que la base de datos deba configurarse
 * permanentemente en esta zona horaria.
 */
export const APP_TIMEZONE = "America/Lima" as const