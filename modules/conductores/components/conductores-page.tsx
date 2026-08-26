"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  RefreshCw,
  Search,
  UserRound,
} from "lucide-react";

import type { Conductor } from "../conductores.types";
import { listarConductores } from "../conductores.actions";

import { ConductorForm } from "./conductor-form";
import { ConductorTable } from "./conductor-table";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ConductoresPage() {
  const [conductores, setConductores] =
    useState<Conductor[]>([]);

  const [
    conductorSeleccionado,
    setConductorSeleccionado,
  ] = useState<Conductor | null>(null);

  const [openForm, setOpenForm] =
    useState(false);

  const [busqueda, setBusqueda] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  // ============================================================
  // PAGINACIÓN
  // ============================================================

  const [page, setPage] = useState(1);

  const [pageSize, setPageSize] =
    useState(10);

  const [totalPages, setTotalPages] =
    useState(1);

  const [totalConductores, setTotalConductores] =
    useState(0);

  /**
   * Obtiene los conductores desde el servidor.
   */
  async function cargarConductores(
    pagina: number = page,
    cantidad: number = pageSize,
  ) {
    setLoading(true);

    try {
      const result =
        await listarConductores(
          pagina,
          cantidad,
        );

      if (result.success) {
        setConductores(
          result.data.data,
        );

        setPage(result.data.page);

        setPageSize(
          result.data.pageSize,
        );

        setTotalPages(
          result.data.totalPages,
        );

        setTotalConductores(
          result.data.total,
        );
      }
    } finally {
      setLoading(false);
    }
  }

  /**
   * Carga inicial.
   */
  useEffect(() => {
    cargarConductores(1, 10);
  }, []);

  /**
   * Cambia de página.
   */
  function handlePageChange(
    nuevaPagina: number,
  ) {
    cargarConductores(
      nuevaPagina,
      pageSize,
    );
  }

  /**
   * Cambia la cantidad de filas
   * mostradas por página.
   */
  function handlePageSizeChange(
    nuevaCantidad: number,
  ) {
    setPageSize(nuevaCantidad);

    cargarConductores(
      1,
      nuevaCantidad,
    );
  }

  /**
   * Filtra por:
   *
   * - Nombre
   * - Número de licencia
   */
  const conductoresFiltrados =
    conductores.filter((conductor) => {
      const termino =
        busqueda.trim().toLowerCase();

      if (!termino) {
        return true;
      }

      return (
        conductor.nombreCompleto
          .toLowerCase()
          .includes(termino) ||
        conductor.numeroLicencia
          .toLowerCase()
          .includes(termino)
      );
    });

  /**
   * Nuevo conductor.
   */
  function handleNuevoConductor() {
    setConductorSeleccionado(null);
    setOpenForm(true);
  }

  /**
   * Editar conductor.
   */
  function handleEditarConductor(
    conductor: Conductor,
  ) {
    setConductorSeleccionado(conductor);
    setOpenForm(true);
  }

  /**
   * Después de crear o actualizar.
   */
  async function handleSuccess() {
    setOpenForm(false);
    setConductorSeleccionado(null);

    await cargarConductores(
      page,
      pageSize,
    );
  }

  /**
   * Controla el diálogo.
   */
  function handleOpenChange(
    open: boolean,
  ) {
    setOpenForm(open);

    if (!open) {
      setConductorSeleccionado(null);
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
            <UserRound className="size-6" />

            <h1 className="text-2xl font-semibold tracking-tight">
              Conductores
            </h1>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Administra los conductores registrados en
            el sistema.
          </p>
        </div>

        <Button
          onClick={handleNuevoConductor}
        >
          <Plus className="mr-2 size-4" />

          Nuevo conductor
        </Button>
      </div>

      {/* =====================================================
          DIALOG
      ====================================================== */}

      <Dialog
        open={openForm}
        onOpenChange={handleOpenChange}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {conductorSeleccionado
                ? "Editar conductor"
                : "Registrar conductor"}
            </DialogTitle>
          </DialogHeader>

          <ConductorForm
            conductor={
              conductorSeleccionado
                ? {
                    id:
                      conductorSeleccionado.id,

                    nombreCompleto:
                      conductorSeleccionado.nombreCompleto,

                    numeroLicencia:
                      conductorSeleccionado.numeroLicencia,
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
            placeholder="Buscar por nombre o licencia..."
            className="pl-9"
          />
        </div>

        {/* Actualizar */}

        <Button
          variant="outline"
          onClick={() =>
            cargarConductores(
              page,
              pageSize,
            )
          }
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
            Cargando conductores...
          </p>
        </div>
      ) : (
        <ConductorTable
          conductores={
            conductoresFiltrados
          }
          onEdit={
            handleEditarConductor
          }
          onRefresh={() =>
            cargarConductores(
              page,
              pageSize,
            )
          }
          page={page}
          pageSize={pageSize}
          totalPages={totalPages}
          total={totalConductores}
          onPageChange={
            handlePageChange
          }
          onPageSizeChange={
            handlePageSizeChange
          }
        />
      )}

      {/* =====================================================
          INFORMACIÓN
      ====================================================== */}

      {!loading && (
        <div className="text-sm text-muted-foreground">
          Mostrando{" "}
          <span className="font-medium text-foreground">
            {
              conductoresFiltrados.length
            }
          </span>{" "}
          de{" "}
          <span className="font-medium text-foreground">
            {totalConductores}
          </span>{" "}
          conductores.
        </div>
      )}
    </div>
  );
}