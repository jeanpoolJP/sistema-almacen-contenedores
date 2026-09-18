// modules\trasegados\components\detalle-guia\detalle-pdf-document.tsx

"use client"

import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer"

import { formatDateTime } from "@/lib/date/format"
import type {
  GuiaTrasegadoDetalle,
  GuiaTrasegadoElementoDetalle,
  GuiaTrasegadoSalidaDetalle,
} from "../../types/guia-trasegado-detalle.types"

// ============================================================
// ESTILOS
// ============================================================
// Definimos una paleta neutra y tipografía consistente.
// Los tamaños son en puntos (pt).

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: "#1a1a1a",
  },
  // ---------------- HEADER ----------------
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: "#1a1a1a",
  },
  headerLeft: {
    flexDirection: "column",
  },
  title: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
  },
  subtitle: {
    fontSize: 9,
    color: "#666",
    marginTop: 2,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  badgeProceso: {
    backgroundColor: "#fef3c7",
    color: "#92400e",
  },
  badgeFinalizado: {
    backgroundColor: "#d1fae5",
    color: "#065f46",
  },
  badgePagoPendiente: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
  },
  badgePagoPagado: {
    backgroundColor: "#dbeafe",
    color: "#1e40af",
  },

  // ---------------- SECCIONES ----------------
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    color: "#374151",
    marginBottom: 6,
    paddingBottom: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: "#d1d5db",
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  col: {
    flex: 1,
    minWidth: "33%",
    marginBottom: 6,
  },
  colFull: {
    flex: 1,
    minWidth: "100%",
    marginBottom: 6,
  },
  label: {
    fontSize: 7,
    color: "#6b7280",
    textTransform: "uppercase",
    marginBottom: 1,
  },
  value: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
  },
  valueNormal: {
    fontSize: 9,
  },
  mono: {
    fontFamily: "Courier",
  },

  // ---------------- ELEMENTO ----------------
  elementoCard: {
    borderWidth: 0.5,
    borderColor: "#d1d5db",
    borderRadius: 3,
    padding: 8,
    marginBottom: 6,
  },
  elementoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
    paddingBottom: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e5e7eb",
  },
  elementoTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
  },
  elementoNumero: {
    fontFamily: "Courier",
    fontSize: 8,
    color: "#4b5563",
  },
  observaciones: {
    fontSize: 8,
    color: "#4b5563",
    marginTop: 4,
    padding: 4,
    backgroundColor: "#f9fafb",
    borderRadius: 2,
  },

  // ---------------- SALIDA ----------------
  salidaCard: {
    borderWidth: 0.5,
    borderColor: "#d1d5db",
    borderRadius: 3,
    padding: 8,
    marginBottom: 6,
  },
  salidaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  badgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 3,
    marginTop: 4,
  },
  smallBadge: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    backgroundColor: "#e5e7eb",
    borderRadius: 2,
    fontSize: 7,
    color: "#374151",
  },

  // ---------------- FOOTER ----------------
  footer: {
    position: "absolute",
    bottom: 16,
    left: 32,
    right: 32,
    textAlign: "center",
    fontSize: 7,
    color: "#9ca3af",
    borderTopWidth: 0.5,
    borderTopColor: "#e5e7eb",
    paddingTop: 6,
  },
})

// ============================================================
// COMPONENTES AUXILIARES
// ============================================================

function Field({
  label,
  value,
  mono,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <View style={styles.col}>
      <Text style={styles.label}>{label}</Text>
      <Text
        style={mono ? [styles.valueNormal, styles.mono] : styles.valueNormal}
      >
        {value}
      </Text>
    </View>
  )
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ marginBottom: 2 }}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.valueNormal}>{value}</Text>
    </View>
  )
}

const ETIQUETAS: Record<GuiaTrasegadoElementoDetalle["tipo"], string> = {
  CONTENEDOR: "Contenedor",
  FLAT_RACK: "Flat Rack",
  MERCADERIA: "Mercadería",
  MAQUINARIA: "Maquinaria",
  OTRO: "Otro",
}

