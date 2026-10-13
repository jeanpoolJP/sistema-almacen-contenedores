// modules/control-alquiler/components/control-alquiler-page.tsx
import { listarGuiasAlquiler } from "../control-alquiler.service"
import { listarEquipos } from "@/modules/equipos/equipos.service"
import { listarOperadores } from "@/modules/operadores/operadores.service"
import { obtenerClientes as listarClientes } from "@/modules/clientes/cliente.service"
import { ControlAlquilerTable } from "./control-alquiler-table"

interface Props {
  searchParams: Record<string, string | string[] | undefined>
}

export async function ControlAlquilerPage({ searchParams }: Props) {
  const filtros = {
    busqueda: String(searchParams.busqueda ?? ""),
    estado: (searchParams.estado as any) ?? "todos",
    estadoPago: (searchParams.estadoPago as any) ?? "todos",
    cotizacion: (searchParams.cotizacion as any) ?? "todos",
    desde: searchParams.desde ? String(searchParams.desde) : undefined,
    hasta: searchParams.hasta ? String(searchParams.hasta) : undefined,
    pagina: Number(searchParams.pagina ?? 1),
    porPagina: Number(searchParams.porPagina ?? 10),
  }

  const [resultado, equipos, operadores, clientes] = await Promise.all([
    listarGuiasAlquiler(filtros),
    listarEquipos({ porPagina: 100 } as any),
    listarOperadores({ porPagina: 100 } as any),
    listarClientes(1, 100),
  ])

  return (
    <div className="space-y-6 p-6">
      <ControlAlquilerTable
        resultado={resultado}
        filtros={filtros}
        equipos={equipos.equipos}
        operadores={operadores.operadores}
        clientes={clientes}
      />
    </div>
  )
}