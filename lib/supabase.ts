import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client-side Supabase client (uses anon key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── Type Definitions ────────────────────────────────────────────────────────

export interface Kecamatan {
  id: number;
  nama_kecamatan: string;
  elevasi_mdpl: number;
  ph_tanah: number;
  tanah_liat: number;
  tanah_pasir: number;
  tanah_debu: number;
  tekstur_tanah: string;
  curah_hujan_tahunan: number | null;
  resiko_bencana: string;
  created_at: string;
  updated_at: string;
}

export interface Komoditas {
  id: number;
  nama_komoditas: string;
  deskripsi: string | null;
  suhu_min_c: number;
  suhu_max_c: number;
  curah_hujan_min_mm: number;
  curah_hujan_max_mm: number;
  kelembapan_min_persen: number;
  kelembapan_max_persen: number;
  ph_min: number;
  ph_max: number;
  elevasi_min_mdpl: number;
  elevasi_max_mdpl: number;
  created_at: string;
  updated_at: string;
}

export interface HasilRekomendasi {
  id: number;
  kecamatan_id: number;
  tanggal_analisis: string;
  prediksi_iklim: Record<string, any> | null;
  profil_wilayah: Record<string, any> | null;
  rekomendasi: Record<string, any>[] | null;
  top_komoditas: string;
  top_score: number;
  top_kelayakan: string;
  penjelasan: string | null;
  sumber: string | null;
  created_at: string;
  kecamatan?: Kecamatan;
}

export interface Admin {
  id: number;
  nama: string;
  username: string;
  password: string;
  email: string;
  peran: string;
  terakhir_login: string | null;
  created_at: string;
}
