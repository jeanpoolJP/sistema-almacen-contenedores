// modules\liquidaciones\liquidacion.errors.ts

export class LiquidacionError extends Error {
  constructor(
    message: string,
    public readonly code: LiquidacionErrorCode,
    public readonly status: number = 400
  ) {
    super(message)
    this.name = "LiquidacionError"
  }
}

export type LiquidacionErrorCode =
  | "NOT_FOUND"
  | "INVALID_STATE"
  | "GUIDE_NOT_AVAILABLE"
  | "GUIDE_ALREADY_LIQUIDATED"
  | "GUIDE_ALREADY_PAID"
  | "GUIDE_WRONG_CLIENT"
  | "EMPTY_LIQUIDATION"
  | "ALREADY_PAID"
  | "UNKNOWN"

export const LiquidacionErrors = {
  notFound: (id: number) =>
    new LiquidacionError(`Liquidación ${id} no encontrada`, "NOT_FOUND", 404),

  invalidState: (expected: string, current: string) =>
    new LiquidacionError(
      `Estado inválido: se esperaba "${expected}" pero está "${current}"`,
      "INVALID_STATE",
      409
    ),

  guideNotAvailable: (numero: string) =>
    new LiquidacionError(
      `La guía ${numero} no está en estado RETIRADO`,
      "GUIDE_NOT_AVAILABLE",
      409
    ),

  guideAlreadyPaid: (numero: string) =>
    new LiquidacionError(
      `La guía ${numero} ya está pagada`,
      "GUIDE_ALREADY_PAID",
      409
    ),

  guideWrongClient: (numero: string) =>
    new LiquidacionError(
      `La guía ${numero} no pertenece al cliente de la liquidación`,
      "GUIDE_WRONG_CLIENT",
      409
    ),

  guideAlreadyLiquidated: (numeros: string[]) =>
    new LiquidacionError(
      `Las guías ya pertenecen a otra liquidación: ${numeros.join(", ")}`,
      "GUIDE_ALREADY_LIQUIDATED",
      409
    ),

  empty: () =>
    new LiquidacionError(
      "La liquidación no tiene guías asociadas",
      "EMPTY_LIQUIDATION",
      409
    ),

  alreadyPaid: () =>
    new LiquidacionError("La liquidación ya está pagada", "ALREADY_PAID", 409),
}
