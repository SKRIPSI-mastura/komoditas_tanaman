import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// DELETE /api/riwayat/[id] — Hapus riwayat rekomendasi
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { error } = await supabase
    .from('hasil_rekomendasi')
    .delete()
    .eq('id', Number(id));

  if (error) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }

  return NextResponse.json({ status: 'success', message: 'Riwayat rekomendasi berhasil dihapus' });
}
