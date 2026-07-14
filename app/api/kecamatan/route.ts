import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/kecamatan — List semua kecamatan
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('kecamatan')
      .select('*')
      .order('nama_kecamatan', { ascending: true });

    if (error) {
      return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }

    return NextResponse.json({ status: 'success', data });
  } catch (err: any) {
    console.error('Supabase query failed:', err.message || err);
    return NextResponse.json({ status: 'error', message: 'Failed to load kecamatan data' }, { status: 500 });
  }
}

// POST /api/kecamatan — Tambah kecamatan baru
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { data, error } = await supabase
      .from('kecamatan')
      .insert([body])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ status: 'error', message: error.message }, { status: 400 });
    }
    return NextResponse.json({ status: 'success', data }, { status: 201 });
  } catch (err: any) {
    console.error('Failed to insert kecamatan:', err.message || err);
    return NextResponse.json({ status: 'error', message: 'Internal Server Error' }, { status: 500 });
  }
}
