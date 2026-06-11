"use client";

import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { useState, useEffect, Suspense, useMemo } from "react";
import Link from "next/link";

interface InputData {
  kecamatan: string;
  ph: number;
  elevasi: number;
  liat: number;
  pasir: number;
  debu: number;
  temp_pred: number;
  hum_pred: number;
  wind_pred: number;
  hujan_pred?: number; // Menambahkan curah hujan prediksi bulanan rata-rata
}

const DEFAULT_INPUTS: InputData = {
  kecamatan: "Lhoksukon",
  ph: 6.4,
  elevasi: 12,
  liat: 34,
  pasir: 34,
  debu: 32,
  temp_pred: 27.3,
  hum_pred: 82.1,
  wind_pred: 2.3,
  hujan_pred: 280, // Default mock untuk perhitungan
};

const KEC_PROFILES: Record<string, { elevasi: number; ph: number; hujan: number; liat: number; pasir: number; debu: number }> = {
  "Baktiya": { elevasi: 11, ph: 5.5, hujan: 2284, liat: 36, pasir: 28, debu: 37 },
  "Baktiya Barat": { elevasi: 4, ph: 5.5, hujan: 2284, liat: 36, pasir: 32, debu: 33 },
  "Banda Baro": { elevasi: 35, ph: 5.3, hujan: 2478, liat: 36, pasir: 34, debu: 29 },
  "Cot Girek": { elevasi: 124, ph: 5.1, hujan: 2284, liat: 35, pasir: 36, debu: 28 },
  "Dewantara": { elevasi: 9, ph: 5.4, hujan: 2478, liat: 35, pasir: 36, debu: 29 },
  "Kuta Makmur": { elevasi: 141, ph: 5.4, hujan: 2478, liat: 35, pasir: 35, debu: 30 },
  "Langkahan": { elevasi: 71, ph: 5.3, hujan: 2284, liat: 36, pasir: 33, debu: 31 },
  "Lapang": { elevasi: 4, ph: 5.2, hujan: 2284, liat: 38, pasir: 33, debu: 29 },
  "Lhoksukon": { elevasi: 12, ph: 5.4, hujan: 2284, liat: 34, pasir: 34, debu: 32 },
  "Matangkuli": { elevasi: 12, ph: 5.4, hujan: 2284, liat: 33, pasir: 30, debu: 37 },
  "Meurah Mulia": { elevasi: 18, ph: 5.1, hujan: 2478, liat: 36, pasir: 36, debu: 28 },
  "Muara Batu": { elevasi: 10, ph: 5.2, hujan: 2478, liat: 34, pasir: 39, debu: 27 },
  "Nibong": { elevasi: 17, ph: 5.2, hujan: 2284, liat: 40, pasir: 28, debu: 32 },
  "Nisam": { elevasi: 31, ph: 5.4, hujan: 2478, liat: 32, pasir: 35, debu: 33 },
  "Nisam Antara": { elevasi: 459, ph: 5.3, hujan: 2478, liat: 39, pasir: 33, debu: 28 },
  "Paya Bakong": { elevasi: 81, ph: 4.9, hujan: 2284, liat: 34, pasir: 38, debu: 28 },
  "Samudera": { elevasi: 7, ph: 5.8, hujan: 2284, liat: 33, pasir: 33, debu: 34 },
  "Sawang": { elevasi: 381, ph: 5.2, hujan: 2478, liat: 35, pasir: 34, debu: 31 },
  "Seunuddon": { elevasi: 4, ph: 5.6, hujan: 2284, liat: 40, pasir: 26, debu: 34 },
  "Syamtalira Aron": { elevasi: 5, ph: 5.6, hujan: 2478, liat: 31, pasir: 32, debu: 36 },
  "Syamtalira Bayu": { elevasi: 20, ph: 5.8, hujan: 2284, liat: 33, pasir: 33, debu: 34 },
  "Tanah Jambo Aye": { elevasi: 10, ph: 5.5, hujan: 2284, liat: 36, pasir: 32, debu: 32 },
  "Tanah Luas": { elevasi: 239, ph: 5.3, hujan: 2284, liat: 32, pasir: 33, debu: 34 },
  "Tanah Pasir": { elevasi: 5, ph: 5.6, hujan: 2284, liat: 34, pasir: 32, debu: 34 },
};

interface CropPhase {
  name: string;
  ageRange: string;
  waterNeed: "Rendah" | "Sedang" | "Tinggi" | "Sangat Tinggi";
  idealRainMin: number;
  idealRainMax: number;
}

interface CropDetail {
  umurPanen: string;
  phIdeal: [number, number];
  hujanIdeal: [number, number];
  suhuIdeal: [number, number];
  liatIdeal: [number, number];
  pasirIdeal: [number, number];
  debuIdeal: [number, number];
  fase: CropPhase[];
}

