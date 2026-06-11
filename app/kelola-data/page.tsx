"use client";

import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface KecamatanData {
  kecamatan: string;
  elevasi_mdpl: number;
  ph_tanah_mean: number;
  curah_hujan_tahunan: number;
  tanah_liat: number;
  tanah_pasir: number;
  tanah_debu: number;
  resiko_bencana: string;
}

export default function Page() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [dataList, setDataList] = useState<KecamatanData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    const isAdmin = localStorage.getItem("admin_logged_in") === "true";
    if (!isAdmin) {
      router.push("/login");
    } else {
      setAuthorized(true);
      fetchData();
    }
  }, [router]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/kelola-data`);
      const json = await res.json();
      if (json.status === "success") {
        setDataList(json.data);
      }
    } catch (error) {
      console.warn("Gagal mengambil data dari server:", error);
      setFetchError("Gagal terhubung ke server backend. Pastikan server Python sedang berjalan.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!authorized) {
    return null; // Prevents FOUC
  }

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

          {fetchError && (
            <div className="bg-red-50 border border-red-500/20 text-red-800 p-4 rounded-2xl flex items-center shadow-sm">
              <span className="material-symbols-outlined mr-3 text-red-600">error</span>
              <span className="font-bold text-xs">{fetchError}</span>
            </div>
          )}

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
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Kecamatan</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">Elevasi (MDPL)</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">pH Tanah</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">Curah Hujan (mm)</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">Liat %</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">Pasir %</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">Debu %</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">Resiko Bencana</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-850">
                  {dataList.map((item, index) => (
                    <tr key={index} className="hover:bg-stone-50/50 dark:hover:bg-stone-900/30 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-stone-900 dark:text-stone-100">{item.kecamatan}</td>
                      <td className="px-6 py-4 text-sm font-mono text-center font-bold">{isNaN(Number(item.elevasi_mdpl)) ? "N/A" : Number(item.elevasi_mdpl).toFixed(1)}</td>
                      <td className="px-6 py-4 text-sm font-mono text-center font-bold text-[#006B54] dark:text-[#10b981]">{isNaN(Number(item.ph_tanah_mean)) ? "N/A" : Number(item.ph_tanah_mean).toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm font-mono text-center">{isNaN(Number(item.curah_hujan_tahunan)) ? "N/A" : Math.round(Number(item.curah_hujan_tahunan))}</td>
                      <td className="px-6 py-4 text-sm font-mono text-center">{isNaN(Number(item.tanah_liat)) ? "N/A" : Number(item.tanah_liat).toFixed(1)}</td>
                      <td className="px-6 py-4 text-sm font-mono text-center">{isNaN(Number(item.tanah_pasir)) ? "N/A" : Number(item.tanah_pasir).toFixed(1)}</td>
                      <td className="px-6 py-4 text-sm font-mono text-center text-stone-700 dark:text-stone-300">{isNaN(Number(item.tanah_debu)) ? "N/A" : Number(item.tanah_debu).toFixed(1)}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.resiko_bencana === "Rendah"
                            ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10"
                            : "bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-500/10"
                        }`}>
                          {item.resiko_bencana}
                        </span>
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
