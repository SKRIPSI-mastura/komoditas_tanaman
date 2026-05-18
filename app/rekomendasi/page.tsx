"use client";

import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { useState, useEffect } from "react";
import Link from "next/link";

interface InputData {
  kecamatan: string;
  ph: number;
  jenisTanah: string;
  elevasi: number;
  curahHujan: number;
  liat: number;
  pasir: number;
  debu: number;
  temp_pred: number;
  hum_pred: number;
  wind_pred: number;
}

// Fallback preset if prediction was not executed yet
const DEFAULT_INPUTS: InputData = {
  kecamatan: "",
  ph: 6.4,
  jenisTanah: "Lempung Berliat",
  elevasi: 12,
  curahHujan: 2100,
  liat: 28,
  pasir: 32,
  debu: 40,
  temp_pred: 27.3,
  hum_pred: 82.1,
  wind_pred: 2.3
};

const KEC_PROFILES: Record<string, { elevasi: number; ph: number; jenis_tanah: string; hujan: number; liat: number; pasir: number; debu: number }> = {
  "Lhoksukon": { elevasi: 12, ph: 6.4, jenis_tanah: "Lempung Berliat", hujan: 2100, liat: 28, pasir: 32, debu: 40 },
  "Tanah Luas": { elevasi: 22, ph: 5.8, jenis_tanah: "Lempung Berpasir", hujan: 1950, liat: 20, pasir: 60, debu: 20 },
  "Cot Girek": { elevasi: 58, ph: 5.2, jenis_tanah: "Lempung Liat Berpasir", hujan: 2400, liat: 25, pasir: 55, debu: 20 },
  "Dewantara": { elevasi: 8, ph: 6.5, jenis_tanah: "Lempung", hujan: 1800, liat: 15, pasir: 45, debu: 40 },
  "Muara Batu": { elevasi: 10, ph: 6.2, jenis_tanah: "Lempung Berpasir", hujan: 1850, liat: 18, pasir: 52, debu: 30 },
  "Syamtalira Aron": { elevasi: 15, ph: 6.3, jenis_tanah: "Lempung Berdebu", hujan: 2050, liat: 22, pasir: 28, debu: 50 },
  "Samudera": { elevasi: 14, ph: 6.1, jenis_tanah: "Lempung Berdebu", hujan: 2000, liat: 20, pasir: 30, debu: 50 },
  "Baktiya": { elevasi: 11, ph: 6.2, jenis_tanah: "Lempung Berliat", hujan: 2150, liat: 26, pasir: 34, debu: 40 },
  "Seunuddon": { elevasi: 5, ph: 6.6, jenis_tanah: "Pasir Berlempung", hujan: 1750, liat: 10, pasir: 75, debu: 15 },
  "Syamtalira Bayu": { elevasi: 16, ph: 6.0, jenis_tanah: "Lempung Berdebu", hujan: 2000, liat: 18, pasir: 32, debu: 50 },
  "Meurah Mulia": { elevasi: 32, ph: 5.6, jenis_tanah: "Lempung Berpasir", hujan: 2200, liat: 21, pasir: 54, debu: 25 },
  "Nibong": { elevasi: 20, ph: 5.9, jenis_tanah: "Lempung", hujan: 1980, liat: 16, pasir: 48, debu: 36 },
};

