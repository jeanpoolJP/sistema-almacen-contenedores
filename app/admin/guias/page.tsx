import { GuiasView } from "@/modules/guias/components/guias-view";
import { obtenerGuiasAction } from "@/modules/guias/guia.actions";

export default async function GuiasAdminPage() {
  const res = await obtenerGuiasAction();

  return <GuiasView guias={res.data} />;
}