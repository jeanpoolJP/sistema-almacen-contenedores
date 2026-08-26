// modules\empresas-transporte\components\empresas-transporte-page.tsx

"use client";

import { useEffect, useState } from "react";

import {
  Building2,
  Plus,
  RefreshCw,
  Search,
} from "lucide-react";

import { toast } from "sonner";

import type {
  EmpresaTransporte,
} from "../empresa-transporte.types";

import {
  obtenerEmpresasTransporteAction,
} from "../empresa-transporte.actions";

import { EmpresaTransporteForm } from "./empresa-transporte-form";
import { EmpresaTransporteTable } from "./empresa-transporte-table";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function EmpresasTransportePage() {
  const [empresas, setEmpresas] =
    useState<
      EmpresaTransporte[]
    >([]);

  const [
    empresaSeleccionada,
    setEmpresaSeleccionada,
  ] = useState<EmpresaTransporte | null>(
    null,
  );

  const [openForm, setOpenForm] =
    useState(false);

  const [busqueda, setBusqueda] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  // ============================================================
  // PAGINACIÓN
  // ============================================================

  const [page, setPage] =
    useState(1);

  const [pageSize, setPageSize] =
    useState(10);

  const [
    totalPages,
    setTotalPages,
  ] = useState(1);

  const [
    totalEmpresas,
    setTotalEmpresas,
  ] = useState(0);

  /**
   * Obtiene las empresas de transporte
   * desde el servidor.
   */
  async function cargarEmpresas(
    pagina: number = page,
    cantidad: number = pageSize,
  ) {
    setLoading(true);

    try {
      const result =
        await obtenerEmpresasTransporteAction(
          pagina,
          cantidad,
        );

      if (result.success) {
        setEmpresas(
          result.data.data,
        );

        setPage(
          result.data.page,
        );

        setPageSize(
          result.data.pageSize,
        );

        setTotalPages(
          result.data.totalPages,
        );

        setTotalEmpresas(
          result.data.total,
        );
      } else {
        toast.error(
          result.message ??
            "No se pudieron cargar las empresas de transporte",
        );
      }
    } catch (error) {
      console.error(error);

      toast.error(
        "No se pudieron cargar las empresas de transporte",
      );
    } finally {
      setLoading(false);
    }
  }

  /**
   * Carga inicial.
   */
  useEffect(() => {
    cargarEmpresas(
      1,
      10,
    );
  }, []);

  /**
   * Cambia de página.
   */
  function handlePageChange(
    nuevaPagina: number,
  ) {
    cargarEmpresas(
      nuevaPagina,
      pageSize,
    );
  }

  /**
   * Cambia la cantidad de filas
   * por página.
   */
  function handlePageSizeChange(
    nuevaCantidad: number,
  ) {
    cargarEmpresas(
      1,
      nuevaCantidad,
    );
  }

  /**
   * Filtra las empresas cargadas
   * actualmente.
   *
   * - Nombre
   * - RUC
   * - Teléfono
   */
  const empresasFiltradas =
    empresas.filter(
      (empresa) => {
        const termino =
          busqueda
            .trim()
            .toLowerCase();

        if (!termino) {
          return true;
        }

        return (
          empresa.nombre
            .toLowerCase()
            .includes(termino) ||
          empresa.ruc
            ?.toLowerCase()
            .includes(termino) ||
          empresa.telefono
            ?.toLowerCase()
            .includes(termino)
        );
      },
    );

  /**
   * Nueva empresa.
   */
  function handleNuevaEmpresa() {
    setEmpresaSeleccionada(
      null,
    );

    setOpenForm(true);
  }

  /**
   * Editar empresa.
   */
  function handleEditarEmpresa(
    empresa: EmpresaTransporte,
  ) {
    setEmpresaSeleccionada(
      empresa,
    );

    setOpenForm(true);
  }

  /**
   * Después de crear o actualizar.
   */
  async function handleSuccess() {
    setOpenForm(false);

    setEmpresaSeleccionada(
      null,
    );

    await cargarEmpresas(
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
      setEmpresaSeleccionada(
        null,
      );
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
            <Building2 className="size-6" />

            <h1 className="text-2xl font-semibold tracking-tight">
              Empresas de
              transporte
            </h1>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Administra las empresas
            de transporte
            registradas en el
            sistema.
          </p>
        </div>

        <Button
          onClick={
            handleNuevaEmpresa
          }
        >
          <Plus className="mr-2 size-4" />

          Nueva empresa
        </Button>
      </div>

      {/* =====================================================
          DIALOG
      ====================================================== */}

      <Dialog
        open={openForm}
        onOpenChange={
          handleOpenChange
        }
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {empresaSeleccionada
                ? "Editar empresa de transporte"
                : "Registrar empresa de transporte"}
            </DialogTitle>
          </DialogHeader>

          <EmpresaTransporteForm
            empresa={
              empresaSeleccionada
                ? {
                    id:
                      empresaSeleccionada.id,

                    nombre:
                      empresaSeleccionada.nombre,

                    ruc:
                      empresaSeleccionada.ruc,

                    telefono:
                      empresaSeleccionada.telefono,

                    activo:
                      empresaSeleccionada.activo,

                    createdAt:
                      empresaSeleccionada.createdAt,

                    updatedAt:
                      empresaSeleccionada.updatedAt,
                  }
                : undefined
            }
            onSuccess={
              handleSuccess
            }
          />
        </DialogContent>
      </Dialog>

      {/* =====================================================
          BARRA DE HERRAMIENTAS
      ====================================================== */}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* BUSCADOR */}

        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={busqueda}
            onChange={(event) =>
              setBusqueda(
                event.target.value,
              )
            }
            placeholder="Buscar por nombre, RUC o teléfono..."
            className="pl-9"
          />
        </div>

        {/* ACTUALIZAR */}

        <Button
          variant="outline"
          onClick={() =>
            cargarEmpresas(
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
            Cargando empresas
            de transporte...
          </p>
        </div>
      ) : (
        <EmpresaTransporteTable
          empresas={
            empresasFiltradas
          }
          onEdit={
            handleEditarEmpresa
          }
          onRefresh={() =>
            cargarEmpresas(
              page,
              pageSize,
            )
          }
          page={page}
          pageSize={pageSize}
          totalPages={
            totalPages
          }
          total={
            totalEmpresas
          }
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
              empresasFiltradas.length
            }
          </span>{" "}
          de{" "}
          <span className="font-medium text-foreground">
            {
              totalEmpresas
            }
          </span>{" "}
          empresas.
        </div>
      )}
    </div>
  );
}