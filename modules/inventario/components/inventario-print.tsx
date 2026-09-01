// modules\inventario\components\inventario-print.tsx

"use client"

type Detalle = {
  id: number
  guiaId: number
  resultado: "PENDIENTE" | "ENCONTRADO" | "NO_ENCONTRADO"

  guia: {
    numeroGuia: string
    fechaIngreso: Date

    contenedor: {
      numeroContenedor: string
      medida: number
      tipo: "NORMAL" | "REEFER"
      marca: string
    }
  }
}

type InventarioPrintProps = {
  inventarioId: number
  fecha: Date
  detalles: Detalle[]
}

function formatearFecha(fecha: Date) {
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(fecha))
}

export function InventarioPrint({
  inventarioId,
  fecha,
  detalles,
}: InventarioPrintProps) {
  const contenedores40 = detalles
    .filter((detalle) => detalle.guia.contenedor.medida === 40)
    .sort((a, b) =>
      a.guia.contenedor.numeroContenedor.localeCompare(
        b.guia.contenedor.numeroContenedor
      )
    )

  const contenedores20 = detalles
    .filter((detalle) => detalle.guia.contenedor.medida === 20)
    .sort((a, b) =>
      a.guia.contenedor.numeroContenedor.localeCompare(
        b.guia.contenedor.numeroContenedor
      )
    )

  function renderGrupo(titulo: string, items: Detalle[]) {
    return (
      <section className="mb-8">
        <h2 className="mb-3 border-b-2 pb-1 text-lg font-bold">
          CONTENEDORES DE {titulo}
        </h2>

        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="border p-2 text-left">N.º CONTENEDOR</th>

              <th className="border p-2 text-left">N.º GUÍA</th>

              <th className="border p-2 text-left">FECHA INGRESO</th>

              <th className="border p-2 text-left">TIPO</th>

              <th className="border p-2 text-center">¿ESTÁ FÍSICAMENTE?</th>
            </tr>
          </thead>

          <tbody>
            {items.map((detalle) => (
              <tr key={detalle.id}>
                <td className="border p-2 font-semibold">
                  {detalle.guia.contenedor.numeroContenedor}
                </td>

                <td className="border p-2">{detalle.guia.numeroGuia}</td>

                <td className="border p-2">
                  {formatearFecha(detalle.guia.fechaIngreso)}
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
    )
  }

  return (
    <div id="inventario-print" className="hidden print:block">
      <div className="mx-auto max-w-[190mm]">
        <header className="mb-6 border-b-2 pb-4 text-center">
          <h1 className="text-2xl font-bold">REPORTE DE INVENTARIO FÍSICO</h1>

          <p className="mt-2 text-sm">Inventario N.º {inventarioId}</p>

          <p className="text-sm">Fecha: {formatearFecha(fecha)}</p>
        </header>

        {renderGrupo("40 PIES", contenedores40)}

        {renderGrupo("20 PIES", contenedores20)}

        <footer className="mt-10 border-t pt-4 text-sm">
          <div className="flex justify-between">
            <span>
              Total de contenedores: <strong>{detalles.length}</strong>
            </span>

            <span>Verificado por: ______________________</span>
          </div>
        </footer>
      </div>
    </div>
  )
}
