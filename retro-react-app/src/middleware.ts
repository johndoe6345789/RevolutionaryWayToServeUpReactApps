import { NextResponse } from "next/server";

/** Keep the root-only application route unchanged. */
export function middleware(): NextResponse {
  return NextResponse.next();
}
