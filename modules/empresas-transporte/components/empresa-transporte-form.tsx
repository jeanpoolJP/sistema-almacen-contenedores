// modules\empresas-transporte\components\empresa-transporte-form.tsx

"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import {
  crearEmpresaTransporteAction,
  actualizarEmpresaTransporteAction,
} from "../empresa-transporte.actions"

import type { EmpresaTransporte } from "../empresa-transporte.types"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type EmpresaTransporteFormProps = {
  empresa?: EmpresaTransporte
  onSuccess: () => void
}

export function EmpresaTransporteForm({
  empresa,
  onSuccess,
}: EmpresaTransporteFormProps) {
  const [nombre, setNombre] = useState("")
  const [ruc, setRuc] = useState("")
  const [telefono, setTelefono] = useState("")
  const [contactoLogistico, setContactoLogistico] = useState("")
  const [nombreEncargado, setNombreEncargado] = useState("")
  const [loading, setLoading] = useState(false)

  const modoEdicion = Boolean(empresa)

  /**
   * Carga los datos cuando se selecciona
   * una empresa para editar.
   */
  useEffect(() => {
    if (empresa) {
      setNombre(empresa.nombre)
      setRuc(empresa.ruc ?? "")
      setTelefono(empresa.telefono ?? "")
      setContactoLogistico(empresa.contactoLogistico ?? "")
      setNombreEncargado(empresa.nombreEncargado ?? "")
    } else {
      setNombre("")
      setRuc("")
      setTelefono("")
      setContactoLogistico("")
      setNombreEncargado("")
    }
  }, [empresa])

  /**
   * Envía el formulario.
   */
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!nombre.trim()) {
      toast.error("El nombre de la empresa es obligatorio")
      return
    }

    if (!ruc.trim()) {
      toast.error("El RUC es obligatorio")
      return
    }

    if (!/^\d{11}$/.test(ruc.trim())) {
      toast.error("El RUC debe tener exactamente 11 dígitos")
      return
    }

    setLoading(true)

    try {
      const data = {
        nombre: nombre.trim(),
        ruc: ruc.trim(),
        telefono: telefono.trim(),
        contactoLogistico: contactoLogistico.trim(),
        nombreEncargado: nombreEncargado.trim(),
      }

      const resultado = modoEdicion
        ? await actualizarEmpresaTransporteAction({
            id: empresa!.id,
            ...data,
          })
        : await crearEmpresaTransporteAction(data)

      if (!resultado.success) {
        toast.error(resultado.message)
        return
      }

      toast.success(resultado.message)

      onSuccess()
    } catch (error) {
      console.error(error)

      toast.error("Ocurrió un error inesperado")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* NOMBRE */}

      <div className="space-y-2">
        <Label htmlFor="nombre">Nombre de la empresa *</Label>

        <Input
          id="nombre"
          value={nombre}
          onChange={(event) => setNombre(event.target.value)}
          placeholder="Ej. Transportes ABC S.A.C."
          maxLength={150}
          disabled={loading}
          autoFocus
        />
      </div>

      {/* RUC */}

      <div className="space-y-2">
        <Label htmlFor="ruc">RUC *</Label>

        <Input
          id="ruc"
          value={ruc}
          onChange={(event) =>
            setRuc(event.target.value.replace(/\D/g, "").slice(0, 11))
          }
          placeholder="Ej. 20123456789"
          inputMode="numeric"
          maxLength={11}
          disabled={loading}
        />

        <p className="text-xs text-muted-foreground">
          El RUC debe tener exactamente 11 dígitos.
        </p>
      </div>

      {/* TELÉFONO */}

      <div className="space-y-2">
        <Label htmlFor="telefono">
          Teléfono{" "}
          <span className="font-normal text-muted-foreground">(opcional)</span>
        </Label>

        <Input
          id="telefono"
          value={telefono}
          onChange={(event) => setTelefono(event.target.value)}
          placeholder="Ej. 987654321"
          maxLength={20}
          disabled={loading}
        />
      </div>

      {/* CONTACTO LOGÍSTICO */}

      <div className="space-y-2">
        <Label htmlFor="contactoLogistico">
          Contacto logístico / compras{" "}
          <span className="font-normal text-muted-foreground">(opcional)</span>
        </Label>

        <Input
          id="contactoLogistico"
          value={contactoLogistico}
          onChange={(event) => setContactoLogistico(event.target.value)}
          placeholder="Ej. Logística / Compras"
          maxLength={150}
          disabled={loading}
        />
      </div>

      {/* NOMBRE DEL ENCARGADO */}

      <div className="space-y-2">
        <Label htmlFor="nombreEncargado">
          Nombre del encargado{" "}
          <span className="font-normal text-muted-foreground">(opcional)</span>
        </Label>

        <Input
          id="nombreEncargado"
          value={nombreEncargado}
          onChange={(event) => setNombreEncargado(event.target.value)}
          placeholder="Ej. Juan Pérez"
          maxLength={150}
          disabled={loading}
        />
      </div>

      {/* BOTONES */}

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 size-4 animate-spin" />}

          {modoEdicion ? "Guardar cambios" : "Registrar empresa"}
        </Button>
      </div>
    </form>
  )
}
