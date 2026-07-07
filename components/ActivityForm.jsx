"use client";

import { useEffect, useState } from "react";

const ACTIVITY_TYPES = [
  { value: "register", label: "Register" },
  { value: "login", label: "Login" },
  { value: "generate_photo", label: "Generate Photo" },
  { value: "generate_caption", label: "Generate Caption" },
  { value: "edit_content", label: "Edit Content" },
  { value: "publish", label: "Publish" },
  { value: "view_dashboard", label: "View Dashboard" },
];

function toLocalInputValue(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function ActivityForm({ editing, onSubmitted, onCancelEdit }) {
  const isEdit = Boolean(editing?.id);
  const [userId, setUserId] = useState("");
  const [type, setType] = useState(ACTIVITY_TYPES[0].value);
  const [createdAt, setCreatedAt] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEdit) {
      setUserId(editing.user_id ?? "");
      setType(editing.type ?? ACTIVITY_TYPES[0].value);
      setCreatedAt(toLocalInputValue(editing.created_at));
      setMessage(null);
      setError(null);
    }
  }, [editing, isEdit]);

  function resetForm() {
    setUserId("");
    setType(ACTIVITY_TYPES[0].value);
    setCreatedAt("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!userId.trim()) {
      setError("user_id wajib diisi");
      return;
    }

    setSubmitting(true);
    try {
      const body = { user_id: userId.trim(), type };
      if (createdAt) body.created_at = new Date(createdAt).toISOString();

      const url = isEdit
        ? `/api/activities/${encodeURIComponent(editing.id)}`
        : "/api/activities";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);

      setMessage(
        isEdit
          ? `Activity #${data.id} berhasil diupdate`
          : `Activity #${data.id} berhasil ditambahkan`
      );
      if (!isEdit) resetForm();
      onSubmitted?.(data);
    } catch (err) {
      setError(err.message || "Gagal menyimpan activity");
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancel() {
    resetForm();
    setError(null);
    setMessage(null);
    onCancelEdit?.();
  }

  return (
    <section
      className={`mb-6 rounded-2xl border bg-white p-5 shadow-sm transition ${
        isEdit ? "border-amber-300 ring-2 ring-amber-100" : "border-gray-200"
      }`}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-800">
            {isEdit ? `Edit Activity #${editing.id}` : "Tambah Activity"}
          </h2>
          <p className="mt-0.5 text-xs text-gray-500">
            {isEdit
              ? "Ubah data lalu klik Simpan Perubahan."
              : "Tambahkan aktivitas baru — dashboard akan otomatis ter-update."}
          </p>
        </div>
        {isEdit && (
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm transition hover:bg-gray-50"
          >
            Batal
          </button>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:items-end"
      >
        <div className="flex flex-col">
          <label
            htmlFor="af-user"
            className="mb-1 text-xs font-medium text-gray-600"
          >
            User ID
          </label>
          <input
            id="af-user"
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="u_1"
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            disabled={submitting}
          />
        </div>

        <div className="flex flex-col">
          <label
            htmlFor="af-type"
            className="mb-1 text-xs font-medium text-gray-600"
          >
            Type
          </label>
          <select
            id="af-type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            disabled={submitting}
          >
            {ACTIVITY_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label
            htmlFor="af-date"
            className="mb-1 text-xs font-medium text-gray-600"
          >
            Waktu <span className="text-gray-400">(opsional)</span>
          </label>
          <input
            id="af-date"
            type="datetime-local"
            value={createdAt}
            onChange={(e) => setCreatedAt(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            disabled={submitting}
          />
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            disabled={submitting}
            className={`w-full rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition disabled:opacity-50 ${
              isEdit
                ? "bg-amber-600 hover:bg-amber-700"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {submitting
              ? "Menyimpan..."
              : isEdit
                ? "Simpan Perubahan"
                : "Tambah Activity"}
          </button>
        </div>
      </form>

      {(message || error) && (
        <div
          role="status"
          className={`mt-3 rounded-lg px-3 py-2 text-xs ${
            error
              ? "border border-red-200 bg-red-50 text-red-700"
              : "border border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {error || message}
        </div>
      )}
    </section>
  );
}
