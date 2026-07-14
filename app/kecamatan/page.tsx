"use client";

import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Kecamatan } from "@/lib/supabase";

export default function Page() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [kecList, setKecList] = useState<Kecamatan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterResiko, setFilterResiko] = useState("Semua");

  const fetchKecamatan = async () => {
    try {
      setIsLoading(true);
      setFetchError("");
      const { data, error } = await supabase
        .from("kecamatan")
        .select("*")
        .order("nama_kecamatan", { ascending: true });

      if (error) throw error;
      setKecList(data || []);
    } catch (err: any) {
      console.error("Gagal mengambil data kecamatan:", err);
      setFetchError("Gagal mengambil data kecamatan: " + err.message);
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
      fetchKecamatan();
    }
  }, [router]);

  useEffect(() => {
    if (!authorized) return;

    const channel = supabase
      .channel("kecamatan_page_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "kecamatan" },
        () => {
          fetchKecamatan();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [authorized]);

  if (!authorized) return null;

  // Filter & Search Logic
  const filteredList = kecList.filter((item) => {
    const matchesSearch = item.nama_kecamatan.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (item.tekstur_tanah && item.tekstur_tanah.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesResiko = filterResiko === "Semua" || item.resiko_bencana === filterResiko;
    return matchesSearch && matchesResiko;
  });

  // Calculate Averages
  const avgElevation = kecList.length > 0 ? kecList.reduce((acc, k) => acc + Number(k.elevasi_mdpl || 0), 0) / kecList.length : 0;
  const avgPh = kecList.length > 0 ? kecList.reduce((acc, k) => acc + Number(k.ph_tanah || 0), 0) / kecList.length : 0;

  return (
    <div className="bg-stone-50 dark:bg-stone-950 text-stone-800 dark:text-stone-100 min-h-screen">
      <Sidebar />
      <Header title="Daftar Kecamatan" subtitle="Data Geografis & Profil Tanah Aceh Utara" />

      {/* Main Content */}
      <main className="ml-64 pt-20 pb-12 px-8 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Page Header */}
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-2xl font-black text-stone-955 dark:text-white tracking-tight">Wilayah & Lahan</h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                Rekaman topografi, keasaman tanah, dan komposisi fisik fraksi tanah per kecamatan.
              </p>
            </div>
          </div>

          {fetchError && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-500/20 text-red-800 dark:text-red-400 p-4 rounded-2xl flex items-center shadow-sm">
              <span className="material-symbols-outlined mr-3 text-red-600">error</span>
              <span className="font-bold text-xs">{fetchError}</span>
            </div>
          )}

          {/* Quick Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 p-6 rounded-3xl shadow-sm flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-[#006B54]/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[#006B54] text-xl">map</span>
              </div>
              <div>
                <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Kecamatan Terdata</p>
                <p className="text-2xl font-black text-stone-900 dark:text-white font-mono">{kecList.length}</p>
                <p className="text-xs text-stone-400">Total wilayah di database</p>
              </div>
            </div>

            <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 p-6 rounded-3xl shadow-sm flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-amber-600 text-xl">terrain</span>
              </div>
              <div>
                <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Rerata Elevasi</p>
                <p className="text-2xl font-black text-stone-900 dark:text-white font-mono">{avgElevation.toFixed(1)} mdpl</p>
                <p className="text-xs text-stone-400">Ketinggian rata-rata wilayah</p>
              </div>
            </div>

            <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 p-6 rounded-3xl shadow-sm flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-emerald-600 text-xl">science</span>
              </div>
              <div>
                <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Rerata pH Tanah</p>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">{avgPh.toFixed(2)}</p>
                <p className="text-xs text-stone-400">Tingkat keasaman tanah rata-rata</p>
              </div>
            </div>
          </div>

          {/* Table Section */}
          <section className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-3xl overflow-hidden shadow-sm">
            
            {/* Table Actions Header */}
            <div className="p-6 border-b border-stone-100 dark:border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              <div className="bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 rounded-2xl flex items-center px-4 py-2.5 w-full md:w-80 focus-within:ring-2 focus-within:ring-[#006B54]/20 transition-all">
                <span className="material-symbols-outlined text-stone-400 text-sm mr-2">search</span>
                <input 
                  type="text" 
                  placeholder="Cari kecamatan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-transparent border-none focus:outline-none text-xs w-full placeholder-stone-400 font-medium"
                />
              </div>

              <select
                value={filterResiko}
                onChange={(e) => setFilterResiko(e.target.value)}
                className="bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 rounded-2xl text-xs py-2.5 px-4 font-semibold text-stone-600 dark:text-stone-300"
              >
                <option value="Semua">Semua Resiko Bencana</option>
                <option value="Rendah">Rendah</option>
                <option value="Tinggi">Tinggi</option>
              </select>
            </div>

            {/* List Table */}
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-3">
                  <div className="w-8 h-8 border-2 border-[#006B54] border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-stone-400">Memuat data...</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-stone-50 dark:bg-stone-950 text-stone-400 dark:text-stone-500 border-b border-stone-100 dark:border-stone-800">
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Kecamatan</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">Elevasi (MDPL)</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">pH Tanah</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">Liat (%)</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">Pasir (%)</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">Debu (%)</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">Tekstur Lahan</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">Curah Hujan (mm/thn)</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">Resiko Bencana</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-850">
                    {filteredList.length > 0 ? (
                      filteredList.map((item) => (
                        <tr key={item.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-900/30 transition-colors">
                          <td className="px-6 py-4 text-sm font-semibold text-stone-900 dark:text-stone-100">{item.nama_kecamatan}</td>
                          <td className="px-6 py-4 text-sm font-mono text-center font-bold">{Number(item.elevasi_mdpl).toFixed(1)}</td>
                          <td className="px-6 py-4 text-sm font-mono text-center font-bold text-[#006B54] dark:text-[#10b981]">{Number(item.ph_tanah).toFixed(2)}</td>
                          <td className="px-6 py-4 text-sm font-mono text-center">{Number(item.tanah_liat).toFixed(1)}%</td>
                          <td className="px-6 py-4 text-sm font-mono text-center">{Number(item.tanah_pasir).toFixed(1)}%</td>
                          <td className="px-6 py-4 text-sm font-mono text-center">{Number(item.tanah_debu).toFixed(1)}%</td>
                          <td className="px-6 py-4 text-sm text-center font-medium text-stone-700 dark:text-stone-300">{item.tekstur_tanah || "N/A"}</td>
                          <td className="px-6 py-4 text-sm font-mono text-center">{item.curah_hujan_tahunan ? Math.round(Number(item.curah_hujan_tahunan)) : "N/A"}</td>
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
                      ))
                    ) : (
                      <tr>
                        <td colSpan={9} className="px-6 py-12 text-center text-xs text-stone-400">
                          Tidak ada data kecamatan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-stone-100 dark:border-stone-800 flex justify-between items-center text-xs text-stone-500">
              <p>Menampilkan {filteredList.length} dari {kecList.length} kecamatan</p>
              <p className="font-mono text-[10px] text-stone-300 dark:text-stone-600">Supabase: kecamatan</p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