const CROP_RANGES: Record<string, { ph: string; phArr: [number, number]; hujan: string; hujanArr: [number, number]; temp: string; tempArr: [number, number] }> = {
  "Padi": { ph: "5.5 - 7.0", phArr: [5.5, 7.0], hujan: "1500 - 2500 mm", hujanArr: [1500, 2500], temp: "24°C - 30°C", tempArr: [24, 30] },
  "Jagung": { ph: "5.6 - 7.5", phArr: [5.6, 7.5], hujan: "1000 - 1800 mm", hujanArr: [1000, 1800], temp: "22°C - 30°C", tempArr: [22, 30] },
  "Kedelai": { ph: "5.8 - 6.8", phArr: [5.8, 6.8], hujan: "800 - 1500 mm", hujanArr: [800, 1500], temp: "23°C - 29°C", tempArr: [23, 29] },
  "Kacang Hijau": { ph: "5.5 - 6.5", phArr: [5.5, 6.5], hujan: "500 - 1000 mm", hujanArr: [500, 1000], temp: "25°C - 35°C", tempArr: [25, 35] },
  "Kacang Tanah": { ph: "6.0 - 6.5", phArr: [6.0, 6.5], hujan: "600 - 1300 mm", hujanArr: [600, 1300], temp: "25°C - 30°C", tempArr: [25, 30] },
  "Ubi Jalar": { ph: "5.5 - 6.5", phArr: [5.5, 6.5], hujan: "750 - 1500 mm", hujanArr: [750, 1500], temp: "21°C - 28°C", tempArr: [21, 28] },
  "Ubi Kayu": { ph: "4.5 - 8.0", phArr: [4.5, 8.0], hujan: "750 - 2500 mm", hujanArr: [750, 2500], temp: "20°C - 30°C", tempArr: [20, 30] }
};

const generateCropReasons = (cropName: string, inp: InputData): string[] => {
  const range = CROP_RANGES[cropName] || { ph: "5.5 - 7.0", phArr: [5.5, 7.0], hujan: "1000 - 2000 mm", hujanArr: [1000, 2000], temp: "22°C - 30°C", tempArr: [22, 30] };
  const ph = inp.ph;
  const optimalPh = range.phArr;
  const reasons: string[] = [];

  if (ph >= optimalPh[0] && ph <= optimalPh[1]) {
    reasons.push(`Kadar keasaman pH tanah (${ph.toFixed(1)}) sangat optimal untuk pertumbuhan tanaman ${cropName}.`);
  } else if (ph < optimalPh[0]) {
    reasons.push(`Kondisi pH tanah cenderung masam (${ph.toFixed(1)}), memerlukan pengapuran (dolomit) untuk hasil optimal.`);
  } else {
    reasons.push(`Kondisi pH tanah cenderung basa (${ph.toFixed(1)}), diperlukan penambahan sulfur untuk mencapai rentang tumbuh.`);
  }

  const hujan = inp.curahHujan;
  const optimalHujan = range.hujanArr;
  if (hujan >= optimalHujan[0] && hujan <= optimalHujan[1]) {
    reasons.push(`Volume curah hujan tahunan (${hujan} mm) sangat ideal untuk kebutuhan hidrologi vegetatif.`);
  } else if (hujan > optimalHujan[1]) {
    reasons.push(`Curah hujan tinggi (${hujan} mm) berisiko menggenangi akar, diperlukan pembuatan saluran drainase aktif.`);
  } else {
    reasons.push(`Curah hujan rendah (${hujan} mm), disarankan penambahan pompa irigasi teknis.`);
  }

  const temp = inp.temp_pred;
  const optimalTemp = range.tempArr;
  if (temp >= optimalTemp[0] && temp <= optimalTemp[1]) {
    reasons.push(`Temperatur rata-rata (${temp.toFixed(1)}°C) berada pada rentang fotosintesis terbaik.`);
  } else {
    reasons.push(`Temperatur rata-rata (${temp.toFixed(1)}°C) berada di luar batas optimal fisiologi (${range.temp}).`);
  }
  
  reasons.push(`Tekstur tanah "${inp.jenisTanah}" mendukung ketersediaan hara bagi komoditas ${cropName}.`);
  return reasons;
};

interface CropScore {
  name: string;
  score: number;
  suitability: "Sangat Layak" | "Layak" | "Kurang Layak" | "Tidak Layak";
  phRange: string;
  hujanRange: string;
  tempRange: string;
  reasons: string[];
}

