import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import type { ReporteInventarioData } from "../types/reporte-inventario.types";

// ============================================================
// DISEÑO — identidad KRENCO: negro + verde #138830
// ============================================================

const COLORS = {
  brand: "#138830",
  brandSoft: "#E7F4EB",
  black: "#141414",
  grey: "#F5F6F7",
  line: "#D7DBE0",
  text: "#222222",
  muted: "#667085",
  white: "#FFFFFF",
};

/** Logo: public/krenco-logo-nombre-transparente.png (689 x 227 px). */
const LOGO_DEFAULT = "/krenco-logo-nombre-transparente.png";
const LOGO_RATIO = 689 / 227;

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 56,
    paddingHorizontal: 40,
    fontSize: 9,
    color: COLORS.text,
    fontFamily: "Helvetica",
  },

  // ---------- Encabezado ----------
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.brand,
  },
  logo: { width: 120, height: 120 / LOGO_RATIO },
  logoFallback: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: COLORS.brand,
  },
  headerRight: { alignItems: "flex-end" },
  headerKicker: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: COLORS.muted,
    letterSpacing: 1.2,
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: "Helvetica-Bold",
    color: COLORS.black,
    marginTop: 3,
  },

  // ---------- Caja de información ----------
  infoBox: {
    flexDirection: "row",
    marginTop: 16,
    backgroundColor: COLORS.grey,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.brand,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  infoCol: { flexGrow: 1 },
  infoLabel: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: COLORS.muted,
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  infoValue: { fontSize: 10, color: COLORS.text },
  infoValueBold: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: COLORS.black,
  },

  // ---------- Secciones ----------
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 8,
  },
  sectionBar: {
    width: 3,
    height: 13,
    backgroundColor: COLORS.brand,
    marginRight: 6,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: COLORS.black,
  },
  sectionCount: {
    fontSize: 9,
    color: COLORS.muted,
    marginLeft: 8,
  },

  // ---------- Tablas ----------
  table: { borderWidth: 1, borderColor: COLORS.line, marginBottom: 6 },
  tHeadRow: { flexDirection: "row", backgroundColor: COLORS.black },
  tRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: COLORS.line,
  },
  tTotalRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: COLORS.brand,
    backgroundColor: COLORS.brandSoft,
  },
  tHeadCell: {
    padding: 6,
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: COLORS.white,
  },
  tCell: { padding: 6, fontSize: 9, color: COLORS.text },
  tCellBold: {
    padding: 6,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: COLORS.black,
  },
  tTotalLabel: {
    padding: 7,
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: COLORS.black,
  },
  tTotalValue: {
    padding: 7,
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: COLORS.brand,
  },

  colNum: { width: "8%" },
  colContenedor: { width: "34%" },
  colGuia: { width: "28%" },
  colFecha: { width: "30%" },

  // ---------- Pie ----------
  footer: {
    position: "absolute",
    bottom: 22,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: COLORS.muted,
    borderTopWidth: 1.2,
    borderTopColor: COLORS.brand,
    paddingTop: 6,
  },
});

// ============================================================
// COMPONENTES
// ============================================================

interface TablaContenedoresProps {
  items: ReporteInventarioData["grupos"][number]["contenedores"];
}

function TablaContenedores({ items }: TablaContenedoresProps) {
  return (
    <View style={styles.table}>
      <View style={styles.tHeadRow} fixed>
        <Text style={[styles.tHeadCell, styles.colNum]}>N°</Text>
        <Text style={[styles.tHeadCell, styles.colContenedor]}>Contenedor</Text>
        <Text style={[styles.tHeadCell, styles.colGuia]}>N° de guía</Text>
        <Text style={[styles.tHeadCell, styles.colFecha]}>
          Fecha de ingreso
        </Text>
      </View>
      {items.map((item, index) => (
        <View
          key={`${item.numeroGuia}-${index}`}
          wrap={false}
          style={[
            styles.tRow,
            { backgroundColor: index % 2 === 1 ? COLORS.grey : COLORS.white },
          ]}
        >
          <Text style={[styles.tCell, styles.colNum]}>{index + 1}</Text>
          <Text style={[styles.tCellBold, styles.colContenedor]}>
            {item.contenedor}
          </Text>
          <Text style={[styles.tCell, styles.colGuia]}>{item.numeroGuia}</Text>
          <Text style={[styles.tCell, styles.colFecha]}>
            {item.fechaIngreso}
          </Text>
        </View>
      ))}
    </View>
  );
}

