import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { ReporteInventarioData } from "../types/reporte-inventario.types";

const COLORS = {
  navy: "#1F3864",
  grey: "#F2F4F7",
  line: "#D0D5DD",
  text: "#222222",
  muted: "#667085",
  totalBg: "#E4E9F2",
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 50,
    paddingHorizontal: 40,
    fontSize: 9,
    color: COLORS.text,
    fontFamily: "Helvetica",
  },
  brand: {
    fontSize: 10,
    color: COLORS.muted,
    letterSpacing: 2,
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    color: COLORS.navy,
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.navy,
  },
  infoRow: { flexDirection: "row", marginBottom: 3 },
  infoLabel: { fontSize: 9, fontWeight: 700, color: COLORS.muted, width: 110 },
  infoValue: { fontSize: 9, color: COLORS.text },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: COLORS.navy,
    marginTop: 18,
    marginBottom: 8,
  },
  sectionCount: { fontSize: 9, color: COLORS.muted },
  table: { borderWidth: 1, borderColor: COLORS.line, marginBottom: 6 },
  tHeadRow: { flexDirection: "row", backgroundColor: COLORS.navy },
  tRow: { flexDirection: "row", borderTopWidth: 1, borderTopColor: COLORS.line },
  tHeadCell: { padding: 5, fontSize: 9, fontWeight: 700, color: "#FFFFFF" },
  tCell: { padding: 5, fontSize: 9, color: COLORS.text },
  colNum: { width: "8%" },
  colContenedor: { width: "34%", fontWeight: 700 },
  colGuia: { width: "28%" },
  colFecha: { width: "30%" },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: COLORS.muted,
    borderTopWidth: 1,
    borderTopColor: COLORS.line,
    paddingTop: 6,
  },
});

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
        <Text style={[styles.tHeadCell, styles.colFecha]}>Fecha de ingreso</Text>
      </View>
      {items.map((item, index) => (
        <View
          key={`${item.numeroGuia}-${index}`}
          wrap={false}
          style={[
            styles.tRow,
            { backgroundColor: index % 2 === 1 ? COLORS.grey : "#FFFFFF" },
          ]}
        >
          <Text style={[styles.tCell, styles.colNum]}>{index + 1}</Text>
          <Text style={[styles.tCell, styles.colContenedor]}>{item.contenedor}</Text>
          <Text style={[styles.tCell, styles.colGuia]}>{item.numeroGuia}</Text>
          <Text style={[styles.tCell, styles.colFecha]}>{item.fechaIngreso}</Text>
        </View>
      ))}
    </View>
  );
}

interface ReporteInventarioPdfProps {
  data: ReporteInventarioData;
}

/**
 * Documento PDF del inventario semanal, con el mismo formato
 * (encabezado navy, resumen y detalle por medida, salto de página entre grupos).
 */
export function ReporteInventarioPdf({ data }: ReporteInventarioPdfProps) {
  return (
    <Document title={`Informe de inventario - ${data.cliente.nombre}`}>
      <Page size="A4" style={styles.page} wrap>
        <Text style={styles.brand}>{data.almacen}</Text>
        <Text style={styles.title}>Informe de inventario de contenedores</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Cliente:</Text>
          <Text style={styles.infoValue}>{data.cliente.nombre}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Documento:</Text>
          <Text style={styles.infoValue}>{data.cliente.documento}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Almacén:</Text>
          <Text style={styles.infoValue}>{data.almacen}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Fecha de corte:</Text>
          <Text style={styles.infoValue}>{data.fechaCorte}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Estado:</Text>
          <Text style={styles.infoValue}>Almacenados</Text>
        </View>

        <Text style={styles.sectionTitle}>Resumen</Text>
        <View style={styles.table}>
          <View style={styles.tHeadRow}>
            <Text style={[styles.tHeadCell, { width: "60%" }]}>
              Medida del contenedor
            </Text>
            <Text style={[styles.tHeadCell, { width: "40%", textAlign: "center" }]}>
              Cantidad
            </Text>
          </View>
          {data.grupos.map((grupo, i) => (
            <View
              key={grupo.medida}
              style={[
                styles.tRow,
                { backgroundColor: i % 2 === 1 ? COLORS.grey : "#FFFFFF" },
              ]}
            >
              <Text style={[styles.tCell, { width: "60%" }]}>
                Contenedores de {grupo.medida}'
              </Text>
              <Text style={[styles.tCell, { width: "40%", textAlign: "center" }]}>
                {grupo.contenedores.length}
              </Text>
            </View>
          ))}
          <View style={[styles.tRow, { backgroundColor: COLORS.totalBg }]}>
            <Text style={[styles.tCell, { width: "60%", fontWeight: 700 }]}>
              Total en almacén
            </Text>
            <Text
              style={[
                styles.tCell,
                { width: "40%", textAlign: "center", fontWeight: 700 },
              ]}
            >
              {data.totalContenedores}
            </Text>
          </View>
        </View>

        {data.grupos.map((grupo, i) => (
          // Salto de página antes de cada grupo, excepto el primero.
          <View key={grupo.medida} break={i > 0}>
            <Text style={styles.sectionTitle}>
              Detalle – Contenedores de {grupo.medida}'{"   "}
              <Text style={styles.sectionCount}>
                {grupo.contenedores.length} contenedores
              </Text>
            </Text>
            <TablaContenedores items={grupo.contenedores} />
          </View>
        ))}

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
