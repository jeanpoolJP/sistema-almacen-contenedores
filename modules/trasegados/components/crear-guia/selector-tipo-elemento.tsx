// modules\trasegados\components\crear-guia\selector-tipo-elemento.tsx

"use client"

import { PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
  ETIQUETAS_TIPO_ELEMENTO,
  type TipoElementoTrasegado,
} from "../../types"

interface SelectorTipoElementoProps {
  onSelect: (tipo: TipoElementoTrasegado) => void
}

const TIPOS: TipoElementoTrasegado[] = [
  "CONTENEDOR",
  "FLAT_RACK",
  "MERCADERIA",
  "MAQUINARIA",
]

export function SelectorTipoElemento({ onSelect }: SelectorTipoElementoProps) {
  return (
    <DropdownMenu>
      {/*
        IMPORTANTE:
        DropdownMenuTrigger ya renderiza un <button> en Base UI.
        Usar `render` para delegar el render al Button de shadcn.
        Alternativa: no pasar children como Button y estilizar
        el trigger directamente con className.
      */}
      <DropdownMenuTrigger
        render={
          <Button type="button" variant="outline" className="w-full">
            <PlusIcon className="mr-2 size-4" />
            Agregar elemento
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-56">
        {TIPOS.map((tipo) => (
          <DropdownMenuItem
            key={tipo}
            onClick={() => onSelect(tipo)}
            className="cursor-pointer"
          >
            {ETIQUETAS_TIPO_ELEMENTO[tipo]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
