import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/komoditas — List semua komoditas
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('komoditas')
      .select('*')
      .order('nama_komoditas', { ascending: true });

    if (error) {
      return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }

    return NextResponse.json({ status: 'success', data });
  } catch (err: any) {
    console.error('Supabase query failed:', err.message || err);
    return NextResponse.json({ status: 'error', message: 'Failed to load komoditas data' }, { status: 500 });
  }
}

// POST /api/komoditas — Tambah komoditas baru
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { data, error } = await supabase
      .from('komoditas')
      .insert([body])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ status: 'error', message: error.message }, { status: 400 });
    }
    return NextResponse.json({ status: 'success', data }, { status: 201 });
  } catch (err: any) {
    console.error('Failed to insert komoditas:', err.message || err);
    return NextResponse.json({ status: 'error', message: 'Internal Server Error' }, { status: 500 });
  }
}