export default function Page() {
  const [selectedKec, setSelectedKec] = useState<string>("");
  const [inputs, setInputs] = useState<InputData>(DEFAULT_INPUTS);
  const [recommendations, setRecommendations] = useState<CropScore[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<CropScore | null>(null);
  const [topExplanation, setTopExplanation] = useState<string>("");

  // Dynamic state helpers
  const [kecamatanList, setKecamatanList] = useState<string[]>(Object.keys(KEC_PROFILES));
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // 1. Fetch kecamatan names from backend on mount
  useEffect(() => {
    fetch("http://localhost:5000/api/kecamatan")
      .then((res) => res.json())
      .then((resData) => {
        if (resData.status === "success" && Array.isArray(resData.data)) {
          setKecamatanList(resData.data);
        }
      })
      .catch((err) => {
        console.warn("Failed to fetch kecamatan list, using local fallback.", err);
      });
  }, []);

  // 2. Check local storage for recent prediction sequence on mount
  useEffect(() => {
    const localData = localStorage.getItem("agro_lstm_prediction");
    if (localData) {
      try {
        const parsed = JSON.parse(localData);
        if (parsed.kecamatan) {
          setSelectedKec(parsed.kecamatan);
        } else if (parsed.inputs && parsed.inputs.kecamatan) {
          setSelectedKec(parsed.inputs.kecamatan);
        }
      } catch (e) {
        console.error("Failed to parse local storage", e);
      }
    }
  }, []);

  // 3. Reactively fetch recommendation calculations from backend Flask API
  useEffect(() => {
    if (!selectedKec) {
      setRecommendations([]);
      setSelectedCrop(null);
      setTopExplanation("");
      return;
    }

    setErrorMsg("");
    let hasLoadedLocal = false;
    const localData = localStorage.getItem("agro_lstm_prediction");

    // Load from localStorage if parameters match
    if (localData) {
      try {
        const parsed = JSON.parse(localData);
        if (parsed.inputs && parsed.inputs.kecamatan === selectedKec) {
          const fetchedInputs: InputData = parsed.inputs;
          setInputs(fetchedInputs);
          
          const rawCrops = parsed.recommendations || [];
          const topRec = parsed.top_recommendation || {};
          setTopExplanation(topRec.explanation || "");

          const mappedCrops: CropScore[] = rawCrops.map((c: any) => {
            const range = CROP_RANGES[c.komoditas] || { ph: "5.5 - 7.0", phArr: [5.5, 7.0], hujan: "1000 - 1500 mm", hujanArr: [1000, 1500], temp: "24°C - 30°C", tempArr: [24, 30] };
            return {
              name: c.komoditas,
              score: c.score,
              suitability: c.kelayakan as any,
              phRange: range.ph,
              hujanRange: range.hujan,
              tempRange: range.temp,
              reasons: generateCropReasons(c.komoditas, fetchedInputs)
            };
          });

          const sorted = mappedCrops.sort((a, b) => b.score - a.score);
          setRecommendations(sorted);
          setSelectedCrop(sorted[0]);
          hasLoadedLocal = true;
        }
      } catch (e) {
        console.error("Failed to parse local storage in rekomendasi page", e);
      }
    }

    // No local storage cache matches selected subdistrict -> query live endpoint!
    if (!hasLoadedLocal) {
      setIsLoading(true);
      fetch(`http://localhost:5000/api/recommend/${selectedKec}`)
        .then((res) => res.json())
        .then((resData) => {
          if (resData.status !== "success" || !resData.data) {
            throw new Error(resData.message || "Gagal mendapatkan data rekomendasi dari server.");
          }

          const apiData = resData.data;
          
          const fetchedInputs: InputData = {
            kecamatan: selectedKec,
            ph: Number(apiData.profil_wilayah.ph ?? 6.0),
            jenisTanah: apiData.profil_wilayah.jenis_tanah ?? "Lempung",
            elevasi: Math.round(apiData.profil_wilayah.elevasi ?? 10),
            curahHujan: Math.round(apiData.profil_wilayah.curah_hujan_tahunan ?? 2000),
            liat: Math.round(apiData.profil_wilayah.tanah_liat_persen ?? 30),
            pasir: Math.round(apiData.profil_wilayah.tanah_pasir_persen ?? 30),
            debu: Math.round(apiData.profil_wilayah.tanah_debu_persen ?? 40),
            temp_pred: Number(apiData.avg_climate_prediction.suhu ?? 27.0),
            hum_pred: Number(apiData.avg_climate_prediction.kelembapan ?? 80.0),
            wind_pred: Number(apiData.avg_climate_prediction.kecepatan_angin ?? 2.0),
          };

          setInputs(fetchedInputs);
          
          const rawCrops = apiData.recommendations || [];
          const topRec = apiData.top_recommendation || {};
          setTopExplanation(topRec.explanation || "");

          const mappedCrops: CropScore[] = rawCrops.map((c: any) => {
            const range = CROP_RANGES[c.komoditas] || { ph: "5.5 - 7.0", phArr: [5.5, 7.0], hujan: "1000 - 1500 mm", hujanArr: [1000, 1500], temp: "24°C - 30°C", tempArr: [24, 30] };
            return {
              name: c.komoditas,
              score: c.score,
              suitability: c.kelayakan as any,
              phRange: range.ph,
              hujanRange: range.hujan,
              tempRange: range.temp,
              reasons: generateCropReasons(c.komoditas, fetchedInputs)
            };
          });

          const sorted = mappedCrops.sort((a, b) => b.score - a.score);
          setRecommendations(sorted);
          setSelectedCrop(sorted[0]);

          // Save standard prediction run to local storage for caching
          const localStoreData = {
            isCustom: false,
            inputs: fetchedInputs,
            climate_prediction: apiData.climate_prediction || [],
            recommendations: rawCrops,
            top_recommendation: topRec
          };
          localStorage.setItem("agro_lstm_prediction", JSON.stringify(localStoreData));
        })
        .catch((err) => {
          console.error("Failed to run dynamic recommendation API", err);
          setErrorMsg(err.message || "Gagal menghubungi server backend Flask untuk mendapatkan rekomendasi.");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [selectedKec]);

  return (
    <div className="bg-stone-50 dark:bg-stone-950 text-stone-800 dark:text-stone-100 min-h-screen">
      <Sidebar />
      <Header title="Rekomendasi Tanaman" subtitle="Hasil Evaluasi Saraf Tiruan & Kriteria Kesesuaian Lahan" />

      {/* Main Content */}
      <main className="ml-64 pt-20 pb-12 px-8 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Header */}
          <div className="mb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-stone-950 dark:text-white tracking-tight">Hasil Rekomendasi Cerdas</h2>
              {selectedKec ? (
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                  Berdasarkan parameter cuaca runtun waktu dari LSTM dan sifat fisik kimia lahan di wilayah <strong>Kecamatan {inputs.kecamatan}</strong>.
                </p>
              ) : (
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 font-medium">
                  Silakan pilih kecamatan untuk melakukan analisis kesesuaian tanaman pangan.
                </p>
              )}
            </div>
            
            <div className="flex space-x-3 shrink-0 items-center">
              {/* Inline dynamic dropdown selector */}
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider shrink-0">Pilih Kecamatan:</span>
                <select
                  value={selectedKec}
                  onChange={(e) => setSelectedKec(e.target.value)}
                  className="bg-white dark:bg-stone-900 border border-stone-150 dark:border-stone-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006B54]/20 text-xs py-2 px-3 transition-all font-bold text-[#006B54] dark:text-[#10b981]"
                >
                  <option value="">-- Pilih Kecamatan --</option>
                  {kecamatanList.map((kec) => (
                    <option key={kec} value={kec}>{kec}</option>
                  ))}
                </select>
              </div>

              <Link 
                href="/prediksi"
                className="px-4 py-2 bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-850 hover:bg-stone-50 text-stone-700 dark:text-stone-300 font-bold text-xs rounded-xl transition-all flex items-center space-x-1"
              >
                <span className="material-symbols-outlined text-sm" data-icon="edit">edit</span>
                <span>Ubah Parameter</span>
              </Link>
            </div>
          </div>

          {errorMsg && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-500/20 text-red-800 dark:text-red-400 p-4 rounded-2xl flex items-center shadow-sm animate-fade-in mb-4">
              <span className="material-symbols-outlined mr-3 text-red-600" data-icon="error">error</span>
              <span className="font-bold text-xs">{errorMsg}</span>
            </div>
          )}

          {/* Conditional Layout: State 1 - Choose subdistrict prompt */}
          {!selectedKec && !isLoading && (
            <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-850 rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[460px] shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#006B54]/5 to-transparent rounded-bl-full pointer-events-none"></div>
              
              <div className="w-20 h-20 bg-emerald-50 dark:bg-stone-800/40 rounded-3xl flex items-center justify-center text-[#006B54] dark:text-[#10b981] mb-6 shadow-inner animate-pulse">
                <span className="material-symbols-outlined text-4xl" data-icon="explore">explore</span>
              </div>
              
              <h4 className="text-xl font-black text-stone-955 dark:text-white leading-tight">Silakan Pilih Kecamatan Terlebih Dahulu</h4>
              <p className="text-xs text-stone-400 dark:text-stone-500 max-w-md mt-2 leading-relaxed">
                Untuk menganalisis kesesuaian komoditas pertanian pangan berdasarkan pemodelan cuaca jangka panjang LSTM & sifat fisik kimia lahan, silakan pilih salah satu kecamatan di wilayah Kabupaten Aceh Utara.
              </p>

              <div className="mt-8 w-full max-w-xs">
                <select
                  value={selectedKec}
                  onChange={(e) => setSelectedKec(e.target.value)}
                  className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-150 dark:border-stone-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#006B54]/25 text-sm py-4 px-5 transition-all text-center font-bold text-[#006B54] dark:text-[#10b981] cursor-pointer"
                >
                  <option value="">-- PILIH KECAMATAN ACEH UTARA --</option>
                  {kecamatanList.map((kec) => (
                    <option key={kec} value={kec}>{kec}</option>
                  ))}
                </select>
              </div>

              <div className="mt-8 flex items-center space-x-2 text-[9px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                <span>LSTM Prediction Engine Ready</span>
              </div>
            </div>
          )}

          {/* Scientific Loading state */}
          {isLoading && (
            <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-850 rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[460px] shadow-sm animate-pulse">
              <div className="w-16 h-16 rounded-full border-4 border-t-[#006B54] border-stone-100 dark:border-stone-800 animate-spin mb-6" />
              <h4 className="text-lg font-black text-stone-950 dark:text-white leading-tight">Melatih & Menganalisis dengan Model AI...</h4>
              <p className="text-xs text-stone-400 dark:text-stone-500 max-w-sm mt-2 leading-relaxed">
                Menjalankan data runtun waktu historis kecamatan pada model LSTM & mengevaluasi parameter tanah dengan model Neural Network (NN). Mohon tunggu beberapa saat.
              </p>
            </div>
          )}

          {/* Conditional Layout: State 2 - Results Displayed */}
          {selectedKec && recommendations.length > 0 && !isLoading && (
            <>
              {/* Summary Banner */}
              <div className="bg-gradient-to-r from-[#006B54] to-[#10b981] text-white rounded-3xl p-6 shadow-lg shadow-[#006B54]/10 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-10 -translate-y-10 pointer-events-none" />
                <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-black/5 rounded-full pointer-events-none" />
                
                <div className="relative z-10 flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-2xl text-white" data-icon="explore">explore</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold tracking-widest text-emerald-100 uppercase">Analisis Kesesuaian Lahan & Iklim</p>
                    <h3 className="text-lg md:text-xl font-extrabold tracking-tight mt-0.5">
                      Kecamatan <span className="underline decoration-emerald-300 decoration-2 font-black">{inputs.kecamatan}</span> direkomendasikan untuk menanam komoditas <span className="bg-white/20 px-2 py-0.5 rounded-lg text-emerald-50 font-black">{recommendations[0].name}</span>
                    </h3>
                  </div>
                </div>

                <div className="relative z-10 bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20 text-center shrink-0 min-w-[160px]">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-100">Kesesuaian Utama</p>
                  <p className="text-2xl font-black font-mono tracking-tight mt-0.5">{recommendations[0].score}%</p>
                  <p className="text-[9px] font-bold text-emerald-100 mt-0.5">{recommendations[0].suitability}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* List of recommended crops (Left) */}
                <div className="lg:col-span-5 space-y-4">
                  <h3 className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest px-1">Peringkat Komoditas Tanaman Pangan</h3>

                  <div className="space-y-3">
                    {recommendations.map((crop, idx) => {
                      const isSelected = selectedCrop?.name === crop.name;
                      return (
                        <button
                          key={crop.name}
                          onClick={() => setSelectedCrop(crop)}
                          className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                            isSelected 
                              ? "bg-white dark:bg-stone-900 border-[#006B54] dark:border-[#10b981] shadow-md shadow-[#006B54]/5 scale-[1.01]" 
                              : "bg-white/60 dark:bg-stone-900/40 border-stone-100 dark:border-stone-850 hover:bg-white dark:hover:bg-stone-900 hover:border-stone-200"
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-xl font-mono text-xs font-black flex items-center justify-center border ${
                              isSelected 
                                ? "bg-[#006B54] text-white border-[#006B54]" 
                                : "bg-stone-50 dark:bg-stone-950 border-stone-100 text-stone-500 dark:border-stone-850"
                            }`}>
                              {idx + 1}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-stone-900 dark:text-white leading-tight">{crop.name}</p>
                              <p className={`text-[10px] font-semibold mt-0.5 ${
                                crop.suitability === "Sangat Layak" 
                                  ? "text-emerald-600 dark:text-emerald-400" 
                                  : crop.suitability === "Layak" 
                                    ? "text-amber-600 dark:text-amber-400" 
                                    : crop.suitability === "Kurang Layak"
                                      ? "text-amber-500 dark:text-amber-500/80"
                                      : "text-rose-600 dark:text-rose-400"
                              }`}>
                                {crop.suitability}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <span className="font-mono font-black text-[#006B54] dark:text-[#10b981] text-sm">{crop.score}%</span>
                            <span className="material-symbols-outlined text-stone-300 text-sm" data-icon="chevron_right">chevron_right</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Scientific details card (Right) */}
                <div className="lg:col-span-7">
                  {selectedCrop && (
                    <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-850 rounded-3xl p-6 shadow-sm space-y-6 animate-fade-in">
                      
                      {/* Hero Title */}
                      <div className="flex justify-between items-start pb-4 border-b border-stone-100 dark:border-stone-850">
                        <div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider mb-2 border ${
                            selectedCrop.suitability === "Sangat Layak" 
                              ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/10" 
                              : selectedCrop.suitability === "Layak" 
                                ? "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-500/10" 
                                : selectedCrop.suitability === "Kurang Layak"
                                  ? "bg-amber-50/40 dark:bg-amber-950/10 text-amber-500 dark:text-amber-500 border-amber-500/5"
                                  : "bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border-rose-500/10"
                          }`}>
                            {selectedCrop.suitability}
                          </span>
                          <h3 className="text-2xl font-extrabold text-stone-950 dark:text-white tracking-tight">{selectedCrop.name}</h3>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest">Kecocokan</p>
                          <p className="text-3xl font-black text-[#006B54] dark:text-[#10b981] font-mono mt-0.5">{selectedCrop.score}%</p>
                        </div>
                      </div>

                      {/* AI Neural Network Dynamic Explanation paragraph */}
                      {topExplanation && selectedCrop.name === recommendations[0].name && (
                        <div className="bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-500/10 p-4 rounded-2xl text-xs text-stone-700 dark:text-stone-300 leading-relaxed shadow-sm">
                          <p className="font-bold text-[#006B54] dark:text-[#10b981] mb-1.5 flex items-center space-x-1.5">
                            <span className="material-symbols-outlined text-sm" data-icon="psychology">psychology</span>
                            <span>Justifikasi Model AI (Neural Network)</span>
                          </p>
                          {topExplanation}
                        </div>
                      )}

                      {/* Growth Criteria Comparison */}
                      <div>
                        <h4 className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-3">Evaluasi Ambang Batas Fisiologi</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* pH Column */}
                          <div className="bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-850 p-4 rounded-2xl space-y-1">
                            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">pH Tanah</span>
                            <div className="flex items-baseline space-x-1.5 pt-1">
                              <span className="text-lg font-bold font-mono">{inputs.ph.toFixed(1)}</span>
                              <span className="text-[10px] text-stone-400 font-mono">/ {selectedCrop.phRange}</span>
                            </div>
                            <p className="text-[9px] text-[#006B54] font-semibold">Toleransi optimal</p>
                          </div>

                          {/* Rainfall Column */}
                          <div className="bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-850 p-4 rounded-2xl space-y-1">
                            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Curah Hujan</span>
                            <div className="flex items-baseline space-x-1.5 pt-1">
                              <span className="text-lg font-bold font-mono">{inputs.curahHujan}</span>
                              <span className="text-[10px] text-stone-400 font-mono">/ mm</span>
                            </div>
                            <p className="text-[9px] text-stone-400 font-medium">Batas: {selectedCrop.hujanRange}</p>
                          </div>

                          {/* Forecast Temperature Column */}
                          <div className="bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-850 p-4 rounded-2xl space-y-1">
                            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Prediksi Suhu</span>
                            <div className="flex items-baseline space-x-1.5 pt-1">
                              <span className="text-lg font-bold font-mono">{inputs.temp_pred.toFixed(1)}°C</span>
                              <span className="text-[10px] text-stone-400 font-mono">/ {selectedCrop.tempRange}</span>
                            </div>
                            <p className="text-[9px] text-[#006B54] font-semibold">Prediksi LSTM Temporal</p>
                          </div>
                        </div>
                      </div>

                      {/* Soil Texture Fraction Bar Chart */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">Fraksi Tekstur Tanah ("{inputs.jenisTanah}")</h4>
                        
                        <div className="space-y-2.5">
                          {/* Clay fraction */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs font-medium">
                              <span>Kandungan Liat (Clay)</span>
                              <span className="font-mono font-bold">{inputs.liat}%</span>
                            </div>
                            <div className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-850 h-2 rounded-full overflow-hidden">
                              <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${inputs.liat}%` }} />
                            </div>
                          </div>

                          {/* Sand fraction */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs font-medium">
                              <span>Kandungan Pasir (Sand)</span>
                              <span className="font-mono font-bold">{inputs.pasir}%</span>
                            </div>
                            <div className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-850 h-2 rounded-full overflow-hidden">
                              <div className="bg-amber-500 h-full rounded-full" style={{ width: `${inputs.pasir}%` }} />
                            </div>
                          </div>

                          {/* Silt fraction */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs font-medium">
                              <span>Kandungan Debu (Silt)</span>
                              <span className="font-mono font-bold">{inputs.debu}%</span>
                            </div>
                            <div className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-850 h-2 rounded-full overflow-hidden">
                              <div className="bg-blue-500 h-full rounded-full" style={{ width: `${inputs.debu}%` }} />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Scientific Reasons List */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">Argumentasi & Alasan Kesesuaian Lahan</h4>
                        <div className="space-y-2">
                          {selectedCrop.reasons.map((reason, idx) => (
                            <div key={idx} className="flex items-start space-x-3 bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-850 p-3 rounded-2xl text-xs leading-relaxed">
                              <span className="material-symbols-outlined text-emerald-600 shrink-0 text-base" data-icon="verified">verified</span>
                              <span>{reason}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  )}
                </div>

              </div>
            </>
          )}

        </div>
      </main>
    </div>
  );
}
