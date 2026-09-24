export default function AdminLoading() {
  return (
    <div className="p-3.5 sm:p-6 space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div className="space-y-2">
          <div className="h-6 w-48 bg-gray-200 rounded-md" />
          <div className="h-4 w-72 bg-gray-100 rounded-md" />
        </div>
        <div className="h-9 w-28 bg-gray-200 rounded-lg" />
      </div>

      {/* KPI Cards skeleton */}
      <div className="grid grid-cols-1 min-[420px]:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gray-200 rounded-xl" />
              <div className="space-y-1.5 flex-1">
                <div className="h-6 w-16 bg-gray-200 rounded" />
                <div className="h-3.5 w-24 bg-gray-100 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Content skeleton card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-4">
        <div className="h-5 w-40 bg-gray-200 rounded" />
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="flex items-center justify-between gap-4 py-3 border-b border-gray-100 last:border-0">
              <div className="flex items-center gap-3 flex-1">
                <div className="h-8 w-8 bg-gray-200 rounded-full" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 w-1/3 bg-gray-200 rounded" />
                  <div className="h-3 w-1/4 bg-gray-100 rounded" />
                </div>
              </div>
              <div className="h-6 w-20 bg-gray-200 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
