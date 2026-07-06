"use client";

import { useMemo, useState } from "react";

const FEATURE_LABELS = {
  register: "Register",
  login: "Login",
  generate_photo: "Generate Foto",
  generate_caption: "Generate Caption",
  edit_content: "Edit Konten",
  publish: "Publish",
  view_dashboard: "Buka Dashboard",
};

export function featureLabel(t) {
  return FEATURE_LABELS[t] || t;
}

function formatDay(iso) {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  });
}

export default function TrendChart({ data }) {
  const [hover, setHover] = useState(null);

  const width = 800;
  const height = 260;
  const pad = { top: 20, right: 20, bottom: 32, left: 40 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;

  const chart = useMemo(() => {
    const activities = data.map((d) => d.activities);
    const users = data.map((d) => d.activeUsers);
    const maxY = Math.max(1, ...activities, ...users);
    // Round the max up to a nice number for gridlines.
    const step = niceStep(maxY / 4);
    const niceMax = Math.ceil(maxY / step) * step;

    const n = data.length;
    const bandW = innerW / Math.max(1, n);
    const xCenter = (i) => pad.left + bandW * (i + 0.5);
    const y = (v) => pad.top + innerH - (v / niceMax) * innerH;

    const linePath = data
      .map((d, i) => `${i === 0 ? "M" : "L"} ${xCenter(i)} ${y(d.activeUsers)}`)
      .join(" ");

    const ticks = [];
    for (let v = 0; v <= niceMax; v += step) ticks.push(v);

    return { activities, users, niceMax, bandW, xCenter, y, linePath, ticks };
  }, [data, innerH, innerW]);

  return (
    <div className="w-full">
      <div className="mb-3 flex flex-wrap items-center gap-4 text-xs text-gray-600">
        <LegendSwatch color="bg-indigo-500" label="Total aktivitas / hari" />
        <LegendSwatch
          color="bg-emerald-500"
          label="Active users / hari"
          line
        />
      </div>

      <div
        className="relative overflow-hidden rounded-xl border border-gray-200 bg-white"
        onMouseLeave={() => setHover(null)}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="block h-64 w-full"
          preserveAspectRatio="none"
        >
          {/* Gridlines + Y ticks */}
          {chart.ticks.map((t) => (
            <g key={t}>
              <line
                x1={pad.left}
                x2={width - pad.right}
                y1={chart.y(t)}
                y2={chart.y(t)}
                stroke="#e5e7eb"
                strokeDasharray="3 3"
              />
              <text
                x={pad.left - 6}
                y={chart.y(t)}
                textAnchor="end"
                dominantBaseline="middle"
                className="fill-gray-400 text-[10px]"
              >
                {t}
              </text>
            </g>
          ))}

          {/* Bars (activities) */}
          {data.map((d, i) => {
            const w = chart.bandW * 0.55;
            const x = chart.xCenter(i) - w / 2;
            const yy = chart.y(d.activities);
            const h = pad.top + innerH - yy;
            const isHover = hover === i;
            return (
              <rect
                key={d.date}
                x={x}
                y={yy}
                width={w}
                height={Math.max(0, h)}
                rx="2"
                className={
                  isHover
                    ? "fill-indigo-600"
                    : "fill-indigo-500/80 transition-colors"
                }
              />
            );
          })}

          {/* Line (active users) */}
          <path
            d={chart.linePath}
            fill="none"
            stroke="#10b981"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {data.map((d, i) => (
            <circle
              key={d.date + "-pt"}
              cx={chart.xCenter(i)}
              cy={chart.y(d.activeUsers)}
              r={hover === i ? 4 : 3}
              className="fill-white stroke-emerald-500"
              strokeWidth="2"
            />
          ))}

          {/* Hover hit-areas + X labels */}
          {data.map((d, i) => {
            // Only show every Nth label so they don't overlap.
            const skip = Math.ceil(data.length / 10);
            const showLabel = i % skip === 0 || i === data.length - 1;
            return (
              <g key={d.date + "-x"}>
                <rect
                  x={chart.xCenter(i) - chart.bandW / 2}
                  y={pad.top}
                  width={chart.bandW}
                  height={innerH}
                  fill="transparent"
                  onMouseEnter={() => setHover(i)}
                />
                {showLabel && (
                  <text
                    x={chart.xCenter(i)}
                    y={height - 10}
                    textAnchor="middle"
                    className="fill-gray-500 text-[10px]"
                  >
                    {formatDay(d.date)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {hover != null && data[hover] && (
          <div
            className="pointer-events-none absolute top-2 rounded-lg border border-gray-200 bg-white/95 p-2 text-xs shadow-md backdrop-blur"
            style={{
              left: `${((chart.xCenter(hover) / width) * 100).toFixed(2)}%`,
              transform: "translateX(-50%)",
            }}
          >
            <div className="font-semibold text-gray-900">
              {formatDay(data[hover].date)}
            </div>
            <div className="mt-0.5 text-indigo-600">
              {data[hover].activities} aktivitas
            </div>
            <div className="text-emerald-600">
              {data[hover].activeUsers} active users
            </div>
            <div className="text-gray-500">
              {data[hover].contentGenerated} konten dibuat
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LegendSwatch({ color, label, line }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {line ? (
        <span className={`inline-block h-0.5 w-5 rounded ${color}`} />
      ) : (
        <span className={`inline-block h-3 w-3 rounded-sm ${color}`} />
      )}
      {label}
    </span>
  );
}

function niceStep(raw) {
  if (raw <= 0) return 1;
  const pow = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / pow;
  const nice = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10;
  return nice * pow;
}
