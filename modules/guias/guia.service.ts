// modules/guias/guia.service.ts

import {
  obtenerGuiaPorId,
  obtenerGuiaPorNumero,
  obtenerGuiaPorContenedor,
  crearGuia,
  actualizarSalidaGuia,
} from "./guia.repository";

import {
  calcularDiasAlmacenamiento,
} from "./utils/calcular-almacenamiento";

import {
  calcularMontoGuia,
} from "./utils/calcular-monto";

import type {
  CrearGuiaInput,
  ActualizarSalidaGuiaInput,
} from "./guia.types";

export async function crearGuiaService(
  datos: CrearGuiaInput
) {
  // ============================================================
  // 1. VALIDACIONES
  // ============================================================

  if (!datos.numeroGuia.trim()) {
    throw new Error(
      "El número de guía es obligatorio."
    );
  }

  if (!datos.fechaIngreso) {
    throw new Error(
      "La fecha de ingreso es obligatoria."
    );
  }

  if (!datos.horaIngreso) {
    throw new Error(
      "La hora de ingreso es obligatoria."
    );
  }

  // ============================================================
  // 2. VERIFICAR QUE NO EXISTA LA GUÍA
  // ============================================================

  const guiaExistente =
    await obtenerGuiaPorNumero(
      datos.numeroGuia
    );

  if (guiaExistente) {
    throw new Error(
      "Ya existe una guía con ese número."
    );
  }

  // ============================================================
  // 3. OBTENER LOS PRECIOS
  // ============================================================
  //
  // IMPORTANTE:
  // La configuración de precios todavía pertenece
  // al módulo de configuración.
  //
  // Por eso posteriormente el service deberá recibir
  // la configuración mediante su repository/service.
  //
  // Por ahora utilizamos los precios que llegan en datos.
  // ============================================================

  const precioPrimerDia =
    datos.precioPrimerDia;

  const precioDiaAdicional =
    datos.precioDiaAdicional;

  // ============================================================
  // 4. DETERMINAR TIPO DE PRECIO
  // ============================================================
  //
  // Esto NO lo decide el usuario.
  //
  // Se determina comparando los precios utilizados
  // contra la configuración estándar.
  //
  // Esta comparación posteriormente se hará contra
  // ConfiguracionPrecio.
  // ============================================================

  const tipoPrecio =
    datos.tipoPrecio ?? "ESTANDAR";

  // ============================================================
  // 5. CREAR LA GUÍA
  // ============================================================
  //
  // Al momento del ingreso todavía no conocemos:
  //
  // - fecha de salida
  // - hora de salida
  // - días de almacenamiento
  // - subtotal
  // - IGV
  // - monto total
  //
  // Esos datos se calculan al registrar la salida.
  // ============================================================

  return crearGuia({
    numeroGuia:
      datos.numeroGuia,

    clienteId:
      datos.clienteId ?? null,

    contenedorId:
      datos.contenedorId,

    empresaTransporteIngresoId:
      datos.empresaTransporteIngresoId,

    vehiculoIngresoId:
      datos.vehiculoIngresoId,

    conductorIngresoId:
      datos.conductorIngresoId,

    fechaIngreso:
      datos.fechaIngreso,

    horaIngreso:
      datos.horaIngreso,

    tipoPrecio,

    precioPrimerDia,

    precioDiaAdicional,

    subtotal: null,

    porcentajeIGV:
      datos.porcentajeIGV,

    montoIGV: null,

    montoTotal: null,

    tratamientoIGV:
      datos.tratamientoIGV,

    estado: "ALMACENADO",

    observaciones:
      datos.observaciones ?? null,
  });
}


// ============================================================
// REGISTRAR SALIDA
// ============================================================

export async function registrarSalidaService(
  datos: ActualizarSalidaGuiaInput
) {
  // ============================================================
  // 1. BUSCAR GUÍA
  // ============================================================

  const guia = await obtenerGuiaPorId(
    datos.guiaId
  );

  if (!guia) {
    throw new Error(
      "La guía no existe."
    );
  }

  // ============================================================
  // 2. VALIDAR ESTADO
  // ============================================================

  if (guia.estado !== "ALMACENADO") {
    throw new Error(
      "La guía no se encuentra almacenada."
    );
  }

  // ============================================================
  // 3. VALIDAR FECHA/HORA DE SALIDA
  // ============================================================

  const diasAlmacenamiento =
    calcularDiasAlmacenamiento(
      guia.fechaIngreso,
      guia.horaIngreso,
      datos.fechaSalida,
      datos.horaSalida
    );

  // ============================================================
  // 4. OBTENER PORCENTAJE DE IGV
  // ============================================================
  //
  // El porcentaje de IGV ya fue guardado en la guía
  // cuando se creó.
  //
  // No se modifica desde el formulario de salida.
  //

  const porcentajeIGV =
    Number(guia.porcentajeIGV ?? 0);

  // ============================================================
  // 5. CALCULAR MONTO
  // ============================================================

  const calculo =
    calcularMontoGuia({
      diasAlmacenamiento,

      precioPrimerDia:
        Number(guia.precioPrimerDia),

      precioDiaAdicional:
        Number(guia.precioDiaAdicional),

      tratamientoIGV:
        datos.tratamientoIGV,

      porcentajeIGV,
    });

  // ============================================================
  // 6. ACTUALIZAR GUÍA
  // ============================================================

  return actualizarSalidaGuia(
    datos.guiaId,
    {
      empresaTransporteSalidaId:
        datos.empresaTransporteSalidaId,

      vehiculoSalidaId:
        datos.vehiculoSalidaId,

      conductorSalidaId:
        datos.conductorSalidaId,

      fechaSalida:
        datos.fechaSalida,

      horaSalida:
        datos.horaSalida,

      diasAlmacenamiento,

      subtotal:
        calculo.subtotal,

      porcentajeIGV,

      montoIGV:
        calculo.montoIGV,

      montoTotal:
        calculo.montoTotal,

      tratamientoIGV:
        datos.tratamientoIGV,

      estado: "RETIRADO",
    }
  );
}