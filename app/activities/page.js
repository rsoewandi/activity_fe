"use client";

import { useState } from "react";
import ActivityForm from "@/components/ActivityForm";
import ActivityList from "@/components/ActivityList";

export default function ManageActivities() {
  const [editing, setEditing] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-6">
        <h1 className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
          Kelola Activity
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Tambah, ubah, atau hapus data aktivitas user.
        </p>
      </header>

      <ActivityForm
        editing={editing}
        onSubmitted={() => {
          setEditing(null);
          setRefreshKey((n) => n + 1);
        }}
        onCancelEdit={() => setEditing(null)}
      />

      <ActivityList
        refreshKey={refreshKey}
        editingId={editing?.id}
        onEdit={(item) => {
          setEditing(item);
          if (typeof window !== "undefined") {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        }}
        onChanged={() => setRefreshKey((n) => n + 1)}
      />
    </div>
  );
}
