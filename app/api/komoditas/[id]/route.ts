import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/komoditas/[id] — Detail satu komoditas
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { data, error } = await supabase
    .from('komoditas')
    .select('*')
    .eq('id', Number(id))
    .single();

  if (error || !data) {
    return NextResponse.json({ status: 'error', message: 'Komoditas tidak ditemukan' }, { status: 404 });
  }

  return NextResponse.json({ status: 'success', data });
}

// PUT /api/komoditas/[id] — Update komoditas
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  const { data, error } = await supabase
    .from('komoditas')
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq('id', Number(id))
    .select()
    .single();

  if (error) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }

  return NextResponse.json({ status: 'success', data });
}

// DELETE /api/komoditas/[id] — Hapus komoditas
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { error } = await supabase
    .from('komoditas')
    .delete()
    .eq('id', Number(id));

  if (error) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }

  return NextResponse.json({ status: 'success', message: 'Komoditas berhasil dihapus' });
}
