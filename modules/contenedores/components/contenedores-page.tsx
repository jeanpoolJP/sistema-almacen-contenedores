"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Plus,
  RefreshCw,
  Search,
} from "lucide-react";

import type { Contenedor } from "../contenedores.types";

import { listarContenedores } from "../contenedores.actions";

import { ContenedorForm } from "./contenedor-form";
import { ContenedorTable } from "./contenedor-table";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ContenedoresPage() {
  const [
    contenedores,
    setContenedores,
  ] = useState<Contenedor[]>([]);

  const [
    contenedorSeleccionado,
    setContenedorSeleccionado,
  ] = useState<Contenedor | null>(
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
    totalContenedores,
    setTotalContenedores,
  ] = useState(0);

  /**
   * Obtiene los contenedores desde
   * el servidor.
   *
   * También obtiene la información
   * necesaria para la paginación.
   */
  async function cargarContenedores(
    pagina: number = page,
    cantidad: number = pageSize,
  ) {
    setLoading(true);

    try {
      const result =
        await listarContenedores(
          pagina,
          cantidad,
        );

      if (result.success) {
        setContenedores(
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

        setTotalContenedores(
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
    cargarContenedores(
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
    cargarContenedores(
      nuevaPagina,
      pageSize,
    );
  }

  /**
   * Cambia la cantidad de filas
   * mostradas por página.
   *
   * Al cambiar la cantidad,
   * volvemos a la primera página.
   */
  function handlePageSizeChange(
    nuevaCantidad: number,
  ) {
    setPageSize(
      nuevaCantidad,
    );

    cargarContenedores(
      1,
      nuevaCantidad,
    );
  }

  /**
   * Filtra por:
   *
   * - Número de contenedor
   * - Marca
   * - Tipo
   * - Medida
   */
  const contenedoresFiltrados =
    contenedores.filter(
      (contenedor) => {
        const termino =
          busqueda
            .trim()
            .toLowerCase();

        if (!termino) {
          return true;
        }

        return (
          contenedor.numeroContenedor
            .toLowerCase()
            .includes(termino) ||
          contenedor.marca
            .toLowerCase()
            .includes(termino) ||
          contenedor.tipo
            .toLowerCase()
            .includes(termino) ||
          String(
            contenedor.medida,
          ).includes(termino)
        );
      },
    );

  /**
   * Nuevo contenedor.
   */
  function handleNuevoContenedor() {
    setContenedorSeleccionado(
      null,
    );

    setOpenForm(true);
  }

  /**
   * Editar contenedor.
   */
  function handleEditarContenedor(
    contenedor: Contenedor,
  ) {
    setContenedorSeleccionado(
      contenedor,
    );

    setOpenForm(true);
  }

  /**
   * Después de crear o actualizar.
   */
  async function handleSuccess() {
    setOpenForm(false);

    setContenedorSeleccionado(
      null,
    );

    await cargarContenedores(
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
      setContenedorSeleccionado(
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
            <Box className="size-6 text-muted-foreground" />

            <h1 className="text-2xl font-semibold tracking-tight">
              Contenedores
            </h1>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Administra los contenedores
            registrados en el almacén.
          </p>
        </div>

        <Button
          onClick={
            handleNuevoContenedor
          }
        >
          <Plus className="mr-2 size-4" />

          Nuevo contenedor
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
              {contenedorSeleccionado
                ? "Editar contenedor"
                : "Registrar contenedor"}
            </DialogTitle>
          </DialogHeader>

          <ContenedorForm
            contenedor={
              contenedorSeleccionado
                ? {
                    id:
                      contenedorSeleccionado.id,

                    numeroContenedor:
                      contenedorSeleccionado.numeroContenedor,

                    marca:
                      contenedorSeleccionado.marca,

                    medida:
                      contenedorSeleccionado.medida,

                    tipo:
                      contenedorSeleccionado.tipo,
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
            placeholder="Buscar por número, marca, tipo o medida..."
            className="pl-9"
          />
        </div>

        {/* Actualizar */}

        <Button
          variant="outline"
          onClick={() =>
            cargarContenedores(
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
            Cargando contenedores...
          </p>
        </div>
      ) : (
        <ContenedorTable
          contenedores={
            contenedoresFiltrados
          }
          onEdit={
            handleEditarContenedor
          }
          onRefresh={() =>
            cargarContenedores(
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
            totalContenedores
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
              contenedoresFiltrados.length
            }
          </span>{" "}
          de{" "}
          <span className="font-medium text-foreground">
            {
              totalContenedores
            }
          </span>{" "}
          contenedores.
        </div>
      )}
    </div>
  );
}