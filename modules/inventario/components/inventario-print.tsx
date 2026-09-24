// modules/inventario/components/inventario-print.tsx

"use client"

type ClienteGuia = {
  id: number
  nombreCompleto: string | null
  tipoDocumento: string
  numeroDocumento: string
}

type Detalle = {
  id: number
  guiaId: number
  resultado: "PENDIENTE" | "ENCONTRADO" | "NO_ENCONTRADO"

  guia: {
    numeroGuia: string
    fechaIngreso: Date
    cliente?: ClienteGuia | null

    contenedor: {
      numeroContenedor: string
      medida: number
      tipo: "NORMAL" | "REEFER"
      marca: string
    }
  }
}

type GrupoCliente = {
  clave: string
  nombre: string
  documento: string | null
  items: Detalle[]
}

type InventarioPrintProps = {
  inventarioId: number
  fecha: Date
  detalles: Detalle[]
}

function formatearFecha(fecha: Date) {
  const valor = new Date(fecha)

  return [
    String(valor.getUTCDate()).padStart(2, "0"),
    String(valor.getUTCMonth() + 1).padStart(2, "0"),
    valor.getUTCFullYear(),
  ].join("/")
}

function ordenarDetalles(items: Detalle[]) {
  return [...items].sort((a, b) => {
    const porMedida = a.guia.contenedor.medida - b.guia.contenedor.medida

    if (porMedida !== 0) return porMedida

    return a.guia.contenedor.numeroContenedor.localeCompare(
      b.guia.contenedor.numeroContenedor
    )
  })
}

/**
 * Agrupa los contenedores del inventario por cliente.
 * Las guías sin cliente quedan al final en "Sin cliente".
 */
function agruparPorCliente(detalles: Detalle[]): GrupoCliente[] {
  const grupos = new Map<string, GrupoCliente>()

  for (const detalle of detalles) {
    const cliente = detalle.guia.cliente
    const clave = cliente ? String(cliente.id) : "sin-cliente"
    const nombre = cliente?.nombreCompleto?.trim() || "Sin cliente"
    const documento = cliente
      ? `${cliente.tipoDocumento} ${cliente.numeroDocumento}`
      : null

    const grupo = grupos.get(clave)

    if (grupo) {
      grupo.items.push(detalle)
    } else {
      grupos.set(clave, {
        clave,
        nombre,
        documento,
        items: [detalle],
      })
    }
  }

  return [...grupos.values()]
    .sort((a, b) => {
      if (a.clave === "sin-cliente") return 1
      if (b.clave === "sin-cliente") return -1

      return a.nombre.localeCompare(b.nombre, "es")
    })
    .map((grupo) => ({
      ...grupo,
      items: ordenarDetalles(grupo.items),
    }))
}

export function InventarioPrint({
  inventarioId,
  fecha,
  detalles,
}: InventarioPrintProps) {
  const grupos = agruparPorCliente(detalles)

  return (
    <div id="inventario-print">
      <div className="mx-auto max-w-[190mm]">
        <header className="mb-6 border-b-2 pb-4 text-center">
          <h1 className="text-2xl font-bold">REPORTE DE INVENTARIO FÍSICO</h1>

          <p className="mt-2 text-sm">Inventario N.º {inventarioId}</p>

          <p className="text-sm">Fecha: {formatearFecha(fecha)}</p>
        </header>

        {grupos.map((grupo) => (
          <section key={grupo.clave} className="mb-8 break-inside-avoid">
            <h2 className="mb-1 border-b-2 pb-1 text-lg font-bold uppercase">
              {grupo.nombre}
            </h2>

            {grupo.documento && (
              <p className="mb-3 text-xs text-muted-foreground">
                {grupo.documento} · {grupo.items.length}{" "}
                {grupo.items.length === 1 ? "contenedor" : "contenedores"}
              </p>
            )}

            {!grupo.documento && (
              <p className="mb-3 text-xs text-muted-foreground">
                {grupo.items.length}{" "}
                {grupo.items.length === 1 ? "contenedor" : "contenedores"}
              </p>
            )}

            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="border p-2 text-left">N.º CONTENEDOR</th>
                  <th className="border p-2 text-left">N.º GUÍA</th>
                  <th className="border p-2 text-left">FECHA INGRESO</th>
                  <th className="border p-2 text-left">MEDIDA</th>
                  <th className="border p-2 text-left">TIPO</th>
                  <th className="border p-2 text-center">¿ESTÁ FÍSICAMENTE?</th>
                </tr>
              </thead>

              <tbody>
                {grupo.items.map((detalle) => (
                  <tr key={detalle.id}>
                    <td className="border p-2 font-semibold">
                      {detalle.guia.contenedor.numeroContenedor}
                    </td>

                    <td className="border p-2">{detalle.guia.numeroGuia}</td>

                    <td className="border p-2">
                      {formatearFecha(detalle.guia.fechaIngreso)}
                    </td>

                    <td className="border p-2">
                      {detalle.guia.contenedor.medida}&apos;
                    </td>

                    <td className="border p-2">{detalle.guia.contenedor.tipo}</td>

                    <td className="border p-2 text-center">
                      <span className="inline-block h-5 w-5 border-2 border-black" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ))}

        <footer className="mt-10 border-t pt-4 text-sm">
          <div className="flex justify-between">
            <span>
              Total de contenedores: <strong>{detalles.length}</strong>
              {" · "}
              Clientes: <strong>{grupos.length}</strong>
            </span>

            <span>Verificado por: ______________________</span>
          </div>
        </footer>
      </div>
    </div>
  )
}
