import { cn } from "@/lib/utils"

type StatProps = {
  label: string
  value: string
  className?: string
}

export function Stat({ label, value, className }: StatProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  )
}
