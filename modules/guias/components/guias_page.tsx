"use client";

import { GuiaForm } from "./guia-form";

export function GuiasPage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-6 space-y-6">
      <div className="w-full">
        <h1 className="text-2xl font-bold tracking-tight">
          Guías de internamiento
        </h1>

        <p className="mt-1 text-muted-foreground">
          Registra y administra el ingreso y salida de
          contenedores del almacén.
        </p>
      </div>

      <GuiaForm />
    </div>
  );
}