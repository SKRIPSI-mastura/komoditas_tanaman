"use client";

import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Komoditas } from "@/lib/supabase";

export default function Page() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [komList, setKomList] = useState<Komoditas[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchKomoditas = async () => {
    try {
      setIsLoading(true);
      setFetchError("");
      const { data, error } = await supabase
        .from("komoditas")
        .select("*")
        .order("nama_komoditas", { ascending: true });

      if (error) throw error;
      setKomList(data || []);
    } catch (err: any) {
      console.error("Gagal mengambil data komoditas:", err);
      setFetchError("Gagal mengambil data komoditas: " + err.message);
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
      fetchKomoditas();
    }
  }, [router]);

  useEffect(() => {
    if (!authorized) return;

    const channel = supabase
      .channel("komoditas_page_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "komoditas" },
        () => {
          fetchKomoditas();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [authorized]);

  if (!authorized) return null;

  // Filter & Search Logic
  const filteredList = komList.filter((item) => {
    return item.nama_komoditas.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (item.deskripsi && item.deskripsi.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  return (
    <div className="bg-stone-50 dark:bg-stone-950 text-stone-800 dark:text-stone-100 min-h-screen">
      <Sidebar />
      <Header title="Daftar Komoditas" subtitle="Acuan Budidaya Tanaman Pangan" />

      {/* Main Content */}
      <main className="ml-0 md:ml-64 pt-20 pb-12 px-4 md:px-8 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Page Header */}
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-2xl font-black text-stone-955 dark:text-white tracking-tight">Kriteria Agronomi Komoditas</h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                Batas ambang ideal cuaca dan karakteristik fisik tanah untuk optimalisasi pertumbuhan tanaman pangan.
              </p>
            </div>
          </div>

          {fetchError && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-500/20 text-red-800 dark:text-red-400 p-4 rounded-2xl flex items-center shadow-sm">
              <span className="material-symbols-outlined mr-3 text-red-600">error</span>
              <span className="font-bold text-xs">{fetchError}</span>
            </div>
          )}

          {/* Table Section */}
          <section className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-3xl overflow-hidden shadow-sm">
            
            {/* Table Actions Header */}
            <div className="p-6 border-b border-stone-100 dark:border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 rounded-2xl flex items-center px-4 py-2.5 w-full md:w-80 focus-within:ring-2 focus-within:ring-[#006B54]/20 transition-all">
                <span className="material-symbols-outlined text-stone-400 text-sm mr-2">search</span>
                <input 
                  type="text" 
                  placeholder="Cari komoditas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-transparent border-none focus:outline-none text-xs w-full placeholder-stone-400 font-medium"
                />
              </div>
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
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Nama Komoditas</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Deskripsi</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">Suhu Ideal (°C)</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">Hujan Ideal (mm)</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">Kelembapan (%)</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">pH Ideal</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">Elevasi (MDPL)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-850">
                    {filteredList.length > 0 ? (
                      filteredList.map((item) => (
                        <tr key={item.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-900/30 transition-colors">
                          <td className="px-6 py-4 text-sm font-bold text-stone-900 dark:text-stone-100">{item.nama_komoditas}</td>
                          <td className="px-6 py-4 text-xs text-stone-500 dark:text-stone-400 max-w-sm leading-relaxed">{item.deskripsi || "Tidak ada deskripsi"}</td>
                          <td className="px-6 py-4 text-sm font-mono text-center font-bold">{item.suhu_min_c} - {item.suhu_max_c}</td>
                          <td className="px-6 py-4 text-sm font-mono text-center font-bold text-[#006B54] dark:text-[#10b981]">{item.curah_hujan_min_mm} - {item.curah_hujan_max_mm}</td>
                          <td className="px-6 py-4 text-sm font-mono text-center">{item.kelembapan_min_persen} - {item.kelembapan_max_persen}%</td>
                          <td className="px-6 py-4 text-sm font-mono text-center">{item.ph_min} - {item.ph_max}</td>
                          <td className="px-6 py-4 text-sm font-mono text-center">{item.elevasi_min_mdpl} - {item.elevasi_max_mdpl}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-xs text-stone-400">
                          Tidak ada data komoditas.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-stone-100 dark:border-stone-800 flex justify-between items-center text-xs text-stone-500">
              <p>Menampilkan {filteredList.length} dari {komList.length} komoditas</p>
              <p className="font-mono text-[10px] text-stone-300 dark:text-stone-600">Supabase: komoditas</p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
