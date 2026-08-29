import { cn } from "@/lib/utils"

type PlaceholderFrameProps = {
  label: string
  children?: React.ReactNode
  className?: string
}

export function PlaceholderFrame({
  label,
  children,
  className,
}: PlaceholderFrameProps) {
  return (
    <section
      className={cn(
        "min-w-0 overflow-hidden rounded-2xl border border-dashed border-border bg-muted/30 p-4",
        className
      )}
    >
      <p className="mb-3 shrink-0 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      {children}
    </section>
  )
}