interface ReporteInventarioPdfProps {
  data: ReporteInventarioData;
  /**
   * Ruta del logo. Por defecto "/krenco-logo-nombre-transparente.png"
   * (válido si el PDF se genera en el navegador). Si se genera en el
   * servidor, pasa el logo como data URI.
   */
  logoSrc?: string | null;
}

/**
 * Informe de inventario por cliente: encabezado con logo, datos del cliente,
 * resumen por medida y detalle por medida (salto de página entre grupos).
 */
export function ReporteInventarioPdf({
  data,
  logoSrc = LOGO_DEFAULT,
}: ReporteInventarioPdfProps) {
  return (
    <Document
      title={`Informe de inventario - ${data.cliente.nombre}`}
      author={data.almacen}
    >
      <Page size="A4" style={styles.page} wrap>
        {/* Encabezado */}
        <View style={styles.header}>
          {logoSrc ? (
            <Image src={logoSrc} style={styles.logo} />
          ) : (
            <Text style={styles.logoFallback}>{data.almacen}</Text>
          )}
          <View style={styles.headerRight}>
            <Text style={styles.headerKicker}>INFORME DE INVENTARIO</Text>
            <Text style={styles.headerTitle}>Contenedores almacenados</Text>
          </View>
        </View>

        {/* Datos del cliente */}
        <View style={styles.infoBox}>
          <View style={[styles.infoCol, { width: "38%" }]}>
            <Text style={styles.infoLabel}>CLIENTE</Text>
            <Text style={styles.infoValueBold}>{data.cliente.nombre}</Text>
          </View>
          <View style={[styles.infoCol, { width: "22%" }]}>
            <Text style={styles.infoLabel}>DOCUMENTO</Text>
            <Text style={styles.infoValue}>{data.cliente.documento}</Text>
          </View>
          <View style={[styles.infoCol, { width: "22%" }]}>
            <Text style={styles.infoLabel}>FECHA DE CORTE</Text>
            <Text style={styles.infoValue}>{data.fechaCorte}</Text>
          </View>
          <View style={[styles.infoCol, { width: "18%" }]}>
            <Text style={styles.infoLabel}>ESTADO</Text>
            <Text style={[styles.infoValueBold, { color: COLORS.brand }]}>
              Almacenados
            </Text>
          </View>
        </View>

        {/* Resumen */}
        <View style={styles.sectionHeader} wrap={false}>
          <View style={styles.sectionBar} />
          <Text style={styles.sectionTitle}>Resumen</Text>
        </View>
        <View style={styles.table}>
          <View style={styles.tHeadRow}>
            <Text style={[styles.tHeadCell, { width: "60%" }]}>
              Medida del contenedor
            </Text>
            <Text
              style={[styles.tHeadCell, { width: "40%", textAlign: "center" }]}
            >
              Cantidad
            </Text>
          </View>
          {data.grupos.map((grupo, i) => (
            <View
              key={grupo.medida}
              style={[
                styles.tRow,
                {
                  backgroundColor: i % 2 === 1 ? COLORS.grey : COLORS.white,
                },
              ]}
            >
              <Text style={[styles.tCell, { width: "60%" }]}>
                Contenedores de {grupo.medida}'
              </Text>
              <Text
                style={[
                  styles.tCellBold,
                  { width: "40%", textAlign: "center" },
                ]}
              >
                {grupo.contenedores.length}
              </Text>
            </View>
          ))}
          <View style={styles.tTotalRow}>
            <Text style={[styles.tTotalLabel, { width: "60%" }]}>
              Total en almacén
            </Text>
            <Text
              style={[
                styles.tTotalValue,
                { width: "40%", textAlign: "center" },
              ]}
            >
              {data.totalContenedores}
            </Text>
          </View>
        </View>

        {/* Detalle por medida: salto de página antes de cada grupo, excepto el primero */}
        {data.grupos.map((grupo, i) => (
          <View key={grupo.medida} break={i > 0}>
            <View style={styles.sectionHeader} minPresenceAhead={60}>
              <View style={styles.sectionBar} />
              <Text style={styles.sectionTitle}>
                Detalle – Contenedores de {grupo.medida}'
              </Text>
              <Text style={styles.sectionCount}>
                {grupo.contenedores.length} contenedores
              </Text>
            </View>
            <TablaContenedores items={grupo.contenedores} />
          </View>
        ))}

        {/* Pie de página */}
        <View style={styles.footer} fixed>
          <Text>
            {data.almacen} | Informe de inventario – {data.cliente.nombre}
          </Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `Página ${pageNumber} de ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}