const API_BASE_URL = process.env.API_BASE_URL + "/activities/seed";

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const res = await fetch(API_BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return Response.json(data, { status: res.status });
}
