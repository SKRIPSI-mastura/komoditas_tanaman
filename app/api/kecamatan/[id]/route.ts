import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/kecamatan/[id] — Detail satu kecamatan by ID atau nama
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numericId = Number(id);

  try {
    let query = supabase.from('kecamatan').select('*');
    if (!isNaN(numericId)) {
      query = query.eq('id', numericId);
    } else {
      query = query.ilike('nama_kecamatan', id);
    }

    const { data, error } = await query.single();

    if (error || !data) {
      return NextResponse.json({ status: 'error', message: 'Kecamatan tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ status: 'success', data });
  } catch (err: any) {
    console.error('Supabase query failed:', err.message || err);
    return NextResponse.json({ status: 'error', message: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT /api/kecamatan/[id] — Update kecamatan
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numericId = Number(id);

  try {
    const body = await req.json();
    const { data, error } = await supabase
      .from('kecamatan')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', numericId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ status: 'error', message: error.message }, { status: 400 });
    }
    return NextResponse.json({ status: 'success', data });
  } catch (err: any) {
    console.error('Failed to update kecamatan:', err.message || err);
    return NextResponse.json({ status: 'error', message: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/kecamatan/[id] — Hapus kecamatan
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numericId = Number(id);

  try {
    const { error } = await supabase
      .from('kecamatan')
      .delete()
      .eq('id', numericId);

    if (error) {
      return NextResponse.json({ status: 'error', message: error.message }, { status: 400 });
    }
    return NextResponse.json({ status: 'success', message: 'Kecamatan berhasil dihapus' });
  } catch (err: any) {
    console.error('Failed to delete kecamatan:', err.message || err);
    return NextResponse.json({ status: 'error', message: 'Internal Server Error' }, { status: 500 });
  }
}
