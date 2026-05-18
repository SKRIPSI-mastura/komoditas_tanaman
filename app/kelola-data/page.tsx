"use client";

import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface KecamatanData {
  periode: string;
  kecamatan: string;
  elevasi: number;
  ph: number;
  tanah: string;
  hujan: number;
  luasPanen: number;
  produksi: number;
  status: "Terverifikasi" | "Sedang Diproses";
}

const INITIAL_KECAMATAN_DATA: KecamatanData[] = [
  { periode: "Mei 2026", kecamatan: "Lhoksukon", elevasi: 12, ph: 6.4, tanah: "Lempung Berliat", hujan: 2100, luasPanen: 1420, produksi: 52100, status: "Terverifikasi" },
  { periode: "Mei 2026", kecamatan: "Tanah Luas", elevasi: 22, ph: 5.8, tanah: "Lempung Berpasir", hujan: 1950, luasPanen: 850, produksi: 31400, status: "Terverifikasi" },
  { periode: "Mei 2026", kecamatan: "Cot Girek", elevasi: 58, ph: 5.2, tanah: "Lempung Liat Berpasir", hujan: 2400, luasPanen: 1100, produksi: 36800, status: "Sedang Diproses" },
  { periode: "April 2026", kecamatan: "Dewantara", elevasi: 8, ph: 6.5, tanah: "Lempung", hujan: 1800, luasPanen: 950, produksi: 34200, status: "Terverifikasi" },
  { periode: "April 2026", kecamatan: "Muara Batu", elevasi: 10, ph: 6.2, tanah: "Lempung Berpasir", hujan: 1850, luasPanen: 780, produksi: 28900, status: "Terverifikasi" },
  { periode: "Maret 2026", kecamatan: "Samudera", elevasi: 14, ph: 6.1, tanah: "Lempung Berdebu", hujan: 2000, luasPanen: 1200, produksi: 44100, status: "Terverifikasi" },
  { periode: "Maret 2026", kecamatan: "Baktiya", elevasi: 11, ph: 6.2, tanah: "Lempung Berliat", hujan: 2150, luasPanen: 1350, produksi: 49800, status: "Sedang Diproses" },
];

