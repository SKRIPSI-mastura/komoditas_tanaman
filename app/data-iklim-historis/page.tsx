"use client";

import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface ClimateData {
  id: number;
  kecamatan: string;
  date: string;
  suhu_rata_rata: number;
  suhu_maksimum: number;
  suhu_minimum: number;
  kelembapan_udara: number;
  kecepatan_angin: number;
  curah_hujan: number;
  created_at?: string;
}

export default function Page() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [kecamatanList, setKecamatanList] = useState<string[]>([]);
  const [selectedKec, setSelectedKec] = useState("");
  const [climateList, setClimateList] = useState<ClimateData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [activeTab, setActiveTab] = useState<"suhu" | "kelembapan" | "hujan">("suhu");

  useEffect(() => {
    const isAdmin = localStorage.getItem("admin_logged_in") === "true";
    if (!isAdmin) {
      router.push("/login");
    } else {
      setAuthorized(true);
      fetchKecamatan();
    }
  }, [router]);

  const fetchKecamatan = async () => {
    try {
      const { data, error } = await supabase
        .from("kecamatan")
        .select("nama_kecamatan")
        .order("nama_kecamatan", { ascending: true });

      if (error) throw error;
      const list = (data || []).map((item) => item.nama_kecamatan);
      setKecamatanList(list);
      if (list.length > 0) {
        setSelectedKec(list[0]);
      } else {
        setIsLoading(false);
      }
    } catch (err: any) {
      console.error("Gagal mengambil daftar kecamatan:", err);
      setFetchError("Gagal terhubung ke database. " + err.message);
      setIsLoading(false);
    }
  };

  const fetchClimateData = async (kec: string) => {
    if (!kec) return;
    try {
      setIsLoading(true);
      setFetchError("");
      const { data, error } = await supabase
        .from("data_iklim_historis")
        .select("*")
        .eq("kecamatan", kec)
        .order("date", { ascending: true })
        .limit(100);

      if (error) throw error;
      setClimateList(data || []);
    } catch (err: any) {
      console.error("Gagal mengambil data iklim:", err);
      setFetchError("Gagal mengambil data iklim: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedKec) {
      fetchClimateData(selectedKec);
    }
  }, [selectedKec]);

  if (!authorized) return null;

  // Calculate averages
  const avgStats = {
    suhu: climateList.length > 0 ? climateList.reduce((acc, c) => acc + (c.suhu_rata_rata || 0), 0) / climateList.length : 0,
    kelembapan: climateList.length > 0 ? climateList.reduce((acc, c) => acc + (c.kelembapan_udara || 0), 0) / climateList.length : 0,
    hujan: climateList.length > 0 ? climateList.reduce((acc, c) => acc + (c.curah_hujan || 0), 0) / climateList.length : 0,
  };

  // Convert array to SVG path for graphing
  const getSvgPath = (data: number[], minVal: number, maxVal: number) => {
    if (data.length <= 1) return "";
    const width = 680;
    const height = 180;
    const stepX = width / (data.length - 1);
    const range = maxVal - minVal === 0 ? 1 : maxVal - minVal;
    
    return data.map((val, idx) => {
      const x = idx * stepX;
      const ratio = (val - minVal) / range;
      const y = height - ratio * height * 0.8 - height * 0.1;
      return `${idx === 0 ? "M" : "L"} ${x} ${y}`;
    }).join(" ");
  };

  const getSvgGradientPath = (data: number[], minVal: number, maxVal: number) => {
    const width = 680;
    const height = 180;
    const linePath = getSvgPath(data, minVal, maxVal);
    if (!linePath) return "";
    return `${linePath} L ${width} ${height} L 0 ${height} Z`;
  };

  const suhuData = climateList.map(c => c.suhu_rata_rata || 0);
  const kelembapanData = climateList.map(c => c.kelembapan_udara || 0);
  const curahHujanData = climateList.map(c => c.curah_hujan || 0);

  const minSuhu = Math.min(...suhuData, 20);
  const maxSuhu = Math.max(...suhuData, 35);
  const minKelembapan = Math.min(...kelembapanData, 40);
  const maxKelembapan = Math.max(...kelembapanData, 100);
  const minHujan = Math.min(...curahHujanData, 0);
  const maxHujan = Math.max(...curahHujanData, 500);

  return (
    <div className="bg-stone-50 dark:bg-stone-950 text-stone-800 dark:text-stone-100 min-h-screen">
      <Sidebar />
      <Header title="Data Iklim Historis" subtitle="Visualisasi & Tren Klimatologi Wilayah" />

      {/* Main Content */}
      <main className="ml-64 pt-20 pb-12 px-8 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Page Header & Kecamatan Selector */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-stone-955 dark:text-white tracking-tight">Tren Klimatologi Wilayah</h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                Pantau rekaman data cuaca historis berupa suhu, kelembapan, dan curah hujan bulanan di Aceh Utara.
              </p>
            </div>
            
            <div className="flex items-center space-x-2 shrink-0">
              <span className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider shrink-0">Pilih Kecamatan:</span>
              <select
                value={selectedKec}
                onChange={(e) => setSelectedKec(e.target.value)}
                className="bg-white dark:bg-stone-900 border border-stone-150 dark:border-stone-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006B54]/20 text-xs py-2 px-3 transition-all font-bold text-[#006B54] dark:text-[#10b981]"
              >
                {kecamatanList.map((kec) => (
                  <option key={kec} value={kec}>{kec}</option>
                ))}
              </select>
            </div>
          </div>

          {fetchError && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-500/20 text-red-800 dark:text-red-400 p-4 rounded-2xl flex items-center shadow-sm">
              <span className="material-symbols-outlined mr-3 text-red-600">error</span>
              <span className="font-bold text-xs">{fetchError}</span>
            </div>
          )}

          {/* Main Visualizations */}
          {isLoading ? (
            <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-850 rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[400px] shadow-sm animate-pulse">
              <div className="w-16 h-16 rounded-full border-4 border-t-[#006B54] border-stone-100 dark:border-stone-800 animate-spin mb-6" />
              <h4 className="text-lg font-black text-stone-955 dark:text-white">Memuat Data Historis...</h4>
            </div>
          ) : climateList.length > 0 ? (
            <div className="space-y-8 animate-fade-in">
              
              {/* Climate stats cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Rerata Suhu */}
                <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-850 p-6 rounded-3xl shadow-sm">
                  <div className="flex justify-between items-center text-amber-500">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">Rerata Suhu Rill</span>
                    <span className="material-symbols-outlined text-lg" data-icon="thermostat">thermostat</span>
                  </div>
                  <p className="text-3xl font-black mt-2 font-mono text-stone-900 dark:text-white">{avgStats.suhu.toFixed(1)} °C</p>
                  <p className="text-[10px] text-stone-400 mt-1">Berdasarkan data historis</p>
                </div>

                {/* Rerata Kelembapan */}
                <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-850 p-6 rounded-3xl shadow-sm">
                  <div className="flex justify-between items-center text-blue-500">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">Rerata Kelembapan</span>
                    <span className="material-symbols-outlined text-lg" data-icon="humidity_percentage">humidity_percentage</span>
                  </div>
                  <p className="text-3xl font-black mt-2 font-mono text-stone-900 dark:text-white">{avgStats.kelembapan.toFixed(1)} %</p>
                  <p className="text-[10px] text-stone-400 mt-1">Keadaan lembap udara rata-rata</p>
                </div>

                {/* Rerata Curah Hujan */}
                <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-850 p-6 rounded-3xl shadow-sm">
                  <div className="flex justify-between items-center text-[#0ea5e9]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">Rerata Curah Hujan</span>
                    <span className="material-symbols-outlined text-lg" data-icon="water_drop">water_drop</span>
                  </div>
                  <p className="text-3xl font-black mt-2 font-mono text-stone-900 dark:text-white">{avgStats.hujan.toFixed(1)} mm</p>
                  <p className="text-[10px] text-stone-400 mt-1">Curah hujan rata-rata bulanan</p>
                </div>
              </div>

              {/* Graphics Tab Box */}
              <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-850 rounded-3xl p-6 shadow-sm space-y-6">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">Grafik Visualisasi Tren Historis</h4>
                  <div className="flex bg-stone-50 dark:bg-stone-950 p-1 rounded-xl border border-stone-100 dark:border-stone-850">
                    <button 
                      onClick={() => setActiveTab("suhu")}
                      className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-colors cursor-pointer ${
                        activeTab === "suhu" 
                          ? "bg-white dark:bg-stone-900 shadow-sm text-[#006B54]" 
                          : "text-stone-400"
                      }`}
                    >
                      Suhu (°C)
                    </button>
                    <button 
                      onClick={() => setActiveTab("kelembapan")}
                      className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-colors cursor-pointer ${
                        activeTab === "kelembapan" 
                          ? "bg-white dark:bg-stone-900 shadow-sm text-[#006B54]" 
                          : "text-stone-400"
                      }`}
                    >
                      Kelembapan (%)
                    </button>
                    <button 
                      onClick={() => setActiveTab("hujan")}
                      className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-colors cursor-pointer ${
                        activeTab === "hujan" 
                          ? "bg-white dark:bg-stone-900 shadow-sm text-[#006B54]" 
                          : "text-stone-400"
                      }`}
                    >
                      Curah Hujan (mm)
                    </button>
                  </div>
                </div>

                {/* SVG Graph rendering */}
                <div className="bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-850 p-4 rounded-2xl relative overflow-hidden select-none">
                  <div className="h-[180px] w-full relative">
                    <svg className="w-full h-full" viewBox="0 0 680 180" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="histGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#006B54" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#006B54" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Gradient Path */}
                      {activeTab === "suhu" && <path d={getSvgGradientPath(suhuData, minSuhu, maxSuhu)} fill="url(#histGradient)" />}
                      {activeTab === "kelembapan" && <path d={getSvgGradientPath(kelembapanData, minKelembapan, maxKelembapan)} fill="url(#histGradient)" />}
                      {activeTab === "hujan" && <path d={getSvgGradientPath(curahHujanData, minHujan, maxHujan)} fill="url(#histGradient)" />}

                      {/* Line Path */}
                      {activeTab === "suhu" && <path d={getSvgPath(suhuData, minSuhu, maxSuhu)} fill="none" stroke="#006B54" strokeWidth="3" />}
                      {activeTab === "kelembapan" && <path d={getSvgPath(kelembapanData, minKelembapan, maxKelembapan)} fill="none" stroke="#3b82f6" strokeWidth="3" />}
                      {activeTab === "hujan" && <path d={getSvgPath(curahHujanData, minHujan, maxHujan)} fill="none" stroke="#0ea5e9" strokeWidth="3" />}

                      {/* Points */}
                      {activeTab === "suhu" && suhuData.map((val, idx) => {
                        const stepX = suhuData.length > 1 ? 680 / (suhuData.length - 1) : 0;
                        const ratio = (val - minSuhu) / (maxSuhu - minSuhu || 1);
                        const y = 180 - ratio * 180 * 0.8 - 180 * 0.1;
                        return <circle key={idx} cx={idx * stepX} cy={y} r="4" fill="white" stroke="#006B54" strokeWidth="2" />;
                      })}
                      {activeTab === "kelembapan" && kelembapanData.map((val, idx) => {
                        const stepX = kelembapanData.length > 1 ? 680 / (kelembapanData.length - 1) : 0;
                        const ratio = (val - minKelembapan) / (maxKelembapan - minKelembapan || 1);
                        const y = 180 - ratio * 180 * 0.8 - 180 * 0.1;
                        return <circle key={idx} cx={idx * stepX} cy={y} r="4" fill="white" stroke="#3b82f6" strokeWidth="2" />;
                      })}
                      {activeTab === "hujan" && curahHujanData.map((val, idx) => {
                        const stepX = curahHujanData.length > 1 ? 680 / (curahHujanData.length - 1) : 0;
                        const ratio = (val - minHujan) / (maxHujan - minHujan || 1);
                        const y = 180 - ratio * 180 * 0.8 - 180 * 0.1;
                        return <circle key={idx} cx={idx * stepX} cy={y} r="4" fill="white" stroke="#0ea5e9" strokeWidth="2" />;
                      })}
                    </svg>
                  </div>
                  
                  {/* X-Axis timestamps */}
                  <div className="flex justify-between text-[8px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-tighter mt-3 border-t border-stone-100 dark:border-stone-850 pt-2">
                    {climateList.map((c, idx) => (
                      <span key={idx} className={idx % Math.ceil(climateList.length / 6) === 0 ? "opacity-100" : "opacity-30"}>
                        {new Date(c.date).toLocaleDateString("id-ID", { month: "short", year: "2-digit" })}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Data Table */}
              <section className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-3xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-stone-100 dark:border-stone-800">
                  <h3 className="text-sm font-bold text-stone-950 dark:text-white">Daftar Rekaman Historis</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-stone-50 dark:bg-stone-950 text-stone-400 dark:text-stone-500 border-b border-stone-100 dark:border-stone-800">
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Tanggal</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">Suhu Rata-rata (°C)</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">Suhu Max (°C)</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">Suhu Min (°C)</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">Kelembapan (%)</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">Kecepatan Angin (m/s)</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">Curah Hujan (mm)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 dark:divide-stone-850">
                      {climateList.map((item) => (
                        <tr key={item.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-900/30 transition-colors">
                          <td className="px-6 py-4 text-sm font-semibold">
                            {new Date(item.date).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "long",
                              year: "numeric"
                            })}
                          </td>
                          <td className="px-6 py-4 text-sm font-mono text-center font-bold text-stone-900 dark:text-white">{item.suhu_rata_rata?.toFixed(1)}</td>
                          <td className="px-6 py-4 text-sm font-mono text-center text-stone-500">{item.suhu_maksimum?.toFixed(1)}</td>
                          <td className="px-6 py-4 text-sm font-mono text-center text-stone-500">{item.suhu_minimum?.toFixed(1)}</td>
                          <td className="px-6 py-4 text-sm font-mono text-center">{item.kelembapan_udara?.toFixed(1)}%</td>
                          <td className="px-6 py-4 text-sm font-mono text-center">{item.kecepatan_angin?.toFixed(1)}</td>
                          <td className="px-6 py-4 text-sm font-mono text-center font-bold text-blue-500">{item.curah_hujan?.toFixed(1)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

            </div>
          ) : (
            <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-850 rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[400px] shadow-sm">
              <div className="w-20 h-20 bg-stone-50 dark:bg-stone-800/40 rounded-full flex items-center justify-center text-[#006B54] mb-6">
                <span className="material-symbols-outlined text-4xl" data-icon="cloud_off">cloud_off</span>
              </div>
              <h4 className="text-lg font-black text-stone-900 dark:text-white">Tidak Ada Data Klimatologi Historis</h4>
              <p className="text-xs text-stone-400 max-w-sm mt-2 leading-relaxed">
                Tabel 'data_iklim_historis' di database Supabase Anda saat ini kosong untuk kecamatan <strong>{selectedKec}</strong>.
              </p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
