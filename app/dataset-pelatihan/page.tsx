"use client";

import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface DatasetData {
  id: number;
  komoditas: string;
  suhu_c: number;
  curah_hujan_mm_tahun: number;
  kelembapan_persen: number;
  ph_tanah: number;
  tanah_liat_persen: number;
  tanah_pasir_persen: number;
  tanah_debu_persen: number;
  tekstur_tanah: string;
  elevasi_mdpl: number;
  label_kelayakan: string;
  created_at?: string;
}

export default function Page() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [datasetList, setDatasetList] = useState<DatasetData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterKelayakan, setFilterKelayakan] = useState("Semua");
  const [filterKomoditas, setFilterKomoditas] = useState("Semua");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<"add" | "edit">("add");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Form state
  const [form, setForm] = useState({
    komoditas: "Padi",
    suhu_c: "",
    curah_hujan_mm_tahun: "",
    kelembapan_persen: "",
    ph_tanah: "",
    tanah_liat_persen: "",
    tanah_pasir_persen: "",
    tanah_debu_persen: "",
    tekstur_tanah: "Lempung",
    elevasi_mdpl: "",
    label_kelayakan: "Layak"
  });

  const fetchDataset = async () => {
    try {
      setIsLoading(true);
      setFetchError("");
      const { data, error } = await supabase
        .from("dataset_pelatihan")
        .select("*")
        .order("id", { ascending: false });

      if (error) throw error;
      setDatasetList(data || []);
    } catch (error: any) {
      console.error("Gagal mengambil data pelatihan:", error);
      setFetchError("Gagal terhubung ke database. " + error.message);
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
      fetchDataset();
    }
  }, [router]);

  useEffect(() => {
    if (!authorized) return;

    const channel = supabase
      .channel("dataset_pelatihan_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "dataset_pelatihan" },
        () => {
          fetchDataset();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [authorized]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const bodyPayload = {
        komoditas: form.komoditas,
        suhu_c: Number(form.suhu_c),
        curah_hujan_mm_tahun: Number(form.curah_hujan_mm_tahun),
        kelembapan_persen: Number(form.kelembapan_persen),
        ph_tanah: Number(form.ph_tanah),
        tanah_liat_persen: Number(form.tanah_liat_persen),
        tanah_pasir_persen: Number(form.tanah_pasir_persen),
        tanah_debu_persen: Number(form.tanah_debu_persen),
        tekstur_tanah: form.tekstur_tanah,
        elevasi_mdpl: Number(form.elevasi_mdpl),
        label_kelayakan: form.label_kelayakan
      };

      const { error } = await supabase
        .from("dataset_pelatihan")
        .insert([bodyPayload]);

      if (error) {
        alert("Gagal menambahkan data: " + error.message);
      } else {
        setIsModalOpen(false);
        resetForm();
        fetchDataset();
      }
    } catch (error: any) {
      console.error("Error adding dataset:", error);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) return;
    try {
      const bodyPayload = {
        komoditas: form.komoditas,
        suhu_c: Number(form.suhu_c),
        curah_hujan_mm_tahun: Number(form.curah_hujan_mm_tahun),
        kelembapan_persen: Number(form.kelembapan_persen),
        ph_tanah: Number(form.ph_tanah),
        tanah_liat_persen: Number(form.tanah_liat_persen),
        tanah_pasir_persen: Number(form.tanah_pasir_persen),
        tanah_debu_persen: Number(form.tanah_debu_persen),
        tekstur_tanah: form.tekstur_tanah,
        elevasi_mdpl: Number(form.elevasi_mdpl),
        label_kelayakan: form.label_kelayakan
      };

      const { error } = await supabase
        .from("dataset_pelatihan")
        .update(bodyPayload)
        .eq("id", selectedId);

      if (error) {
        alert("Gagal memperbarui data: " + error.message);
      } else {
        setIsModalOpen(false);
        resetForm();
        fetchDataset();
      }
    } catch (error: any) {
      console.error("Error editing dataset:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus data pelatihan ID #${id}?`)) return;
    try {
      const { error } = await supabase
        .from("dataset_pelatihan")
        .delete()
        .eq("id", id);

      if (error) {
        alert("Gagal menghapus data: " + error.message);
      } else {
        fetchDataset();
      }
    } catch (error: any) {
      console.error("Error deleting dataset:", error);
    }
  };

  const openModal = (action: "add" | "edit", item?: DatasetData) => {
    setModalAction(action);
    if (action === "edit" && item) {
      setSelectedId(item.id);
      setForm({
        komoditas: item.komoditas,
        suhu_c: String(item.suhu_c),
        curah_hujan_mm_tahun: String(item.curah_hujan_mm_tahun),
        kelembapan_persen: String(item.kelembapan_persen),
        ph_tanah: String(item.ph_tanah),
        tanah_liat_persen: String(item.tanah_liat_persen),
        tanah_pasir_persen: String(item.tanah_pasir_persen),
        tanah_debu_persen: String(item.tanah_debu_persen),
        tekstur_tanah: item.tekstur_tanah,
        elevasi_mdpl: String(item.elevasi_mdpl),
        label_kelayakan: item.label_kelayakan
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setSelectedId(null);
    setForm({
      komoditas: "Padi",
      suhu_c: "",
      curah_hujan_mm_tahun: "",
      kelembapan_persen: "",
      ph_tanah: "",
      tanah_liat_persen: "",
      tanah_pasir_persen: "",
      tanah_debu_persen: "",
      tekstur_tanah: "Lempung",
      elevasi_mdpl: "",
      label_kelayakan: "Layak"
    });
  };

  if (!authorized) return null;

  // Filter & Search Logic
  const filteredList = datasetList.filter((item) => {
    const matchesSearch = item.komoditas.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.label_kelayakan.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.tekstur_tanah.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesKelayakan = filterKelayakan === "Semua" || item.label_kelayakan === filterKelayakan;
    const matchesKomoditas = filterKomoditas === "Semua" || item.komoditas === filterKomoditas;
    return matchesSearch && matchesKelayakan && matchesKomoditas;
  });

  const uniqueKomoditasList = Array.from(new Set(datasetList.map(item => item.komoditas)));

  return (
    <div className="bg-stone-50 dark:bg-stone-950 text-stone-800 dark:text-stone-100 min-h-screen">
      <Sidebar />
      <Header title="Kelola Dataset Pelatihan" subtitle="Manajemen Data Latih untuk Pemodelan LSTM" />

      {/* Main Content */}
      <main className="ml-0 md:ml-64 pt-20 pb-12 px-4 md:px-8 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-stone-955 dark:text-white tracking-tight">Dataset Pelatihan Model</h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                Kelola data latih agronomi untuk mengoptimalkan kalibrasi model rekomendasi komoditas pangan.
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
              
              {/* Left filter options */}
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                {/* Search input */}
                <div className="bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 rounded-2xl flex items-center px-4 py-2.5 w-full md:w-60 focus-within:ring-2 focus-within:ring-[#006B54]/20 transition-all">
                  <span className="material-symbols-outlined text-stone-400 text-sm mr-2">search</span>
                  <input 
                    type="text" 
                    placeholder="Cari komoditas, tekstur..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-transparent border-none focus:outline-none text-xs w-full placeholder-stone-400 font-medium"
                  />
                </div>

                {/* Filter Komoditas */}
                <select
                  value={filterKomoditas}
                  onChange={(e) => setFilterKomoditas(e.target.value)}
                  className="bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 rounded-2xl text-xs py-2.5 px-4 font-semibold text-stone-600 dark:text-stone-300"
                >
                  <option value="Semua">Semua Komoditas</option>
                  {uniqueKomoditasList.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                  <option value="Padi">Padi</option>
                  <option value="Jagung">Jagung</option>
                  <option value="Kedelai">Kedelai</option>
                  <option value="Kacang Tanah">Kacang Tanah</option>
                  <option value="Kacang Hijau">Kacang Hijau</option>
                  <option value="Ubi Kayu">Ubi Kayu</option>
                  <option value="Ubi Jalar">Ubi Jalar</option>
                </select>

                {/* Filter Kelayakan */}
                <select
                  value={filterKelayakan}
                  onChange={(e) => setFilterKelayakan(e.target.value)}
                  className="bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 rounded-2xl text-xs py-2.5 px-4 font-semibold text-stone-600 dark:text-stone-300"
                >
                  <option value="Semua">Semua Kelayakan</option>
                  <option value="Sangat Layak">Sangat Layak</option>
                  <option value="Layak">Layak</option>
                  <option value="Kurang Layak">Kurang Layak</option>
                  <option value="Tidak Layak">Tidak Layak</option>
                </select>
              </div>

              {/* Add data button */}
              <button 
                onClick={() => openModal("add")}
                className="flex items-center px-4 py-2.5 bg-[#006B54] hover:bg-[#00513f] text-white rounded-2xl text-xs font-bold transition-all shadow-md shadow-[#006B54]/10 active:scale-95 cursor-pointer self-start md:self-auto"
              >
                <span className="material-symbols-outlined text-sm mr-1.5">add</span>
                <span>Tambah Dataset</span>
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-3">
                  <div className="w-8 h-8 border-2 border-[#006B54] border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-stone-400">Memuat data dari Supabase...</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-stone-50 dark:bg-stone-950 text-stone-400 dark:text-stone-500 border-b border-stone-100 dark:border-stone-800">
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Komoditas</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">Suhu (°C)</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">Hujan (mm/thn)</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">Lembap (%)</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">pH Tanah</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">Liat/Pasir/Debu (%)</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">Tekstur</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">Elevasi (mdpl)</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">Kelayakan</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-850">
                    {filteredList.length > 0 ? (
                      filteredList.map((item) => (
                        <tr key={item.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-900/30 transition-colors">
                          <td className="px-6 py-4 text-sm font-semibold text-stone-900 dark:text-stone-100">{item.komoditas}</td>
                          <td className="px-6 py-4 text-sm font-mono text-center font-bold">{item.suhu_c}</td>
                          <td className="px-6 py-4 text-sm font-mono text-center">{item.curah_hujan_mm_tahun}</td>
                          <td className="px-6 py-4 text-sm font-mono text-center">{item.kelembapan_persen}%</td>
                          <td className="px-6 py-4 text-sm font-mono text-center font-bold text-[#006B54] dark:text-[#10b981]">{item.ph_tanah}</td>
                          <td className="px-6 py-4 text-sm font-mono text-center text-xs">
                            {item.tanah_liat_persen} / {item.tanah_pasir_persen} / {item.tanah_debu_persen}
                          </td>
                          <td className="px-6 py-4 text-sm text-center">{item.tekstur_tanah}</td>
                          <td className="px-6 py-4 text-sm font-mono text-center">{item.elevasi_mdpl}</td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              item.label_kelayakan === "Sangat Layak"
                                ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10"
                                : item.label_kelayakan === "Layak"
                                  ? "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border border-blue-500/10"
                                  : item.label_kelayakan === "Kurang Layak"
                                    ? "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-500/10"
                                    : "bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-500/10"
                            }`}>
                              {item.label_kelayakan}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex justify-center space-x-2">
                              <button 
                                onClick={() => openModal("edit", item)}
                                className="p-1 hover:bg-stone-50 dark:hover:bg-stone-850 text-amber-600 dark:text-amber-400 rounded-lg transition-colors cursor-pointer"
                                title="Edit Data"
                              >
                                <span className="material-symbols-outlined text-sm">edit</span>
                              </button>
                              <button 
                                onClick={() => handleDelete(item.id)}
                                className="p-1 hover:bg-stone-50 dark:hover:bg-stone-850 text-red-600 dark:text-red-400 rounded-lg transition-colors cursor-pointer"
                                title="Hapus Data"
                              >
                                <span className="material-symbols-outlined text-sm">delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={10} className="px-6 py-12 text-center text-xs text-stone-400">
                          Tidak ada data dataset pelatihan ditemukan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-stone-100 dark:border-stone-800 flex justify-between items-center text-xs text-stone-500">
              <p>Menampilkan {filteredList.length} dari {datasetList.length} data</p>
              <p className="font-mono text-[10px] text-stone-300 dark:text-stone-600">Supabase: dataset_pelatihan</p>
            </div>
          </section>
        </div>
      </main>

      {/* ── Dynamic CRUD Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm transition-all duration-300 animate-fade-in">
          <div className="bg-white dark:bg-stone-900 rounded-[2rem] border border-stone-100 dark:border-stone-800 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto relative animate-scale-up">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black text-stone-900 dark:text-white">
                  {modalAction === "add" ? "Tambah" : "Edit"} Data Pelatihan
                </h3>
                <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-1 uppercase tracking-widest font-mono">
                  Sistem Informasi Agronomi
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors p-1.5 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-full cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={modalAction === "add" ? handleAdd : handleEdit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                
                <div className="col-span-2 space-y-1.5">
                  <label className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">Komoditas</label>
                  <select
                    value={form.komoditas}
                    onChange={(e) => setForm({ ...form, komoditas: e.target.value })}
                    className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#006B54]/20 text-xs py-3 px-4 transition-all font-bold"
                  >
                    <option value="Padi">Padi</option>
                    <option value="Jagung">Jagung</option>
                    <option value="Kedelai">Kedelai</option>
                    <option value="Kacang Tanah">Kacang Tanah</option>
                    <option value="Kacang Hijau">Kacang Hijau</option>
                    <option value="Ubi Kayu">Ubi Kayu</option>
                    <option value="Ubi Jalar">Ubi Jalar</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">Suhu (°C)</label>
                  <input 
                    type="number" step="any" required placeholder="Contoh: 26.5"
                    value={form.suhu_c}
                    onChange={(e) => setForm({ ...form, suhu_c: e.target.value })}
                    className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#006B54]/20 text-xs py-3 px-4 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">Curah Hujan (mm/thn)</label>
                  <input 
                    type="number" step="any" required placeholder="Contoh: 2200"
                    value={form.curah_hujan_mm_tahun}
                    onChange={(e) => setForm({ ...form, curah_hujan_mm_tahun: e.target.value })}
                    className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#006B54]/20 text-xs py-3 px-4 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">Kelembapan (%)</label>
                  <input 
                    type="number" step="any" required placeholder="Contoh: 80"
                    value={form.kelembapan_persen}
                    onChange={(e) => setForm({ ...form, kelembapan_persen: e.target.value })}
                    className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#006B54]/20 text-xs py-3 px-4 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">pH Tanah</label>
                  <input 
                    type="number" step="any" required placeholder="Contoh: 6.5"
                    value={form.ph_tanah}
                    onChange={(e) => setForm({ ...form, ph_tanah: e.target.value })}
                    className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#006B54]/20 text-xs py-3 px-4 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">Tanah Liat (%)</label>
                  <input 
                    type="number" step="any" required placeholder="Contoh: 30"
                    value={form.tanah_liat_persen}
                    onChange={(e) => setForm({ ...form, tanah_liat_persen: e.target.value })}
                    className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#006B54]/20 text-xs py-3 px-4 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">Tanah Pasir (%)</label>
                  <input 
                    type="number" step="any" required placeholder="Contoh: 30"
                    value={form.tanah_pasir_persen}
                    onChange={(e) => setForm({ ...form, tanah_pasir_persen: e.target.value })}
                    className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#006B54]/20 text-xs py-3 px-4 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">Tanah Debu (%)</label>
                  <input 
                    type="number" step="any" required placeholder="Contoh: 40"
                    value={form.tanah_debu_persen}
                    onChange={(e) => setForm({ ...form, tanah_debu_persen: e.target.value })}
                    className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#006B54]/20 text-xs py-3 px-4 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">Tekstur Tanah</label>
                  <input 
                    type="text" required placeholder="Contoh: Lempung"
                    value={form.tekstur_tanah}
                    onChange={(e) => setForm({ ...form, tekstur_tanah: e.target.value })}
                    className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#006B54]/20 text-xs py-3 px-4 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">Elevasi (MDPL)</label>
                  <input 
                    type="number" step="any" required placeholder="Contoh: 50"
                    value={form.elevasi_mdpl}
                    onChange={(e) => setForm({ ...form, elevasi_mdpl: e.target.value })}
                    className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#006B54]/20 text-xs py-3 px-4 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">Kelayakan</label>
                  <select
                    value={form.label_kelayakan}
                    onChange={(e) => setForm({ ...form, label_kelayakan: e.target.value })}
                    className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#006B54]/20 text-xs py-3 px-4 transition-all"
                  >
                    <option value="Sangat Layak">Sangat Layak</option>
                    <option value="Layak">Layak</option>
                    <option value="Kurang Layak">Kurang Layak</option>
                    <option value="Tidak Layak">Tidak Layak</option>
                  </select>
                </div>

              </div>

              {/* Modal actions */}
              <div className="pt-4 flex justify-end space-x-3 border-t border-stone-100 dark:border-stone-800">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-stone-500 hover:text-stone-700 hover:bg-stone-50 dark:hover:bg-stone-850 rounded-xl transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 text-xs font-bold bg-[#006B54] hover:bg-[#00513f] text-white rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
