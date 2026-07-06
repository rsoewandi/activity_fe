"use client";

import { useCallback, useEffect, useState } from "react";
import KpiCard from "./KpiCard";
import TrendChart, { featureLabel } from "./TrendChart";
import FeatureBreakdown from "./FeatureBreakdown";

const RANGES = [
  { days: 7, label: "7 hari" },
  { days: 14, label: "14 hari" },
  { days: 30, label: "30 hari" },
];

export default function Dashboard() {
  const [days, setDays] = useState(7);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(null); // 'seed' | 'clear' | null
  const [lastRefresh, setLastRefresh] = useState(null);

  const load = useCallback(async (d) => {
    try {
      setError(null);
      setLoading(true);
      const res = await fetch(`/api/dashboard/summary?days=${d}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
      setLastRefresh(new Date());
    } catch (e) {
      setError(e.message || "Gagal memuat dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(days);
  }, [days, load]);

  async function seed() {
    setBusy("seed");
    setError(null);
    try {
      const res = await fetch("/api/activities/seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days: 30, users: 80, replace: true }),
      });
      if (!res.ok) throw new Error(`Seed gagal (HTTP ${res.status})`);
      await load(days);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(null);
    }
  }

  async function clearAll() {
    if (!confirm("Hapus semua data aktivitas?")) return;
    setBusy("clear");
    setError(null);
    try {
      const res = await fetch("/api/activities", { method: "DELETE" });
      if (!res.ok) throw new Error(`Clear gagal (HTTP ${res.status})`);
      await load(days);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(null);
    }
  }

  const kpis = data?.kpis;
  const isEmpty =
    !loading && data && data.dailyTrend.every((d) => d.activities === 0);

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
            UMKMMall — Mini Dashboard Internal
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Pantau aktivitas user & pemakaian fitur sekilas.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg border border-gray-200 bg-white p-0.5 shadow-sm">
            {RANGES.map((r) => (
              <button
                key={r.days}
                onClick={() => setDays(r.days)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                  days === r.days
                    ? "bg-indigo-600 text-white shadow"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => load(days)}
            disabled={loading}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
          >
            {loading ? "..." : "Refresh"}
          </button>
          <button
            onClick={seed}
            disabled={busy != null}
            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
            title="Isi ulang 30 hari data dummy"
          >
            {busy === "seed" ? "Seeding..." : "Seed dummy"}
          </button>
          <button
            onClick={clearAll}
            disabled={busy != null}
            className="rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-medium text-rose-700 shadow-sm transition hover:bg-rose-50 disabled:opacity-50"
          >
            {busy === "clear" ? "..." : "Clear"}
          </button>
        </div>
      </header>

      {error && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <span className="font-semibold">Error:</span>
          <span>{error}</span>
        </div>
      )}

      {loading && !data ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
          <p className="mt-3 text-sm text-gray-500">Memuat dashboard...</p>
        </div>
      ) : isEmpty ? (
        <EmptyState onSeed={seed} busy={busy === "seed"} />
      ) : data ? (
        <>
          {/* KPI grid */}
          <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
            <KpiCard
              label={`Aktivitas · ${days}h`}
              value={kpis.totalActivities.value}
              delta={kpis.totalActivities.deltaPct}
              hint={`vs ${days}h sebelumnya`}
              tone="indigo"
            />
            <KpiCard
              label={`Active Users · ${days}h`}
              value={kpis.activeUsers.value}
              delta={kpis.activeUsers.deltaPct}
              hint={`vs ${days}h sebelumnya`}
              tone="emerald"
            />
            <KpiCard
              label={`User Baru · ${days}h`}
              value={kpis.newUsers.value}
              delta={kpis.newUsers.deltaPct}
              hint={`vs ${days}h sebelumnya`}
              tone="amber"
            />
            <KpiCard
              label={`Konten Dibuat · ${days}h`}
              value={kpis.contentGenerated.value}
              delta={kpis.contentGenerated.deltaPct}
              hint={`vs ${days}h sebelumnya`}
              tone="rose"
            />
            <KpiCard
              label="DAU (hari ini)"
              value={kpis.dau.value}
              delta={null}
              hint={kpis.dau.date}
              tone="slate"
            />
          </div>

          {/* Chart */}
          <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-baseline justify-between">
              <div>
                <h2 className="text-sm font-semibold text-gray-800">
                  Tren Aktivitas Harian
                </h2>
                <p className="mt-0.5 text-xs text-gray-500">
                  {formatRange(data.range)}
                </p>
              </div>
              {kpis.topFeature && (
                <p className="text-xs text-gray-500">
                  Fitur teratas:{" "}
                  <span className="font-semibold text-gray-800">
                    {featureLabel(kpis.topFeature.type)}
                  </span>{" "}
                  ({kpis.topFeature.count.toLocaleString("id-ID")})
                </p>
              )}
            </div>
            <TrendChart data={data.dailyTrend} />
          </section>

          {/* Breakdown */}
          <FeatureBreakdown items={data.featureBreakdown} />

          <footer className="mt-8 text-center text-xs text-gray-400">
            {lastRefresh &&
              `Diperbarui ${lastRefresh.toLocaleTimeString("id-ID")} · `}
            Data dihitung langsung dari tabel aktivitas — ganti/tambah datanya,
            angka & tren update otomatis.
          </footer>
        </>
      ) : null}
    </div>
  );
}

function EmptyState({ onSeed, busy }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-white/50 p-12 text-center">
      <h2 className="text-lg font-semibold text-gray-800">
        Belum ada data aktivitas
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
        Dashboard ini menghitung angka dari tabel <code>activity</code> di
        backend. Klik tombol di bawah buat ngisi ulang 30 hari data dummy —
        atau POST ke <code>/api/activities</code> pakai data asli kamu.
      </p>
      <button
        onClick={onSeed}
        disabled={busy}
        className="mt-5 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
      >
        {busy ? "Seeding..." : "Seed dummy data"}
      </button>
    </div>
  );
}

function formatRange({ from, to, days }) {
  const f = new Date(from);
  const t = new Date(new Date(to).getTime() - 86400000);
  const fmt = (d) =>
    d.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  return `${fmt(f)} → ${fmt(t)} (${days} hari)`;
}
