import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client-side Supabase client (uses anon key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── Type Definitions ────────────────────────────────────────────────────────

export interface Kecamatan {
  id: number;
  nama_kecamatan: string;
  elevasi_mdpl: string;
  ph_tanah: string;
  tanah_liat: string;
  tanah_pasir: string;
  tanah_debu: string;
  tekstur_tanah: string;
  curah_hujan_tahunan: string | null;
  resiko_bencana: string;
  created_at: string;
  updated_at: string;
}

export interface Komoditas {
  id: number;
  nama_komoditas: string;
  deskripsi: string | null;
  suhu_min_c: string;
  suhu_max_c: string;
  curah_hujan_min_mm: string;
  curah_hujan_max_mm: string;
  kelembapan_min_persen: string;
  kelembapan_max_persen: string;
  ph_min: string;
  ph_max: string;
  elevasi_min_mdpl: string;
  elevasi_max_mdpl: string;
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
  top_score: string;
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
