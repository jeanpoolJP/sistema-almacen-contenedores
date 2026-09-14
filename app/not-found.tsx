
import Link from "next/link"
import { Home, SearchX } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <Card className="w-full max-w-lg border-border/60 shadow-sm">
        <CardHeader className="items-center text-center">
          <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
            <SearchX className="size-8 text-muted-foreground" />
          </div>

          <p className="text-7xl font-bold tracking-tight text-foreground">
            404
          </p>

          <CardTitle className="mt-2 text-2xl">
            Página no encontrada
          </CardTitle>

          <CardDescription className="max-w-md text-base">
            La página que estás buscando no existe, fue movida o ya no está
            disponible.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex justify-center">
          <Link
            href="/"
            className={cn(buttonVariants({ variant: "default" }))}
          >
            <Home className="size-4" />
            Ir al inicio
          </Link>
        </CardContent>
      </Card>
    </main>
  )
}
