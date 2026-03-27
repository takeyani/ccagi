import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Auth disabled — all pages are publicly accessible
  return NextResponse.next({ request });
}

export const config = {
  matcher: [],
};
