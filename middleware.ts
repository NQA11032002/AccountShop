import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const DISABLED_USER_PATHS = [
  "/accounts",
  "/my-ranking",
  "/my-vouchers",
  "/rankings",
  "/products",
  "/favorites",
  "/cart",
  "/checkout",
  "/wallet",
  "/collaborator",
  "/orders",
  "/news",
  "/contact",
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
    "/rankings",
    "/rankings/:path*",
    "/products",
    "/products/:path*",
    "/favorites",
    "/favorites/:path*",
    "/cart",
    "/cart/:path*",
    "/checkout",
    "/checkout/:path*",
    "/wallet",
    "/wallet/:path*",
    "/collaborator",
    "/collaborator/:path*",
    "/orders",
    "/orders/:path*",
    "/news",
    "/news/:path*",
    "/contact",
    "/contact/:path*",
  ],
};
