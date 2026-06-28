const BASE = process.env.NEXT_PUBLIC_URL

export async function api<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) throw new Error(`API ${path}: ${res.status}`)
  return res.json()
}
