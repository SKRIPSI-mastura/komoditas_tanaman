"use client";

import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface HistoryRecord {
  id: string;
  dbId: number;
  kecamatan: string;
  tanggal: string;
  ph: number;
  elevasi: number;
  komoditas: string;
  skor: number;
  suitability: "Sangat Layak" | "Layak" | "Kurang Layak" | "Tidak Layak";
}

const HISTORICAL_DATA: HistoryRecord[] = [
  { id: "AGR-1092", dbId: -1, kecamatan: "Lhoksukon", tanggal: "17 Mei 2026, 14:32", ph: 6.4, elevasi: 12, komoditas: "Padi", skor: 98.2, suitability: "Sangat Layak" },
  { id: "AGR-1091", dbId: -2, kecamatan: "Tanah Luas", tanggal: "16 Mei 2026, 09:15", ph: 5.8, elevasi: 22, komoditas: "Jagung", skor: 89.4, suitability: "Layak" },
  { id: "AGR-1090", dbId: -3, kecamatan: "Cot Girek", tanggal: "15 Mei 2026, 11:45", ph: 5.2, elevasi: 58, komoditas: "Kedelai", skor: 74.1, suitability: "Layak" },
  { id: "AGR-1089", dbId: -4, kecamatan: "Dewantara", tanggal: "14 Mei 2026, 16:20", ph: 6.5, elevasi: 8, komoditas: "Padi", skor: 88.7, suitability: "Layak" },
  { id: "AGR-1088", dbId: -5, kecamatan: "Muara Batu", tanggal: "12 Mei 2026, 10:10", ph: 6.2, elevasi: 10, komoditas: "Kacang Tanah", skor: 83.5, suitability: "Layak" },
  { id: "AGR-1087", dbId: -6, kecamatan: "Syamtalira Aron", tanggal: "10 Mei 2026, 08:30", ph: 6.3, elevasi: 15, komoditas: "Padi", skor: 95.8, suitability: "Sangat Layak" },
  { id: "AGR-1086", dbId: -7, kecamatan: "Samudera", tanggal: "08 Mei 2026, 15:40", ph: 6.1, elevasi: 14, komoditas: "Padi", skor: 91.2, suitability: "Sangat Layak" },
  { id: "AGR-1085", dbId: -8, kecamatan: "Baktiya", tanggal: "06 Mei 2026, 11:05", ph: 6.2, elevasi: 11, komoditas: "Padi", skor: 97.4, suitability: "Sangat Layak" },
  { id: "AGR-1084", dbId: -9, kecamatan: "Seunuddon", tanggal: "04 Mei 2026, 14:55", ph: 4.8, elevasi: 5, komoditas: "Kacang Tanah", skor: 58.5, suitability: "Kurang Layak" },
];