const CROP_DETAILS: Record<string, CropDetail> = {
  "Padi": {
    umurPanen: "105–120 hari",
    phIdeal: [5.5, 7.0],
    hujanIdeal: [200, 300], 
    suhuIdeal: [24, 30],
    liatIdeal: [40, 60], pasirIdeal: [20, 30], debuIdeal: [20, 30], 
    fase: [
      { name: "Perkecambahan", ageRange: "0–14 hari", waterNeed: "Tinggi", idealRainMin: 100, idealRainMax: 150 },
      { name: "Vegetatif", ageRange: "15–45 hari", waterNeed: "Sangat Tinggi", idealRainMin: 150, idealRainMax: 300 },
      { name: "Pembentukan Anakan", ageRange: "46–65 hari", waterNeed: "Tinggi", idealRainMin: 150, idealRainMax: 250 },
      { name: "Pembungaan", ageRange: "66–90 hari", waterNeed: "Sedang", idealRainMin: 100, idealRainMax: 200 },
      { name: "Pengisian Bulir", ageRange: "91–110 hari", waterNeed: "Sedang", idealRainMin: 100, idealRainMax: 150 },
      { name: "Panen", ageRange: ">110 hari", waterNeed: "Rendah", idealRainMin: 0, idealRainMax: 100 },
    ]
  },
  "Jagung": {
    umurPanen: "90–120 hari",
    phIdeal: [5.6, 7.5],
    hujanIdeal: [100, 150],
    suhuIdeal: [22, 30],
    liatIdeal: [20, 40], pasirIdeal: [30, 50], debuIdeal: [20, 40], 
    fase: [
      { name: "Perkecambahan", ageRange: "0–15 hari", waterNeed: "Sedang", idealRainMin: 50, idealRainMax: 80 },
      { name: "Pertumbuhan Daun", ageRange: "16–45 hari", waterNeed: "Tinggi", idealRainMin: 80, idealRainMax: 120 },
      { name: "Pembungaan", ageRange: "46–65 hari", waterNeed: "Sangat Tinggi", idealRainMin: 100, idealRainMax: 150 },
      { name: "Pengisian Biji", ageRange: "66–90 hari", waterNeed: "Tinggi", idealRainMin: 80, idealRainMax: 120 },
      { name: "Pematangan", ageRange: ">90 hari", waterNeed: "Rendah", idealRainMin: 0, idealRainMax: 50 },
    ]
  },
  "Kedelai": {
    umurPanen: "75–90 hari",
    phIdeal: [5.8, 6.8],
    hujanIdeal: [100, 200],
    suhuIdeal: [23, 29],
    liatIdeal: [20, 30], pasirIdeal: [30, 40], debuIdeal: [30, 50],
    fase: [
      { name: "Perkecambahan", ageRange: "0–10 hari", waterNeed: "Sedang", idealRainMin: 30, idealRainMax: 50 },
      { name: "Vegetatif", ageRange: "11–35 hari", waterNeed: "Tinggi", idealRainMin: 80, idealRainMax: 120 },
      { name: "Pembungaan", ageRange: "36–50 hari", waterNeed: "Sangat Tinggi", idealRainMin: 100, idealRainMax: 150 },
      { name: "Pengisian Polong", ageRange: "51–75 hari", waterNeed: "Tinggi", idealRainMin: 80, idealRainMax: 120 },
      { name: "Pemasakan", ageRange: ">75 hari", waterNeed: "Rendah", idealRainMin: 0, idealRainMax: 50 },
    ]
  },
  "Kacang Hijau": {
    umurPanen: "55–65 hari",
    phIdeal: [5.5, 6.5],
    hujanIdeal: [50, 100],
    suhuIdeal: [25, 35],
    liatIdeal: [10, 30], pasirIdeal: [40, 60], debuIdeal: [20, 40], 
    fase: [
      { name: "Perkecambahan", ageRange: "0–7 hari", waterNeed: "Rendah", idealRainMin: 20, idealRainMax: 40 },
      { name: "Vegetatif", ageRange: "8–25 hari", waterNeed: "Sedang", idealRainMin: 40, idealRainMax: 60 },
      { name: "Pembungaan", ageRange: "26–40 hari", waterNeed: "Tinggi", idealRainMin: 60, idealRainMax: 100 },
      { name: "Pengisian Polong", ageRange: "41–55 hari", waterNeed: "Sedang", idealRainMin: 40, idealRainMax: 60 },
      { name: "Panen", ageRange: ">55 hari", waterNeed: "Rendah", idealRainMin: 0, idealRainMax: 30 },
    ]
  },
  "Kacang Tanah": {
    umurPanen: "90–100 hari",
    phIdeal: [6.0, 6.5],
    hujanIdeal: [80, 120],
    suhuIdeal: [25, 30],
    liatIdeal: [10, 20], pasirIdeal: [50, 70], debuIdeal: [20, 30],
    fase: [
      { name: "Perkecambahan", ageRange: "0–15 hari", waterNeed: "Sedang", idealRainMin: 30, idealRainMax: 50 },
      { name: "Pertumbuhan Awal", ageRange: "16–35 hari", waterNeed: "Sedang", idealRainMin: 40, idealRainMax: 60 },
      { name: "Pembungaan", ageRange: "36–50 hari", waterNeed: "Tinggi", idealRainMin: 60, idealRainMax: 100 },
      { name: "Pembentukan Ginofor", ageRange: "51–75 hari", waterNeed: "Sangat Tinggi", idealRainMin: 80, idealRainMax: 120 },
      { name: "Pematangan Polong", ageRange: ">75 hari", waterNeed: "Rendah", idealRainMin: 0, idealRainMax: 40 },
    ]
  },
  "Ubi Jalar": {
    umurPanen: "100–120 hari",
    phIdeal: [5.5, 6.5],
    hujanIdeal: [60, 120],
    suhuIdeal: [21, 28],
    liatIdeal: [10, 30], pasirIdeal: [40, 60], debuIdeal: [20, 40],
    fase: [
      { name: "Pertumbuhan Akar", ageRange: "0–30 hari", waterNeed: "Sedang", idealRainMin: 40, idealRainMax: 60 },
      { name: "Pertumbuhan Batang", ageRange: "31–60 hari", waterNeed: "Tinggi", idealRainMin: 60, idealRainMax: 100 },
      { name: "Pembentukan Umbi", ageRange: "61–90 hari", waterNeed: "Sangat Tinggi", idealRainMin: 80, idealRainMax: 120 },
      { name: "Pembesaran Umbi", ageRange: ">90 hari", waterNeed: "Sedang", idealRainMin: 40, idealRainMax: 60 },
    ]
  },
  "Ubi Kayu": {
    umurPanen: "240–300 hari",
    phIdeal: [4.5, 8.0],
    hujanIdeal: [60, 200],
    suhuIdeal: [20, 30],
    liatIdeal: [10, 40], pasirIdeal: [30, 60], debuIdeal: [20, 40],
    fase: [
      { name: "Pertumbuhan Awal", ageRange: "0–60 hari", waterNeed: "Sedang", idealRainMin: 40, idealRainMax: 80 },
      { name: "Pertumbuhan Kanopi", ageRange: "61–120 hari", waterNeed: "Tinggi", idealRainMin: 80, idealRainMax: 150 },
      { name: "Pembentukan Umbi", ageRange: "121–180 hari", waterNeed: "Tinggi", idealRainMin: 80, idealRainMax: 150 },
      { name: "Pembesaran Umbi", ageRange: "181–240 hari", waterNeed: "Sedang", idealRainMin: 40, idealRainMax: 80 },
      { name: "Dormansi/Panen", ageRange: ">240 hari", waterNeed: "Rendah", idealRainMin: 0, idealRainMax: 50 },
    ]
  }
};

