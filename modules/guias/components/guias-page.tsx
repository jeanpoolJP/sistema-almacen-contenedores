"use client";

import { GuiaForm } from "./guia-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export function GuiasPage() {
  return (
    <div className="w-full px-4 py-6">
      <div className="mx-auto w-full max-w-5xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              Registrar guía de internamiento
            </CardTitle>

            <CardDescription>
              Registra el ingreso de un contenedor al almacén.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <GuiaForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}