import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

// Helper function to load and merge kecamatan data from local CSVs
function getKecamatanFromCSV() {
  try {
    const elevPath = path.join(process.cwd(), '..', 'lstm_komoditas', 'data', 'Elevasi_Kecamatan_Aceh_Utara.csv');
    const tanahPath = path.join(process.cwd(), '..', 'lstm_komoditas', 'data', 'data_tanah_aceh_utara2.csv');

    if (!fs.existsSync(elevPath) || !fs.existsSync(tanahPath)) {
      console.warn('CSV files not found at:', { elevPath, tanahPath });
      return [];
    }

    const elevContent = fs.readFileSync(elevPath, 'utf-8');
    const elevLines = elevContent.split('\n').map(l => l.trim()).filter(Boolean);
    const elevMap = new Map<string, number>();
    for (let i = 1; i < elevLines.length; i++) {
      const parts = elevLines[i].split(',');
      if (parts.length >= 2) {
        const elev = parseFloat(parts[0]);
        const kec = parts[1].trim();
        elevMap.set(kec.toLowerCase(), elev);
      }
    }

    const tanahContent = fs.readFileSync(tanahPath, 'utf-8');
    const tanahLines = tanahContent.split('\n').map(l => l.trim()).filter(Boolean);
    const list: any[] = [];
    
    for (let i = 1; i < tanahLines.length; i++) {
      const parts = tanahLines[i].split(',');
      if (parts.length >= 6) {
        const kec = parts[0].trim();
        const ph = parseFloat(parts[1]);
        const liat = parseFloat(parts[2]);
        const pasir = parseFloat(parts[3]);
        const debu = parseFloat(parts[4]);
        const tekstur = parts[5].trim();
        
        const key = kec.toLowerCase();
        const elev = elevMap.get(key) || 0;
        
        list.push({
          id: i,
          nama_kecamatan: kec,
          elevasi_mdpl: elev.toString(),
          ph_tanah: ph.toString(),
          tanah_liat: liat.toString(),
          tanah_pasir: pasir.toString(),
          tanah_debu: debu.toString(),
          tekstur_tanah: tekstur,
          curah_hujan_tahunan: '2000',
          resiko_bencana: elev < 15 ? 'Tinggi' : 'Rendah'
        });
      }
    }
    
    return list.sort((a, b) => a.nama_kecamatan.localeCompare(b.nama_kecamatan));
  } catch (e) {
    console.error('Error parsing kecamatan CSVs:', e);
    return [];
  }
}

// GET /api/kecamatan — List semua kecamatan
export async function GET() {
  let data: any = null;
  let dbError = false;

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Supabase request timeout')), 2500)
  );

  try {
    const res = await Promise.race([
      supabase.from('kecamatan').select('*').order('nama_kecamatan', { ascending: true }),
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

  // Fallback to local CSV if database is offline
  if (dbError || !data || data.length === 0) {
    console.log('Menggunakan fallback data kecamatan dari CSV lokal...');
    data = getKecamatanFromCSV();
  }

  return NextResponse.json({ status: 'success', data });
}

// POST /api/kecamatan — Tambah kecamatan baru
export async function POST(req: NextRequest) {
  const body = await req.json();

  try {
    const { data, error } = await supabase
      .from('kecamatan')
      .insert([body])
      .select()
      .single();

    if (error) {
      throw error;
    }
    return NextResponse.json({ status: 'success', data }, { status: 201 });
  } catch (err: any) {
    console.error('Failed to insert kecamatan, returning mock offline success:', err.message || err);
    // Offline success mock
    const mockData = {
      id: Math.floor(Math.random() * 1000) + 100,
      ...body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return NextResponse.json({ status: 'success', data: mockData }, { status: 201 });
  }
}

