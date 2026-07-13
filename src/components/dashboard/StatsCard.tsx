interface StatsCardProps {
  label:     string;
  value:     number;
  icon:      React.ReactNode;
  accent:    string; // Tailwind text-color class for the icon
  bg:        string; // Tailwind bg class for the icon container
}

export default function StatsCard({ label, value, icon, accent, bg }: StatsCardProps) {
  return (
    <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className={`${bg} ${accent} p-2 sm:p-2.5 rounded-lg shrink-0`} aria-hidden>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-50 leading-none tabular-nums">{value}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-tight">{label}</p>
      </div>
    </div>
  );
}