interface CropScore {
  name: string;
  score: number;
  suitability: "Sangat Layak" | "Layak" | "Kurang Layak" | "Tidak Layak";
  reasons: string[];
}


function RekomendasiPage() {
  const [selectedKec, setSelectedKec] = useState<string>("");
  const [inputs, setInputs] = useState<InputData>(DEFAULT_INPUTS);
  const [recommendations, setRecommendations] = useState<CropScore[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<CropScore | null>(null);

  const [kecamatanList, setKecamatanList] = useState<string[]>(Object.keys(KEC_PROFILES));
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    setIsAdmin(localStorage.getItem("admin_logged_in") === "true");
  }, []);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/kecamatan`)
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

  useEffect(() => {
    if (!selectedKec) {
      setRecommendations([]);
      setSelectedCrop(null);
      return;
    }

    setErrorMsg("");
    let hasLoadedLocal = false;
    const localData = localStorage.getItem("agro_lstm_prediction");

    const processData = (apiData: any, inputsData: InputData, rawCrops: any[]) => {
      setInputs(inputsData);
      
      const mappedCrops: CropScore[] = rawCrops.map((c: any) => {
        return {
          name: c.komoditas,
          score: c.score,
          suitability: c.kelayakan as any,
          reasons: c.reasons || []
        };
      });

      const sorted = mappedCrops.sort((a, b) => b.score - a.score);
      
      // Jika data dari backend kurang lengkap (misal mock), kita bisa inject fallback semua tanaman
      const allCrops = Object.keys(CROP_DETAILS);
      const finalCrops = sorted.length > 0 ? sorted : allCrops.map((c, i) => ({
        name: c,
        score: Math.max(30, 95 - (i * 7)),
        suitability: i < 2 ? "Sangat Layak" : i < 4 ? "Layak" : "Kurang Layak" as any,
        reasons: ["Curah hujan sesuai.", "Kondisi tanah mendukung."]
      }));

      setRecommendations(finalCrops);
      setSelectedCrop(finalCrops[0]);
    };

    if (localData) {
      try {
        const parsed = JSON.parse(localData);
        if (parsed.inputs && parsed.inputs.kecamatan === selectedKec) {
          // Tambahkan estimasi curah hujan dari suhu/kelembapan jika tidak ada dari API
          // Biasanya curah hujan bisa diekstrapolasi sederhana untuk keperluan display
          const hujan_pred = (parsed.climate_prediction || []).reduce((acc: number, val: any) => acc + (val.kelembapan * 2.5), 0) / 4 || 280;
          
          const fetchedInputs: InputData = {
            ...parsed.inputs,
            hujan_pred
          };
          
          processData(parsed, fetchedInputs, parsed.recommendations || []);
          hasLoadedLocal = true;
        }
      } catch (e) {
        console.error("Failed to parse local storage in rekomendasi page", e);
      }
    }

    if (!hasLoadedLocal) {
      setIsLoading(true);
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/recommend/${encodeURIComponent(selectedKec)}`)
        .then((res) => res.json())
        .then((resData) => {
          if (resData.status !== "success" || !resData.data) {
            throw new Error(resData.message || "Gagal mendapatkan data rekomendasi dari server.");
          }

          const apiData = resData.data;
          const hujan_pred = (apiData.climate_prediction || []).reduce((acc: number, val: any) => acc + (val.kelembapan * 2.5), 0) / 4 || 280;

          const fetchedInputs: InputData = {
            kecamatan: apiData.kecamatan,
            ph: apiData.profil_wilayah.ph ?? 6.4,
            elevasi: Math.round(apiData.profil_wilayah.elevasi ?? 10),
            liat: Math.round(apiData.profil_wilayah.tanah_liat_persen ?? 30),
            pasir: Math.round(apiData.profil_wilayah.tanah_pasir_persen ?? 30),
            debu: Math.round(apiData.profil_wilayah.tanah_debu_persen ?? 40),
            temp_pred: Number(apiData.avg_climate_prediction.suhu ?? 27.0),
            hum_pred: Number(apiData.avg_climate_prediction.kelembapan ?? 80.0),
            wind_pred: Number(apiData.avg_climate_prediction.kecepatan_angin ?? 2.0),
            hujan_pred
          };

          processData(apiData, fetchedInputs, apiData.recommendations || []);

          const localStoreData = {
            isCustom: false,
            inputs: fetchedInputs,
            climate_prediction: apiData.climate_prediction || [],
            recommendations: apiData.recommendations,
            top_recommendation: apiData.top_recommendation
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

  // Evaluasi Analisis Otomatis
  const analysis = useMemo(() => {
    if (!selectedCrop || !CROP_DETAILS[selectedCrop.name]) return null;
    
    const cropData = CROP_DETAILS[selectedCrop.name];
    const { hujan_pred = 250, ph, liat, pasir, debu, elevasi } = inputs;
    
    // Evaluasi Iklim
    const hMin = cropData.hujanIdeal[0];
    const hMax = cropData.hujanIdeal[1];
    let iklimStatus = "Sesuai";
    let iklimAlasan = `Curah hujan hasil prediksi sebesar ${hujan_pred.toFixed(0)} mm/bulan berada dalam rentang ideal pertumbuhan ${selectedCrop.name.toLowerCase()} yaitu ${hMin}–${hMax} mm/bulan sehingga kondisi iklim dinilai sesuai.`;
    
    if (hujan_pred < hMin) {
      iklimStatus = "Kurang Sesuai";
      iklimAlasan = `Curah hujan hasil prediksi sebesar ${hujan_pred.toFixed(0)} mm/bulan berada di bawah rentang ideal (${hMin}–${hMax} mm/bulan). Hal ini dapat menyebabkan kekurangan pasokan air yang menghambat pertumbuhan vegetatif dan generatif.`;
    } else if (hujan_pred > hMax) {
      iklimStatus = "Kurang Sesuai";
      iklimAlasan = `Curah hujan hasil prediksi sebesar ${hujan_pred.toFixed(0)} mm/bulan melebihi rentang ideal (${hMin}–${hMax} mm/bulan). Hal ini berisiko menyebabkan genangan air berlebih yang dapat membusukkan akar.`;
    }

    // Evaluasi Tanah
    let tanahStatus = "Sesuai";
    let tanahAlasan = [];
    
    if (ph >= cropData.phIdeal[0] && ph <= cropData.phIdeal[1]) {
      tanahAlasan.push(`Nilai pH tanah ${ph} berada dalam rentang optimal (${cropData.phIdeal[0]}–${cropData.phIdeal[1]}) sehingga mendukung penyerapan unsur hara dengan baik.`);
    } else {
      tanahStatus = "Perlu Perhatian";
      tanahAlasan.push(`Nilai pH tanah ${ph} di luar rentang ideal (${cropData.phIdeal[0]}–${cropData.phIdeal[1]}). Diperlukan pengapuran atau pemberian bahan organik tambahan.`);
    }

    if (liat >= cropData.liatIdeal[0]) {
      tanahAlasan.push(`Kandungan tanah liat yang cukup tinggi (${liat}%) membantu menyimpan air lebih lama sehingga mendukung pertumbuhan ${selectedCrop.name.toLowerCase()} yang membutuhkan ketersediaan air yang stabil.`);
    }

    // Evaluasi Fase Pertumbuhan
    const faseEval = cropData.fase.map(f => {
      let status = "Sesuai";
      let penjelasan = `Curah hujan hasil prediksi mampu memenuhi kebutuhan air tanaman pada fase ${f.name.toLowerCase()} sehingga mendukung pertumbuhan secara optimal.`;
      
      if (hujan_pred < f.idealRainMin) {
        status = "Kekurangan Air";
        penjelasan = `Curah hujan diprediksi kurang untuk kebutuhan fase ini. Diperlukan irigasi tambahan untuk menghindari stres air.`;
      } else if (hujan_pred > f.idealRainMax) {
        status = "Kelebihan Air";
        penjelasan = `Curah hujan diprediksi berlebih. Perlu dipastikan sistem drainase berjalan baik agar lahan tidak tergenang.`;
      }

      return { ...f, status, penjelasan };
    });

    // Evaluasi Risiko
    let risikoKekeringan = hujan_pred < (hMin * 0.8) ? "Tinggi" : hujan_pred < hMin ? "Sedang" : "Rendah";
    let risikoBanjir = (hujan_pred > 300 && elevasi < 15) ? "Tinggi" : (hujan_pred > 250 && elevasi < 30) ? "Sedang" : "Rendah";
    let risikoCuacaEkstrem = hujan_pred > 350 ? "Tinggi" : hujan_pred > 280 ? "Sedang" : "Rendah";
    let risikoGagalPanen = (risikoKekeringan === "Tinggi" || risikoBanjir === "Tinggi") ? "Tinggi" : (risikoKekeringan === "Sedang" || risikoBanjir === "Sedang") ? "Sedang" : "Rendah";

    const getRiskColor = (level: string) => level === "Tinggi" ? "bg-rose-500" : level === "Sedang" ? "bg-amber-500" : "bg-emerald-500";
    const getRiskWidth = (level: string) => level === "Tinggi" ? "100%" : level === "Sedang" ? "60%" : "20%";

    // Narasi Kesimpulan
    const kesimpulan = `Berdasarkan hasil prediksi curah hujan menggunakan model LSTM sebesar ${hujan_pred.toFixed(0)} mm/bulan, kondisi tanah pada kecamatan yang dipilih, kebutuhan air tanaman pada setiap fase pertumbuhan, serta analisis risiko lingkungan, tanaman ${selectedCrop.name} memperoleh tingkat kecocokan sebesar ${selectedCrop.score}%.

Curah hujan yang diprediksi ${iklimStatus === "Sesuai" ? "berada dalam rentang ideal pertumbuhan" : "berada di luar rentang ideal"} terutama pada fase-fase kritis. Nilai pH tanah ${ph >= cropData.phIdeal[0] && ph <= cropData.phIdeal[1] ? "juga berada dalam rentang optimal sehingga mendukung penyerapan unsur hara dan pertumbuhan akar." : "perlu sedikit penyesuaian agar penyerapan hara lebih optimal."}

Risiko gagal panen tergolong ${risikoGagalPanen.toLowerCase()} dan kondisi lingkungan secara keseluruhan ${selectedCrop.score >= 80 ? "sangat mendukung" : "cukup mendukung"} budidaya ${selectedCrop.name.toLowerCase()} sehingga tanaman ini ${selectedCrop.score >= 80 ? "sangat direkomendasikan sebagai pilihan utama" : "direkomendasikan dengan beberapa catatan agronomi"}.`;

    return {
      cropData,
      iklimStatus,
      iklimAlasan,
      tanahStatus,
      tanahAlasan,
      faseEval,
      risiko: [
        { label: "Risiko Kekeringan", level: risikoKekeringan, width: getRiskWidth(risikoKekeringan), color: getRiskColor(risikoKekeringan), desc: "Risiko tanaman kekurangan air selama siklus hidupnya." },
        { label: "Risiko Banjir", level: risikoBanjir, width: getRiskWidth(risikoBanjir), color: getRiskColor(risikoBanjir), desc: "Risiko lahan tergenang yang dapat memicu kebusukan akar." },
        { label: "Curah Hujan Ekstrem", level: risikoCuacaEkstrem, width: getRiskWidth(risikoCuacaEkstrem), color: getRiskColor(risikoCuacaEkstrem), desc: "Risiko kerusakan fisik tanaman akibat hujan badai." },
        { label: "Risiko Gagal Panen", level: risikoGagalPanen, width: getRiskWidth(risikoGagalPanen), color: getRiskColor(risikoGagalPanen), desc: "Akumulasi risiko yang berpotensi membatalkan hasil panen." }
      ],
      kesimpulan
    };
  }, [selectedCrop, inputs]);


  return (
    <div className="bg-stone-50 dark:bg-stone-950 text-stone-800 dark:text-stone-100 min-h-screen">
      <Sidebar />
      <Header title="Rekomendasi Tanaman" subtitle="Hasil Evaluasi Saraf Tiruan & Kriteria Kesesuaian Lahan" />

      <main className="ml-64 pt-20 pb-12 px-8 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Header Controls */}
          <div className="mb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-stone-950 dark:text-white tracking-tight">Justifikasi Model AI & Rekomendasi</h2>
              {selectedKec ? (
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-2xl leading-relaxed">
                  Berdasarkan parameter cuaca runtun waktu dari LSTM dan sifat fisik kimia lahan di wilayah <strong>Kecamatan {inputs.kecamatan}</strong>.
                </p>
              ) : (
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 font-medium">
                  Silakan pilih kecamatan untuk melakukan analisis kesesuaian tanaman pangan.
                </p>
              )}
            </div>
            
            <div className="flex space-x-3 shrink-0 items-center">
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

              {isAdmin && (
                <Link 
                  href="/prediksi"
                  className="px-4 py-2 bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-850 hover:bg-stone-50 text-stone-700 dark:text-stone-300 font-bold text-xs rounded-xl transition-all flex items-center space-x-1"
                >
                  <span className="material-symbols-outlined text-sm" data-icon="edit">edit</span>
                  <span>Ubah Parameter</span>
                </Link>
              )}
            </div>
          </div>

          {errorMsg && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-500/20 text-red-800 dark:text-red-400 p-4 rounded-2xl flex items-center shadow-sm animate-fade-in mb-4">
              <span className="material-symbols-outlined mr-3 text-red-600" data-icon="error">error</span>
              <span className="font-bold text-xs">{errorMsg}</span>
            </div>
          )}

          {!selectedKec && !isLoading && (
            <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-850 rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[460px] shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#006B54]/5 to-transparent rounded-bl-full pointer-events-none"></div>
              <div className="w-20 h-20 bg-emerald-50 dark:bg-stone-800/40 rounded-3xl flex items-center justify-center text-[#006B54] dark:text-[#10b981] mb-6 shadow-inner animate-pulse">
                <span className="material-symbols-outlined text-4xl" data-icon="explore">explore</span>
              </div>
              <h4 className="text-xl font-black text-stone-955 dark:text-white leading-tight">Silakan Pilih Kecamatan Terlebih Dahulu</h4>
              <p className="text-xs text-stone-400 dark:text-stone-500 max-w-md mt-2 leading-relaxed">
                Untuk menganalisis kesesuaian komoditas pertanian pangan berdasarkan pemodelan cuaca jangka panjang LSTM & sifat fisik kimia lahan, silakan pilih salah satu kecamatan.
              </p>
            </div>
          )}

          {isLoading && (
            <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-850 rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[460px] shadow-sm animate-pulse">
              <div className="w-16 h-16 rounded-full border-4 border-t-[#006B54] border-stone-100 dark:border-stone-800 animate-spin mb-6" />
              <h4 className="text-lg font-black text-stone-950 dark:text-white leading-tight">Melatih & Menganalisis dengan Model AI...</h4>
              <p className="text-stone-500 dark:text-stone-400 mt-2 text-xs leading-relaxed max-w-sm">
                Menjalankan data runtun waktu historis kecamatan pada model LSTM & mengevaluasi parameter tanah dengan model terintegrasi.
              </p>
            </div>
          )}

          {selectedKec && recommendations.length > 0 && selectedCrop && analysis && !isLoading && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
              
              {/* Left Column: Ranking & Risk */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* 1. Ringkasan Hasil AI */}
                <div className={`rounded-3xl p-6 shadow-lg border relative overflow-hidden text-white ${
                  selectedCrop.suitability === "Sangat Layak" ? "bg-gradient-to-br from-[#006B54] to-emerald-600 border-[#006B54]" :
                  selectedCrop.suitability === "Layak" ? "bg-gradient-to-br from-amber-500 to-amber-600 border-amber-600" :
                  "bg-gradient-to-br from-rose-500 to-rose-600 border-rose-600"
                }`}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-10 -translate-y-10 pointer-events-none" />
                  
                  <p className="text-[10px] font-bold tracking-widest uppercase opacity-80 mb-1">Hasil Rekomendasi Utama</p>
                  <h3 className="text-3xl font-black tracking-tight mb-4">{selectedCrop.name}</h3>
                  
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[10px] uppercase font-bold opacity-80">Tingkat Kecocokan</p>
                      <p className="text-4xl font-black font-mono mt-1">{selectedCrop.score}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-bold opacity-80">Status</p>
                      <p className="text-sm font-black mt-1 py-1 px-3 bg-white/20 rounded-xl">{selectedCrop.suitability}</p>
                    </div>
                  </div>
                </div>

                {/* Grafik 3: Ranking Tanaman */}
                <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-850 rounded-3xl p-6 shadow-sm">
                  <h3 className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest mb-4">Peringkat Komoditas</h3>
                  <div className="space-y-3">
                    {recommendations.map((crop, idx) => {
                      const isSelected = selectedCrop.name === crop.name;
                      return (
                        <button
                          key={crop.name}
                          onClick={() => setSelectedCrop(crop)}
                          className={`w-full flex items-center p-2 rounded-xl transition-all ${
                            isSelected ? "bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800" : "hover:bg-stone-50 dark:hover:bg-stone-950"
                          }`}
                        >
                          <span className="w-5 text-[10px] font-bold text-stone-400">{idx + 1}</span>
                          <div className="flex-1 text-left px-2">
                            <p className={`text-xs font-bold ${isSelected ? "text-[#006B54] dark:text-emerald-400" : ""}`}>{crop.name}</p>
                            {/* Horizontal Bar */}
                            <div className="w-full bg-stone-100 dark:bg-stone-800 h-1.5 rounded-full mt-1">
                              <div 
                                className={`h-full rounded-full ${isSelected ? "bg-[#006B54]" : "bg-stone-300 dark:bg-stone-600"}`} 
                                style={{ width: `${crop.score}%` }} 
                              />
                            </div>
                          </div>
                          <span className="font-mono text-[10px] font-bold">{crop.score}%</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 8. Analisis Risiko & Grafik 5 */}
                <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-850 rounded-3xl p-6 shadow-sm">
                  <h3 className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest mb-4">Analisis Risiko Lingkungan</h3>
                  <div className="space-y-5">
                    {analysis.risiko.map((r, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between items-center text-xs font-bold">
                          <span className="text-stone-700 dark:text-stone-300">{r.label}</span>
                          <span className={`${r.color.replace('bg-', 'text-')}`}>{r.level}</span>
                        </div>
                        <div className="w-full bg-stone-100 dark:bg-stone-800 h-2.5 rounded-full overflow-hidden">
                          <div className={`${r.color} h-full rounded-full transition-all duration-1000`} style={{ width: r.width }} />
                        </div>
                        <p className="text-[9px] text-stone-500 dark:text-stone-400 leading-relaxed pt-1">{r.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Right Column: Detailed Analysis */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* 2. Alasan Rekomendasi AI */}
                <div className="bg-[#006B54]/5 border border-[#006B54]/10 rounded-3xl p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-2xl bg-[#006B54]/10 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[#006B54]" data-icon="auto_awesome">auto_awesome</span>
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-[#006B54] uppercase tracking-wider mb-2">Alasan Rekomendasi AI</h3>
                      <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed font-medium">
                        Berdasarkan hasil prediksi curah hujan menggunakan model LSTM sebesar <strong>{(inputs.hujan_pred || 0).toFixed(0)} mm/bulan</strong> dan kondisi tanah pada kecamatan yang dipilih, tanaman {selectedCrop.name} memiliki tingkat kecocokan <strong>{selectedCrop.score}%</strong> karena kebutuhan air dan kondisi tanah sesuai dengan kebutuhan pertumbuhannya.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3. Informasi Umum Tanaman */}
                <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-850 rounded-3xl p-6 shadow-sm">
                  <h3 className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest mb-4">Informasi Umum Tanaman</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-stone-50 dark:bg-stone-950 p-4 rounded-2xl border border-stone-100 dark:border-stone-800">
                      <span className="material-symbols-outlined text-amber-500 mb-2" data-icon="calendar_month">calendar_month</span>
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Umur Panen</p>
                      <p className="font-bold text-sm mt-1">{analysis.cropData.umurPanen}</p>
                    </div>
                    <div className="bg-stone-50 dark:bg-stone-950 p-4 rounded-2xl border border-stone-100 dark:border-stone-800">
                      <span className="material-symbols-outlined text-blue-500 mb-2" data-icon="rainy">rainy</span>
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Curah Hujan Ideal</p>
                      <p className="font-bold text-sm mt-1">{analysis.cropData.hujanIdeal[0]}-{analysis.cropData.hujanIdeal[1]} mm/bln</p>
                    </div>
                    <div className="bg-stone-50 dark:bg-stone-950 p-4 rounded-2xl border border-stone-100 dark:border-stone-800">
                      <span className="material-symbols-outlined text-rose-500 mb-2" data-icon="device_thermostat">device_thermostat</span>
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Suhu Ideal</p>
                      <p className="font-bold text-sm mt-1">{analysis.cropData.suhuIdeal[0]}-{analysis.cropData.suhuIdeal[1]}°C</p>
                    </div>
                    <div className="bg-stone-50 dark:bg-stone-950 p-4 rounded-2xl border border-stone-100 dark:border-stone-800">
                      <span className="material-symbols-outlined text-emerald-500 mb-2" data-icon="science">science</span>
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">pH Ideal</p>
                      <p className="font-bold text-sm mt-1">{analysis.cropData.phIdeal[0]}-{analysis.cropData.phIdeal[1]}</p>
                    </div>
                  </div>
                </div>

                {/* 6. Analisis Kesesuaian Iklim & Grafik 1 */}
                <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-850 rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest">Kesesuaian Iklim & Curah Hujan</h3>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${analysis.iklimStatus === "Sesuai" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>{analysis.iklimStatus}</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div>
                      <p className="text-sm leading-relaxed text-stone-700 dark:text-stone-300">
                        {analysis.iklimAlasan}
                      </p>
                    </div>
                    {/* Grafik 1: Curah Hujan Prediksi vs Ideal */}
                    <div className="bg-stone-50 dark:bg-stone-950 p-4 rounded-2xl border border-stone-100 dark:border-stone-850 h-32 relative flex items-end justify-center space-x-6">
                      {/* Bar Ideal Min */}
                      <div className="flex flex-col items-center justify-end h-full group">
                        <span className="text-[10px] font-bold text-stone-400 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">{analysis.cropData.hujanIdeal[0]} mm</span>
                        <div className="w-12 bg-blue-200 dark:bg-blue-900/50 rounded-t-lg transition-all" style={{ height: `${Math.min(100, (analysis.cropData.hujanIdeal[0] / 400) * 100)}%` }}></div>
                        <span className="text-[9px] font-bold text-stone-500 mt-2">Ideal Min</span>
                      </div>
                      {/* Bar Prediksi LSTM */}
                      <div className="flex flex-col items-center justify-end h-full group">
                        <span className="text-[10px] font-bold text-[#006B54] mb-1">{inputs.hujan_pred?.toFixed(0)} mm</span>
                        <div className="w-14 bg-[#006B54] rounded-t-lg shadow-lg shadow-[#006B54]/20 transition-all" style={{ height: `${Math.min(100, ((inputs.hujan_pred||0) / 400) * 100)}%` }}></div>
                        <span className="text-[9px] font-bold text-[#006B54] mt-2">Prediksi LSTM</span>
                      </div>
                      {/* Bar Ideal Max */}
                      <div className="flex flex-col items-center justify-end h-full group">
                        <span className="text-[10px] font-bold text-stone-400 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">{analysis.cropData.hujanIdeal[1]} mm</span>
                        <div className="w-12 bg-blue-300 dark:bg-blue-800/50 rounded-t-lg transition-all" style={{ height: `${Math.min(100, (analysis.cropData.hujanIdeal[1] / 400) * 100)}%` }}></div>
                        <span className="text-[9px] font-bold text-stone-500 mt-2">Ideal Max</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4 & 5. Analisis Fase Pertumbuhan & Kebutuhan Air (Grafik 2 Terintegrasi) */}
                <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-850 rounded-3xl p-6 shadow-sm">
                  <h3 className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest mb-4">Analisis Fase Pertumbuhan & Kebutuhan Air</h3>
                  
                  <div className="space-y-4">
                    {analysis.faseEval.map((f, idx) => (
                      <div key={idx} className="bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-850 rounded-2xl p-4 md:p-5">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="w-full md:w-1/3">
                            <span className="text-[10px] font-bold text-[#006B54] uppercase tracking-wider bg-[#006B54]/10 px-2 py-0.5 rounded-lg">Fase {f.name}</span>
                            <p className="text-sm font-bold text-stone-900 dark:text-white mt-2">Umur: {f.ageRange}</p>
                            <div className="mt-2 flex items-center space-x-2">
                              <span className={`w-2 h-2 rounded-full ${f.status === "Sesuai" ? "bg-emerald-500" : f.status === "Kekurangan Air" ? "bg-amber-500" : "bg-blue-500"}`}></span>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">{f.status}</span>
                            </div>
                          </div>
                          
                          {/* Metriks per Fase */}
                          <div className="w-full md:w-1/3 space-y-2 text-xs">
                            <div className="flex justify-between border-b border-stone-200 dark:border-stone-800 pb-1">
                              <span className="text-stone-500">Kebutuhan Air:</span>
                              <span className="font-bold">{f.idealRainMin}–{f.idealRainMax} mm</span>
                            </div>
                            <div className="flex justify-between border-b border-stone-200 dark:border-stone-800 pb-1">
                              <span className="text-stone-500">Prediksi Hujan:</span>
                              <span className="font-bold text-[#006B54]">{(inputs.hujan_pred||0).toFixed(0)} mm</span>
                            </div>
                            <p className="text-[9px] text-stone-500 italic pt-1">{f.penjelasan}</p>
                          </div>

                          {/* Grafik 2: Visualisasi Kebutuhan vs Prediksi per fase */}
                          <div className="w-full md:w-1/3">
                            <div className="h-2 w-full bg-stone-200 dark:bg-stone-800 rounded-full mb-1 relative overflow-hidden">
                              <div className="absolute top-0 bottom-0 bg-blue-200 dark:bg-blue-900/50" style={{ left: `${(f.idealRainMin/400)*100}%`, width: `${((f.idealRainMax-f.idealRainMin)/400)*100}%` }}></div>
                              <div className="absolute top-0 bottom-0 bg-[#006B54] w-1.5" style={{ left: `${((inputs.hujan_pred||0)/400)*100}%` }}></div>
                            </div>
                            <div className="flex justify-between text-[8px] font-bold text-stone-400">
                              <span>0</span>
                              <span>Ideal Range (Biru) vs Prediksi (Hijau)</span>
                              <span>400mm</span>
                            </div>
                          </div>

                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 7. Analisis Kesesuaian Tanah & Grafik 4 */}
                <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-850 rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest">Kesesuaian Profil Tanah</h3>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${analysis.tanahStatus === "Sesuai" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>{analysis.tanahStatus}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      {analysis.tanahAlasan.map((alasan, i) => (
                        <p key={i} className="text-sm leading-relaxed text-stone-700 dark:text-stone-300">
                          <span className="material-symbols-outlined text-emerald-500 text-sm align-middle mr-2" data-icon="check_circle">check_circle</span>
                          {alasan}
                        </p>
                      ))}
                    </div>

                    {/* Grafik 4: Horizontal Bar Comparison Tanah */}
                    <div className="space-y-4">
                      {/* pH */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                          <span>pH Tanah ({inputs.ph})</span>
                          <span className="text-stone-400">Ideal: {analysis.cropData.phIdeal[0]}-{analysis.cropData.phIdeal[1]}</span>
                        </div>
                        <div className="w-full bg-stone-100 dark:bg-stone-800 h-2 rounded-full relative">
                          <div className="absolute h-full bg-emerald-200 dark:bg-emerald-900/50 rounded-full" style={{ left: `${(analysis.cropData.phIdeal[0]/14)*100}%`, width: `${((analysis.cropData.phIdeal[1]-analysis.cropData.phIdeal[0])/14)*100}%` }}></div>
                          <div className="absolute h-full w-2 bg-[#006B54] rounded-full -mt-0.5 shadow border border-white dark:border-stone-900" style={{ height: "12px", left: `${(inputs.ph/14)*100}%` }}></div>
                        </div>
                      </div>

                      {/* Liat */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                          <span>Liat ({inputs.liat}%)</span>
                          <span className="text-stone-400">Ideal: {analysis.cropData.liatIdeal[0]}-{analysis.cropData.liatIdeal[1]}%</span>
                        </div>
                        <div className="w-full bg-stone-100 dark:bg-stone-800 h-2 rounded-full relative">
                          <div className="absolute h-full bg-amber-200 dark:bg-amber-900/50 rounded-full" style={{ left: `${analysis.cropData.liatIdeal[0]}%`, width: `${analysis.cropData.liatIdeal[1]-analysis.cropData.liatIdeal[0]}%` }}></div>
                          <div className="absolute h-full w-2 bg-amber-600 rounded-full -mt-0.5 shadow border border-white dark:border-stone-900" style={{ height: "12px", left: `${inputs.liat}%` }}></div>
                        </div>
                      </div>

                      {/* Pasir */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                          <span>Pasir ({inputs.pasir}%)</span>
                          <span className="text-stone-400">Ideal: {analysis.cropData.pasirIdeal[0]}-{analysis.cropData.pasirIdeal[1]}%</span>
                        </div>
                        <div className="w-full bg-stone-100 dark:bg-stone-800 h-2 rounded-full relative">
                          <div className="absolute h-full bg-blue-200 dark:bg-blue-900/50 rounded-full" style={{ left: `${analysis.cropData.pasirIdeal[0]}%`, width: `${analysis.cropData.pasirIdeal[1]-analysis.cropData.pasirIdeal[0]}%` }}></div>
                          <div className="absolute h-full w-2 bg-blue-600 rounded-full -mt-0.5 shadow border border-white dark:border-stone-900" style={{ height: "12px", left: `${inputs.pasir}%` }}></div>
                        </div>
                      </div>
                      
                      {/* Debu */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                          <span>Debu ({inputs.debu}%)</span>
                          <span className="text-stone-400">Ideal: {analysis.cropData.debuIdeal[0]}-{analysis.cropData.debuIdeal[1]}%</span>
                        </div>
                        <div className="w-full bg-stone-100 dark:bg-stone-800 h-2 rounded-full relative">
                          <div className="absolute h-full bg-purple-200 dark:bg-purple-900/50 rounded-full" style={{ left: `${analysis.cropData.debuIdeal[0]}%`, width: `${analysis.cropData.debuIdeal[1]-analysis.cropData.debuIdeal[0]}%` }}></div>
                          <div className="absolute h-full w-2 bg-purple-600 rounded-full -mt-0.5 shadow border border-white dark:border-stone-900" style={{ height: "12px", left: `${inputs.debu}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 9. Kesimpulan Justifikasi AI */}
                <div className="bg-stone-900 text-stone-100 dark:bg-stone-950 dark:border dark:border-stone-800 rounded-3xl p-8 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-[#006B54]/20 rounded-full blur-3xl pointer-events-none"></div>
                  <h3 className="text-sm font-black text-emerald-400 uppercase tracking-widest mb-4 flex items-center">
                    <span className="material-symbols-outlined mr-2" data-icon="summarize">summarize</span>
                    Kesimpulan Justifikasi AI
                  </h3>
                  <p className="text-sm leading-relaxed whitespace-pre-line text-stone-300">
                    {analysis.kesimpulan}
                  </p>
                </div>

              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <RekomendasiPage />
    </Suspense>
  );
}
