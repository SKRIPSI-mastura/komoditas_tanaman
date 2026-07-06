import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

// Helper to parse local CSV data
function getAdminUsersFromCSV() {
  try {
    const csvPath = path.join(process.cwd(), '..', 'lstm_komoditas', 'data', 'Admin_Data.csv');
    if (!fs.existsSync(csvPath)) return [];
    const content = fs.readFileSync(csvPath, 'utf-8');
    const lines = content.split('\n').map(line => line.trim()).filter(Boolean);
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',');
    const list: any[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      const adminObj: any = {};
      headers.forEach((header, index) => {
        adminObj[header.trim()] = values[index] ? values[index].trim() : '';
      });
      
      list.push({
        id: String(adminObj.id),
        nama: adminObj.nama || '',
        username: adminObj.username || '',
        email: adminObj.email || '',
        peran: adminObj.peran || 'Admin Dinas',
        terakhir_login: adminObj.terakhir_login || 'Belum pernah login'
      });
    }
    return list;
  } catch (e) {
    console.error('Error reading admin-users from CSV:', e);
    return [];
  }
}

export async function GET() {
  let rows: any[] = [];
  let dbError = false;

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Supabase request timeout')), 2500)
  );

  try {
    const res = await Promise.race([
      supabase
        .from('admin')
        .select('id, nama, username, email, peran, terakhir_login')
        .order('id', { ascending: true }),
      timeoutPromise
    ]) as any;

    if (res.error) {
      console.error('Supabase error for admin-users:', res.error.message);
      dbError = true;
    } else {
      rows = res.data.map((item: any) => ({
        id: String(item.id),
        nama: item.nama || '',
        username: item.username || '',
        email: item.email || '',
        peran: item.peran || '',
        terakhir_login: item.terakhir_login || 'Belum pernah login'
      }));
    }
  } catch (err: any) {
    console.error('Supabase connection failed or timed out for admin-users:', err.message || err);
    dbError = true;
  }

  // Fallback to local CSV data if database query failed
  if (dbError || rows.length === 0) {
    console.log('Menggunakan fallback data admin-users dari CSV lokal...');
    rows = getAdminUsersFromCSV();
  }

  return NextResponse.json({ data: rows });
}

