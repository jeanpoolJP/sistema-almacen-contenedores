"use client";

import { useEffect, useState } from "react";
import {
  Car,
  Plus,
  RefreshCw,
  Search,
} from "lucide-react";

import type { Vehiculo } from "../vehiculos.types";
import { listarVehiculos } from "../vehiculos.actions";

import { VehiculoForm } from "./vehiculo-form";
import { VehiculoTable } from "./vehiculo-table";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function VehiculosPage() {
  const [vehiculos, setVehiculos] =
    useState<Vehiculo[]>([]);

  const [
    vehiculoSeleccionado,
    setVehiculoSeleccionado,
  ] = useState<Vehiculo | null>(null);

  const [openForm, setOpenForm] =
    useState(false);

  const [busqueda, setBusqueda] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  /**
   * Obtiene los vehículos desde el servidor.
   */
  async function cargarVehiculos() {
    setLoading(true);

    try {
      const result =
        await listarVehiculos();

      if (result.success) {
        setVehiculos(result.data);
      }
    } finally {
      setLoading(false);
    }
  }

  /**
   * Carga inicial.
   */
  useEffect(() => {
    cargarVehiculos();
  }, []);

  /**
   * Filtra los vehículos por placa.
   */
  const vehiculosFiltrados =
    vehiculos.filter((vehiculo) => {
      const termino =
        busqueda.trim().toLowerCase();

      if (!termino) {
        return true;
      }

      return vehiculo.placa
        .toLowerCase()
        .includes(termino);
    });

  /**
   * Nuevo vehículo.
   */
  function handleNuevoVehiculo() {
    setVehiculoSeleccionado(null);
    setOpenForm(true);
  }

  /**
   * Editar vehículo.
   */
  function handleEditarVehiculo(
    vehiculo: Vehiculo,
  ) {
    setVehiculoSeleccionado(vehiculo);
    setOpenForm(true);
  }

  /**
   * Se ejecuta después de crear o actualizar
   * correctamente un vehículo.
   */
  async function handleSuccess() {
    setOpenForm(false);
    setVehiculoSeleccionado(null);

    await cargarVehiculos();
  }

  /**
   * Controla el diálogo.
   */
  function handleOpenChange(
    open: boolean,
  ) {
    setOpenForm(open);

    if (!open) {
      setVehiculoSeleccionado(null);
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Car className="size-6" />

            <h1 className="text-2xl font-semibold tracking-tight">
              Vehículos
            </h1>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Administra los vehículos registrados
            en el sistema.
          </p>
        </div>

        <Button
          onClick={handleNuevoVehiculo}
        >
          <Plus className="mr-2 size-4" />

          Nuevo vehículo
        </Button>
      </div>

      {/* =====================================================
          DIALOG CREAR / EDITAR
      ====================================================== */}

      <Dialog
        open={openForm}
        onOpenChange={handleOpenChange}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {vehiculoSeleccionado
                ? "Editar vehículo"
                : "Registrar vehículo"}
            </DialogTitle>
          </DialogHeader>

          <VehiculoForm
            vehiculo={
              vehiculoSeleccionado
                ? {
                    id: vehiculoSeleccionado.id,
                    placa:
                      vehiculoSeleccionado.placa,
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
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={busqueda}
            onChange={(event) =>
              setBusqueda(
                event.target.value,
              )
            }
            placeholder="Buscar por placa..."
            className="pl-9 uppercase"
          />
        </div>

        {/* Actualizar */}
        <Button
          variant="outline"
          onClick={cargarVehiculos}
          disabled={loading}
        >
          <RefreshCw
            className={`mr-2 size-4 ${
              loading
                ? "animate-spin"
                : ""
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
          <RefreshCw className="mx-auto size-5 animate-spin text-muted-foreground" />

          <p className="mt-2 text-sm text-muted-foreground">
            Cargando vehículos...
          </p>
        </div>
      ) : (
        <VehiculoTable
          vehiculos={vehiculosFiltrados}
          onEdit={handleEditarVehiculo}
          onRefresh={cargarVehiculos}
        />
      )}

      {/* =====================================================
          INFORMACIÓN
      ====================================================== */}

      {!loading && (
        <div className="text-sm text-muted-foreground">
          Mostrando{" "}
          <span className="font-medium text-foreground">
            {vehiculosFiltrados.length}
          </span>{" "}
          de{" "}
          <span className="font-medium text-foreground">
            {vehiculos.length}
          </span>{" "}
          vehículos.
        </div>
      )}
    </div>
  );
}