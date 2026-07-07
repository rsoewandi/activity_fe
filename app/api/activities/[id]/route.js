const API_BASE_URL = process.env.API_BASE_URL + "/activities";

export async function PATCH(req, { params }) {
  const { id } = await params;
  const body = await req.json();
  const res = await fetch(`${API_BASE_URL}/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return Response.json(data, { status: res.status });
}

export async function PUT(req, { params }) {
  const { id } = await params;
  const body = await req.json();
  const res = await fetch(`${API_BASE_URL}/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return Response.json(data, { status: res.status });
}

export async function DELETE(_req, { params }) {
  const { id } = await params;
  const res = await fetch(`${API_BASE_URL}/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  const data = await res.json().catch(() => ({}));
  return Response.json(data, { status: res.status });
}
