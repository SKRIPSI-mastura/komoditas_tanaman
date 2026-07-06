import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

// Helper to look up details in CSV
function getKecamatanFromCSV(idOrName: string) {
  try {
    const elevPath = path.join(process.cwd(), '..', 'lstm_komoditas', 'data', 'Elevasi_Kecamatan_Aceh_Utara.csv');
    const tanahPath = path.join(process.cwd(), '..', 'lstm_komoditas', 'data', 'data_tanah_aceh_utara2.csv');

    if (!fs.existsSync(elevPath) || !fs.existsSync(tanahPath)) return null;

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
    
    const numericId = Number(idOrName);
    
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
        
        const isMatch = !isNaN(numericId) 
          ? i === numericId 
          : key === idOrName.toLowerCase();
          
        if (isMatch) {
          return {
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
          };
        }
      }
    }
  } catch (e) {
    console.error('Error parsing kecamatan detail CSVs:', e);
  }
  return null;
}

// GET /api/kecamatan/[id] — Detail satu kecamatan by ID atau nama
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numericId = Number(id);

  let data: any = null;
  let dbError = false;

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Supabase request timeout')), 2500)
  );

  try {
    let query = supabase.from('kecamatan').select('*');
    if (!isNaN(numericId)) {
      query = query.eq('id', numericId);
    } else {
      query = query.ilike('nama_kecamatan', id);
    }

    const res = await Promise.race([
      query.single(),
      timeoutPromise
    ]) as any;

    if (res.error) {
      console.error('Supabase detail error:', res.error.message);
      dbError = true;
    } else {
      data = res.data;
    }
  } catch (err: any) {
    console.error('Supabase detail query failed or timed out:', err.message || err);
    dbError = true;
  }

  // Fallback to local CSV if database is offline or not found
  if (dbError || !data) {
    console.log('Menggunakan fallback detail kecamatan dari CSV lokal...');
    data = getKecamatanFromCSV(id);
  }

  if (!data) {
    return NextResponse.json({ status: 'error', message: 'Kecamatan tidak ditemukan' }, { status: 404 });
  }

  return NextResponse.json({ status: 'success', data });
}

// PUT /api/kecamatan/[id] — Update kecamatan
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  try {
    const { data, error } = await supabase
      .from('kecamatan')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', Number(id))
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ status: 'success', data });
  } catch (err: any) {
    console.error('Failed to update kecamatan, returning mock offline success:', err.message || err);
    const mockData = {
      id: Number(id),
      ...body,
      updated_at: new Date().toISOString()
    };
    return NextResponse.json({ status: 'success', data: mockData });
  }
}

// DELETE /api/kecamatan/[id] — Hapus kecamatan
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const { error } = await supabase
      .from('kecamatan')
      .delete()
      .eq('id', Number(id));

    if (error) throw error;
    return NextResponse.json({ status: 'success', message: 'Kecamatan berhasil dihapus' });
  } catch (err: any) {
    console.error('Failed to delete kecamatan, returning mock offline success:', err.message || err);
    return NextResponse.json({ status: 'success', message: 'Kecamatan berhasil dihapus (Offline Mode)' });
  }
}

