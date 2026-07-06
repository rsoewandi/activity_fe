"use client";

export default function KpiCard({ label, value, delta, hint, tone = "indigo" }) {
  const tones = {
    indigo: "from-indigo-500/10 to-indigo-500/0 text-indigo-700",
    emerald: "from-emerald-500/10 to-emerald-500/0 text-emerald-700",
    amber: "from-amber-500/10 to-amber-500/0 text-amber-700",
    rose: "from-rose-500/10 to-rose-500/0 text-rose-700",
    slate: "from-slate-500/10 to-slate-500/0 text-slate-700",
  };
  const toneClass = tones[tone] || tones.indigo;

  const deltaLabel = formatDelta(delta);
  const deltaClass =
    delta == null
      ? "text-gray-400"
      : delta > 0
        ? "text-emerald-600"
        : delta < 0
          ? "text-rose-600"
          : "text-gray-500";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${toneClass}`}
      />
      <div className="relative">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
          {label}
        </p>
        <p className="mt-2 text-3xl font-bold text-gray-900 tabular-nums">
          {value?.toLocaleString?.("id-ID") ?? value}
        </p>
        <div className="mt-2 flex items-center gap-2 text-xs">
          <span className={`font-semibold ${deltaClass}`}>{deltaLabel}</span>
          {hint && <span className="text-gray-500">{hint}</span>}
        </div>
      </div>
    </div>
  );
}

function formatDelta(pct) {
  if (pct == null) return "—";
  if (pct === 0) return "±0%";
  const sign = pct > 0 ? "▲" : "▼";
  return `${sign} ${Math.abs(pct).toFixed(1)}%`;
}
