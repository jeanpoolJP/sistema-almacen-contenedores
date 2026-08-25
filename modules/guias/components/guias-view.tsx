// modules/guias/components/guias-view.tsx

"use client";

import { useRouter } from "next/navigation";

import { CrearGuiaDialog } from "./crear-guia-dialog";
import { GuiasTable } from "./guias-table";
import type { GuiaConRelaciones } from "./guia-con-relaciones.type";

type GuiasViewProps = {
  guias: GuiaConRelaciones[];
};

/**
 * Componente de nivel de página para el módulo de guías.
 *
 * Uso típico en `app/(dashboard)/guias/page.tsx`:
 *
 * ```tsx
 * const res = await obtenerGuiasAction();
 * return <GuiasView guias={res.data} />;
 * ```
 *
 * `router.refresh()` vuelve a ejecutar el server component padre
 * (la página) después de crear/anular/registrar una salida, para
 * que la tabla refleje los datos actualizados desde la base de datos.
 */
export function GuiasView({ guias }: GuiasViewProps) {
  const router = useRouter();

  return (
    <div className="w-full px-4 py-6">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Guías de internamiento
            </h1>

            <p className="text-sm text-muted-foreground">
              Registra el ingreso y la salida de contenedores del almacén.
            </p>
          </div>

          <CrearGuiaDialog onCreada={() => router.refresh()} />
        </div>

        <GuiasTable
          guias={guias}
          onCambio={() => router.refresh()}
        />
      </div>
    </div>
  );
}