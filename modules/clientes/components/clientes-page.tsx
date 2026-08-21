"use client";

import { useEffect, useState } from "react";
import { Plus, RefreshCw, Search } from "lucide-react";

import type { Cliente } from "../cliente.types";
import { listarClientes } from "../cliente.actions";

import { ClienteForm } from "./cliente-form";
import { ClienteTable } from "./cliente-table";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);

  const [clienteSeleccionado, setClienteSeleccionado] =
    useState<Cliente | null>(null);

  const [openForm, setOpenForm] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);

  /**
   * Obtiene la lista de clientes desde el servidor.
   */
  async function cargarClientes() {
    setLoading(true);

    try {
      const result = await listarClientes();

      if (result.success) {
        setClientes(result.data);
      }
    } finally {
      setLoading(false);
    }
  }

  /**
   * Cargar clientes al montar el componente.
   */
  useEffect(() => {
    cargarClientes();
  }, []);

  /**
   * Filtra clientes por DNI, nombre o teléfono.
   */
  const clientesFiltrados = clientes.filter((cliente) => {
    const termino = busqueda.toLowerCase().trim();

    if (!termino) {
      return true;
    }

    return (
      cliente.dni?.toLowerCase().includes(termino) ||
      cliente.nombreCompleto
        ?.toLowerCase()
        .includes(termino) ||
      cliente.telefono
        ?.toLowerCase()
        .includes(termino)
    );
  });

  /**
   * Abre el formulario para registrar un nuevo cliente.
   */
  function handleNuevoCliente() {
    setClienteSeleccionado(null);
    setOpenForm(true);
  }

  /**
   * Abre el formulario para editar un cliente.
   */
  function handleEditarCliente(cliente: Cliente) {
    setClienteSeleccionado(cliente);
    setOpenForm(true);
  }

  /**
   * Se ejecuta después de crear o actualizar
   * correctamente un cliente.
   */
  async function handleSuccess() {
    setOpenForm(false);
    setClienteSeleccionado(null);

    await cargarClientes();
  }

  /**
   * Controla el cierre del diálogo.
   */
  function handleOpenChange(open: boolean) {
    setOpenForm(open);

    if (!open) {
      setClienteSeleccionado(null);
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* =====================================================
          HEADER
      ====================================================== */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Clientes
          </h1>

          <p className="text-sm text-muted-foreground">
            Administra los clientes registrados en el sistema.
          </p>
        </div>

        {/* Botón nuevo cliente */}
        <Button onClick={handleNuevoCliente}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo cliente
        </Button>
      </div>

      {/* =====================================================
          DIALOG CREAR / EDITAR
      ====================================================== */}
      <Dialog
        open={openForm}
        onOpenChange={handleOpenChange}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {clienteSeleccionado
                ? "Editar cliente"
                : "Registrar cliente"}
            </DialogTitle>
          </DialogHeader>

          <ClienteForm
            cliente={
              clienteSeleccionado
                ? {
                    id: clienteSeleccionado.id,
                    dni: clienteSeleccionado.dni ?? "",
                    nombreCompleto:
                      clienteSeleccionado.nombreCompleto ?? "",
                    telefono:
                      clienteSeleccionado.telefono ?? "",
                    observaciones:
                      clienteSeleccionado.observaciones ?? "",
                    activo: clienteSeleccionado.activo,
                  }
                : undefined
            }
            onSuccess={handleSuccess}
          />
        </DialogContent>
      </Dialog>

      {/* =====================================================
          BARRA DE HERRAMIENTAS
      ====================================================== */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Buscador */}
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={busqueda}
            onChange={(event) =>
              setBusqueda(event.target.value)
            }
            placeholder="Buscar por DNI, nombre o teléfono..."
            className="pl-9"
          />
        </div>

        {/* Actualizar */}
        <Button
          variant="outline"
          onClick={cargarClientes}
          disabled={loading}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${
              loading ? "animate-spin" : ""
            }`}
          />

          Actualizar
        </Button>
      </div>

      {/* =====================================================
          TABLA
      ====================================================== */}
      {loading ? (
        <div className="rounded-lg border p-8 text-center">
          <RefreshCw className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />

          <p className="mt-2 text-sm text-muted-foreground">
            Cargando clientes...
          </p>
        </div>
      ) : (
        <ClienteTable
          clientes={clientesFiltrados}
          onEdit={handleEditarCliente}
          onRefresh={cargarClientes}
        />
      )}

      {/* =====================================================
          INFORMACIÓN
      ====================================================== */}
      {!loading && (
        <div className="text-sm text-muted-foreground">
          Mostrando{" "}
          <span className="font-medium text-foreground">
            {clientesFiltrados.length}
          </span>{" "}
          de{" "}
          <span className="font-medium text-foreground">
            {clientes.length}
          </span>{" "}
          clientes.
        </div>
      )}
    </div>
  );
}