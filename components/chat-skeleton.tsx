import { cn } from "@/lib/utils"

export function ChatSkeleton() {
  return (
    <div className="space-y-4 py-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className={cn("flex w-full items-start gap-2 py-2", i % 2 === 0 ? "justify-end" : "justify-start")}
        >
          <div
            className={cn(
              "flex max-w-[75%] flex-col gap-1 rounded-2xl px-4 py-2",
              i % 2 === 0 ? "bg-primary/20 rounded-tr-none" : "bg-muted/50 rounded-tl-none",
            )}
          >
            <div className="h-4 w-24 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-4 w-48 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
            {i === 3 && <div className="h-4 w-32 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>}
            <div className="h-2 w-12 bg-gray-300 dark:bg-gray-700 rounded animate-pulse self-end mt-1"></div>
          </div>
        </div>
      ))}
    </div>
  )
}
