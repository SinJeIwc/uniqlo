import { revalidateTag } from "next/cache"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const { tag } = await request.json()
  await revalidateTag(tag, {})
  return NextResponse.json({ revalidated: tag })
}
