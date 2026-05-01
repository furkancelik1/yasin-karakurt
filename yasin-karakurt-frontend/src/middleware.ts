import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_PAGES      = ['/login', '/register'];
const PROTECTED_PATHS = ['/dashboard'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('yk_access')?.value;

  /* Giriş yapmış kullanıcı auth sayfasına girmeye çalışıyor */
  if (token && AUTH_PAGES.includes(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  /* Giriş yapmamış kullanıcı korumalı sayfaya erişiyor */
  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  if (!token && isProtected) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
};
