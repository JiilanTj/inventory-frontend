import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ROUTES } from './config/constants';

export function middleware(request: NextRequest) {
  const auth = request.cookies.get('auth')?.value;
  const isLoginPage = request.nextUrl.pathname === ROUTES.LOGIN;

  // If trying to access login page while already authenticated
  if (isLoginPage && auth) {
    try {
      const userData = JSON.parse(auth);
      const redirectUrl = userData.data.user.role === 'admin' 
        ? ROUTES.ADMIN_DASHBOARD 
        : ROUTES.USER_DASHBOARD;
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    } catch {
      // If auth cookie is invalid, remove it and continue to login page
      const response = NextResponse.next();
      response.cookies.delete('auth');
      return response;
    }
  }

  // If trying to access protected routes without authentication
  if (!isLoginPage && !auth) {
    const loginUrl = new URL(ROUTES.LOGIN, request.url);
    return NextResponse.redirect(loginUrl);
  }

  // If trying to access admin routes without admin role
  if (request.nextUrl.pathname.startsWith('/admin')) {
    try {
      const userData = JSON.parse(auth!);
      if (userData.data.user.role !== 'admin') {
        return NextResponse.redirect(new URL(ROUTES.USER_DASHBOARD, request.url));
      }
    } catch {
      return NextResponse.redirect(new URL(ROUTES.LOGIN, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/login',
    '/dashboard',
    '/admin/:path*',
  ],
}; 