import { CardSkeleton, Skeleton } from "@/components/ui/skeleton";
export default function Loading() {
  return (
    <div
      className="page-width py-10"
      role="status"
      aria-label="Đang tải nội dung"
    >
      <div className="sr-only">Đang tải nội dung</div>
      <div className="mb-9 grid gap-5 md:grid-cols-2">
        <div className="space-y-5 py-8">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-12 w-4/5" />
          <Skeleton className="h-12 w-3/5" />
          <Skeleton className="h-4 w-4/5" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}
