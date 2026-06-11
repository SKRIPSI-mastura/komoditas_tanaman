import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/komoditas — List semua komoditas
export async function GET() {
  const { data, error } = await supabase
    .from('komoditas')
    .select('*')
    .order('nama_komoditas', { ascending: true });

  if (error) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }

  return NextResponse.json({ status: 'success', data });
}

// POST /api/komoditas — Tambah komoditas baru
export async function POST(req: NextRequest) {
  const body = await req.json();

  const { data, error } = await supabase
    .from('komoditas')
    .insert([body])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }

  return NextResponse.json({ status: 'success', data }, { status: 201 });
}
