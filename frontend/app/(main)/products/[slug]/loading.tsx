import { Skeleton } from "@/components/ui/skeleton"

export default function ProductLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-3 md:py-4">
        <Skeleton className="h-4 w-64" />
      </div>
      <section className="container mx-auto px-4 pb-8 md:pb-16 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-12 items-start">
          <div className="space-y-3">
            <div className="aspect-square rounded-xl md:rounded-2xl overflow-hidden bg-muted">
              <Skeleton className="w-full h-full" />
            </div>
            <div className="flex gap-2 overflow-hidden">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="w-16 h-16 md:w-20 md:h-20 rounded-lg shrink-0" />
              ))}
            </div>
          </div>
          <div className="space-y-4 md:space-y-6">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 md:h-12 w-full max-w-md" />
            <Skeleton className="h-5 w-3/4" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-20" />
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-12 w-24" />
              <Skeleton className="h-12 flex-1" />
              <Skeleton className="h-12 w-12" />
              <Skeleton className="h-12 w-12" />
            </div>
            <div className="flex gap-4">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-5 w-32" />
            </div>
            <div className="rounded-xl border border-border p-4 space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-5 w-40" />
            </div>
            <div className="border-t border-border space-y-2 pt-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
