export default function GlobalLoading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 rounded-full border-3 border-brand-200 border-t-brand-600 animate-spin" />
        <p className="text-sm font-medium text-gray-500 animate-pulse">Loading LAW CENTRE II Portal...</p>
      </div>
    </div>
  );
}
