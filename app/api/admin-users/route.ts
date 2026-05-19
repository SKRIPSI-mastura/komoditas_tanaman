import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const csvPath = path.resolve(process.cwd(), 'lstm_komoditas', 'data', 'Admin_Data.csv');
  try {
    const fileContent = await fs.promises.readFile(csvPath, 'utf-8');
    const lines = fileContent.trim().split('\n');
    const headers = lines[0].split(',');
    const rows = lines.slice(1).map(line => {
      const values = line.split(',');
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => {
        obj[h.trim()] = values[i]?.trim() ?? '';
      });
      return obj;
    });
    return NextResponse.json({ data: rows });
  } catch (err) {
    console.error('Error reading admin CSV:', err);
    return NextResponse.json({ error: 'Failed to load admin data' }, { status: 500 });
  }
}
