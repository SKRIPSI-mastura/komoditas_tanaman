import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Definisikan rute halaman admin yang diproteksi
  const isAdminPage = pathname.startsWith('/dashboard') ||
                      pathname.startsWith('/prediksi') ||
                      pathname.startsWith('/kelola-data') ||
                      pathname.startsWith('/riwayat') ||
                      pathname.startsWith('/admin');

  // Ambil session cookie 'admin_session'
  const sessionCookie = request.cookies.get('admin_session');

  // Proteksi Halaman Admin: Jika tidak ada session cookie, redirect ke /login
  if (isAdminPage && !sessionCookie) {
    const loginUrl = new URL('/login', request.url);
    // Tambahkan parameter redirect agar setelah login bisa kembali ke rute asal
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Jika sudah login dan mencoba mengakses rute /login, redirect ke /dashboard
  if (pathname === '/login' && sessionCookie) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 2. Proteksi Rute API Next.js (/api/*)
  if (pathname.startsWith('/api')) {
    // Rute login dan logout dikecualikan dari proteksi token
    if (pathname === '/api/login' || pathname === '/api/logout') {
      return NextResponse.next();
    }

    // Ambil metode HTTP request
    const method = request.method;

    // Rute yang sepenuhnya privat untuk admin (GET/POST/PUT/DELETE)
    const isFullyPrivateApi = pathname.startsWith('/api/admin-users') ||
                              pathname.startsWith('/api/riwayat');

    if (isFullyPrivateApi && !sessionCookie) {
      return NextResponse.json(
        { status: 'error', message: 'Akses ditolak: Sesi tidak sah atau kadaluwarsa.' },
        { status: 401 }
      );
    }

    // Rute publik untuk dibaca (GET), tetapi privat untuk dimodifikasi (POST/PUT/DELETE)
    const isPublicReadPrivateWriteApi = pathname.startsWith('/api/kecamatan') ||
                                        pathname.startsWith('/api/komoditas');

    if (isPublicReadPrivateWriteApi) {
      const isWriteOperation = ['POST', 'PUT', 'DELETE'].includes(method);
      if (isWriteOperation && !sessionCookie) {
        return NextResponse.json(
          { status: 'error', message: 'Akses ditolak: Memerlukan hak akses admin.' },
          { status: 401 }
        );
      }
    }
  }

  return NextResponse.next();
}

// Konfigurasi matcher rute mana saja yang akan difilter oleh middleware ini
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/prediksi/:path*',
    '/kelola-data/:path*',
    '/riwayat/:path*',
    '/admin/:path*',
    '/login',
    '/api/:path*',
  ],
};