export default function Page() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTab, setFilterTab] = useState<"Semua" | "Sangat Layak" | "Layak" | "Kurang Layak" | "Tidak Layak">("Semua");
  const [historyList, setHistoryList] = useState<HistoryRecord[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  // Load history from Supabase API - Admin Only
  useEffect(() => {
    const adminStatus = localStorage.getItem("admin_logged_in") === "true";
    if (!adminStatus) {
      router.push("/login");
      return;
    }
    setIsAdmin(adminStatus);

    fetch("/api/riwayat")
      .then((res) => res.json())
      .then((resData) => {
        if (resData.status === "success" && Array.isArray(resData.data)) {
          const mapped = resData.data.map((r: any) => ({
            id: `AGR-${r.id}`,
            dbId: r.id,
            kecamatan: r.kecamatan?.nama_kecamatan || `Kecamatan #${r.kecamatan_id}`,
            tanggal: new Date(r.tanggal_analisis).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric"
            }) + `, ${new Date(r.tanggal_analisis).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`,
            ph: r.profil_wilayah?.ph ? Number(r.profil_wilayah.ph) : 6.0,
            elevasi: r.profil_wilayah?.elevasi ? Math.round(Number(r.profil_wilayah.elevasi)) : 0,
            komoditas: r.top_komoditas,
            skor: Number(r.top_score),
            suitability: r.top_kelayakan as any
          }));
          setHistoryList(mapped);
        } else {
          setHistoryList(HISTORICAL_DATA);
        }
      })
      .catch((err) => {
        console.warn("Failed to fetch history from Supabase, using mock fallback", err);
        setHistoryList(HISTORICAL_DATA);
      });
  }, []);

  const handleDeleteRecord = async (dbId: number) => {
    if (dbId < 0) {
      // Local mock data deletion
      setHistoryList((prev) => prev.filter((r) => r.dbId !== dbId));
      return;
    }

    if (!confirm("Apakah Anda yakin ingin menghapus riwayat rekomendasi ini dari database?")) {
      return;
    }

    try {
      const res = await fetch(`/api/riwayat/${dbId}`, {
        method: "DELETE"
      });

      const json = await res.json();
      if (json.status === "success") {
        setHistoryList((prev) => prev.filter((r) => r.dbId !== dbId));
      } else {
        alert(json.message || "Gagal menghapus data.");
      }
    } catch (err) {
      console.error("Error deleting record:", err);
      alert("Terjadi kesalahan koneksi.");
    }
  };

  const filteredHistory = historyList.filter((record) => {
    const matchesSearch = 
      record.kecamatan.toLowerCase().includes(searchTerm.toLowerCase()) || 
      record.komoditas.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.id.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesTab = filterTab === "Semua" || record.suitability === filterTab;
    
    return matchesSearch && matchesTab;
  });

  // Dynamic text report generator & download
  const handleDownloadReport = (record: HistoryRecord) => {
    const reportText = `=====================================================
LAPORAN HASIL REKOMENDASI KOMODITAS PERTANIAN PANGAN
SISTEM CERDAS AGRO-LSTM (ACEH UTARA)
=====================================================
ID Laporan       : ${record.id}
Tanggal Analisis : ${record.tanggal}
Wilayah Evaluasi : Kecamatan ${record.kecamatan}

VARIABEL KONDISI FISIK DAN KIMIA LAHAN:
-----------------------------------------------------
- Derajat Keasaman (pH) : ${record.ph.toFixed(1)}
- Elevasi Lahan        : ${record.elevasi} mdpl (meter di atas permukaan laut)

HASIL PREDIKSI MODEL KECERDASAN BUATAN:
-----------------------------------------------------
- Komoditas Direkomendasikan : ${record.komoditas}
- Tingkat Kesesuaian Lahan  : ${record.skor.toFixed(1)}%
- Kategori Kelayakan         : ${record.suitability}

REKOMENDASI VEGETATIF:
Berdasarkan analisis model LSTM, komoditas ${record.komoditas}
memiliki indeks kecocokan sebesar ${record.skor.toFixed(1)}% (${record.suitability}) untuk ditanam pada
wilayah Kecamatan ${record.kecamatan} dengan karakteristik kondisi lahan di atas.
=====================================================
Laporan ini dihasilkan secara otomatis oleh Sistem Agro-LSTM.`;

    const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Laporan_Agro_${record.id}_${record.kecamatan.replace(/\s+/g, "_")}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Full table CSV export
  const handleExportCSV = () => {
    if (historyList.length === 0) return;
    
    const headers = ["ID", "Kecamatan", "Tanggal", "pH", "Elevasi(mdpl)", "Komoditas", "Skor(%)", "Kelayakan"];
    const rows = historyList.map((r) => [
      r.id,
      r.kecamatan,
      r.tanggal,
      r.ph,
      r.elevasi,
      r.komoditas,
      r.skor,
      r.suitability
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Riwayat_Prediksi_Agro_Lahan.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-stone-50 dark:bg-stone-950 text-stone-800 dark:text-stone-100 min-h-screen">
      <Sidebar />
      <Header title="Riwayat Prediksi" subtitle="Daftar Log Hasil Perhitungan LSTM" />

      {/* Main Content */}
      <main className="ml-0 md:ml-64 pt-20 pb-12 px-4 md:px-8 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Header */}
          <div className="mb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-stone-950 dark:text-white tracking-tight">Log Riwayat Prediksi</h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                Data historis hasil pencarian komoditas pangan optimal di Kabupaten Aceh Utara.
              </p>
            </div>
            
            {isAdmin && (
              <div className="flex space-x-2 shrink-0">
                <button 
                  onClick={handleExportCSV}
                  className="flex items-center px-4 py-2.5 bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-850 hover:bg-stone-50 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm mr-1.5" data-icon="download">download</span>
                  <span>Export CSV</span>
                </button>
              </div>
            )}
            {!isAdmin && (
              <div className="flex items-center space-x-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-500/20 px-4 py-2 rounded-xl">
                <span className="material-symbols-outlined text-amber-600 text-sm" data-icon="lock">lock</span>
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400">Export CSV hanya untuk Admin</span>
              </div>
            )}
          </div>

          {/* Search and filter controls */}
          <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-850 p-4 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-850 rounded-2xl flex items-center px-4 py-2.5 w-full md:w-80 focus-within:ring-2 focus-within:ring-[#006B54]/20 transition-all">
              <span className="material-symbols-outlined text-stone-400 text-sm mr-2" data-icon="search">search</span>
              <input 
                type="text" 
                placeholder="Cari ID, Kecamatan, Tanaman..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none focus:outline-none text-xs w-full placeholder-stone-400 font-medium"
              />
            </div>

            {/* Suitability Tabs */}
            <div className="flex bg-stone-50 dark:bg-stone-950 p-1 rounded-2xl border border-stone-100 dark:border-stone-850 overflow-x-auto">
              {(["Semua", "Sangat Layak", "Layak", "Kurang Layak", "Tidak Layak"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilterTab(tab)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                    filterTab === tab 
                      ? "bg-white dark:bg-stone-900 text-[#006B54] dark:text-[#10b981] shadow-sm" 
                      : "text-stone-500 hover:text-stone-700"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Logs Table */}
          <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-850 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-50 dark:bg-stone-950 text-stone-400 dark:text-stone-500 border-b border-stone-100 dark:border-stone-850">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">ID</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Kecamatan</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Tanggal Eksekusi</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Variabel Lahan (pH/Elev)</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Rekomendasi Utama</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">Tingkat Kecocokan</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-850">
                  {filteredHistory.length > 0 ? (
                    filteredHistory.map((record, idx) => (
                      <tr key={`${record.id}-${idx}`} className="hover:bg-stone-50/50 dark:hover:bg-stone-900/30 transition-colors">
                        <td className="px-6 py-4 text-xs font-bold text-stone-500">{record.id}</td>
                        <td className="px-6 py-4 text-sm font-semibold">{record.kecamatan}</td>
                        <td className="px-6 py-4 text-xs text-stone-400 dark:text-stone-500">{record.tanggal}</td>
                        <td className="px-6 py-4 text-xs">
                          <div className="flex space-x-2 font-mono text-stone-600 dark:text-stone-400 font-bold">
                            <span className="bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-850 px-2 py-0.5 rounded-lg">pH {record.ph.toFixed(1)}</span>
                            <span className="bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-850 px-2 py-0.5 rounded-lg">{record.elevasi}m</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-stone-700 dark:text-stone-300">{record.komoditas}</td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center space-x-1.5">
                            <span className="text-sm font-black font-mono text-[#006B54] dark:text-[#10b981]">{record.skor.toFixed(1)}%</span>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              record.suitability === "Sangat Layak" 
                                ? "bg-emerald-500" 
                                : record.suitability === "Layak" 
                                  ? "bg-amber-500" 
                                  : record.suitability === "Kurang Layak"
                                    ? "bg-amber-500/60"
                                    : "bg-rose-500"
                            }`} />
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {isAdmin ? (
                            <div className="flex justify-center space-x-2">
                              <button 
                                onClick={() => handleDownloadReport(record)}
                                className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 text-[#006B54] dark:text-[#10b981] rounded-lg transition-colors cursor-pointer flex items-center justify-center" 
                                title="Unduh Laporan"
                              >
                                <span className="material-symbols-outlined text-base" data-icon="cloud_download">cloud_download</span>
                              </button>
                              <button 
                                onClick={() => handleDeleteRecord(record.dbId)}
                                className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 rounded-lg transition-colors cursor-pointer flex items-center justify-center" 
                                title="Hapus Riwayat"
                              >
                                <span className="material-symbols-outlined text-base" data-icon="delete">delete</span>
                              </button>
                            </div>
                          ) : (
                            <span className="material-symbols-outlined text-stone-300 dark:text-stone-700 text-base" data-icon="lock" title="Login untuk unduh">lock</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-xs text-stone-400">
                        Tidak ada log riwayat kecocokan dengan filter pencarian tersebut.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            <div className="px-6 py-4 border-t border-stone-100 dark:border-stone-850 flex justify-between items-center text-xs text-stone-500">
              <p>Menampilkan {filteredHistory.length} dari {filteredHistory.length} data riwayat</p>
              <div className="flex space-x-1">
                <button className="px-2.5 py-1 border border-stone-100 dark:border-stone-850 text-stone-400 rounded-lg cursor-not-allowed">Kembali</button>
                <button className="px-3 py-1 bg-[#006B54] text-white rounded-lg font-bold">1</button>
                <button className="px-2.5 py-1 border border-stone-100 dark:border-stone-850 text-stone-400 rounded-lg cursor-not-allowed">Lanjut</button>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
