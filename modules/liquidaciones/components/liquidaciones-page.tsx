// modules\liquidaciones\components\liquidaciones-page.tsx

"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { listLiquidacionesAction } from "../liquidacion.actions"
import type { LiquidacionListItem } from "../liquidacion.types"
import { runAction } from "../hooks/use-action-result"

const estadoColor: Record<string, string> = {
  BORRADOR: "bg-gray-200 text-gray-800",
  CONFIRMADA: "bg-yellow-200 text-yellow-900",
  PAGADA: "bg-green-200 text-green-900",
  ANULADA: "bg-red-200 text-red-900",
}

export function LiquidacionesPage() {
  const [items, setItems] = useState<LiquidacionListItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    runAction(() => listLiquidacionesAction({ page: 1, pageSize: 50 }))
      .then((data) => {
        if (cancelled || !data) return
        setItems(data.items)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Liquidaciones</h1>
        <Button>
          <Link href="/admin/liquidaciones/nueva">Nueva liquidación</Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Fecha corte</TableHead>
              <TableHead className="text-right">Guías</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="py-6 text-center">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-6 text-center">
                  No hay liquidaciones registradas
                </TableCell>
              </TableRow>
            ) : (
              items.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="font-mono">{l.numero}</TableCell>
                  <TableCell>
                    {l.clienteNombre} ({l.clienteDocumento})
                  </TableCell>
                  <TableCell>
                    {new Date(l.fechaCorte).toLocaleDateString("es-PE")}
                  </TableCell>
                  <TableCell className="text-right">
                    {l.cantidadGuias}
                  </TableCell>
                  <TableCell className="text-right">
                    S/ {l.montoTotal.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge className={estadoColor[l.estado]}>{l.estado}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">
                      <Link href={`/admin/liquidaciones/${l.id}`}>Ver</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
