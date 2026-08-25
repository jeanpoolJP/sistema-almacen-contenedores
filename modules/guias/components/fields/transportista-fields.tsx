// modules/guias/components/fields/transportista-fields.tsx

"use client";

import { useFormContext } from "react-hook-form";

import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

type TransportistaFieldsProps = {
  /** Prefijo del campo en el formulario, ej: "transportistaIngreso" */
  prefix: string;
};

/**
 * Bloque de campos reutilizable para los datos de un transportista:
 * empresa de transporte, placa, conductor y número de licencia.
 * Se usa tanto para el transportista de ingreso como el de salida.
 */
export function TransportistaFields({
  prefix,
}: TransportistaFieldsProps) {
  const { control } = useFormContext();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <FormField
          control={control}
          name={`${prefix}.empresaNombre`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Empresa de transporte</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Razón social" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={`${prefix}.empresaRuc`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                RUC de la empresa{" "}
                <span className="font-normal text-muted-foreground">
                  (opcional)
                </span>
              </FormLabel>
              <FormControl>
                <Input {...field} maxLength={11} placeholder="11 dígitos" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name={`${prefix}.empresaTelefono`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Teléfono de la empresa{" "}
              <span className="font-normal text-muted-foreground">
                (opcional)
              </span>
            </FormLabel>
            <FormControl>
              <Input {...field} placeholder="Ej: 987654321" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-3 gap-3">
        <FormField
          control={control}
          name={`${prefix}.placa`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Placa</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  className="uppercase"
                  placeholder="ABC-123"
                  onChange={(e) =>
                    field.onChange(e.target.value.toUpperCase())
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={`${prefix}.conductorNombre`}
          render={({ field }) => (
            <FormItem className="col-span-2">
              <FormLabel>Nombre del conductor</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Nombre completo" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name={`${prefix}.numeroLicencia`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Número de licencia</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Ej: Q12345678" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
