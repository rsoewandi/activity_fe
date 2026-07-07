"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { featureLabel } from "./TrendChart";

const PAGE_SIZE = 12;

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
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  // Ref-mirrors so the scroll handler reads the latest state without
  // needing re-subscription each render.
  const loadingRef = useRef(false);
  const loadingMoreRef = useRef(false);
  const hasMoreRef = useRef(true);
  const offsetRef = useRef(0);
  const listRef = useRef(null);

  const fetchPage = useCallback(async (offset, reset) => {
    const res = await fetch(
      `/api/activities?limit=${PAGE_SIZE}&offset=${offset}`,
      { cache: "no-store" }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const rows = await res.json();

    setHasMore(rows.length === PAGE_SIZE);
    hasMoreRef.current = rows.length === PAGE_SIZE;

    if (reset) {
      setItems(rows);
    } else {
      setItems((prev) => {
        const seen = new Set(prev.map((x) => x.id));
        const merged = [...prev];
        for (const r of rows) if (!seen.has(r.id)) merged.push(r);
        return merged;
      });
    }
    offsetRef.current = offset + rows.length;
  }, []);

  const reload = useCallback(async () => {
    setLoading(true);
    loadingRef.current = true;
    setError(null);
    try {
      offsetRef.current = 0;
      await fetchPage(0, true);
    } catch (e) {
      setError(e.message || "Gagal memuat daftar activity");
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [fetchPage]);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || loadingMoreRef.current || !hasMoreRef.current)
      return;
    setLoadingMore(true);
    loadingMoreRef.current = true;
    setError(null);
    try {
      await fetchPage(offsetRef.current, false);
    } catch (e) {
      setError(e.message || "Gagal memuat lebih banyak");
    } finally {
      setLoadingMore(false);
      loadingMoreRef.current = false;
    }
  }, [fetchPage]);

  useEffect(() => {
    reload();
  }, [reload, refreshKey]);

  function handleScroll(e) {
    const el = e.currentTarget;
    const max = el.scrollHeight - el.clientHeight;
    if (max <= 0) return;
    const ratio = el.scrollTop / max;
    if (ratio >= 0.6) loadMore();
  }

  // (e.g. user is holding scroll at bottom), automatically fetch the next.
  useEffect(() => {
    if (loading || loadingMore || !hasMore || error) return;
    const el = listRef.current;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    if (max <= 0) return;
    if (el.scrollTop / max >= 0.6) loadMore();
  }, [items.length, loading, loadingMore, hasMore, error, loadMore]);

  async function handleDelete(item) {
    if (!confirm(`Hapus activity #${item.id}?`)) return;
    setDeletingId(item.id);
    try {
      const res = await fetch(
        `/api/activities/${encodeURIComponent(item.id)}`,
        { method: "DELETE" }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      await reload();
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
            Total tampil:{" "}
            <span className="font-semibold text-gray-700">{items.length}</span>
          </p>
        </div>
        <button
          onClick={reload}
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
        <>
          <ul
            ref={listRef}
            onScroll={handleScroll}
            className="grid max-h-[500px] grid-cols-1 gap-3 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3"
          >
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

          <div className="mt-4 flex items-center justify-center py-4 text-xs text-gray-500">
            {loadingMore ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                Memuat lebih banyak...
              </span>
            ) : hasMore ? (
              <span className="text-gray-400">
                Memuat lebih banyak...
              </span>
            ) : (
              <span className="text-gray-400">— Semua data sudah tampil —</span>
            )}
          </div>
        </>
      )}
    </section>
  );
}
