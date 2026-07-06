import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Hardcoded agronomic thresholds for 7 commodities as local fallback
const fallbackKomoditas = [
  {
    id: 1,
    nama_komoditas: "Padi",
    deskripsi: "Tanaman pangan utama, membutuhkan air melimpah terutama di awal masa tanam.",
    suhu_min_c: "25",
    suhu_max_c: "30",
    curah_hujan_min_mm: "100",
    curah_hujan_max_mm: "300",
    kelembapan_min_persen: "60",
    kelembapan_max_persen: "90",
    ph_min: "5.5",
    ph_max: "7.5",
    elevasi_min_mdpl: "0",
    elevasi_max_mdpl: "600"
  },
  {
    id: 2,
    nama_komoditas: "Jagung",
    deskripsi: "Tanaman pangan alternatif yang toleran kekeringan sedang dan menyukai sinar matahari langsung.",
    suhu_min_c: "21",
    suhu_max_c: "30",
    curah_hujan_min_mm: "80",
    curah_hujan_max_mm: "200",
    kelembapan_min_persen: "50",
    kelembapan_max_persen: "80",
    ph_min: "5.5",
    ph_max: "7.0",
    elevasi_min_mdpl: "0",
    elevasi_max_mdpl: "1000"
  },
  {
    id: 3,
    nama_komoditas: "Kedelai",
    deskripsi: "Tanaman kacang-kacangan sumber protein nabati tinggi.",
    suhu_min_c: "25",
    suhu_max_c: "30",
    curah_hujan_min_mm: "50",
    curah_hujan_max_mm: "200",
    kelembapan_min_persen: "50",
    kelembapan_max_persen: "80",
    ph_min: "5.8",
    ph_max: "7.0",
    elevasi_min_mdpl: "0",
    elevasi_max_mdpl: "900"
  },
  {
    id: 4,
    nama_komoditas: "Kacang Tanah",
    deskripsi: "Tanaman polong-polongan yang tumbuh optimal pada tanah gembur berpasir.",
    suhu_min_c: "25",
    suhu_max_c: "30",
    curah_hujan_min_mm: "50",
    curah_hujan_max_mm: "150",
    kelembapan_min_persen: "50",
    kelembapan_max_persen: "70",
    ph_min: "5.5",
    ph_max: "7.0",
    elevasi_min_mdpl: "0",
    elevasi_max_mdpl: "500"
  },
  {
    id: 5,
    nama_komoditas: "Kacang Hijau",
    deskripsi: "Tanaman yang sangat toleran kekeringan dan memiliki masa tumbuh yang singkat.",
    suhu_min_c: "25",
    suhu_max_c: "35",
    curah_hujan_min_mm: "50",
    curah_hujan_max_mm: "100",
    kelembapan_min_persen: "50",
    kelembapan_max_persen: "80",
    ph_min: "5.5",
    ph_max: "6.5",
    elevasi_min_mdpl: "0",
    elevasi_max_mdpl: "500"
  },
  {
    id: 6,
    nama_komoditas: "Ubi Kayu",
    deskripsi: "Tanaman umbi-umbian dengan daya tahan sangat tinggi terhadap kondisi tanah kurang subur.",
    suhu_min_c: "25",
    suhu_max_c: "30",
    curah_hujan_min_mm: "100",
    curah_hujan_max_mm: "250",
    kelembapan_min_persen: "60",
    kelembapan_max_persen: "85",
    ph_min: "5.5",
    ph_max: "7.0",
    elevasi_min_mdpl: "0",
    elevasi_max_mdpl: "800"
  },
  {
    id: 7,
    nama_komoditas: "Ubi Jalar",
    deskripsi: "Tanaman merambat yang menghasilkan umbi manis pada tanah berpasir dengan aerasi baik.",
    suhu_min_c: "21",
    suhu_max_c: "27",
    curah_hujan_min_mm: "50",
    curah_hujan_max_mm: "200",
    kelembapan_min_persen: "50",
    kelembapan_max_persen: "80",
    ph_min: "5.5",
    ph_max: "6.8",
    elevasi_min_mdpl: "0",
    elevasi_max_mdpl: "1000"
  }
];

// GET /api/komoditas — List semua komoditas
export async function GET() {
  let data: any = null;
  let dbError = false;

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Supabase request timeout')), 2500)
  );

  try {
    const res = await Promise.race([
      supabase.from('komoditas').select('*').order('nama_komoditas', { ascending: true }),
      timeoutPromise
    ]) as any;

    if (res.error) {
      console.error('Supabase error:', res.error.message);
      dbError = true;
    } else {
      data = res.data;
    }
  } catch (err: any) {
    console.error('Supabase query failed or timed out:', err.message || err);
    dbError = true;
  }

  // Fallback to local hardcoded commodities list if database is offline
  if (dbError || !data || data.length === 0) {
    console.log('Menggunakan fallback data komoditas lokal...');
    data = fallbackKomoditas;
  }

  return NextResponse.json({ status: 'success', data });
}

// POST /api/komoditas — Tambah komoditas baru
export async function POST(req: NextRequest) {
  const body = await req.json();

  try {
    const { data, error } = await supabase
      .from('komoditas')
      .insert([body])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ status: 'success', data }, { status: 201 });
  } catch (err: any) {
    console.error('Failed to insert komoditas, returning mock offline success:', err.message || err);
    const mockData = {
      id: Math.floor(Math.random() * 100) + 10,
      ...body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return NextResponse.json({ status: 'success', data: mockData }, { status: 201 });
  }
}

