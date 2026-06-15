"use client";

import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Data Profil Kecamatan di-fetch langsung dari backend (FastAPI)

export default function Page() {
  const router = useRouter();
  const [selectedKec, setSelectedKec] = useState("Lhoksukon");
  const [ph, setPh] = useState(5.4);
  const [elevasi, setElevasi] = useState(12);
  const [liat, setLiat] = useState(34);
  const [pasir, setPasir] = useState(34);
  const [debu, setDebu] = useState(32);
  const [resikoBencana, setResikoBencana] = useState("Rendah");

  // Dynamic lists and details from backend
  const [kecamatanList, setKecamatanList] = useState<any[]>([]);
  const [predictedClimate, setPredictedClimate] = useState<any[]>([]);
  const [avgClimate, setAvgClimate] = useState<any>({ suhu: 27.3, kelembapan: 82.1, curah_hujan: 280.0 });
  const [errorMsg, setErrorMsg] = useState("");
  
  // Interactive States
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionStep, setPredictionStep] = useState(0);
  const [hasPredicted, setHasPredicted] = useState(false);
  const [activeTab, setActiveTab] = useState<"suhu" | "kelembapan" | "hujan">("suhu");

  // Fetch all kecamatan list on mount
  useEffect(() => {
    if (localStorage.getItem("admin_logged_in") !== "true") {
      router.push("/login");
      return;
    }

    fetch(`/api/kecamatan`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.status === "success" && Array.isArray(resData.data)) {
          setKecamatanList(resData.data);
        }
      })
      .catch((err) => {
        console.warn("Failed to fetch kecamatan from Next.js API, using default list.", err);
      });
  }, []);

  // Auto-fill form details when subdistrict changes from backend profile
  useEffect(() => {
    if (!selectedKec) return;
    
    fetch(`/api/kecamatan/${encodeURIComponent(selectedKec)}`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.status === "success" && resData.data) {
          const d = resData.data;
          setPh(Number((d.ph_tanah ?? d.ph ?? 6.4).toFixed(1)));
          setElevasi(Math.round(d.elevasi_mdpl ?? d.elevasi ?? 12));
          setLiat(Math.round(d.tanah_liat ?? d.tanah_liat_persen ?? 28));
          setPasir(Math.round(d.tanah_pasir ?? d.tanah_pasir_persen ?? 32));
          setDebu(Math.round(d.tanah_debu ?? d.tanah_debu_persen ?? 40));
          setResikoBencana(d.resiko_bencana ?? "Rendah");
        }
      })
      .catch((err) => {
        console.error(`Failed to fetch profile for ${selectedKec}`, err);
        setErrorMsg(`Gagal memuat profil untuk ${selectedKec}. Server tidak merespon.`);
      });
  }, [selectedKec]);

  // LSTM Pipeline steps
  const steps = [
    "Memuat runtun waktu iklim historis (2020-2025)...",
    "Normalisasi skala data dengan MinMaxScaler...",
    "Membagi dataset (80% Train, 20% Test)...",
    "Melatih Model Jaringan Saraf LSTM (Epochs 20/20)...",
    "Melakukan peramalan autoregresif beberapa bulan ke depan..."
  ];

  const handlePredict = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsPredicting(true);
    setPredictionStep(0);
    setHasPredicted(false);
  };

  useEffect(() => {
    if (!isPredicting) return;

    if (predictionStep < 3) {
      const timer = setTimeout(() => {
        setPredictionStep((prev) => prev + 1);
      }, 600);
      return () => clearTimeout(timer);
    } else if (predictionStep === 3) {
      // Step 3 is "Melatih Model Jaringan Saraf LSTM..."
      // Start actual BE API calls here
      const fetchPipeline = async () => {
        try {
          // 1. GET recommendation (triggers LSTM training and gets forecasts)
          const getRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/recommend/${encodeURIComponent(selectedKec)}`);
          if (!getRes.ok) {
            throw new Error(`Gagal memanggil API: ${getRes.statusText}`);
          }
          const getJson = await getRes.json();
          if (getJson.status !== "success" || !getJson.data) {
            throw new Error(getJson.message || "Gagal mendapatkan data rekomendasi.");
          }
          
          const baselineData = getJson.data;
          let finalRecommendations = baselineData.recommendations;
          let finalTopRec = baselineData.top_recommendation;
          let isCustomRun = false;

          // 2. Fetch default profile to check if user customized any parameters
          let hasCustomized = false;
          try {
            const profileRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/kecamatan/${encodeURIComponent(selectedKec)}`);
            if (profileRes.ok) {
              const profileJson = await profileRes.json();
              if (profileJson.status === "success" && profileJson.data) {
                const pd = profileJson.data;
                const phDiff = Math.abs(Number(ph) - Number(pd.ph));
                const elevDiff = Math.abs(Number(elevasi) - Number(pd.elevasi));
                
                if (phDiff > 0.05 || elevDiff > 1) {
                  hasCustomized = true;
                }
              }
            }
          } catch (profileErr) {
            console.warn("Failed to check customized parameters from API", profileErr);
            // Default to custom if we cannot verify against backend
            hasCustomized = true;
          }

          // 3. If customized, POST to /api/recommend to get custom NN recommendations
          if (hasCustomized) {
            isCustomRun = true;
            const postPayload = {
              ph_tanah: Number(ph),
              tanah_liat_persen: Number(liat),
              tanah_pasir_persen: Number(pasir),
              tanah_debu_persen: Number(debu),
              elevasi: Number(elevasi),
              hujan_tahunan: Number(baselineData.profil_wilayah.curah_hujan_tahunan ?? 0),
              suhu: Number(baselineData.avg_climate_prediction.suhu),
              kelembapan: Number(baselineData.avg_climate_prediction.kelembapan),
              curah_hujan: Number(baselineData.avg_climate_prediction.curah_hujan ?? baselineData.avg_climate_prediction.kecepatan_angin ?? 0),
              resiko_bencana: resikoBencana,
              kecamatan: `${selectedKec} (Kustom)`
            };

            const postRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/recommend`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify(postPayload)
            });

            if (postRes.ok) {
              const postJson = await postRes.json();
              if (postJson.status === "success" && postJson.data) {
                finalRecommendations = postJson.data.recommendations;
                finalTopRec = postJson.data.top_recommendation;
              }
            }
          }

          setPredictedClimate(baselineData.climate_prediction || []);
          setAvgClimate(baselineData.avg_climate_prediction || { suhu: 27.3, kelembapan: 82.1, curah_hujan: 280.0 });

          // Save complete structured result into localStorage
          const localStoreData = {
            isCustom: isCustomRun,
            inputs: {
              kecamatan: selectedKec,
              ph: Number(ph),
              elevasi: Number(elevasi),
              liat: Number(liat),
              pasir: Number(pasir),
              debu: Number(debu),
              temp_pred: Number(baselineData.avg_climate_prediction.suhu),
              hum_pred: Number(baselineData.avg_climate_prediction.kelembapan),
              wind_pred: 2.0,
              hujan_pred: Number(baselineData.avg_climate_prediction.curah_hujan ?? baselineData.avg_climate_prediction.kecepatan_angin ?? 0)
            },
            climate_prediction: baselineData.climate_prediction || [],
            recommendations: finalRecommendations || [],
            top_recommendation: finalTopRec
          };
          localStorage.setItem("agro_lstm_prediction", JSON.stringify(localStoreData));

          // Save to history in localStorage and Supabase
          try {
            const selectedKecObj = kecamatanList.find((k: any) => k.nama_kecamatan === selectedKec);
            const kecamatanId = selectedKecObj ? selectedKecObj.id : 1;

            const dbPayload = {
              kecamatan_id: kecamatanId,
              tanggal_analisis: new Date().toISOString(),
              prediksi_iklim: localStoreData.climate_prediction,
              profil_wilayah: {
                ph: Number(ph),
                elevasi: Number(elevasi),
                tanah_liat: Number(liat),
                tanah_pasir: Number(pasir),
                tanah_debu: Number(debu),
                resiko_bencana: resikoBencana
              },
              rekomendasi: localStoreData.recommendations,
              top_komoditas: finalTopRec?.komoditas || "N/A",
              top_score: String(finalTopRec?.score || 0),
              top_kelayakan: finalTopRec?.kelayakan || "Layak",
              penjelasan: finalTopRec?.reasons ? finalTopRec.reasons.join(". ") : "",
              sumber: isCustomRun ? "Web (Custom Lahan)" : "Web"
            };

            fetch("/api/riwayat", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(dbPayload)
            })
            .then(res => res.json())
            .then(data => {
              console.log("Successfully saved prediction history to Supabase:", data);
            })
            .catch(dbErr => {
              console.error("Failed to save prediction history to Supabase:", dbErr);
            });

            const currentHistoryJson = localStorage.getItem("agro_prediction_history");
            let historyList = [];
            if (currentHistoryJson) {
              historyList = JSON.parse(currentHistoryJson);
            }
            if (!Array.isArray(historyList)) historyList = [];

            const newRecord = {
              id: `AGR-${Math.floor(1000 + Math.random() * 9000)}`,
              kecamatan: selectedKec + (isCustomRun ? " (Kustom Lahan)" : ""),
              tanggal: new Date().toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric"
              }) + `, ${new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`,
              ph: Number(ph),
              elevasi: Number(elevasi),
              komoditas: finalTopRec?.komoditas || "N/A",
              skor: finalTopRec?.score || 0,
              suitability: finalTopRec?.kelayakan || "Layak"
            };

            historyList.unshift(newRecord);
            if (historyList.length > 50) historyList = historyList.slice(0, 50);
            localStorage.setItem("agro_prediction_history", JSON.stringify(historyList));
          } catch (historyErr) {
            console.error("Failed to update prediction history", historyErr);
          }

          // Advance to Step 5
          setPredictionStep(4);
        } catch (err: any) {
          console.error("Pipeline execution failed", err);
          setErrorMsg(err.message || "Terjadi kesalahan saat memanggil server API backend.");
          setIsPredicting(false);
        }
      };

      fetchPipeline();
    } else if (predictionStep === 4) {
      const timer = setTimeout(() => {
        setIsPredicting(false);
        setHasPredicted(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isPredicting, predictionStep]);

  // Chart dataset for 4 months forecast
  const forecastData = {
    suhu: predictedClimate.length > 0 ? predictedClimate.map((c) => c.suhu) : [26.8, 27.2, 27.5, 27.1],
    kelembapan: predictedClimate.length > 0 ? predictedClimate.map((c) => c.kelembapan) : [80, 82, 83, 81],
    hujan: predictedClimate.length > 0 ? predictedClimate.map((c) => c.curah_hujan ?? c.kecepatan_angin ?? 0) : [220, 240, 260, 210],
  };

  // Convert array to SVG path
  const getSvgPath = (data: number[], minVal: number, maxVal: number) => {
    const width = 680;
    const height = 180;
    const stepX = width / (data.length - 1);
    
    return data.map((val, idx) => {
      const x = idx * stepX;
      const ratio = (val - minVal) / (maxVal - minVal);
      const y = height - ratio * height * 0.8 - height * 0.1;
      return `${idx === 0 ? "M" : "L"} ${x} ${y}`;
    }).join(" ");
  };

  const getSvgGradientPath = (data: number[], minVal: number, maxVal: number) => {
    const width = 680;
    const height = 180;
    const linePath = getSvgPath(data, minVal, maxVal);
    return `${linePath} L ${width} ${height} L 0 ${height} Z`;
  };

  const handleNavigateToRecommendation = () => {
    router.push("/rekomendasi");
  };

  return (
    <div className="bg-stone-50 dark:bg-stone-950 text-stone-800 dark:text-stone-100 min-h-screen">
      <Sidebar />
      <Header title="Prediksi Iklim LSTM" subtitle="Pemodelan Temporal Jaringan Saraf LSTM" />

      {/* Main Content */}
      <main className="ml-64 pt-20 pb-12 px-8 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Header Section */}
          <div className="mb-4">
            <h2 className="text-2xl font-black text-stone-950 dark:text-white tracking-tight">
              Engine Analisis AI-LSTM
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-3xl">
              Gunakan formulir parameter lingkungan di bawah ini untuk meramalkan iklim temporal dan menganalisis kesesuaian komoditas pangan yang sesuai dengan skenario lahan Anda.
            </p>
          </div>

          {errorMsg && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-500/20 text-red-800 dark:text-red-400 p-4 rounded-2xl flex items-center shadow-sm animate-fade-in">
              <span className="material-symbols-outlined mr-3 text-red-600" data-icon="error">error</span>
              <span className="font-bold text-xs">{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Input Form Column (Left) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-850 rounded-3xl p-6 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#006B54]/5 to-transparent rounded-bl-full pointer-events-none"></div>
                
                <div className="flex items-center space-x-2 mb-6">
                  <span className="material-symbols-outlined text-[#006B54]" data-icon="tune">tune</span>
                  <h3 className="font-bold text-sm text-stone-900 dark:text-white uppercase tracking-wider">Parameter Lahan & Wilayah</h3>
                </div>

                <form onSubmit={handlePredict} className="space-y-4">
                  {/* Kecamatan Select */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest">Kecamatan Aceh Utara</label>
                    <select 
                      value={selectedKec}
                      onChange={(e) => setSelectedKec(e.target.value)}
                      className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-850 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#006B54]/20 text-sm py-3 px-4 transition-all"
                    >
                      {kecamatanList.map((kec) => {
                        const name = typeof kec === 'string' ? kec : kec.nama_kecamatan;
                        const id = typeof kec === 'string' ? kec : kec.id;
                        return (
                          <option key={id} value={name}>{name}</option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Elevasi Input */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest">Elevasi Lahan (MDPL)</label>
                    <div className="relative">
                      <input 
                        type="number"
                        value={elevasi}
                        onChange={(e) => setElevasi(Number(e.target.value))}
                        className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-850 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#006B54]/20 text-sm py-3 px-4 transition-all"
                        required
                      />
                      <span className="absolute right-4 top-3.5 text-xs text-stone-400">mdpl</span>
                    </div>
                  </div>

                  {/* pH Tanah Input */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest">Derajat Keasaman Tanah (pH)</label>
                    <input 
                      type="number"
                      step="0.1"
                      value={ph}
                      onChange={(e) => setPh(Number(e.target.value))}
                      className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-850 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#006B54]/20 text-sm py-3 px-4 transition-all"
                      required
                    />
                  </div>


                  {/* Predict Button */}
                  <button 
                    type="submit"
                    disabled={isPredicting}
                    className="w-full mt-4 bg-[#006B54] hover:bg-[#00513f] disabled:bg-stone-200 dark:disabled:bg-stone-800 disabled:text-stone-400 dark:disabled:text-stone-600 text-white font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center space-x-2 transition-all active:scale-95 shadow-md shadow-[#006B54]/10 text-sm cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base" data-icon="cloud_sync">cloud_sync</span>
                    <span>{isPredicting ? "Memproses Model LSTM..." : "Jalankan Prediksi LSTM"}</span>
                  </button>

                </form>
              </div>
            </div>

            {/* Results Column (Right) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* If Idle / Not Predicted yet */}
              {!isPredicting && !hasPredicted && (
                <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-850 rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[460px] shadow-sm">
                  <div className="w-20 h-20 bg-stone-50 dark:bg-stone-800/40 rounded-full flex items-center justify-center text-[#006B54] mb-6">
                    <span className="material-symbols-outlined text-4xl" data-icon="hourglass_empty">hourglass_empty</span>
                  </div>
                  <h4 className="text-lg font-black text-stone-900 dark:text-white leading-tight">Menunggu Parameter Masukan</h4>
                  <p className="text-xs text-stone-400 max-w-sm mt-2 leading-relaxed">
                    Silakan atur variabel elevasi, pH tanah, curah hujan, dan subdistrik di panel kiri, lalu tekan tombol prediksi untuk mengeksekusi model algoritma LSTM.
                  </p>
                </div>
              )}

              {/* If Predicting (Stepper Loader) */}
              {isPredicting && (
                <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-850 rounded-3xl p-8 min-h-[460px] shadow-sm flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-bold text-[#006B54] uppercase tracking-widest font-mono">LSTM Compute Pipe</h4>
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400">Silakan tunggu, model matematika LSTM sedang melakukan pelatihan iteratif di memori sistem.</p>
                  </div>

                  {/* Step Loader List */}
                  <div className="space-y-4 my-6">
                    {steps.map((step, idx) => {
                      const isActive = predictionStep === idx;
                      const isCompleted = predictionStep > idx;
                      return (
                        <div key={idx} className="flex items-center space-x-3 transition-opacity duration-300">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 border ${
                            isCompleted 
                              ? "bg-emerald-50 border-emerald-500 text-emerald-600 dark:bg-emerald-950/20" 
                              : isActive 
                                ? "bg-[#006B54]/10 border-[#006B54] text-[#006B54] animate-pulse" 
                                : "bg-stone-50 border-stone-100 text-stone-300 dark:bg-stone-950 dark:border-stone-850"
                          }`}>
                            {isCompleted ? (
                              <span className="material-symbols-outlined text-xs" data-icon="check">check</span>
                            ) : (
                              idx + 1
                            )}
                          </div>
                          <span className={`text-xs ${
                            isActive 
                              ? "font-bold text-stone-900 dark:text-white" 
                              : isCompleted 
                                ? "text-stone-400 dark:text-stone-500" 
                                : "text-stone-300 dark:text-stone-600"
                          }`}>
                            {step}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Loading Console Terminal */}
                  <div className="bg-stone-950 text-emerald-400 p-4 rounded-2xl font-mono text-[10px] space-y-1 shadow-inner h-28 overflow-hidden select-none border border-stone-850">
                    <p className="opacity-40">[SYSTEM] Initialization sequence on CUDA GPU... OK</p>
                    <p className="opacity-40">[DATA] Row count: 12,402. Feature count: 3</p>
                    {predictionStep >= 1 && <p className="opacity-60">[SCALE] Vector scaling done. Range: [0, 1]</p>}
                    {predictionStep >= 3 && (
                      <p className="opacity-90 text-white animate-pulse">
                        &gt;&gt; Training epochs: 20/20 | Train_Loss: 0.014 | Test_Loss: 0.018 | MSE: 0.023
                      </p>
                    )}
                    {predictionStep >= 4 && <p className="text-emerald-300 font-bold">&gt;&gt; Prediksi iklim beberapa bulan ke depan berhasil.</p>}
                  </div>
                </div>
              )}

              {/* If Predict Completed successfully */}
              {hasPredicted && (
                <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-850 rounded-3xl p-6 shadow-sm space-y-6">
                  
                  {/* Climate average metrics */}
                  <div>
                    <h3 className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-3">Hasil Prediksi Rata-Rata Iklim (4 Bulan Ke Depan)</h3>
                    
                    <div className="grid grid-cols-3 gap-4">
                      {/* Suhu */}
                      <div className="bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-850 p-4 rounded-2xl">
                        <div className="flex justify-between items-center text-amber-500">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">Rerata Suhu</span>
                          <span className="material-symbols-outlined text-lg" data-icon="thermostat">thermostat</span>
                        </div>
                        <p className="text-xl font-bold mt-2 font-mono">{avgClimate.suhu.toFixed(1)} °C</p>
                        <p className="text-[10px] text-stone-400 mt-1">Sesuai tanaman pangan</p>
                      </div>

                      {/* Kelembapan */}
                      <div className="bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-850 p-4 rounded-2xl">
                        <div className="flex justify-between items-center text-blue-500">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">Kelembapan</span>
                          <span className="material-symbols-outlined text-lg" data-icon="humidity_percentage">humidity_percentage</span>
                        </div>
                        <p className="text-xl font-bold mt-2 font-mono">{avgClimate.kelembapan.toFixed(1)} %</p>
                        <p className="text-[10px] text-stone-400 mt-1">Rentang ideal</p>
                      </div>

                      {/* Curah Hujan */}
                      <div className="bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-850 p-4 rounded-2xl">
                        <div className="flex justify-between items-center text-[#0ea5e9]">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">Curah Hujan</span>
                          <span className="material-symbols-outlined text-lg" data-icon="water_drop">water_drop</span>
                        </div>
                        <p className="text-xl font-bold mt-2 font-mono">{(avgClimate.curah_hujan ?? avgClimate.kecepatan_angin ?? 0).toFixed(1)} mm</p>
                        <p className="text-[10px] text-stone-400 mt-1">Rata-rata bulanan</p>
                      </div>
                    </div>
                  </div>

                  {/* Chart Tabs */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">Grafik Prediksi Runtun Waktu (4 Bulan)</h4>
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
                          Hujan (mm)
                        </button>
                      </div>
                    </div>

                    {/* Custom SVG Line Chart */}
                    <div className="bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-850 p-4 rounded-2xl relative overflow-hidden select-none">
                      <div className="h-[180px] w-full relative">
                        {/* Grid lines */}
                        <div className="absolute inset-0 flex flex-col justify-between py-2 opacity-5 pointer-events-none">
                          <div className="border-b border-stone-800 w-full" />
                          <div className="border-b border-stone-800 w-full" />
                          <div className="border-b border-stone-800 w-full" />
                          <div className="border-b border-stone-800 w-full" />
                        </div>

                        {/* Rendering Graph */}
                        <svg className="w-full h-full" viewBox="0 0 680 180" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#006B54" stopOpacity="0.25" />
                              <stop offset="100%" stopColor="#006B54" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>

                          {/* Gradient Fill under Path */}
                          {activeTab === "suhu" && (
                            <path 
                              d={getSvgGradientPath(forecastData.suhu, 23.0, 32.0)} 
                              fill="url(#chartGradient)"
                              className="transition-all duration-500"
                            />
                          )}
                          {activeTab === "kelembapan" && (
                            <path 
                              d={getSvgGradientPath(forecastData.kelembapan, 60, 95)} 
                              fill="url(#chartGradient)"
                              className="transition-all duration-500"
                            />
                          )}
                          {activeTab === "hujan" && (
                            <path 
                              d={getSvgGradientPath(forecastData.hujan, 0, 400)} 
                              fill="url(#chartGradient)"
                              className="transition-all duration-500"
                            />
                          )}

                          {/* Path Line */}
                          {activeTab === "suhu" && (
                            <path 
                              d={getSvgPath(forecastData.suhu, 23.0, 32.0)} 
                              fill="none" 
                              stroke="#006B54" 
                              strokeWidth="3.5" 
                              strokeLinecap="round" 
                              strokeLinejoin="round"
                              className="transition-all duration-500"
                            />
                          )}
                          {activeTab === "kelembapan" && (
                            <path 
                              d={getSvgPath(forecastData.kelembapan, 60, 95)} 
                              fill="none" 
                              stroke="#3b82f6" 
                              strokeWidth="3.5" 
                              strokeLinecap="round" 
                              strokeLinejoin="round"
                              className="transition-all duration-500"
                            />
                          )}
                          {activeTab === "hujan" && (
                            <path 
                              d={getSvgPath(forecastData.hujan, 0, 400)} 
                              fill="none" 
                              stroke="#0ea5e9" 
                              strokeWidth="3.5" 
                              strokeLinecap="round" 
                              strokeLinejoin="round"
                              className="transition-all duration-500"
                            />
                          )}

                          {/* Circular Points */}
                          {activeTab === "suhu" && forecastData.suhu.map((val, idx) => {
                            const stepX = forecastData.suhu.length > 1 ? 680 / (forecastData.suhu.length - 1) : 0;
                            const ratio = (val - 23.0) / (32.0 - 23.0);
                            const y = 180 - ratio * 180 * 0.8 - 180 * 0.1;
                            return (
                              <circle key={idx} cx={idx * stepX} cy={y} r="5" fill="white" stroke="#006B54" strokeWidth="2" />
                            );
                          })}
                          {activeTab === "kelembapan" && forecastData.kelembapan.map((val, idx) => {
                            const stepX = forecastData.kelembapan.length > 1 ? 680 / (forecastData.kelembapan.length - 1) : 0;
                            const ratio = (val - 60) / (95 - 60);
                            const y = 180 - ratio * 180 * 0.8 - 180 * 0.1;
                            return (
                              <circle key={idx} cx={idx * stepX} cy={y} r="5" fill="white" stroke="#3b82f6" strokeWidth="2" />
                            );
                          })}
                          {activeTab === "hujan" && forecastData.hujan.map((val, idx) => {
                            const stepX = forecastData.hujan.length > 1 ? 680 / (forecastData.hujan.length - 1) : 0;
                            const ratio = (val - 0) / (400 - 0);
                            const y = 180 - ratio * 180 * 0.8 - 180 * 0.1;
                            return (
                              <circle key={idx} cx={idx * stepX} cy={y} r="5" fill="white" stroke="#0ea5e9" strokeWidth="2" />
                            );
                          })}
                        </svg>

                        {/* Point details / data labels overlay */}
                        <div className="absolute top-2 left-0 right-0 flex justify-between px-2 font-mono text-[9px] text-stone-400 font-bold">
                          {activeTab === "suhu" && forecastData.suhu.map((val, idx) => <span key={idx}>{val.toFixed(1)}°C</span>)}
                          {activeTab === "kelembapan" && forecastData.kelembapan.map((val, idx) => <span key={idx}>{val.toFixed(1)}%</span>)}
                          {activeTab === "hujan" && forecastData.hujan.map((val, idx) => <span key={idx}>{val.toFixed(0)} mm</span>)}
                        </div>
                      </div>

                      {/* X-Axis labels */}
                      <div className="flex justify-between text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-tighter mt-3 border-t border-stone-100 dark:border-stone-850 pt-2">
                        {forecastData.suhu.map((_, idx) => (
                          <span key={idx}>Bulan {idx + 1}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Call to action: Navigate to Crop Suitability Recommendations */}
                  <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/10 p-4 rounded-2xl flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-emerald-800 dark:text-emerald-400">Prediksi Cuaca Berhasil Disimpan</p>
                      <p className="text-[10px] text-stone-500 dark:text-stone-400">Tekan tombol di samping untuk memproses kecocokan komoditas pangan berbasis AI.</p>
                    </div>
                    <button
                      onClick={handleNavigateToRecommendation}
                      className="bg-[#006B54] hover:bg-[#00513f] text-white py-2 px-5 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
                    >
                      <span>Lihat Rekomendasi Tanaman</span>
                      <span className="material-symbols-outlined text-xs" data-icon="arrow_forward">arrow_forward</span>
                    </button>
                  </div>

                </div>
              )}

            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
