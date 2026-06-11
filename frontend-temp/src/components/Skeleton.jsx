export function SkeletonRow({ cols = 5 }) {
  return (
    <tr className="animate-pulse border-b dark:border-slate-700">
      {Array(cols).fill(0).map((_, i) => (
        <td key={i} className="p-4">
          <div className="h-4 bg-gray-200 dark:bg-slate-600 rounded w-3/4"></div>
        </td>
      ))}
    </tr>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow animate-pulse border-l-4 border-gray-200">
      <div className="w-8 h-8 bg-gray-200 dark:bg-slate-600 rounded-lg mb-3"></div>
      <div className="h-3 bg-gray-200 dark:bg-slate-600 rounded w-20 mb-2"></div>
      <div className="h-8 bg-gray-200 dark:bg-slate-600 rounded w-12"></div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 6 }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow overflow-hidden">
      <div className="h-14 bg-gray-50 dark:bg-slate-700 border-b dark:border-slate-600 animate-pulse"></div>
      <table className="w-full">
        <tbody>
          {Array(rows).fill(0).map((_, i) => <SkeletonRow key={i} cols={cols}/>)}
        </tbody>
      </table>
    </div>
  );
}