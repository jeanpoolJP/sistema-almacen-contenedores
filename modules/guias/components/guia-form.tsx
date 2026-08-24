"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import { GuiaIngresoForm } from "./guia-ingreso-form";
import { GuiaSalidaForm } from "./guia-salida-form";

export function GuiaForm() {
  return (
    <div className="w-full">
      <Tabs
        defaultValue="ingreso"
        className="w-full"
      >
        <TabsList className="grid w-fit grid-cols-2">
          <TabsTrigger value="ingreso">
            Registrar ingreso
          </TabsTrigger>

          <TabsTrigger value="salida">
            Registrar salida
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="ingreso"
          className="mt-6 w-full"
        >
          <GuiaIngresoForm />
        </TabsContent>

        <TabsContent
          value="salida"
          className="mt-6 w-full"
        >
          <GuiaSalidaForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}