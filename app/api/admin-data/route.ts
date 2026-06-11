import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('kecamatan')
      .select('nama_kecamatan, elevasi_mdpl')
      .order('nama_kecamatan', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const rows = data.map(item => ({
      elevasi_mdpl: item.elevasi_mdpl,
      kecamatan: item.nama_kecamatan
    }));

    return NextResponse.json({ data: rows });
  } catch (err: any) {
    console.error('Error fetching admin-data from Supabase:', err);
    return NextResponse.json({ error: 'Failed to load data' }, { status: 500 });
  }
}
