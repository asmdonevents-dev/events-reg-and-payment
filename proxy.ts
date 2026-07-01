import { NextResponse, type NextRequest } from "next/server";
import { verifyToken } from "@/utils/auth";

const PUBLIC_ADMIN_ROUTES = [
  "/admin/auth/login",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) return NextResponse.next();
  if (PUBLIC_ADMIN_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  const token = request.cookies.get(
    process.env.NEXT_PUBLIC_COOKIE_NAME ?? "asm_auth_token"
  )?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/admin/auth/login", request.url));
  }

  try {
    await verifyToken(token);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/admin/auth/login", request.url));
  }
}

export const config = { matcher: ["/admin/:path*"] };
