"use client";

import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Page() {
  const router = useRouter();
  const [showNotification, setShowNotification] = useState(true);
  const [totalKecamatan, setTotalKecamatan] = useState<number | string>("…");
  const [totalKomoditas, setTotalKomoditas] = useState<number | string>("…");
  const [totalDataset, setTotalDataset] = useState<number | string>("…");
  const [totalRekomendasi, setTotalRekomendasi] = useState<number | string>("…");
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  const fetchStats = async () => {
    try {
      const { count: kecCount } = await supabase
        .from('kecamatan')
        .select('*', { count: 'exact', head: true });
      if (kecCount !== null) setTotalKecamatan(kecCount);

      const { count: komCount } = await supabase
        .from('komoditas')
        .select('*', { count: 'exact', head: true });
      if (komCount !== null) setTotalKomoditas(komCount);

      const { count: dtCount } = await supabase
        .from('dataset_pelatihan')
        .select('*', { count: 'exact', head: true });
      if (dtCount !== null) setTotalDataset(dtCount);

      const { count: hrCount } = await supabase
        .from('hasil_rekomendasi')
        .select('*', { count: 'exact', head: true });
      if (hrCount !== null) setTotalRekomendasi(hrCount);
    } catch (err) {
      console.error("Failed to fetch dashboard stats:", err);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('hasil_rekomendasi')
        .select(`
          id,
          tanggal_analisis,
          top_komoditas,
          top_score,
          top_kelayakan,
          kecamatan:kecamatan_id (nama_kecamatan)
        `)
        .order('tanggal_analisis', { ascending: false })
        .limit(4);

      if (error) throw error;

      if (data) {
        const formatted = data.map((r: any) => ({
          id: `#AGR-${r.id}`,
          kecamatan: r.kecamatan?.nama_kecamatan || `Kecamatan #${r.kecamatan_id}`,
          komoditas: r.top_komoditas,
          kecocokan: typeof r.top_score === "string" ? `${parseFloat(r.top_score).toFixed(1)}%` : `${Number(r.top_score).toFixed(1)}%`,
          status: "Sukses",
          tanggal: new Date(r.tanggal_analisis).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric"
          })
        }));
        setRecentActivities(formatted);
      }
    } catch (err) {
      console.error("Failed to fetch recent activities:", err);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("admin_logged_in") !== "true") {
      router.push("/login");
      return;
    }

    fetchStats();
    fetchRecentActivities();

    const channel = supabase
      .channel('dashboard_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'hasil_rekomendasi' },
        () => {
          fetchStats();
          fetchRecentActivities();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'kecamatan' },
        () => {
          fetchStats();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'komoditas' },
        () => {
          fetchStats();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'dataset_pelatihan' },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  return (
    <div className="bg-stone-50 dark:bg-stone-950 text-stone-800 dark:text-stone-100 min-h-screen">
      <Sidebar />
      <Header title="Dashboard" subtitle="Sistem Informasi Rekomendasi Tanaman Pangan" />
      
      {/* Main Content */}
      <main className="ml-64 pt-20 pb-12 px-8 min-h-screen transition-all">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Welcome Notification */}
          {showNotification && (
            <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/20 text-emerald-800 dark:text-emerald-400 p-4 rounded-2xl flex items-center justify-between shadow-sm animate-fade-in">
              <div className="flex items-center space-x-3">
                <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400" data-icon="energy_savings_leaf">energy_savings_leaf</span>
                <div>
                  <span className="font-bold text-sm">Sistem LSTM Siap Beroperasi:</span>
                  <span className="text-xs ml-2 opacity-95">Model prediksi cuaca dan kecocokan lahan telah dikalibrasi untuk wilayah Aceh Utara.</span>
                </div>
              </div>
              <button 
                onClick={() => setShowNotification(false)}
                className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-200 transition-colors"
              >
                <span className="material-symbols-outlined text-lg" data-icon="close">close</span>
              </button>
            </div>
          )}

          {/* Welcome Header */}
          <section className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-850 p-8 rounded-3xl relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#006B54]/5 to-transparent rounded-bl-full pointer-events-none"></div>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2">
                <p className="text-[#006B54] dark:text-[#10b981] font-bold text-xs uppercase tracking-widest font-mono">
                  Sistem Cerdas Rekomendasi Agronomi
                </p>
                <h1 className="text-3xl font-extrabold text-stone-955 dark:text-white tracking-tight leading-tight">
                  Selamat Datang di Portal AI-LSTM Tanaman Pangan
                </h1>
                <p className="text-stone-500 dark:text-stone-400 text-sm max-w-2xl leading-relaxed">
                  Platform digital cerdas yang memadukan pemodelan cuaca runtun waktu <strong>Long Short-Term Memory (LSTM)</strong> dan algoritma klasifikasi saraf tiruan guna merekomendasikan komoditas pertanian pangan paling optimal di wilayah Kabupaten Aceh Utara.
                </p>
              </div>
              <div className="flex space-x-3 shrink-0">
                <Link
                  href="/prediksi"
                  className="bg-[#006B54] hover:bg-[#00513f] text-white px-6 py-3 rounded-2xl font-bold flex items-center space-x-2 transition-all shadow-md shadow-[#006B54]/10 active:scale-95 text-sm"
                >
                  <span className="material-symbols-outlined text-base" data-icon="analytics">analytics</span>
                  <span>Mulai Analisis Prediksi</span>
                </Link>
              </div>
            </div>
          </section>

          {/* Statistics Grid */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Total Kecamatan */}
            <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-850 p-6 rounded-3xl shadow-sm flex flex-col justify-between min-h-[160px] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-stone-50 dark:bg-stone-800/20 rounded-bl-full pointer-events-none"></div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">Kecamatan Terdata</span>
                <span className="material-symbols-outlined text-[#006B54] bg-[#006B54]/5 p-2 rounded-xl text-lg" data-icon="map">map</span>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-black text-stone-900 dark:text-white font-mono">{totalKecamatan} Wilayah</div>
                <p className="text-[#006B54] font-semibold text-xs mt-1 flex items-center space-x-1">
                  <span>Kecamatan di Aceh Utara</span>
                </p>
              </div>
            </div>

            {/* Total Komoditas */}
            <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-850 p-6 rounded-3xl shadow-sm flex flex-col justify-between min-h-[160px] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-stone-50 dark:bg-stone-800/20 rounded-bl-full pointer-events-none"></div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">Total Komoditas</span>
                <span className="material-symbols-outlined text-amber-600 bg-amber-500/5 p-2 rounded-xl text-lg" data-icon="eco">eco</span>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-black text-stone-900 dark:text-white font-mono">{totalKomoditas} Tanaman</div>
                <p className="text-amber-600 font-semibold text-xs mt-1">
                  <span>Komoditas pangan acuan</span>
                </p>
              </div>
            </div>

            {/* Total Dataset Pelatihan */}
            <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-850 p-6 rounded-3xl shadow-sm flex flex-col justify-between min-h-[160px] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-stone-50 dark:bg-stone-800/20 rounded-bl-full pointer-events-none"></div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">Dataset Pelatihan</span>
                <span className="material-symbols-outlined text-blue-600 bg-blue-500/5 p-2 rounded-xl text-lg" data-icon="database">database</span>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-black text-stone-900 dark:text-white font-mono">{totalDataset} Baris</div>
                <p className="text-blue-600 font-semibold text-xs mt-1">
                  <span>Data latih terintegrasi</span>
                </p>
              </div>
            </div>

            {/* Total Hasil Rekomendasi */}
            <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-850 p-6 rounded-3xl shadow-sm flex flex-col justify-between min-h-[160px] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-stone-50 dark:bg-stone-800/20 rounded-bl-full pointer-events-none"></div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">Hasil Rekomendasi</span>
                <span className="material-symbols-outlined text-emerald-600 bg-emerald-500/5 p-2 rounded-xl text-lg" data-icon="insights">insights</span>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-black text-stone-900 dark:text-white font-mono">{totalRekomendasi} Analisis</div>
                <p className="text-emerald-600 font-semibold text-xs mt-1">
                  <span>Prediksi & rekomendasi selesai</span>
                </p>
              </div>
            </div>

          </section>

          {/* Environmental Insight and Gauge */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Circular Soil Gauge */}
            <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-850 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-1">Kesehatan Lahan</h3>
                <p className="text-sm font-bold text-stone-700 dark:text-stone-300">Rerata Indeks Kelembapan & pH</p>
              </div>
              <div className="flex flex-col items-center py-6">
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle className="text-stone-100 dark:text-stone-800" cx="72" cy="72" fill="transparent" r="58" stroke="currentColor" strokeWidth="8"></circle>
                    <circle className="text-[#006B54]" cx="72" cy="72" fill="transparent" r="58" stroke="currentColor" strokeDasharray="364.4" strokeDashoffset="43.7" strokeWidth="8" strokeLinecap="round"></circle>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-stone-955 dark:text-white font-mono">88%</span>
                    <span className="text-[9px] uppercase font-bold text-[#006B54] bg-[#006B54]/5 px-2 py-0.5 rounded-full mt-1">Optimal</span>
                  </div>
                </div>
                <p className="text-center text-xs text-stone-500 dark:text-stone-400 mt-4 max-w-[200px]">
                  Kondisi pH tanah (6.2 - 6.8) dan curah hujan harian di Aceh Utara stabil.
                </p>
              </div>
            </div>

            {/* Quick Informational Guide */}
            <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-850 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-1">Panduan Penggunaan</h3>
                <p className="text-sm font-bold text-stone-700 dark:text-stone-300">3 Langkah Mudah Rekomendasi</p>
              </div>
              <div className="space-y-4 my-4 flex-1 flex flex-col justify-center">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-[#006B54]/10 text-[#006B54] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</div>
                  <div className="text-xs">
                    <p className="font-bold text-stone-800 dark:text-stone-200">Pilih / Input Kecamatan</p>
                    <p className="text-stone-500 dark:text-stone-400">Masuk ke menu Prediksi dan tentukan subdistrik lahan.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-[#006B54]/10 text-[#006B54] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</div>
                  <div className="text-xs">
                    <p className="font-bold text-stone-800 dark:text-stone-200">Analisis Iklim LSTM</p>
                    <p className="text-stone-500 dark:text-stone-400">Sistem memprediksi tren suhu, kelembapan, curah hujan 7 hari ke depan.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-[#006B54]/10 text-[#006B54] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</div>
                  <div className="text-xs">
                    <p className="font-bold text-stone-800 dark:text-stone-200">Lihat Rekomendasi Tanaman</p>
                    <p className="text-stone-500 dark:text-stone-400">Terima kecocokan varietas unggul beserta alasan saintifiknya.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick CTA Premium Panel */}
            <div className="bg-[#006B54] text-white p-6 rounded-3xl flex flex-col justify-between shadow-md relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
                <span className="material-symbols-outlined text-9xl" data-icon="eco">eco</span>
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 font-mono">Tesis Pertanian Modern</span>
                <h3 className="text-xl font-bold leading-snug">Implementasi Pembelajaran Mendalam (Deep Learning)</h3>
                <p className="text-xs leading-relaxed opacity-90">
                  Model LSTM meramalkan faktor klimatologi multivariat guna meminimalisir kegagalan panen akibat anomali cuaca.
                </p>
              </div>
              <div className="mt-6 flex justify-between items-center bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10">
                <span className="text-[10px] font-medium opacity-90">Versi Model: 3.1.2-Stable</span>
                <span className="material-symbols-outlined text-sm" data-icon="verified_user">verified_user</span>
              </div>
            </div>

          </section>

          {/* Recent History Table */}
          <section className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-850 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-stone-100 dark:border-stone-850 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-stone-955 dark:text-white">Analisis Prediksi Terbaru</h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">Riwayat eksekusi pencarian komoditas pangan</p>
              </div>
              <Link 
                href="/hasil-rekomendasi" 
                className="text-[#006B54] dark:text-[#10b981] text-xs font-bold hover:underline flex items-center space-x-1"
              >
                <span>Lihat Semua Rekomendasi</span>
                <span className="material-symbols-outlined text-xs" data-icon="arrow_forward">arrow_forward</span>
              </Link>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-50 dark:bg-stone-950 text-stone-400 dark:text-stone-500 border-b border-stone-100 dark:border-stone-850">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">ID</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Kecamatan</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Komoditas Rekomendasi</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Kecocokan</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Tanggal</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-850">
                  {recentActivities.length > 0 ? (
                    recentActivities.map((act) => (
                      <tr key={act.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-900/30 transition-colors">
                        <td className="px-6 py-4 text-xs font-bold text-stone-500 dark:text-stone-400">{act.id}</td>
                        <td className="px-6 py-4 text-sm font-semibold">{act.kecamatan}</td>
                        <td className="px-6 py-4 text-sm text-stone-700 dark:text-stone-300">{act.komoditas}</td>
                        <td className="px-6 py-4 text-sm font-mono font-bold text-[#006B54] dark:text-[#10b981]">{act.kecocokan}</td>
                        <td className="px-6 py-4 text-xs text-stone-500 dark:text-stone-400">{act.tanggal}</td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10">
                            {act.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-xs text-stone-400">
                        Belum ada riwayat hasil rekomendasi di database.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
