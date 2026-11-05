import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const superadminEmail = (process.env.SUPERADMIN_EMAIL || 'andariftri7@gmail.com').toLowerCase().trim();

  // Helper: check superadmin authorization from cookies
  const authCookie = req.cookies.get('threadly_auth')?.value;
  let isSuperadminUser = false;

  if (authCookie) {
    try {
      const session = JSON.parse(decodeURIComponent(authCookie));
      const sessionEmail = (session.email || '').toLowerCase().trim();
      const isVerified = session.email_verified === true || session.verified === true;
      const isSuper = session.is_superadmin === true;

      if (sessionEmail === superadminEmail && isVerified && isSuper) {
        isSuperadminUser = true;
      }
    } catch {
      isSuperadminUser = false;
    }
  }

  // 1. Guard /admin and /admin/*
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    if (!isSuperadminUser) {
      // Rewrite to not-found (404) with status 404 and noindex
      const url = req.nextUrl.clone();
      url.pathname = '/not-found';
      const res = NextResponse.rewrite(url, { status: 404 });
      res.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
      return res;
    }
  }

  // 1b. Support /superadmin and /superadmin/* routes
  if (pathname === '/superadmin/login') {
    if (isSuperadminUser) {
      const adminUrl = req.nextUrl.clone();
      adminUrl.pathname = '/admin';
      return NextResponse.redirect(adminUrl);
    }
    return NextResponse.next();
  }

  if (pathname === '/superadmin' || pathname.startsWith('/superadmin/')) {
    if (!isSuperadminUser) {
      const url = req.nextUrl.clone();
      url.pathname = '/not-found';
      const res = NextResponse.rewrite(url, { status: 404 });
      res.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
      return res;
    }
    // Authenticated superadmin directed to /admin panel
    const adminUrl = req.nextUrl.clone();
    adminUrl.pathname = '/admin';
    return NextResponse.redirect(adminUrl);
  }

  // 2. Guard /api/admin and /api/admin/*
  if (pathname === '/api/admin' || pathname.startsWith('/api/admin/')) {
    if (!isSuperadminUser) {
      return new NextResponse(null, { status: 404 });
    }
  }

  // 3. Super admin opening /dashboard redirected to /admin
  if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
    if (isSuperadminUser) {
      const adminUrl = req.nextUrl.clone();
      adminUrl.pathname = '/admin';
      return NextResponse.redirect(adminUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin',
    '/admin/:path*',
    '/api/admin/:path*',
    '/dashboard',
    '/dashboard/:path*',
    '/superadmin',
    '/superadmin/:path*',
  ],
};
