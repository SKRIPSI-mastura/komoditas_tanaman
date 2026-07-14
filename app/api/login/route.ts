import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';

// POST /api/login — Autentikasi admin
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { status: 'error', message: 'Username dan password wajib diisi' },
        { status: 400 }
      );
    }

    const { data: admin, error } = await supabase
      .from('admin')
      .select('*')
      .eq('username', username)
      .maybeSingle();

    if (error) {
      console.error('Supabase query error:', error.message);
      return NextResponse.json({ status: 'error', message: 'Gagal terhubung ke database' }, { status: 500 });
    }

    if (!admin) {
      return NextResponse.json(
        { status: 'error', message: 'Username tidak ditemukan' },
        { status: 401 }
      );
    }

    // Bandingkan password plain-text (karena data lama plain-text)
    if (admin.password !== password) {
      return NextResponse.json(
        { status: 'error', message: 'Password salah' },
        { status: 401 }
      );
    }

    // Update terakhir login
    const now = new Date().toISOString();
    try {
      await supabase
        .from('admin')
        .update({ terakhir_login: now })
        .eq('id', admin.id);
    } catch (updateErr) {
      console.error('Failed to update login timestamp:', updateErr);
    }

    // Set secure session cookie
    const cookieStore = await cookies();
    cookieStore.set('admin_session', JSON.stringify({
      username: admin.username,
      nama: admin.nama,
      peran: admin.peran,
    }), {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 1 day
    });

    return NextResponse.json({
      status: 'success',
      data: {
        username: admin.username,
        nama: admin.nama,
        peran: admin.peran,
      }
    });
  } catch (err: any) {
    console.error('Login API error:', err);
    return NextResponse.json(
      { status: 'error', message: 'Terjadi kesalahan internal server' },
      { status: 500 }
    );
  }
}
