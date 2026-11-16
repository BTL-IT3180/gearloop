import { Skeleton, CardSkeleton, TableSkeleton } from "../components/ui";

export default function RootLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 w-full space-y-10">
      <div className="space-y-3">
        <Skeleton className="h-9 w-2/5" />
        <Skeleton className="h-4 w-3/5" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>

      <div className="space-y-3 pt-4 border-t border-slate-200">
        <Skeleton className="h-6 w-1/4" />
        <TableSkeleton rows={4} cols={5} />
      </div>
    </div>
  );
}
