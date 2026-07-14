"use client";

import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface HasilRekomendasiData {
  id: number;
  kecamatan_id: number;
  tanggal_analisis: string;
  prediksi_iklim: any;
  profil_wilayah: any;
  rekomendasi: any;
  top_komoditas: string;
  top_score: number | string;
  top_kelayakan: string;
  penjelasan: string | null;
  sumber: string | null;
  created_at: string;
  kecamatan?: {
    id: number;
    nama_kecamatan: string;
  };
}

export default function Page() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [historyList, setHistoryList] = useState<HasilRekomendasiData[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<HasilRekomendasiData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchHistory = async (autoSelect = false) => {
    try {
      setIsLoading(true);
      setFetchError("");
      const { data, error } = await supabase
        .from("hasil_rekomendasi")
        .select(`
          *,
          kecamatan:kecamatan_id (
            id,
            nama_kecamatan
          )
        `)
        .order("tanggal_analisis", { ascending: false });

      if (error) throw error;

      const list = data || [];
      setHistoryList(list);

      if (list.length > 0) {
        if (autoSelect || !selectedRecord) {
          setSelectedRecord(list[0]);
        } else {
          // Keep current selection updated if it still exists
          const current = list.find((item) => item.id === selectedRecord.id);
          setSelectedRecord(current || list[0]);
        }
      } else {
        setSelectedRecord(null);
      }
    } catch (err: any) {
      console.error("Gagal mengambil riwayat rekomendasi:", err);
      setFetchError("Gagal mengambil riwayat: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const isAdmin = localStorage.getItem("admin_logged_in") === "true";
    if (!isAdmin) {
      router.push("/login");
    } else {
      setAuthorized(true);
      fetchHistory(true);
    }
  }, [router]);

  useEffect(() => {
    if (!authorized) return;

    const channel = supabase
      .channel("hasil_rekomendasi_page_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "hasil_rekomendasi" },
        () => {
          fetchHistory(false);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [authorized]);

  if (!authorized) return null;

  // Filter list by search term
  const filteredList = historyList.filter((item) => {
    const kecName = item.kecamatan?.nama_kecamatan || `Kecamatan #${item.kecamatan_id}`;
    return kecName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           item.top_komoditas.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="bg-stone-50 dark:bg-stone-955 text-stone-800 dark:text-stone-100 min-h-screen">
      <Sidebar />
      <Header title="Hasil Rekomendasi" subtitle="Hasil Evaluasi LSTM & Peringkat Komoditas Terbaik" />

      {/* Main Content */}
      <main className="ml-64 pt-20 pb-12 px-8 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Page Title */}
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-2xl font-black text-stone-955 dark:text-white tracking-tight">Evaluasi & Peringkat Komoditas</h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                Lihat peringkat kecocokan seluruh komoditas pertanian pangan yang dihitung oleh model cerdas.
              </p>
            </div>
          </div>

          {fetchError && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-500/20 text-red-800 dark:text-red-400 p-4 rounded-2xl flex items-center shadow-sm">
              <span className="material-symbols-outlined mr-3 text-red-600">error</span>
              <span className="font-bold text-xs">{fetchError}</span>
            </div>
          )}

          {isLoading && historyList.length === 0 ? (
            <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-850 rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[460px] shadow-sm animate-pulse">
              <div className="w-16 h-16 rounded-full border-4 border-t-[#006B54] border-stone-100 dark:border-stone-800 animate-spin mb-6" />
              <h4 className="text-lg font-black text-stone-950 dark:text-white">Memuat Hasil Rekomendasi...</h4>
            </div>
          ) : historyList.length === 0 ? (
            <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-850 rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[460px] shadow-sm">
              <div className="w-20 h-20 bg-stone-50 dark:bg-stone-800/40 rounded-full flex items-center justify-center text-[#006B54] mb-6">
                <span className="material-symbols-outlined text-4xl">search_off</span>
              </div>
              <h4 className="text-lg font-black text-stone-900 dark:text-white">Belum Ada Hasil Rekomendasi</h4>
              <p className="text-xs text-stone-400 max-w-sm mt-2 leading-relaxed">
                Silakan jalankan prediksi di menu 'Prediksi LSTM' terlebih dahulu untuk menghasilkan rekomendasi komoditas.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
              
              {/* Sidebar List (Left) */}
              <div className="lg:col-span-4 space-y-4">
                
                {/* Search in sidebar list */}
                <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 p-4 rounded-3xl shadow-sm space-y-3">
                  <span className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest block">Cari Hasil Rekomendasi</span>
                  <div className="bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 rounded-2xl flex items-center px-3 py-2">
                    <span className="material-symbols-outlined text-stone-400 text-sm mr-2">search</span>
                    <input 
                      type="text" 
                      placeholder="Kecamatan, komoditas..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-transparent border-none focus:outline-none text-xs w-full placeholder-stone-400 font-medium"
                    />
                  </div>
                </div>

                {/* Sidebar list items */}
                <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-3xl p-4 shadow-sm max-h-[500px] overflow-y-auto space-y-2">
                  {filteredList.map((item) => {
                    const isSelected = selectedRecord?.id === item.id;
                    const name = item.kecamatan?.nama_kecamatan || `Kecamatan #${item.kecamatan_id}`;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setSelectedRecord(item)}
                        className={`w-full text-left p-3 rounded-2xl transition-all border flex flex-col justify-between ${
                          isSelected
                            ? "bg-[#006B54]/10 border-[#006B54]/30 text-[#006B54] dark:bg-[#10b981]/15 dark:text-[#10b981]"
                            : "bg-transparent border-stone-50 dark:border-stone-850 hover:bg-stone-50 dark:hover:bg-stone-950"
                        }`}
                      >
                        <div className="flex justify-between items-start w-full">
                          <span className="font-bold text-xs truncate max-w-[150px]">{name}</span>
                          <span className="text-[9px] font-mono opacity-60">
                            {new Date(item.tanggal_analisis).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short"
                            })}
                          </span>
                        </div>
                        <div className="flex justify-between items-center w-full mt-2">
                          <span className={`text-[10px] font-semibold ${isSelected ? "text-stone-800 dark:text-stone-200" : "text-stone-500"}`}>
                            {item.top_komoditas}
                          </span>
                          <span className="text-[10px] font-mono font-bold">{Number(item.top_score).toFixed(1)}%</span>
                        </div>
                      </button>
                    );
                  })}
                  {filteredList.length === 0 && (
                    <p className="text-center text-[10px] text-stone-400 py-6">Hasil pencarian kosong.</p>
                  )}
                </div>

              </div>

              {/* Detailed View (Right) */}
              <div className="lg:col-span-8 space-y-6">
                {selectedRecord ? (
                  <div className="space-y-6">
                    
                    {/* Header Summary */}
                    <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 p-6 rounded-3xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#006B54]/5 to-transparent rounded-bl-full pointer-events-none" />
                      <div>
                        <span className="text-[9px] font-mono uppercase bg-[#006B54]/10 text-[#006B54] dark:text-[#10b981] px-2 py-0.5 rounded-md font-bold">
                          ID: #AGR-{selectedRecord.id}
                        </span>
                        <h3 className="text-xl font-black text-stone-900 dark:text-white mt-2">
                          Kecamatan {selectedRecord.kecamatan?.nama_kecamatan || `Kecamatan #${selectedRecord.kecamatan_id}`}
                        </h3>
                        <p className="text-[10px] text-stone-400 mt-1">
                          Waktu Analisis: {new Date(selectedRecord.tanggal_analisis).toLocaleString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </p>
                      </div>

                      <div className="bg-emerald-50 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-500/10 text-right shrink-0">
                        <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">Komoditas Terbaik</span>
                        <span className="text-lg font-black text-stone-900 dark:text-white block mt-0.5">{selectedRecord.top_komoditas}</span>
                        <span className="text-xs font-mono font-bold text-[#006B54] dark:text-[#10b981]">{Number(selectedRecord.top_score).toFixed(1)}% ({selectedRecord.top_kelayakan})</span>
                      </div>
                    </div>

                    {/* Inputs Characteristics Used */}
                    <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 p-6 rounded-3xl shadow-sm space-y-4">
                      <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest">Karakteristik Lahan Terpakai</h4>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-xs">
                        <div className="bg-stone-50 dark:bg-stone-950 p-3 rounded-2xl border border-stone-100 dark:border-stone-800">
                          <span className="text-stone-400 block font-bold uppercase tracking-wider text-[8px]">pH Tanah</span>
                          <span className="text-sm font-black font-mono mt-1 block">{selectedRecord.profil_wilayah?.ph || "N/A"}</span>
                        </div>
                        <div className="bg-stone-50 dark:bg-stone-950 p-3 rounded-2xl border border-stone-100 dark:border-stone-800">
                          <span className="text-stone-400 block font-bold uppercase tracking-wider text-[8px]">Elevasi</span>
                          <span className="text-sm font-black font-mono mt-1 block">{selectedRecord.profil_wilayah?.elevasi || "N/A"} mdpl</span>
                        </div>
                        <div className="bg-stone-50 dark:bg-stone-950 p-3 rounded-2xl border border-stone-100 dark:border-stone-800">
                          <span className="text-stone-400 block font-bold uppercase tracking-wider text-[8px]">Kadar Liat</span>
                          <span className="text-sm font-black font-mono mt-1 block">{selectedRecord.profil_wilayah?.tanah_liat || "N/A"}%</span>
                        </div>
                        <div className="bg-stone-50 dark:bg-stone-950 p-3 rounded-2xl border border-stone-100 dark:border-stone-800">
                          <span className="text-stone-400 block font-bold uppercase tracking-wider text-[8px]">Kadar Pasir</span>
                          <span className="text-sm font-black font-mono mt-1 block">{selectedRecord.profil_wilayah?.tanah_pasir || "N/A"}%</span>
                        </div>
                        <div className="bg-stone-50 dark:bg-stone-950 p-3 rounded-2xl border border-stone-100 dark:border-stone-800">
                          <span className="text-stone-400 block font-bold uppercase tracking-wider text-[8px]">Kadar Debu</span>
                          <span className="text-sm font-black font-mono mt-1 block">{selectedRecord.profil_wilayah?.tanah_debu || "N/A"}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Narrative Explanation */}
                    {selectedRecord.penjelasan && (
                      <div className="bg-[#006B54]/5 border border-[#006B54]/10 rounded-3xl p-6">
                        <div className="flex items-start space-x-4">
                          <div className="w-10 h-10 rounded-2xl bg-[#006B54]/10 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[#006B54]" data-icon="auto_awesome">auto_awesome</span>
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-[#006B54] uppercase tracking-wider mb-2">Justifikasi Agronomi AI</h4>
                            <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed font-medium">
                              {selectedRecord.penjelasan}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Commodities Rankings (Requirement 6) */}
                    <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-3xl overflow-hidden shadow-sm">
                      <div className="p-6 border-b border-stone-100 dark:border-stone-800">
                        <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest">Peringkat Komoditas Lengkap</h4>
                      </div>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-stone-50 dark:bg-stone-950 text-stone-400 dark:text-stone-500 border-b border-stone-100 dark:border-stone-800">
                              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">Peringkat</th>
                              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Komoditas</th>
                              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">Skor Kecocokan</th>
                              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">Visual Persentase</th>
                              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">Kelayakan</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-100 dark:divide-stone-850">
                            {Array.isArray(selectedRecord.rekomendasi) ? (
                              selectedRecord.rekomendasi
                                .sort((a: any, b: any) => b.score - a.score)
                                .map((crop: any, index: number) => {
                                  const score = Number(crop.score || crop.skor || 0);
                                  const kelayakan = crop.kelayakan || crop.suitability || "Layak";
                                  return (
                                    <tr key={index} className="hover:bg-stone-50/50 dark:hover:bg-stone-900/30 transition-colors">
                                      <td className="px-6 py-4 text-xs font-bold text-stone-400 text-center">{index + 1}</td>
                                      <td className="px-6 py-4 text-sm font-semibold text-stone-900 dark:text-stone-100">{crop.komoditas || crop.name}</td>
                                      <td className="px-6 py-4 text-sm font-mono text-center font-bold text-[#006B54] dark:text-[#10b981]">{score.toFixed(1)}%</td>
                                      <td className="px-6 py-4">
                                        <div className="w-full bg-stone-100 dark:bg-stone-800 h-2 rounded-full overflow-hidden">
                                          <div className="bg-[#006B54] h-full rounded-full" style={{ width: `${score}%` }}></div>
                                        </div>
                                      </td>
                                      <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                          kelayakan === "Sangat Layak"
                                            ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10"
                                            : kelayakan === "Layak"
                                              ? "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border border-blue-500/10"
                                              : kelayakan === "Kurang Layak"
                                                ? "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-500/10"
                                                : "bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-500/10"
                                        }`}>
                                          {kelayakan}
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                })
                            ) : (
                              <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-xs text-stone-400">
                                  Format data rekomendasi tidak valid.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-850 rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[460px] shadow-sm">
                    <p className="text-stone-400 text-sm">Pilih rekaman di panel kiri untuk melihat rincian.</p>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      </main>
    </div>
  );
}
