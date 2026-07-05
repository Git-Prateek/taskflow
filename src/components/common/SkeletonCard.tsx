export default function SkeletonCard() {
  return (
    <div className="flex gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 animate-pulse">
      <div className="mt-0.5 w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
      <div className="flex-1 space-y-2.5">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
        <div className="flex gap-2">
          <div className="h-4 w-14 bg-gray-100 dark:bg-gray-800 rounded-full" />
          <div className="h-4 w-20 bg-gray-100 dark:bg-gray-800 rounded-full" />
        </div>
      </div>
    </div>
  );
}
