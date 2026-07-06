"use client";

import { featureLabel } from "./TrendChart";

export default function FeatureBreakdown({ items }) {
  const total = items.reduce((a, b) => a + b.count, 0);
  const max = Math.max(1, ...items.map((i) => i.count));

  if (!items.length) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
        Belum ada aktivitas pada rentang ini.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-gray-800">
          Feature Breakdown
        </h3>
        <span className="text-xs text-gray-500">
          Total {total.toLocaleString("id-ID")} aktivitas
        </span>
      </div>
      <ul className="space-y-2.5">
        {items.map((it) => {
          const pct = ((it.count / total) * 100).toFixed(1);
          const bar = (it.count / max) * 100;
          return (
            <li key={it.type}>
              <div className="mb-1 flex items-baseline justify-between text-xs">
                <span className="font-medium text-gray-700">
                  {featureLabel(it.type)}
                </span>
                <span className="tabular-nums text-gray-500">
                  {it.count.toLocaleString("id-ID")}{" "}
                  <span className="text-gray-400">({pct}%)</span>
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                  style={{ width: `${bar}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
