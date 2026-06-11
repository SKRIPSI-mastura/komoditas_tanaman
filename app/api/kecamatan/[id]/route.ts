import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/kecamatan/[id] — Detail satu kecamatan by ID atau nama
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numericId = Number(id);

  let query = supabase.from('kecamatan').select('*');

  if (!isNaN(numericId)) {
    query = query.eq('id', numericId);
  } else {
    // Cari berdasarkan nama (case-insensitive)
    query = query.ilike('nama_kecamatan', id);
  }

  const { data, error } = await query.single();

  if (error || !data) {
    return NextResponse.json({ status: 'error', message: 'Kecamatan tidak ditemukan' }, { status: 404 });
  }

  return NextResponse.json({ status: 'success', data });
}

// PUT /api/kecamatan/[id] — Update kecamatan
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  const { data, error } = await supabase
    .from('kecamatan')
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq('id', Number(id))
    .select()
    .single();

  if (error) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }

  return NextResponse.json({ status: 'success', data });
}

// DELETE /api/kecamatan/[id] — Hapus kecamatan
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { error } = await supabase
    .from('kecamatan')
    .delete()
    .eq('id', Number(id));

  if (error) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }

  return NextResponse.json({ status: 'success', message: 'Kecamatan berhasil dihapus' });
}
