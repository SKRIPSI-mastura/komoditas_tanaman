import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// POST /api/logout — Clear admin session cookie
export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('admin_session');
    
    return NextResponse.json({
      status: 'success',
      message: 'Logout berhasil'
    });
  } catch (err: any) {
    console.error('Logout API error:', err);
    return NextResponse.json(
      { status: 'error', message: 'Terjadi kesalahan internal server' },
      { status: 500 }
    );
  }
}
