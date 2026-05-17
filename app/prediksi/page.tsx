"use client";

import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Real-like profiles from Aceh Utara
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

export default function Page() {
  const router = useRouter();
  const [selectedKec, setSelectedKec] = useState("Lhoksukon");
  const [ph, setPh] = useState(6.4);
  const [jenisTanah, setJenisTanah] = useState("Lempung Berliat");
  const [elevasi, setElevasi] = useState(12);
  const [curahHujan, setCurahHujan] = useState(2100);
  
  // Interactive States
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionStep, setPredictionStep] = useState(0);
  const [hasPredicted, setHasPredicted] = useState(false);
  const [activeTab, setActiveTab] = useState<"suhu" | "kelembapan" | "angin">("suhu");

  // Auto-fill form details when subdistrict changes
  useEffect(() => {
    const profile = KEC_PROFILES[selectedKec];
    if (profile) {
      setPh(profile.ph);
      setJenisTanah(profile.jenis_tanah);
      setElevasi(profile.elevasi);
      setCurahHujan(profile.hujan);
    }
  }, [selectedKec]);

  // LSTM Pipeline simulation steps
  const steps = [
    "Memuat runtun waktu iklim historis (2020-2025)...",
    "Normalisasi skala data dengan MinMaxScaler...",
    "Membagi dataset (80% Train, 20% Test)...",
    "Melatih Model Jaringan Saraf LSTM (Epochs 20/20)...",
    "Melakukan peramalan autoregresif 7 hari ke depan..."
  ];

  const handlePredict = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPredicting(true);
    setPredictionStep(0);
    setHasPredicted(false);
  };

  useEffect(() => {
    if (!isPredicting) return;

    if (predictionStep < steps.length) {
      const timer = setTimeout(() => {
        setPredictionStep((prev) => prev + 1);
      }, 700);
      return () => clearTimeout(timer);
    } else {
      setIsPredicting(false);
      setHasPredicted(true);

      // Save input variables and dynamic climate outputs to localStorage for Recomendasi page to read
      const profile = KEC_PROFILES[selectedKec] || { liat: 20, pasir: 50, debu: 30 };
      const predictionData = {
        kecamatan: selectedKec,
        ph: Number(ph),
        jenisTanah,
        elevasi: Number(elevasi),
        curahHujan: Number(curahHujan),
        liat: profile.liat,
        pasir: profile.pasir,
        debu: profile.debu,
        temp_pred: 27.4 + (Number(elevasi) > 30 ? -1.2 : 0.4) + (Number(ph) > 6.0 ? 0.2 : -0.3),
        hum_pred: 82.5 + (curahHujan > 2000 ? 3.2 : -2.1),
        wind_pred: 2.3 + (elevasi > 40 ? 0.8 : -0.2),
      };
      localStorage.setItem("agro_lstm_prediction", JSON.stringify(predictionData));
    }
  }, [isPredicting, predictionStep]);

  // Chart dataset for 7-day forecast
  const forecastData = {
    suhu: [26.8, 27.2, 27.5, 27.1, 27.6, 27.9, 27.4],
    kelembapan: [80, 82, 83, 81, 84, 85, 82],
    angin: [2.1, 2.3, 2.5, 2.2, 2.4, 2.6, 2.3],
  };

  // Convert array to SVG path
  const getSvgPath = (data: number[], minVal: number, maxVal: number) => {
    const width = 680;
    const height = 180;
    const stepX = width / (data.length - 1);
    
    return data.map((val, idx) => {
      const x = idx * stepX;
      // Map val between minVal and maxVal to height
      const ratio = (val - minVal) / (maxVal - minVal);
      const y = height - ratio * height * 0.8 - height * 0.1; // margin top/bottom
      return `${idx === 0 ? "M" : "L"} ${x} ${y}`;
    }).join(" ");
  };

  const getSvgGradientPath = (data: number[], minVal: number, maxVal: number) => {
    const width = 680;
    const height = 180;
    const stepX = width / (data.length - 1);
    const linePath = getSvgPath(data, minVal, maxVal);
    
    // Connect to bottom right and bottom left to close path
    const lastRatio = (data[data.length - 1] - minVal) / (maxVal - minVal);
    const lastY = height - lastRatio * height * 0.8 - height * 0.1;
    const firstRatio = (data[0] - minVal) / (maxVal - minVal);
    const firstY = height - firstRatio * height * 0.8 - height * 0.1;
    
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
                      {Object.keys(KEC_PROFILES).map((kec) => (
                        <option key={kec} value={kec}>{kec}</option>
                      ))}
                    </select>
                  </div>

                  {/* Elevasi Input */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest">Elevasi Lahan (MDPL)</label>
                    <div className="relative">
                      <input 
                        type="number"
                        min="0"
                        max="1500"
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
                      min="3.0"
                      max="9.0"
                      value={ph}
                      onChange={(e) => setPh(Number(e.target.value))}
                      className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-850 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#006B54]/20 text-sm py-3 px-4 transition-all"
                      required
                    />
                  </div>

                  {/* Jenis Tanah Selection */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest">Jenis / Tekstur Tanah</label>
                    <select 
                      value={jenisTanah}
                      onChange={(e) => setJenisTanah(e.target.value)}
                      className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-850 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#006B54]/20 text-sm py-3 px-4 transition-all"
                    >
                      <option value="Lempung">Lempung (Clay)</option>
                      <option value="Lempung Berpasir">Lempung Berpasir (Sandy Clay)</option>
                      <option value="Lempung Berdebu">Lempung Berdebu (Silty Clay)</option>
                      <option value="Pasir Berlempung">Pasir Berlempung (Loamy Sand)</option>
                      <option value="Lempung Liat Berpasir">Lempung Liat Berpasir (Clay Loam)</option>
                    </select>
                  </div>

                  {/* Curah Hujan Input */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest">Curah Hujan Tahunan (mm/tahun)</label>
                    <div className="relative">
                      <input 
                        type="number"
                        min="500"
                        max="4000"
                        value={curahHujan}
                        onChange={(e) => setCurahHujan(Number(e.target.value))}
                        className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-850 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#006B54]/20 text-sm py-3 px-4 transition-all"
                        required
                      />
                      <span className="absolute right-4 top-3.5 text-xs text-stone-400">mm/thn</span>
                    </div>
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
                    Silakan atur variabel elevasi, pH tanah, curah hujan, dan subdistrik di panel kiri, lalu tekan tombol prediksi untuk mengeksekusi model neural network LSTM.
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
                    {predictionStep >= 4 && <p className="text-emerald-300 font-bold">&gt;&gt; Forecasting 7 periods completed successfully.</p>}
                  </div>
                </div>
              )}

              {/* If Predict Completed successfully */}
              {hasPredicted && (
                <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-850 rounded-3xl p-6 shadow-sm space-y-6">
                  
                  {/* Climate average metrics */}
                  <div>
                    <h3 className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-3">Hasil Prediksi Rata-Rata Iklim (7 Hari Ke Depan)</h3>
                    
                    <div className="grid grid-cols-3 gap-4">
                      {/* Suhu */}
                      <div className="bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-850 p-4 rounded-2xl">
                        <div className="flex justify-between items-center text-amber-500">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">Rerata Suhu</span>
                          <span className="material-symbols-outlined text-lg" data-icon="thermostat">thermostat</span>
                        </div>
                        <p className="text-xl font-bold mt-2 font-mono">27.3 °C</p>
                        <p className="text-[10px] text-stone-400 mt-1">Sesuai tanaman pangan</p>
                      </div>

                      {/* Kelembapan */}
                      <div className="bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-850 p-4 rounded-2xl">
                        <div className="flex justify-between items-center text-blue-500">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">Kelembapan</span>
                          <span className="material-symbols-outlined text-lg" data-icon="humidity_percentage">humidity_percentage</span>
                        </div>
                        <p className="text-xl font-bold mt-2 font-mono">82.1 %</p>
                        <p className="text-[10px] text-stone-400 mt-1">Rentang ideal</p>
                      </div>

                      {/* Kecepatan Angin */}
                      <div className="bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-850 p-4 rounded-2xl">
                        <div className="flex justify-between items-center text-[#006B54]">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">Kecepatan Angin</span>
                          <span className="material-symbols-outlined text-lg" data-icon="wind_power">wind_power</span>
                        </div>
                        <p className="text-xl font-bold mt-2 font-mono">2.3 m/s</p>
                        <p className="text-[10px] text-stone-400 mt-1">Kecepatan normal</p>
                      </div>
                    </div>
                  </div>

                  {/* Chart Tabs */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">Grafik Prediksi Runtun Waktu (7 Hari)</h4>
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
                          onClick={() => setActiveTab("angin")}
                          className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-colors cursor-pointer ${
                            activeTab === "angin" 
                              ? "bg-white dark:bg-stone-900 shadow-sm text-[#006B54]" 
                              : "text-stone-400"
                          }`}
                        >
                          Angin (m/s)
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
                              d={getSvgGradientPath(forecastData.suhu, 25.0, 30.0)} 
                              fill="url(#chartGradient)"
                              className="transition-all duration-500"
                            />
                          )}
                          {activeTab === "kelembapan" && (
                            <path 
                              d={getSvgGradientPath(forecastData.kelembapan, 70, 90)} 
                              fill="url(#chartGradient)"
                              className="transition-all duration-500"
                            />
                          )}
                          {activeTab === "angin" && (
                            <path 
                              d={getSvgGradientPath(forecastData.angin, 1.5, 3.0)} 
                              fill="url(#chartGradient)"
                              className="transition-all duration-500"
                            />
                          )}

                          {/* Path Line */}
                          {activeTab === "suhu" && (
                            <path 
                              d={getSvgPath(forecastData.suhu, 25.0, 30.0)} 
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
                              d={getSvgPath(forecastData.kelembapan, 70, 90)} 
                              fill="none" 
                              stroke="#3b82f6" 
                              strokeWidth="3.5" 
                              strokeLinecap="round" 
                              strokeLinejoin="round"
                              className="transition-all duration-500"
                            />
                          )}
                          {activeTab === "angin" && (
                            <path 
                              d={getSvgPath(forecastData.angin, 1.5, 3.0)} 
                              fill="none" 
                              stroke="#f59e0b" 
                              strokeWidth="3.5" 
                              strokeLinecap="round" 
                              strokeLinejoin="round"
                              className="transition-all duration-500"
                            />
                          )}

                          {/* Circular Points */}
                          {activeTab === "suhu" && forecastData.suhu.map((val, idx) => {
                            const stepX = 680 / 6;
                            const ratio = (val - 25.0) / (30.0 - 25.0);
                            const y = 180 - ratio * 180 * 0.8 - 180 * 0.1;
                            return (
                              <circle key={idx} cx={idx * stepX} cy={y} r="5" fill="white" stroke="#006B54" strokeWidth="2" />
                            );
                          })}
                          {activeTab === "kelembapan" && forecastData.kelembapan.map((val, idx) => {
                            const stepX = 680 / 6;
                            const ratio = (val - 70) / (90 - 70);
                            const y = 180 - ratio * 180 * 0.8 - 180 * 0.1;
                            return (
                              <circle key={idx} cx={idx * stepX} cy={y} r="5" fill="white" stroke="#3b82f6" strokeWidth="2" />
                            );
                          })}
                          {activeTab === "angin" && forecastData.angin.map((val, idx) => {
                            const stepX = 680 / 6;
                            const ratio = (val - 1.5) / (3.0 - 1.5);
                            const y = 180 - ratio * 180 * 0.8 - 180 * 0.1;
                            return (
                              <circle key={idx} cx={idx * stepX} cy={y} r="5" fill="white" stroke="#f59e0b" strokeWidth="2" />
                            );
                          })}
                        </svg>

                        {/* Point details / data labels overlay */}
                        <div className="absolute top-2 left-0 right-0 flex justify-between px-2 font-mono text-[9px] text-stone-400 font-bold">
                          {activeTab === "suhu" && forecastData.suhu.map((val, idx) => <span key={idx}>{val}°C</span>)}
                          {activeTab === "kelembapan" && forecastData.kelembapan.map((val, idx) => <span key={idx}>{val}%</span>)}
                          {activeTab === "angin" && forecastData.angin.map((val, idx) => <span key={idx}>{val}m/s</span>)}
                        </div>
                      </div>

                      {/* X-Axis labels */}
                      <div className="flex justify-between text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-tighter mt-3 border-t border-stone-100 dark:border-stone-850 pt-2">
                        <span>Hari 1</span>
                        <span>Hari 2</span>
                        <span>Hari 3</span>
                        <span>Hari 4</span>
                        <span>Hari 5</span>
                        <span>Hari 6</span>
                        <span>Hari 7 (Forecast)</span>
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
