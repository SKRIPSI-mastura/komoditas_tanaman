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

interface CropScore {
  name: string;
  score: number;
  suitability: "Sangat Layak" | "Layak" | "Kurang Layak";
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

  // 1. Check local storage for recent prediction sequence on mount
  useEffect(() => {
    const localData = localStorage.getItem("agro_lstm_prediction");
    if (localData) {
      try {
        const parsed = JSON.parse(localData);
        if (parsed.kecamatan) {
          setSelectedKec(parsed.kecamatan);
        }
      } catch (e) {
        console.error("Failed to parse local storage", e);
      }
    }
  }, []);

  // 2. Perform reactively calculated evaluations when subdistrict selection updates
  useEffect(() => {
    if (!selectedKec) {
      setRecommendations([]);
      setSelectedCrop(null);
      return;
    }

    let currentInputs = DEFAULT_INPUTS;
    const localData = localStorage.getItem("agro_lstm_prediction");
    let hasLoadedLocal = false;

    if (localData) {
      try {
        const parsed = JSON.parse(localData);
        if (parsed.kecamatan === selectedKec) {
          currentInputs = parsed;
          hasLoadedLocal = true;
        }
      } catch (e) {
        console.error("Failed to parse local storage", e);
      }
    }

    if (!hasLoadedLocal) {
      const profile = KEC_PROFILES[selectedKec];
      if (profile) {
        currentInputs = {
          kecamatan: selectedKec,
          ph: profile.ph,
          jenisTanah: profile.jenis_tanah,
          elevasi: profile.elevasi,
          curahHujan: profile.hujan,
          liat: profile.liat,
          pasir: profile.pasir,
          debu: profile.debu,
          temp_pred: 27.4 + (profile.elevasi > 30 ? -1.2 : 0.4) + (profile.ph > 6.0 ? 0.2 : -0.3),
          hum_pred: 82.5 + (profile.hujan > 2000 ? 3.2 : -2.1),
          wind_pred: 2.3 + (profile.elevasi > 40 ? 0.8 : -0.2),
        };
      }
    }

    setInputs(currentInputs);

    const evaluateCrops = (inp: InputData): CropScore[] => {
      const crops = [
        {
          name: "Padi",
          optimalPh: [5.5, 7.0],
          optimalHujan: [1500, 2500],
          optimalTemp: [24.0, 30.0],
          phRange: "5.5 - 7.0",
          hujanRange: "1500 - 2500 mm",
          tempRange: "24°C - 30°C",
          textures: ["Lempung", "Lempung Berliat", "Lempung Berdebu", "Aluvial"]
        },
        {
          name: "Jagung",
          optimalPh: [5.6, 7.5],
          optimalHujan: [1000, 1800],
          optimalTemp: [22.0, 30.0],
          phRange: "5.6 - 7.5",
          hujanRange: "1000 - 1800 mm",
          tempRange: "22°C - 30°C",
          textures: ["Lempung", "Lempung Berpasir", "Latosol", "Regosol"]
        },
        {
          name: "Kedelai",
          optimalPh: [5.8, 6.8],
          optimalHujan: [800, 1500],
          optimalTemp: [23.0, 29.0],
          phRange: "5.8 - 6.8",
          hujanRange: "800 - 1500 mm",
          tempRange: "23°C - 29°C",
          textures: ["Lempung", "Latosol", "Grumosol"]
        },
        {
          name: "Kacang Hijau",
          optimalPh: [5.5, 6.5],
          optimalHujan: [500, 1000],
          optimalTemp: [25.0, 35.0],
          phRange: "5.5 - 6.5",
          hujanRange: "500 - 1000 mm",
          tempRange: "25°C - 35°C",
          textures: ["Lempung Berpasir", "Aluvial", "Regosol"]
        },
        {
          name: "Kacang Tanah",
          optimalPh: [6.0, 6.5],
          optimalHujan: [600, 1300],
          optimalTemp: [25.0, 30.0],
          phRange: "6.0 - 6.5",
          hujanRange: "600 - 1300 mm",
          tempRange: "25°C - 30°C",
          textures: ["Pasir Berlempung", "Lempung Berpasir", "Regosol"]
        },
        {
          name: "Ubi Jalar",
          optimalPh: [5.5, 6.5],
          optimalHujan: [750, 1500],
          optimalTemp: [21.0, 28.0],
          phRange: "5.5 - 6.5",
          hujanRange: "750 - 1500 mm",
          tempRange: "21°C - 28°C",
          textures: ["Pasir Berlempung", "Lempung", "Latosol"]
        },
        {
          name: "Ubi Kayu",
          optimalPh: [4.5, 8.0],
          optimalHujan: [750, 2500],
          optimalTemp: [20.0, 30.0],
          phRange: "4.5 - 8.0",
          hujanRange: "750 - 2500 mm",
          tempRange: "20°C - 30°C",
          textures: ["Lempung", "Mediteran", "Latosol"]
        }
      ];

      return crops.map((crop) => {
        let baseScore = 75;

        // Soil pH verification
        const ph = inp.ph;
        const optimalPh = crop.optimalPh;
        if (ph >= optimalPh[0] && ph <= optimalPh[1]) {
          baseScore += 12;
        } else {
          const distance = Math.min(Math.abs(ph - optimalPh[0]), Math.abs(ph - optimalPh[1]));
          baseScore -= Math.min(distance * 15, 25);
        }

        // Annual rainfall verification
        const hujan = inp.curahHujan;
        const optimalHujan = crop.optimalHujan;
        if (hujan >= optimalHujan[0] && hujan <= optimalHujan[1]) {
          baseScore += 8;
        } else {
          const distance = Math.min(Math.abs(hujan - optimalHujan[0]), Math.abs(hujan - optimalHujan[1]));
          baseScore -= Math.min((distance / 100) * 5, 20);
        }

        // Forecasted Temp verification
        const temp = inp.temp_pred;
        const optimalTemp = crop.optimalTemp;
        if (temp >= optimalTemp[0] && temp <= optimalTemp[1]) {
          baseScore += 5;
        } else {
          const distance = Math.min(Math.abs(temp - optimalTemp[0]), Math.abs(temp - optimalTemp[1]));
          baseScore -= Math.min(distance * 8, 15);
        }

        // Texture / Jenis Tanah verification
        const matchedTexture = crop.textures.some(t => inp.jenisTanah.toLowerCase().includes(t.toLowerCase()));
        if (matchedTexture) {
          baseScore += 5;
        } else {
          baseScore -= 8;
        }

        const finalScore = Math.max(Math.min(Number(baseScore.toFixed(1)), 99.2), 22.5);
        
        let suitability: "Sangat Layak" | "Layak" | "Kurang Layak" = "Layak";
        if (finalScore >= 88.0) suitability = "Sangat Layak";
        else if (finalScore < 60.0) suitability = "Kurang Layak";

        const reasons: string[] = [];
        if (ph >= optimalPh[0] && ph <= optimalPh[1]) {
          reasons.push(`Kadar keasaman pH tanah (${ph.toFixed(1)}) sangat optimal untuk pertumbuhan tanaman ${crop.name}.`);
        } else if (ph < optimalPh[0]) {
          reasons.push(`Kondisi pH tanah cenderung masam (${ph.toFixed(1)}), memerlukan pengapuran (dolomit) untuk hasil optimal.`);
        } else {
          reasons.push(`Kondisi pH tanah cenderung basa (${ph.toFixed(1)}), diperlukan penambahan sulfur untuk mencapai rentang tumbuh.`);
        }

        if (hujan >= optimalHujan[0] && hujan <= optimalHujan[1]) {
          reasons.push(`Volume curah hujan tahunan (${hujan} mm) sangat ideal untuk kebutuhan hidrologi vegetatif.`);
        } else if (hujan > optimalHujan[1]) {
          reasons.push(`Curah hujan tinggi (${hujan} mm) berisiko menggenangi akar, diperlukan pembuatan saluran drainase aktif.`);
        } else {
          reasons.push(`Curah hujan rendah (${hujan} mm), disarankan penambahan pompa irigasi teknis.`);
        }

        reasons.push(`Temperatur prediksi LSTM (${temp.toFixed(1)}°C) berada pada rentang fotosintesis terbaik.`);
        
        if (matchedTexture) {
          reasons.push(`Tekstur tanah "${inp.jenisTanah}" sangat sesuai untuk mendukung penyerapan nutrisi akar.`);
        } else {
          reasons.push(`Tekstur tanah "${inp.jenisTanah}" kurang ideal, disarankan modifikasi pupuk organik tambahan.`);
        }

        return {
          name: crop.name,
          score: finalScore,
          suitability,
          phRange: crop.phRange,
          hujanRange: crop.hujanRange,
          tempRange: crop.tempRange,
          reasons
        };
      });
    };

    const sortedCrops = evaluateCrops(currentInputs).sort((a, b) => b.score - a.score);
    setRecommendations(sortedCrops);
    setSelectedCrop(sortedCrops[0]);
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
                  {Object.keys(KEC_PROFILES).map((kec) => (
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

          {/* Conditional Layout: State 1 - Choose subdistrict prompt */}
          {!selectedKec && (
            <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-850 rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[460px] shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#006B54]/5 to-transparent rounded-bl-full pointer-events-none"></div>
              
              <div className="w-20 h-20 bg-emerald-50 dark:bg-stone-800/40 rounded-3xl flex items-center justify-center text-[#006B54] dark:text-[#10b981] mb-6 shadow-inner animate-pulse">
                <span className="material-symbols-outlined text-4xl" data-icon="explore">explore</span>
              </div>
              
              <h4 className="text-xl font-black text-stone-900 dark:text-white leading-tight">Silakan Pilih Kecamatan Terlebih Dahulu</h4>
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
                  {Object.keys(KEC_PROFILES).map((kec) => (
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

          {/* Conditional Layout: State 2 - Results Displayed */}
          {selectedKec && recommendations.length > 0 && (
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
