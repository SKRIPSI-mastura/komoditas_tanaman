import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('admin')
      .select('id, nama, username, email, peran, terakhir_login')
      .order('id', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const rows = (data || []).map((item: any) => ({
      id: String(item.id),
      nama: item.nama || '',
      username: item.username || '',
      email: item.email || '',
      peran: item.peran || '',
      terakhir_login: item.terakhir_login || 'Belum pernah login'
    }));

    return NextResponse.json({ data: rows });
  } catch (err: any) {
    console.error('Supabase query failed for admin-users:', err.message || err);
    return NextResponse.json({ error: 'Failed to load admin users' }, { status: 500 });
  }
}
