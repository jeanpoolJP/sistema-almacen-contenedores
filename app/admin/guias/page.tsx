// app\admin\guias\page.tsx

import { obtenerGuiasAction } from "@/modules/guias/guia.actions"
import { GuiasView } from "@/modules/guias/components/guias-view"

export default async function GuiasAdminPage() {
  const resultado = await obtenerGuiasAction({
    pagina: 1,
    limite: 10,
  })

  return (
    <GuiasView
      data={resultado.data}
    />
  )
}