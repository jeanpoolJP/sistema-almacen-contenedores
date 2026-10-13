import { ControlAlquilerPage } from "@/modules/control-alquiler/components/control-alquiler-page"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Control de alquiler",
}

export default async function ControlAlquilerRoute({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  return <ControlAlquilerPage searchParams={await searchParams} />
}
