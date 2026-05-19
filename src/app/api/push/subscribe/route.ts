import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const baseApi = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
  const target = `${baseApi.replace(/\/$/, "")}/push/subscribe`;

  const upstream = await fetch(target, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: req.headers.get("authorization") || "",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const data = await upstream.json().catch(() => ({ success: upstream.ok }));
  return NextResponse.json(data, { status: upstream.status });
}
