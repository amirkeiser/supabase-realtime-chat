import { cn } from "@/lib/utils"
import { Loader2Icon } from "lucide-react"

export function Spinner({
  className,
  size = "default",
}: {
  className?: string
  size?: "sm" | "default" | "lg"
}) {
  const sizeClasses = {
    sm: "size-4",
    default: "size-8",
    lg: "size-12",
  }

  return (
    <div className="flex h-full w-full items-center justify-center">
      <Loader2Icon
        className={cn("animate-spin text-muted-foreground", sizeClasses[size], className)}
      />
    </div>
  )
}


