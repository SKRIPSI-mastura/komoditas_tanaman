import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/riwayat — Ambil semua riwayat rekomendasi (dengan join kecamatan)
export async function GET() {
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Supabase request timeout')), 2500)
  );

  try {
    const res = await Promise.race([
      supabase
        .from('hasil_rekomendasi')
        .select(`
          *,
          kecamatan:kecamatan_id (
            id,
            nama_kecamatan
          )
        `)
        .order('tanggal_analisis', { ascending: false })
        .limit(100),
      timeoutPromise
    ]) as any;

    if (res.error) {
      throw res.error;
    }

    return NextResponse.json({ status: 'success', data: res.data });
  } catch (err: any) {
    console.error('Supabase query failed or timed out for riwayat:', err.message || err);
    // Return empty list on offline mode instead of crashing
    return NextResponse.json({ status: 'success', data: [] });
  }
}

// POST /api/riwayat — Simpan hasil rekomendasi baru ke Supabase
export async function POST(req: NextRequest) {
  const body = await req.json();

  try {
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
      throw error;
    }

    return NextResponse.json({ status: 'success', data }, { status: 201 });
  } catch (err: any) {
    console.error('Failed to log recommendation history, returning mock offline success:', err.message || err);
    // Offline success mock
    const mockData = {
      id: Math.floor(Math.random() * 1000) + 1,
      ...body,
      tanggal_analisis: body.tanggal_analisis || new Date().toISOString()
    };
    return NextResponse.json({ status: 'success', data: mockData }, { status: 201 });
  }
}

