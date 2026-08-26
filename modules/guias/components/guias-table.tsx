// modules/guias/components/guias-table.tsx

"use client"

import { useMemo, useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Eye, LogOut, MoreHorizontal, Search, Ban } from "lucide-react"
import { toast } from "sonner"

import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { EstadoBadge } from "./estado-badge"
import { GuiaDetalleSheet } from "./guia-detalle-sheet"
import { RegistrarSalidaDialog } from "./registrar-salida-dialog"
import { anularGuiaAction } from "../guia.actions"
import type { GuiaConRelaciones } from "./guia-con-relaciones.type"

/**
 * Formatea una fecha de negocio sin aplicar
 * conversión de zona horaria.
 *
 * Ejemplo:
 *
 * 2026-08-25T00:00:00.000Z
 * → 25 ago 2026
 *
 * No usamos:
 * new Date(fecha) + format()
 *
 * porque eso puede convertir la fecha a UTC-5
 * y mostrar el día anterior en Perú.
 */
function formatFechaNegocio(fecha: Date | string | null | undefined) {
  if (!fecha) return "—"

  const fechaDate = typeof fecha === "string" ? new Date(fecha) : fecha

  const año = fechaDate.getUTCFullYear()

  const mes = fechaDate.getUTCMonth()

  const dia = fechaDate.getUTCDate()

  // Creamos una fecha local con los mismos
  // componentes de año, mes y día.
  const fechaLocal = new Date(año, mes, dia)

  return format(fechaLocal, "dd MMM yyyy", {
    locale: es,
  })
}

type GuiasTableProps = {
  guias: GuiaConRelaciones[]
  onCambio?: () => void
}

export function GuiasTable({ guias, onCambio }: GuiasTableProps) {
  const [busqueda, setBusqueda] = useState("")
  const [guiaDetalle, setGuiaDetalle] = useState<GuiaConRelaciones | null>(null)
  const [guiaSalida, setGuiaSalida] = useState<GuiaConRelaciones | null>(null)
  const [guiaAnular, setGuiaAnular] = useState<GuiaConRelaciones | null>(null)
  const [anulando, setAnulando] = useState(false)

  const guiasFiltradas = useMemo(() => {
    const query = busqueda.trim().toLowerCase()
    if (!query) return guias

    return guias.filter((guia) => {
      return (
        guia.numeroGuia.toLowerCase().includes(query) ||
        guia.contenedor.numeroContenedor.toLowerCase().includes(query) ||
        guia.cliente?.numeroDocumento?.toLowerCase().includes(query) ||
        guia.cliente?.nombreCompleto?.toLowerCase().includes(query)
      )
    })
  }, [guias, busqueda])

  async function confirmarAnulacion() {
    if (!guiaAnular) return
    setAnulando(true)
    const res = await anularGuiaAction(guiaAnular.id)
    setAnulando(false)
    setGuiaAnular(null)

    if (!res.success) {
      toast.error(res.message)
      return
    }

    toast.success(res.message)
    onCambio?.()
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por guía, contenedor o cliente..."
          className="pl-8"
        />
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N° Guía</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Contenedor</TableHead>
              <TableHead>Ingreso</TableHead>
              <TableHead>Salida</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Monto total</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {guiasFiltradas.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-24 text-center text-sm text-muted-foreground"
                >
                  No se encontraron guías.
                </TableCell>
              </TableRow>
            )}

            {guiasFiltradas.map((guia) => (
              <TableRow key={guia.id}>
                <TableCell className="font-medium">{guia.numeroGuia}</TableCell>
                <TableCell>
                  {guia.cliente ? (
                    <div>
                      <p className="text-sm">
                        {guia.cliente.nombreCompleto || "Sin nombre"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {guia.cliente.tipoDocumento}{" "}
                        {guia.cliente.numeroDocumento}
                      </p>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      Sin cliente
                    </span>
                  )}
                </TableCell>
                <TableCell>{guia.contenedor.numeroContenedor}</TableCell>
                <TableCell className="text-sm">
                  {formatFechaNegocio(guia.fechaIngreso)}
                </TableCell>
                <TableCell className="text-sm">
                  {formatFechaNegocio(guia.fechaSalida)}
                </TableCell>
                <TableCell>
                  <EstadoBadge estado={guia.estado} />
                </TableCell>
                <TableCell className="text-right text-sm">
                  {guia.montoTotal !== null
                    ? `S/ ${guia.montoTotal.toFixed(2)}`
                    : "—"}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                        />
                      }
                    >
                      <MoreHorizontal className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setGuiaDetalle(guia)}>
                        <Eye className="mr-2 size-4" />
                        Ver detalles
                      </DropdownMenuItem>

                      {guia.estado === "ALMACENADO" && (
                        <DropdownMenuItem onClick={() => setGuiaSalida(guia)}>
                          <LogOut className="mr-2 size-4" />
                          Registrar salida
                        </DropdownMenuItem>
                      )}

                      {guia.estado === "ALMACENADO" && (
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setGuiaAnular(guia)}
                        >
                          <Ban className="mr-2 size-4" />
                          Anular guía
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <GuiaDetalleSheet
        guia={guiaDetalle}
        open={!!guiaDetalle}
        onOpenChange={(open) => !open && setGuiaDetalle(null)}
      />

      {guiaSalida && (
        <RegistrarSalidaDialog
          guia={guiaSalida}
          open={!!guiaSalida}
          onOpenChange={(open) => !open && setGuiaSalida(null)}
          onRegistrada={() => {
            setGuiaSalida(null)
            onCambio?.()
          }}
        />
      )}

      <AlertDialog
        open={!!guiaAnular}
        onOpenChange={(open) => !open && setGuiaAnular(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Anular la guía {guiaAnular?.numeroGuia}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no elimina el registro, pero marca la guía como
              anulada y no podrá revertirse desde aquí.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={anulando}
              onClick={confirmarAnulacion}
              className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
            >
              {anulando ? "Anulando..." : "Sí, anular"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
