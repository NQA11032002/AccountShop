import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const DISABLED_USER_PATHS = [
  "/accounts",
  "/my-ranking",
  "/my-vouchers",
  "/products",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isBlocked = DISABLED_USER_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
  if (isBlocked) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/accounts",
    "/accounts/:path*",
    "/my-ranking",
    "/my-ranking/:path*",
    "/my-vouchers",
    "/my-vouchers/:path*",
    "/products",
    "/products/:path*",
  ],
};
