// ─── Skeleton primitives ──────────────────────────────────────────────────────
// Usage:
//   <SkeletonLine w="60%" />
//   <SkeletonBox h={40} />
//   <SkeletonStatCard />
//   <SkeletonTableRows rows={5} cols={6} />
//   <SkeletonChartBar />

const shimmer = `
  relative overflow-hidden
  bg-gray-200 dark:bg-slate-700
  before:absolute before:inset-0
  before:-translate-x-full
  before:animate-[shimmer_1.4s_infinite]
  before:bg-gradient-to-r
  before:from-transparent before:via-white/30 before:to-transparent
  dark:before:via-white/10
  rounded-lg
`;

// Tailwind keyframes must be added to tailwind.config.js:
// theme: { extend: { keyframes: { shimmer: { '100%': { transform: 'translateX(100%)' } } }, animation: { shimmer: 'shimmer 1.4s infinite' } } }
// If not set up, replace `animate-[shimmer_1.4s_infinite]` with `animate-pulse`

export function SkeletonLine({ w = "100%", h = 14, className = "" }) {
  return (
    <div
      className={`${shimmer} ${className}`}
      style={{ width: w, height: h }}
    />
  );
}

export function SkeletonBox({ h = 80, w = "100%", className = "" }) {
  return (
    <div
      className={`${shimmer} ${className}`}
      style={{ height: h, width: w }}
    />
  );
}

// Single stat card skeleton
export function SkeletonStatCard() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow space-y-3">
      <div className="flex justify-between items-center">
        <SkeletonLine w="45%" h={12} />
        <SkeletonBox w={36} h={36} className="rounded-xl" />
      </div>
      <SkeletonLine w="55%" h={28} />
      <SkeletonLine w="35%" h={10} />
    </div>
  );
}

// Stat cards grid
export function SkeletonStatGrid({ count = 4 }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonStatCard key={i} />
      ))}
    </div>
  );
}

// Table row skeleton
export function SkeletonTableRows({ rows = 6, cols = 6 }) {
  const widths = ["40%", "55%", "60%", "30%", "45%", "50%", "35%", "65%"];
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r} className="border-b border-gray-50 dark:border-slate-700/50">
          {Array.from({ length: cols }).map((_, c) => (
            <td key={c} className="px-4 py-3.5">
              <SkeletonLine w={widths[(r + c) % widths.length]} h={13} />
              {c === 0 && <SkeletonLine w="30%" h={10} className="mt-1.5" />}
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// Full table skeleton (card wrapper + rows)
export function SkeletonTable({ rows = 6, cols = 6 }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow">
      <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-slate-700">
        <SkeletonLine w={180} h={14} />
        <SkeletonBox w={200} h={34} className="rounded-xl" />
      </div>
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100 dark:border-slate-700">
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} className="px-4 py-3">
                <SkeletonLine w="70%" h={11} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <SkeletonTableRows rows={rows} cols={cols} />
        </tbody>
      </table>
    </div>
  );
}

// Chart placeholder
export function SkeletonChart({ h = 300, title = true }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow p-5 space-y-4">
      {title && <SkeletonLine w="40%" h={14} />}
      <SkeletonBox h={h} className="rounded-xl" />
    </div>
  );
}

// Notification item skeleton
export function SkeletonNotificationItem() {
  return (
    <div className="flex gap-3 px-4 py-3 border-b border-gray-50 dark:border-slate-700/50">
      <SkeletonBox w={36} h={36} className="rounded-full shrink-0" />
      <div className="flex-1 space-y-2 pt-1">
        <SkeletonLine w="80%" h={12} />
        <SkeletonLine w="45%" h={10} />
      </div>
    </div>
  );
}

// Full dashboard skeleton (banner + stats + table)
export function SkeletonDashboard({ statCount = 4, tableRows = 6, tableCols = 6 }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <SkeletonLine w="35%" h={28} />
        <SkeletonLine w="55%" h={13} />
      </div>

      {/* Welcome banner */}
      <SkeletonBox h={90} className="rounded-2xl" />

      {/* Stat cards */}
      <SkeletonStatGrid count={statCount} />

      {/* Table */}
      <SkeletonTable rows={tableRows} cols={tableCols} />
    </div>
  );
}