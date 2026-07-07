"use client";

import { useCallback, useEffect, useState } from "react";
import { featureLabel } from "./TrendChart";

function formatDateTime(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const TYPE_TONES = {
  register: "bg-emerald-50 text-emerald-700 border-emerald-200",
  login: "bg-sky-50 text-sky-700 border-sky-200",
  generate_photo: "bg-indigo-50 text-indigo-700 border-indigo-200",
  generate_caption: "bg-violet-50 text-violet-700 border-violet-200",
  edit_content: "bg-amber-50 text-amber-700 border-amber-200",
  publish: "bg-rose-50 text-rose-700 border-rose-200",
  view_dashboard: "bg-slate-50 text-slate-700 border-slate-200",
};

export default function ActivityList({
  refreshKey,
  editingId,
  onEdit,
  onChanged,
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/activities?limit=12", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setItems(await res.json());
    } catch (e) {
      setError(e.message || "Gagal memuat daftar activity");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  async function handleDelete(item) {
    if (!confirm(`Hapus activity #${item.id}?`)) return;
    setDeletingId(item.id);
    try {
      const res = await fetch(`/api/activities/${encodeURIComponent(item.id)}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      await load();
      onChanged?.();
    } catch (e) {
      setError(e.message || "Gagal menghapus");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-baseline justify-between">
        <div>
          <h2 className="text-sm font-semibold text-gray-800">
            Activity Terbaru
          </h2>
          <p className="mt-0.5 text-xs text-gray-500">
            Klik Edit untuk mengubah, atau Hapus untuk menghapus.
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
        >
          {loading ? "..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      {loading && !items.length ? (
        <div className="py-8 text-center text-sm text-gray-500">Memuat...</div>
      ) : items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-200 py-8 text-center text-sm text-gray-500">
          Belum ada activity.
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => {
            const isEditing = String(editingId) === String(it.id);
            const tone = TYPE_TONES[it.type] || TYPE_TONES.view_dashboard;
            return (
              <li
                key={it.id}
                className={`flex flex-col rounded-xl border bg-white p-4 shadow-sm transition ${
                  isEditing
                    ? "border-amber-400 ring-2 ring-amber-100"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-xs font-mono text-gray-400">
                    #{it.id}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${tone}`}
                  >
                    {featureLabel(it.type)}
                  </span>
                </div>

                <div className="mb-3">
                  <p className="text-sm font-semibold text-gray-900">
                    {it.user_id}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {formatDateTime(it.created_at)}
                  </p>
                </div>

                <div className="mt-auto flex gap-2">
                  <button
                    onClick={() => onEdit?.(it)}
                    className="flex-1 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(it)}
                    disabled={deletingId === it.id}
                    className="flex-1 rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 disabled:opacity-50"
                  >
                    {deletingId === it.id ? "..." : "Hapus"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