function ElementoPDF({
  elemento,
  index,
}: {
  elemento: GuiaTrasegadoElementoDetalle
  index: number
}) {
  return (
    <View style={styles.elementoCard} wrap={false}>
      <View style={styles.elementoHeader}>
        <Text style={styles.elementoTitle}>
          {ETIQUETAS[elemento.tipo]} #{index + 1}
          {elemento.numero ? ` · ${elemento.numero}` : ""}
        </Text>
        <Text
          style={{
            fontSize: 7,
            color: elemento.retirado ? "#065f46" : "#92400e",
          }}
        >
          {elemento.retirado ? "RETIRADO" : "PENDIENTE"}
        </Text>
      </View>

      {elemento.contenedor && (
        <View style={styles.row}>
          <Field
            label="N° Contenedor"
            value={elemento.contenedor.numeroContenedor}
            mono
          />
          <Field label="Marca" value={elemento.contenedor.marca} />
          <Field label="Medida" value={`${elemento.contenedor.medida} pies`} />
          <Field
            label="Tipo"
            value={elemento.contenedor.tipo === "REEFER" ? "Reefer" : "Normal"}
          />
        </View>
      )}

      {elemento.flatRack && (
        <View style={styles.row}>
          <Field label="N° Flat Rack" value={elemento.flatRack.numero} mono />
          <Field label="Marca" value={elemento.flatRack.marca} />
        </View>
      )}

      {!elemento.contenedor && !elemento.flatRack && (
        <View style={styles.row}>
          {elemento.numero && (
            <Field label="Número" value={elemento.numero} mono />
          )}
          {elemento.descripcion && (
            <Field label="Descripción" value={elemento.descripcion} />
          )}
        </View>
      )}

      {elemento.observaciones && (
        <Text style={styles.observaciones}>Obs: {elemento.observaciones}</Text>
      )}
    </View>
  )
}

function SalidaPDF({
  salida,
  index,
}: {
  salida: GuiaTrasegadoSalidaDetalle
  index: number
}) {
  return (
    <View style={styles.salidaCard} wrap={false}>
      <View style={styles.salidaHeader}>
        <Text style={styles.elementoTitle}>
          Salida #{index + 1} · {formatDateTime(salida.fechaSalida)}
        </Text>
        <Text style={[styles.valueNormal, styles.mono]}>
          {salida.vehiculo.placa}
        </Text>
      </View>

      <View style={styles.row}>
        <Field label="Empresa" value={salida.empresaTransporte.nombre} />
        <Field label="RUC" value={salida.empresaTransporte.ruc} mono />
        <Field label="Conductor" value={salida.conductor.nombreCompleto} />
      </View>

      <Text style={styles.label}>Elementos retirados</Text>
      <View style={styles.badgesRow}>
        {salida.elementos.map((el) => (
          <Text key={el.elementoId} style={styles.smallBadge}>
            {el.tipo}
            {el.numero ? ` · ${el.numero}` : ""}
          </Text>
        ))}
      </View>

      {salida.observaciones && (
        <Text style={styles.observaciones}>Obs: {salida.observaciones}</Text>
      )}
    </View>
  )
}

// ============================================================
// DOCUMENTO
// ============================================================

interface DetalleGuiaPDFDocumentProps {
  guia: GuiaTrasegadoDetalle
}

