import { obtenerGuiasService } from "@/modules/guias/guia.service"
import { GuiasView } from "@/modules/guias/components/guias-view"

export default async function GuiasAdminPage() {
  const resultado = await obtenerGuiasService({
    pagina: 1,
    limite: 10,
  })

  return (
    <GuiasView
      guias={resultado.guias}
      total={resultado.total}
      pagina={resultado.pagina}
      limite={resultado.limite}
      totalPaginas={resultado.totalPaginas}
    />
  )
}
