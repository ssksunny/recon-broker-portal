export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="divide-y divide-gray-100">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3.5">
            <div className="h-3.5 w-20 animate-pulse rounded bg-gray-100" />
            <div className="h-3.5 w-32 animate-pulse rounded bg-gray-100" />
            <div className="h-3.5 w-20 animate-pulse rounded bg-gray-100" />
            <div className="ml-auto h-5 w-20 animate-pulse rounded-full bg-gray-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
