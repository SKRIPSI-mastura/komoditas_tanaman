import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/riwayat — Ambil semua riwayat rekomendasi (dengan join kecamatan)
export async function GET() {
  const { data, error } = await supabase
    .from('hasil_rekomendasi')
    .select(`
      *,
      kecamatan:kecamatan_id (
        id,
        nama_kecamatan
      )
    `)
    .order('tanggal_analisis', { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }

  return NextResponse.json({ status: 'success', data });
}

// POST /api/riwayat — Simpan hasil rekomendasi baru ke Supabase
export async function POST(req: NextRequest) {
  const body = await req.json();

  const { data, error } = await supabase
    .from('hasil_rekomendasi')
    .insert([{
      kecamatan_id: body.kecamatan_id,
      tanggal_analisis: body.tanggal_analisis || new Date().toISOString(),
      prediksi_iklim: body.prediksi_iklim || null,
      profil_wilayah: body.profil_wilayah || null,
      rekomendasi: body.rekomendasi || null,
      top_komoditas: body.top_komoditas,
      top_score: body.top_score,
      top_kelayakan: body.top_kelayakan,
      penjelasan: body.penjelasan || null,
      sumber: body.sumber || 'web',
    }])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }

  return NextResponse.json({ status: 'success', data }, { status: 201 });
}
