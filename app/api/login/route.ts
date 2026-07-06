import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';

// Helper function to read admin credentials from local CSV
function getAdminFromCSV(username: string) {
  try {
    const csvPath = path.join(process.cwd(), '..', 'lstm_komoditas', 'data', 'Admin_Data.csv');
    if (!fs.existsSync(csvPath)) {
      console.warn('CSV admin file not found at:', csvPath);
      return null;
    }
    const content = fs.readFileSync(csvPath, 'utf-8');
    const lines = content.split('\n').map(line => line.trim()).filter(Boolean);
    if (lines.length < 2) return null;
    
    const headers = lines[0].split(',');
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      const adminObj: any = {};
      headers.forEach((header, index) => {
        adminObj[header.trim()] = values[index] ? values[index].trim() : '';
      });
      
      if (adminObj.username && adminObj.username.toLowerCase() === username.toLowerCase()) {
        return adminObj;
      }
    }
  } catch (e) {
    console.error('Error reading Admin_Data.csv:', e);
  }
  return null;
}

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

    let admin: any = null;
    let dbError = false;

    // Promise race to timeout Supabase query if it takes too long
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Supabase request timeout')), 2500)
    );

    try {
      const { data, error } = await Promise.race([
        supabase.from('admin').select('*').eq('username', username).maybeSingle(),
        timeoutPromise
      ]) as any;

      if (error) {
        console.error('Supabase error:', error.message);
        dbError = true;
      } else {
        admin = data;
      }
    } catch (err: any) {
      console.error('Supabase query failed or timed out:', err.message || err);
      dbError = true;
    }

    // Fallback to local CSV if Supabase is offline/errored or admin not found in DB
    if (dbError || !admin) {
      console.log('Menggunakan fallback data admin dari CSV lokal...');
      const csvAdmin = getAdminFromCSV(username);
      if (csvAdmin) {
        admin = {
          id: parseInt(csvAdmin.id) || 999,
          nama: csvAdmin.nama,
          username: csvAdmin.username,
          password: csvAdmin.password,
          email: csvAdmin.email,
          peran: csvAdmin.peran || 'Admin Dinas',
          terakhir_login: csvAdmin.terakhir_login || null
        };
      }
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

    // Update terakhir login (silently try Supabase update if DB was not errored)
    if (!dbError) {
      const now = new Date().toISOString();
      supabase
        .from('admin')
        .update({ terakhir_login: now })
        .eq('id', admin.id)
        .then(({ error }) => {
          if (error) console.error('Failed to update login timestamp in Supabase:', error.message);
        })
        .catch(err => console.error('Failed to update login timestamp:', err));
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

