const API_BASE_URL = process.env.API_BASE_URL + "/activities";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = new URL(API_BASE_URL);
  searchParams.forEach((v, k) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) {
    return Response.json({ error: "Failed to fetch" }, { status: res.status });
  }
  return Response.json(await res.json());
}

export async function POST(req) {
  const body = await req.json();
  const res = await fetch(API_BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return Response.json(data, { status: res.status });
}

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
