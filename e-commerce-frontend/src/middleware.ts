import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    let b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) {
      b64 += '=';
    }
    const payload = JSON.parse(atob(b64));
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return true;
    }
    return false;
  } catch {
    return true;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;
  const userRole = request.cookies.get('user_role')?.value;

  const isAuthenticated = Boolean(token && !isTokenExpired(token));

  // 1. Guard all /admin routes
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    // If not authenticated or token expired, immediately redirect to login before page loads
    if (!isAuthenticated) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      const response = NextResponse.redirect(loginUrl);
      if (token) {
        response.cookies.delete('token');
        response.cookies.delete('user_role');
      }
      return response;
    }

    // If role is known and is not an administrator, immediately redirect
    if (userRole && userRole !== 'ADMIN' && userRole !== 'PLATFORM_ADMIN') {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Guard all /account routes
  if (pathname === '/account' || pathname.startsWith('/account/')) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      const response = NextResponse.redirect(loginUrl);
      if (token) {
        response.cookies.delete('token');
        response.cookies.delete('user_role');
      }
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin',
    '/admin/:path*',
    '/account',
    '/account/:path*',
  ],
};
