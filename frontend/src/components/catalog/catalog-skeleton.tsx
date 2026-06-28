import { Skeleton } from "@/components/ui/skeleton";

export function CatalogProductSkeleton({ viewMode = "grid" }: { viewMode?: "grid" | "list" }) {
  if (viewMode === "list") {
    return (
      <div className="flex gap-4 rounded-[1.5rem] border border-border/60 p-4">
        <Skeleton className="h-32 w-32 shrink-0 rounded-2xl" />
        <div className="flex flex-1 flex-col gap-3">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-[1.5rem] border border-border/60 p-4">
      <Skeleton className="h-52 w-full rounded-[1.25rem]" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-8 w-1/2" />
    </div>
  );
}

export function CatalogGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <CatalogProductSkeleton key={index} />
      ))}
    </div>
  );
}
