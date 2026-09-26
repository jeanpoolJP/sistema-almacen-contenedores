// modules/reporte-inventario/components/reporte-inventario-form.tsx

"use client"

import { useState } from "react"
import { Loader2, FileDown, UserCheck, Building2, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

import { generarReporteInventarioPdf } from "../actions/reporte-inventario.actions"
import type { ClienteOption } from "../types/reporte-inventario.types"

interface ReporteInventarioFormProps {
  clientes: ClienteOption[]
}

function descargarPdfDesdeBase64(base64: string, nombreArchivo: string) {
  const binario = atob(base64)
  const bytes = new Uint8Array(binario.length)
  for (let i = 0; i < binario.length; i++) {
    bytes[i] = binario.charCodeAt(i)
  }

  const blob = new Blob([bytes], { type: "application/pdf" })
  const url = URL.createObjectURL(blob)

  const link = document.createElement("a")
  link.href = url
  link.download = nombreArchivo
  link.click()

  URL.revokeObjectURL(url)
}

export function ReporteInventarioForm({
  clientes,
}: ReporteInventarioFormProps) {
  const [clienteId, setClienteId] = useState<string>("")
  const [cargando, setCargando] = useState(false)

  // Corrección de TypeScript: Evita el descalce entre (value: string | null) y useState<string>
  const handleSelectChange = (val: string | null) => {
    setClienteId(val ?? "")
  }

  async function handleGenerar() {
    if (!clienteId) return

    setCargando(true)
    try {
      const resultado = await generarReporteInventarioPdf({
        clienteId: Number(clienteId),
      })

      if (!resultado.success) {
        toast.error(resultado.error)
        return
      }

      descargarPdfDesdeBase64(
        resultado.data.archivoBase64,
        resultado.data.nombreArchivo
      )
      toast.success("Reporte descargado exitosamente.")
    } catch (error) {
      console.error(error)
      toast.error("Ocurrió un error inesperado al generar el reporte.")
    } finally {
      setCargando(false)
    }
  }

  const clienteSeleccionado = clientes.find((c) => String(c.id) === clienteId)

  return (
    <Card className="w-full max-w-lg border-border/60 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-primary/10 p-2 text-primary">
              <FileDown className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">
                Generar Reporte de Inventario
              </CardTitle>
              <CardDescription className="text-xs">
                Selecciona un cliente para exportar su inventario actual a PDF.
              </CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className="font-mono text-xs">
            {clientes.length} {clientes.length === 1 ? "Cliente" : "Clientes"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="space-y-2">
          <label className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            <Building2 className="h-3.5 w-3.5" />
            Cliente con carga activa
          </label>

          <Select value={clienteId} onValueChange={handleSelectChange}>
            <SelectTrigger className="h-11 w-full bg-background">
              <SelectValue placeholder="Buscar o seleccionar cliente..." />
            </SelectTrigger>
            <SelectContent>
              {clientes.map((cliente) => (
                <SelectItem key={cliente.id} value={String(cliente.id)}>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{cliente.nombre}</span>
                    <span className="font-mono text-xs text-muted-foreground">
                      ({cliente.documento})
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {clientes.length === 0 && (
            <p className="mt-1 text-xs text-amber-600 dark:text-amber-500">
              No hay clientes con contenedores almacenados en este momento.
            </p>
          )}
        </div>

        {clienteSeleccionado && (
          <div className="animate-in space-y-1 rounded-lg border bg-muted/40 p-3 text-xs duration-200 fade-in-50">
            <p className="flex items-center gap-1.5 font-semibold text-foreground">
              <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
              Resumen de exportación:
            </p>
            <p className="pl-5 text-muted-foreground">
              <span className="font-medium text-foreground">
                {clienteSeleccionado.nombre}
              </span>{" "}
              — Documento: {clienteSeleccionado.documento}
            </p>
          </div>
        )}

        <Button
          onClick={handleGenerar}
          disabled={!clienteId || cargando}
          className="h-10 w-full font-medium transition-all"
        >
          {cargando ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generando documento...
            </>
          ) : (
            <>
              <Layers className="mr-2 h-4 w-4" />
              Descargar Reporte PDF
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