export default function Page() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [dataList, setDataList] = useState<KecamatanData[]>(INITIAL_KECAMATAN_DATA);
  const [showToast, setShowToast] = useState(false);
  
  // Form State
  const [periode, setPeriode] = useState("2026-05");
  const [kecamatan, setKecamatan] = useState("Lhoksukon");
  const [elevasi, setElevasi] = useState(12);
  const [ph, setPh] = useState(6.4);
  const [tanah, setTanah] = useState("Lempung Berliat");
  const [hujan, setHujan] = useState(2100);
  const [luasPanen, setLuasPanen] = useState(1000);
  const [produksi, setProduksi] = useState(4000);

  useEffect(() => {
    const isAdmin = localStorage.getItem("admin_logged_in") === "true";
    if (!isAdmin) {
      router.push("/login");
    } else {
      setAuthorized(true);
    }
  }, [router]);

  if (!authorized) {
    return null; // Prevents FOUC
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Format year-month to Month Name Year (e.g. "2026-05" -> "Mei 2026")
    const dateParts = periode.split("-");
    const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    const monthIndex = parseInt(dateParts[1]) - 1;
    const formattedDate = `${months[monthIndex]} ${dateParts[0]}`;

    const newRecord: KecamatanData = {
      periode: formattedDate,
      kecamatan,
      elevasi: Number(elevasi),
      ph: Number(ph),
      tanah,
      hujan: Number(hujan),
      luasPanen: Number(luasPanen),
      produksi: Number(produksi),
      status: "Terverifikasi"
    };

    setDataList([newRecord, ...dataList]);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleDelete = (index: number) => {
    setDataList(dataList.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-stone-50 dark:bg-stone-950 text-stone-800 dark:text-stone-100 min-h-screen">
      <Sidebar />
      <Header title="Data Kecamatan" subtitle="Manajemen Profil Fisik & Klimatologi Wilayah" />

      {/* Main Content */}
      <main className="ml-64 pt-20 pb-12 px-8 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Page Header */}
          <div className="mb-4">
            <h2 className="text-2xl font-black text-stone-950 dark:text-white tracking-tight">Manajemen Lahan Kecamatan</h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Kelola profil tanah, ketinggian topografi, serta volume curah hujan rata-rata tahunan pada masing-masing subdistrik di Aceh Utara.
            </p>
          </div>

          {/* Success Toast */}
          {showToast && (
            <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/20 text-emerald-800 dark:text-emerald-400 p-4 rounded-2xl flex items-center shadow-sm animate-fade-in">
              <span className="material-symbols-outlined mr-3 text-emerald-600" data-icon="check_circle">check_circle</span>
              <span className="font-bold text-xs">Profil Data Lahan Kecamatan Berhasil Disimpan & Diperbarui!</span>
            </div>
          )}

          {/* Form Input Section */}
          <section className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-850 rounded-3xl p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#006B54]/5 to-transparent rounded-bl-full pointer-events-none"></div>
            
            <div className="flex items-center space-x-2 mb-6">
              <span className="material-symbols-outlined text-[#006B54]" data-icon="add_box">add_box</span>
              <h3 className="font-bold text-sm text-stone-900 dark:text-white uppercase tracking-wider">Input Karakteristik Lahan Baru</h3>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest">Periode</label>
                <input 
                  type="month" 
                  value={periode}
                  onChange={(e) => setPeriode(e.target.value)}
                  className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-850 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#006B54]/20 text-sm py-2.5 px-4 transition-all"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest">Kecamatan</label>
                <select 
                  value={kecamatan}
                  onChange={(e) => setKecamatan(e.target.value)}
                  className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-850 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#006B54]/20 text-sm py-2.5 px-4 transition-all"
                >
                  <option value="Lhoksukon">Lhoksukon</option>
                  <option value="Tanah Luas">Tanah Luas</option>
                  <option value="Cot Girek">Cot Girek</option>
                  <option value="Dewantara">Dewantara</option>
                  <option value="Muara Batu">Muara Batu</option>
                  <option value="Samudera">Samudera</option>
                  <option value="Baktiya">Baktiya</option>
                  <option value="Seunuddon">Seunuddon</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest">Elevasi (mdpl)</label>
                <input 
                  type="number" 
                  value={elevasi}
                  onChange={(e) => setElevasi(Number(e.target.value))}
                  className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-850 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#006B54]/20 text-sm py-2.5 px-4 transition-all"
                  placeholder="Elevasi" 
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest">pH Tanah</label>
                <input 
                  type="number" 
                  step="0.1" 
                  value={ph}
                  onChange={(e) => setPh(Number(e.target.value))}
                  className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-850 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#006B54]/20 text-sm py-2.5 px-4 transition-all"
                  placeholder="pH" 
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest">Jenis Tanah</label>
                <select 
                  value={tanah}
                  onChange={(e) => setTanah(e.target.value)}
                  className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-850 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#006B54]/20 text-sm py-2.5 px-4 transition-all"
                >
                  <option value="Lempung Berliat">Lempung Berliat</option>
                  <option value="Lempung Berpasir">Lempung Berpasir</option>
                  <option value="Lempung Berdebu">Lempung Berdebu</option>
                  <option value="Pasir Berlempung">Pasir Berlempung</option>
                  <option value="Lempung">Lempung (Loam)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest">Curah Hujan (mm/tahun)</label>
                <input 
                  type="number" 
                  value={hujan}
                  onChange={(e) => setHujan(Number(e.target.value))}
                  className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-850 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#006B54]/20 text-sm py-2.5 px-4 transition-all"
                  placeholder="Curah Hujan" 
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest">Luas Panen (Ha)</label>
                <input 
                  type="number" 
                  value={luasPanen}
                  onChange={(e) => setLuasPanen(Number(e.target.value))}
                  className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-850 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#006B54]/20 text-sm py-2.5 px-4 transition-all"
                  placeholder="Luas Panen" 
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest">Produksi Pangan (Ton)</label>
                <input 
                  type="number" 
                  value={produksi}
                  onChange={(e) => setProduksi(Number(e.target.value))}
                  className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-850 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#006B54]/20 text-sm py-2.5 px-4 transition-all"
                  placeholder="Volume Produksi" 
                  required
                />
              </div>

              <div className="lg:col-span-4 flex justify-end space-x-2 pt-2 border-t border-stone-100 dark:border-stone-850 mt-2">
                <button 
                  type="reset" 
                  className="px-5 py-2.5 bg-stone-50 hover:bg-stone-100 dark:bg-stone-950 dark:hover:bg-stone-800/50 rounded-2xl text-xs font-bold text-stone-500 dark:text-stone-400 transition-all cursor-pointer"
                >
                  Reset
                </button>
                <button 
                  type="submit" 
                  className="px-8 py-2.5 bg-[#006B54] hover:bg-[#00513f] text-white rounded-2xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  Simpan Profil Lahan
                </button>
              </div>
            </form>
          </section>

          {/* Table Section */}
          <section className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-850 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-stone-100 dark:border-stone-850 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="material-symbols-outlined text-[#006B54]" data-icon="table_rows">table_rows</span>
                <h3 className="font-bold text-sm text-stone-900 dark:text-white uppercase tracking-wider">Histori Profil Tanah & Hidrologi</h3>
              </div>
              <div className="flex space-x-2">
                <button className="flex items-center px-3 py-1.5 bg-stone-50 hover:bg-stone-100 dark:bg-stone-950 dark:hover:bg-stone-800 rounded-xl text-xs font-bold border border-stone-100 dark:border-stone-850 transition-colors">
                  <span className="material-symbols-outlined text-sm mr-1.5" data-icon="filter_list">filter_list</span>
                  <span>Filter</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-50 dark:bg-stone-950 text-stone-400 dark:text-stone-500 border-b border-stone-100 dark:border-stone-850">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Periode</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Kecamatan</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">Elevasi</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">pH Lahan</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Tekstur Lahan</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">Curah Hujan</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-right">Luas Panen</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-right">Vol Produksi</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">Status</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-850">
                  {dataList.map((item, index) => (
                    <tr key={index} className="hover:bg-stone-50/50 dark:hover:bg-stone-900/30 transition-colors">
                      <td className="px-6 py-4 text-xs font-bold text-stone-500 dark:text-stone-400">{item.periode}</td>
                      <td className="px-6 py-4 text-sm font-semibold">{item.kecamatan}</td>
                      <td className="px-6 py-4 text-sm font-mono text-center font-bold">{item.elevasi} mdpl</td>
                      <td className="px-6 py-4 text-sm font-mono text-center font-bold text-[#006B54] dark:text-[#10b981]">{item.ph}</td>
                      <td className="px-6 py-4 text-xs font-medium text-stone-600 dark:text-stone-400">{item.tanah}</td>
                      <td className="px-6 py-4 text-sm font-mono text-center">{item.hujan} mm</td>
                      <td className="px-6 py-4 text-sm font-mono text-right">{item.luasPanen.toLocaleString()} Ha</td>
                      <td className="px-6 py-4 text-sm font-mono text-right font-bold text-stone-700 dark:text-stone-300">{item.produksi.toLocaleString()} Ton</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          item.status === "Terverifikasi"
                            ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10"
                            : "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-500/10"
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center space-x-1">
                          <button 
                            onClick={() => handleDelete(index)}
                            className="p-1 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors cursor-pointer text-stone-400"
                            title="Hapus"
                          >
                            <span className="material-symbols-outlined text-base" data-icon="delete">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 border-t border-stone-100 dark:border-stone-850 flex justify-between items-center text-xs text-stone-500">
              <p>Menampilkan {dataList.length} data subdistrik</p>
              <div className="flex space-x-1">
                <button className="px-3 py-1 bg-[#006B54] text-white rounded-lg font-bold">1</button>
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