export function DetalleGuiaPDFDocument({ guia }: DetalleGuiaPDFDocumentProps) {
  const totalElementos = guia.ingreso?.elementos.length ?? 0
  const pendientes =
    guia.ingreso?.elementos.filter((e) => !e.retirado).length ?? 0

  return (
    <Document
      title={`Guía de trasegado ${guia.numeroGuia}`}
      author="Sistema KRENCO"
      subject="Guía de trasegado"
      creator="KRENCO"
    >
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>
              GUÍA DE TRASEGADO {guia.numeroGuia}
            </Text>
            {guia.descripcionServicio && (
              <Text style={styles.subtitle}>{guia.descripcionServicio}</Text>
            )}
            <Text style={styles.subtitle}>
              Fecha de ingreso: {formatDateTime(guia.fechaIngreso)}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Text
              style={[
                styles.badge,
                guia.estado === "EN_PROCESO"
                  ? styles.badgeProceso
                  : styles.badgeFinalizado,
              ]}
            >
              {guia.estado === "EN_PROCESO" ? "EN PROCESO" : "FINALIZADO"}
            </Text>
            <Text
              style={[
                styles.badge,
                guia.estadoPago === "PENDIENTE"
                  ? styles.badgePagoPendiente
                  : styles.badgePagoPagado,
              ]}
            >
              {guia.estadoPago === "PENDIENTE" ? "PAGO PENDIENTE" : "PAGADO"}
            </Text>
          </View>
        </View>

        {/* INFORMACIÓN GENERAL */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información general</Text>
          <View style={styles.row}>
            <Field label="N° Guía" value={guia.numeroGuia} mono />
            <Field
              label="Fecha ingreso"
              value={formatDateTime(guia.fechaIngreso)}
            />
            <Field
              label="Tratamiento IGV"
              value={guia.tratamientoIGV === "CON_IGV" ? "Con IGV" : "Sin IGV"}
            />
          </View>
          {guia.observaciones && (
            <View style={styles.row}>
              <View style={styles.colFull}>
                <Text style={styles.label}>Observaciones</Text>
                <Text style={styles.valueNormal}>{guia.observaciones}</Text>
              </View>
            </View>
          )}
        </View>

        {/* CLIENTE */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cliente</Text>
          {guia.cliente ? (
            <View style={styles.row}>
              <Field
                label="Documento"
                value={`${guia.cliente.tipoDocumento}: ${guia.cliente.numeroDocumento}`}
              />
              <Field
                label="Nombre"
                value={guia.cliente.nombreCompleto ?? "—"}
              />
              <Field label="Teléfono" value={guia.cliente.telefono ?? "—"} />
            </View>
          ) : (
            <Text style={styles.valueNormal}>Sin cliente asignado.</Text>
          )}
        </View>

        {/* INGRESO */}
        {guia.ingreso && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ingreso</Text>
            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.label}>Empresa</Text>
                <Text style={styles.value}>
                  {guia.ingreso.empresaTransporte.nombre}
                </Text>
                <Text style={styles.valueNormal}>
                  RUC: {guia.ingreso.empresaTransporte.ruc}
                </Text>
                <Text style={styles.valueNormal}>
                  Tel: {guia.ingreso.empresaTransporte.telefono ?? "—"}
                </Text>
                <Text style={styles.valueNormal}>
                  Contacto:{" "}
                  {guia.ingreso.empresaTransporte.contactoLogistico ?? "—"}
                </Text>
                <Text style={styles.valueNormal}>
                  Encargado:{" "}
                  {guia.ingreso.empresaTransporte.nombreEncargado ?? "—"}
                </Text>
              </View>
              <View style={styles.col}>
                <Text style={styles.label}>Vehículo</Text>
                <Text style={[styles.value, styles.mono]}>
                  {guia.ingreso.vehiculo.placa}
                </Text>
                <Text style={styles.valueNormal}>
                  Tipo:{" "}
                  {guia.ingreso.vehiculo.tipo === "PORTA_CONTENEDORES"
                    ? "Porta-contenedores"
                    : guia.ingreso.vehiculo.tipo === "CAMA_BAJA"
                      ? "Cama baja"
                      : guia.ingreso.vehiculo.tipo === "OTRO"
                        ? "Otro"
                        : "—"}
                </Text>
                {guia.ingreso.vehiculo.descripcion && (
                  <Text style={styles.valueNormal}>
                    {guia.ingreso.vehiculo.descripcion}
                  </Text>
                )}
              </View>
              <View style={styles.col}>
                <Text style={styles.label}>Conductor</Text>
                <Text style={styles.value}>
                  {guia.ingreso.conductor.nombreCompleto}
                </Text>
                <Text style={styles.valueNormal}>
                  Lic: {guia.ingreso.conductor.numeroLicencia}
                </Text>
                <Text style={styles.valueNormal}>
                  Tel: {guia.ingreso.conductor.telefono ?? "—"}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* ELEMENTOS */}
        {guia.ingreso && guia.ingreso.elementos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Elementos transportados ({totalElementos} · {pendientes}{" "}
              pendientes)
            </Text>
            {guia.ingreso.elementos.map((el, i) => (
              <ElementoPDF key={el.id} elemento={el} index={i} />
            ))}
          </View>
        )}

        {/* SALIDAS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Salidas ({guia.salidas.length})
          </Text>
          {guia.salidas.length === 0 ? (
            <Text style={styles.valueNormal}>
              Aún no hay salidas registradas.
            </Text>
          ) : (
            guia.salidas.map((s, i) => (
              <SalidaPDF key={s.id} salida={s} index={i} />
            ))
          )}
        </View>

        {/* FOOTER */}
        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) =>
            `KRENCO · Guía ${guia.numeroGuia} · Página ${pageNumber} de ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  )
}
