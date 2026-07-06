const API_BASE_URL = process.env.API_BASE_URL + "/dashboard/summary";

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
