const RADIUS      = 38;
const STROKE      = 8;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS; // ≈ 238.76

interface ProgressRingProps {
  percent: number; // 0–100
  size?: number;
}

export default function ProgressRing({ percent, size = 120 }: ProgressRingProps) {
  const offset = CIRCUMFERENCE * (1 - Math.min(percent, 100) / 100);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      aria-label={`${percent}% complete`}
      role="img"
    >
      {/* Track */}
      <circle
        cx="50" cy="50" r={RADIUS}
        fill="none"
        stroke="currentColor"
        strokeWidth={STROKE}
        className="text-gray-200 dark:text-gray-700"
      />
      {/* Progress — starts at 12 o'clock */}
      <circle
        cx="50" cy="50" r={RADIUS}
        fill="none"
        stroke="currentColor"
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={offset}
        transform="rotate(-90 50 50)"
        className="text-indigo-600 dark:text-indigo-400 transition-all duration-500"
      />
      {/* Label */}
      <text x="50" y="45" textAnchor="middle" className="fill-gray-900 dark:fill-gray-50" fontSize="16" fontWeight="700">
        {percent}%
      </text>
      <text x="50" y="60" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400" fontSize="8">
        complete
      </text>
    </svg>
  );
}
