"use client";

import { Settings } from "lucide-react";

import { ConfiguracionPreciosForm } from "./configuracion-precios-form";

export function ConfiguracionPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <div className="flex items-center gap-2">
          <Settings className="size-6" />

          <h1 className="text-2xl font-semibold tracking-tight">
            Configuración
          </h1>
        </div>

        <p className="mt-1 text-sm text-muted-foreground">
          Configura los precios estándar y el porcentaje
          de IGV utilizados por el sistema.
        </p>
      </div>

      <div className="max-w-2xl rounded-lg border p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">
            Precios de internamiento
          </h2>

          <p className="text-sm text-muted-foreground">
            Estos valores se utilizarán como base para
            las nuevas guías de internamiento.
          </p>
        </div>

        <ConfiguracionPreciosForm />
      </div>
    </div>
  );
}