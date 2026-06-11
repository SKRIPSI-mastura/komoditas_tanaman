import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/kecamatan — List semua kecamatan
export async function GET() {
  const { data, error } = await supabase
    .from('kecamatan')
    .select('*')
    .order('nama_kecamatan', { ascending: true });

  if (error) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }

  return NextResponse.json({ status: 'success', data });
}

// POST /api/kecamatan — Tambah kecamatan baru
export async function POST(req: NextRequest) {
  const body = await req.json();

  const { data, error } = await supabase
    .from('kecamatan')
    .insert([body])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }

  return NextResponse.json({ status: 'success', data }, { status: 201 });
}
