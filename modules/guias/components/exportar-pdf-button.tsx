// modules/guias/components/exportar-pdf-button.tsx
"use client"

import { PDFDownloadLink } from "@react-pdf/renderer"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GuiaPDFDocument } from "./guia-pdf-document"
import type { GuiaConRelaciones } from "./guia-con-relaciones.type"

interface ExportarPDFButtonProps {
  guia: GuiaConRelaciones
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg"
  className?: string
}

export function ExportarPDFButton({
  guia,
  variant = "default",
  size = "default",
  className = "",
}: ExportarPDFButtonProps) {
  return (
    <PDFDownloadLink
      document={<GuiaPDFDocument guia={guia} />}
      fileName={`guia-${guia.numeroGuia}.pdf`}
      onError={(error) => {
        console.error("Error al generar PDF:", error)
      }}
    >
      {({ loading, error }) => (
        <Button
          variant={variant}
          size={size}
          className={className}
          disabled={loading || !!error}
        >
          <Download className="mr-2 h-4 w-4" />
          {loading ? "Generando PDF..." : error ? "Error" : "Exportar PDF"}
        </Button>
      )}
    </PDFDownloadLink>
  )
}
