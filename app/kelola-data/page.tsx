"use client";

import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface KecamatanData {
  id: number;
  kecamatan: string;
  elevasi_mdpl: number;
  ph_tanah_mean: number;
  curah_hujan_tahunan: number;
  tanah_liat: number;
  tanah_pasir: number;
  tanah_debu: number;
  tekstur_tanah: string;
  resiko_bencana: string;
}

interface KomoditasData {
  id: number;
  nama_komoditas: string;
  deskripsi: string | null;
  suhu_min_c: number;
  suhu_max_c: number;
  curah_hujan_min_mm: number;
  curah_hujan_max_mm: number;
  kelembapan_min_persen: number;
  kelembapan_max_persen: number;
  ph_min: number;
  ph_max: number;
  elevasi_min_mdpl: number;
  elevasi_max_mdpl: number;
}

export default function Page() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState<"kecamatan" | "komoditas">("kecamatan");
  const [kecamatanList, setKecamatanList] = useState<KecamatanData[]>([]);
  const [komoditasList, setKomoditasList] = useState<KomoditasData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<"add" | "edit">("add");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Form Kecamatan state
  const [formKec, setFormKec] = useState({
    nama_kecamatan: "",
    elevasi_mdpl: "",
    ph_tanah: "",
    curah_hujan_tahunan: "",
    tanah_liat: "",
    tanah_pasir: "",
    tanah_debu: "",
    tekstur_tanah: "Aluvial",
    resiko_bencana: "Rendah"
  });

  // Form Komoditas state
  const [formKom, setFormKom] = useState({
    nama_komoditas: "",
    deskripsi: "",
    suhu_min_c: "",
    suhu_max_c: "",
    curah_hujan_min_mm: "",
    curah_hujan_max_mm: "",
    kelembapan_min_persen: "",
    kelembapan_max_persen: "",
    ph_min: "",
    ph_max: "",
    elevasi_min_mdpl: "",
    elevasi_max_mdpl: ""
  });

  useEffect(() => {
    const isAdmin = localStorage.getItem("admin_logged_in") === "true";
    if (!isAdmin) {
      router.push("/login");
    } else {
      setAuthorized(true);
      fetchKecamatan();
      fetchKomoditas();
    }
  }, [router]);


  const fetchKecamatan = async () => {
    try {
      const res = await fetch("/api/kecamatan");
      const json = await res.json();
      if (json.status === "success") {
        const mapped = json.data.map((item: any) => ({
          id: item.id,
          kecamatan: item.nama_kecamatan,
          elevasi_mdpl: Number(item.elevasi_mdpl),
          ph_tanah_mean: Number(item.ph_tanah),
          curah_hujan_tahunan: item.curah_hujan_tahunan ? Number(item.curah_hujan_tahunan) : 0,
          tanah_liat: Number(item.tanah_liat),
          tanah_pasir: Number(item.tanah_pasir),
          tanah_debu: Number(item.tanah_debu),
          tekstur_tanah: item.tekstur_tanah || "N/A",
          resiko_bencana: item.resiko_bencana
        }));
        setKecamatanList(mapped);
      }
    } catch (error) {
      console.error("Gagal mengambil data kecamatan:", error);
      setFetchError("Gagal terhubung ke database. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchKomoditas = async () => {
    try {
      const res = await fetch("/api/komoditas");
      const json = await res.json();
      if (json.status === "success") {
        const mapped = json.data.map((item: any) => ({
          id: item.id,
          nama_komoditas: item.nama_komoditas,
          deskripsi: item.deskripsi,
          suhu_min_c: Number(item.suhu_min_c),
          suhu_max_c: Number(item.suhu_max_c),
          curah_hujan_min_mm: Number(item.curah_hujan_min_mm),
          curah_hujan_max_mm: Number(item.curah_hujan_max_mm),
          kelembapan_min_persen: Number(item.kelembapan_min_persen),
          kelembapan_max_persen: Number(item.kelembapan_max_persen),
          ph_min: Number(item.ph_min),
          ph_max: Number(item.ph_max),
          elevasi_min_mdpl: Number(item.elevasi_min_mdpl),
          elevasi_max_mdpl: Number(item.elevasi_max_mdpl)
        }));
        setKomoditasList(mapped);
      }
    } catch (error) {
      console.error("Gagal mengambil data komoditas:", error);
      setFetchError("Gagal terhubung ke database. Silakan coba lagi.");
    }
  };

  // Kecamatan CRUD Actions
  const handleAddKecamatan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const bodyPayload = {
        nama_kecamatan: formKec.nama_kecamatan,
        elevasi_mdpl: Number(formKec.elevasi_mdpl),
        ph_tanah: Number(formKec.ph_tanah),
        curah_hujan_tahunan: formKec.curah_hujan_tahunan ? Number(formKec.curah_hujan_tahunan) : null,
        tanah_liat: Number(formKec.tanah_liat),
        tanah_pasir: Number(formKec.tanah_pasir),
        tanah_debu: Number(formKec.tanah_debu),
        tekstur_tanah: formKec.tekstur_tanah,
        resiko_bencana: formKec.resiko_bencana
      };

      const res = await fetch("/api/kecamatan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload)
      });
      const data = await res.json();
      if (data.status === "success") {
        fetchKecamatan();
        setIsModalOpen(false);
        resetFormKec();
      } else {
        alert("Gagal menambahkan kecamatan: " + data.message);
      }
    } catch (error) {
      console.error("Error adding kecamatan:", error);
    }
  };

  const handleEditKecamatan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) return;
    try {
      const bodyPayload = {
        nama_kecamatan: formKec.nama_kecamatan,
        elevasi_mdpl: Number(formKec.elevasi_mdpl),
        ph_tanah: Number(formKec.ph_tanah),
        curah_hujan_tahunan: formKec.curah_hujan_tahunan ? Number(formKec.curah_hujan_tahunan) : null,
        tanah_liat: Number(formKec.tanah_liat),
        tanah_pasir: Number(formKec.tanah_pasir),
        tanah_debu: Number(formKec.tanah_debu),
        tekstur_tanah: formKec.tekstur_tanah,
        resiko_bencana: formKec.resiko_bencana
      };

      const res = await fetch(`/api/kecamatan/${selectedId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload)
      });
      const data = await res.json();
      if (data.status === "success") {
        fetchKecamatan();
        setIsModalOpen(false);
        resetFormKec();
      } else {
        alert("Gagal memperbarui kecamatan: " + data.message);
      }
    } catch (error) {
      console.error("Error editing kecamatan:", error);
    }
  };

  const handleDeleteKecamatan = async (id: number, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus kecamatan "${name}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    try {
      const res = await fetch(`/api/kecamatan/${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.status === "success") {
        fetchKecamatan();
      } else {
        alert("Gagal menghapus kecamatan: " + data.message);
      }
    } catch (error) {
      console.error("Error deleting kecamatan:", error);
    }
  };

  // Komoditas CRUD Actions
  const handleAddKomoditas = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const bodyPayload = {
        nama_komoditas: formKom.nama_komoditas,
        deskripsi: formKom.deskripsi || null,
        suhu_min_c: Number(formKom.suhu_min_c),
        suhu_max_c: Number(formKom.suhu_max_c),
        curah_hujan_min_mm: Number(formKom.curah_hujan_min_mm),
        curah_hujan_max_mm: Number(formKom.curah_hujan_max_mm),
        kelembapan_min_persen: Number(formKom.kelembapan_min_persen),
        kelembapan_max_persen: Number(formKom.kelembapan_max_persen),
        ph_min: Number(formKom.ph_min),
        ph_max: Number(formKom.ph_max),
        elevasi_min_mdpl: Number(formKom.elevasi_min_mdpl),
        elevasi_max_mdpl: Number(formKom.elevasi_max_mdpl)
      };

      const res = await fetch("/api/komoditas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload)
      });
      const data = await res.json();
      if (data.status === "success") {
        fetchKomoditas();
        setIsModalOpen(false);
        resetFormKom();
      } else {
        alert("Gagal menambahkan komoditas: " + data.message);
      }
    } catch (error) {
      console.error("Error adding komoditas:", error);
    }
  };

  const handleEditKomoditas = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) return;
    try {
      const bodyPayload = {
        nama_komoditas: formKom.nama_komoditas,
        deskripsi: formKom.deskripsi || null,
        suhu_min_c: Number(formKom.suhu_min_c),
        suhu_max_c: Number(formKom.suhu_max_c),
        curah_hujan_min_mm: Number(formKom.curah_hujan_min_mm),
        curah_hujan_max_mm: Number(formKom.curah_hujan_max_mm),
        kelembapan_min_persen: Number(formKom.kelembapan_min_persen),
        kelembapan_max_persen: Number(formKom.kelembapan_max_persen),
        ph_min: Number(formKom.ph_min),
        ph_max: Number(formKom.ph_max),
        elevasi_min_mdpl: Number(formKom.elevasi_min_mdpl),
        elevasi_max_mdpl: Number(formKom.elevasi_max_mdpl)
      };

      const res = await fetch(`/api/komoditas/${selectedId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload)
      });
      const data = await res.json();
      if (data.status === "success") {
        fetchKomoditas();
        setIsModalOpen(false);
        resetFormKom();
      } else {
        alert("Gagal memperbarui komoditas: " + data.message);
      }
    } catch (error) {
      console.error("Error editing komoditas:", error);
    }
  };

  const handleDeleteKomoditas = async (id: number, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus komoditas "${name}"?`)) return;
    try {
      const res = await fetch(`/api/komoditas/${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.status === "success") {
        fetchKomoditas();
      } else {
        alert("Gagal menghapus komoditas: " + data.message);
      }
    } catch (error) {
      console.error("Error deleting komoditas:", error);
    }
  };

  // Form control helpers
  const openKecamatanModal = (action: "add" | "edit", item?: KecamatanData) => {
    setModalAction(action);
    if (action === "edit" && item) {
      setSelectedId(item.id);
      setFormKec({
        nama_kecamatan: item.kecamatan,
        elevasi_mdpl: String(item.elevasi_mdpl),
        ph_tanah: String(item.ph_tanah_mean),
        curah_hujan_tahunan: String(item.curah_hujan_tahunan),
        tanah_liat: String(item.tanah_liat),
        tanah_pasir: String(item.tanah_pasir),
        tanah_debu: String(item.tanah_debu),
        tekstur_tanah: item.tekstur_tanah || "Aluvial",
        resiko_bencana: item.resiko_bencana
      });
    } else {
      resetFormKec();
    }
    setIsModalOpen(true);
  };

  const openKomoditasModal = (action: "add" | "edit", item?: KomoditasData) => {
    setModalAction(action);
    if (action === "edit" && item) {
      setSelectedId(item.id);
      setFormKom({
        nama_komoditas: item.nama_komoditas,
        deskripsi: item.deskripsi || "",
        suhu_min_c: String(item.suhu_min_c),
        suhu_max_c: String(item.suhu_max_c),
        curah_hujan_min_mm: String(item.curah_hujan_min_mm),
        curah_hujan_max_mm: String(item.curah_hujan_max_mm),
        kelembapan_min_persen: String(item.kelembapan_min_persen),
        kelembapan_max_persen: String(item.kelembapan_max_persen),
        ph_min: String(item.ph_min),
        ph_max: String(item.ph_max),
        elevasi_min_mdpl: String(item.elevasi_min_mdpl),
        elevasi_max_mdpl: String(item.elevasi_max_mdpl)
      });
    } else {
      resetFormKom();
    }
    setIsModalOpen(true);
  };

  const resetFormKec = () => {
    setSelectedId(null);
    setFormKec({
      nama_kecamatan: "",
      elevasi_mdpl: "",
      ph_tanah: "",
      curah_hujan_tahunan: "",
      tanah_liat: "",
      tanah_pasir: "",
      tanah_debu: "",
      tekstur_tanah: "Aluvial",
      resiko_bencana: "Rendah"
    });
  };

  const resetFormKom = () => {
    setSelectedId(null);
    setFormKom({
      nama_komoditas: "",
      deskripsi: "",
      suhu_min_c: "",
      suhu_max_c: "",
      curah_hujan_min_mm: "",
      curah_hujan_max_mm: "",
      kelembapan_min_persen: "",
      kelembapan_max_persen: "",
      ph_min: "",
      ph_max: "",
      elevasi_min_mdpl: "",
      elevasi_max_mdpl: ""
    });
  };

  if (!authorized) {
    return null;
  }

  // Search filter implementation
  const filteredKecamatan = kecamatanList.filter((item) =>
    item.kecamatan.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.resiko_bencana.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredKomoditas = komoditasList.filter((item) =>
    item.nama_komoditas.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.deskripsi && item.deskripsi.toLowerCase().includes(searchTerm.toLowerCase()))
  );



  return (
    <div className="bg-stone-50 dark:bg-stone-950 text-stone-800 dark:text-stone-100 min-h-screen">
      <Sidebar />
      <Header title="Kelola Data Master" subtitle="Manajemen Wilayah & Parameter Komoditas" />

      {/* Main Content */}
      <main className="ml-0 md:ml-64 pt-20 pb-12 px-4 md:px-8 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-stone-950 dark:text-white tracking-tight">Manajemen Data Master</h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                Kelola parameter lingkungan kecamatan dan rentang kecocokan komoditas pertanian pangan Aceh Utara.
              </p>
            </div>
            
            {/* Tab controls */}
            <div className="flex bg-white dark:bg-stone-900 p-1.5 rounded-2xl border border-stone-100 dark:border-stone-800 shadow-sm shrink-0">
              <button
                onClick={() => { setActiveTab("kecamatan"); setSearchTerm(""); }}
                className={`flex items-center space-x-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeTab === "kecamatan"
                    ? "bg-[#006B54] text-white shadow-sm"
                    : "text-stone-500 hover:text-stone-700 dark:text-stone-400"
                }`}
              >
                <span className="material-symbols-outlined text-base">map</span>
                <span>Data Kecamatan</span>
              </button>
              <button
                onClick={() => { setActiveTab("komoditas"); setSearchTerm(""); }}
                className={`flex items-center space-x-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeTab === "komoditas"
                    ? "bg-[#006B54] text-white shadow-sm"
                    : "text-stone-500 hover:text-stone-700 dark:text-stone-400"
                }`}
              >
                <span className="material-symbols-outlined text-base">eco</span>
                <span>Data Komoditas</span>
              </button>
            </div>
          </div>

          {fetchError && (
            <div className="bg-red-50 border border-red-500/20 text-red-800 p-4 rounded-2xl flex items-center shadow-sm">
              <span className="material-symbols-outlined mr-3 text-red-600">error</span>
              <span className="font-bold text-xs">{fetchError}</span>
            </div>
          )}

          {/* Table Section */}
          <section className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-3xl overflow-hidden shadow-sm">
            
            {/* Table Actions Header */}
            <div className="p-6 border-b border-stone-100 dark:border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              {/* Search input */}
              <div className="bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 rounded-2xl flex items-center px-4 py-2.5 w-full md:w-80 focus-within:ring-2 focus-within:ring-[#006B54]/20 transition-all">
                <span className="material-symbols-outlined text-stone-400 text-sm mr-2">search</span>
                <input 
                  type="text" 
                  placeholder={activeTab === "kecamatan" ? "Cari kecamatan..." : "Cari komoditas..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-transparent border-none focus:outline-none text-xs w-full placeholder-stone-400 font-medium"
                />
              </div>

              {/* Add data button */}
              <button 
                onClick={() => activeTab === "kecamatan" ? openKecamatanModal("add") : openKomoditasModal("add")}
                className="flex items-center px-4 py-2.5 bg-[#006B54] hover:bg-[#00513f] text-white rounded-2xl text-xs font-bold transition-all shadow-md shadow-[#006B54]/10 active:scale-95 cursor-pointer self-start md:self-auto"
              >
                <span className="material-symbols-outlined text-sm mr-1.5">add</span>
                <span>{activeTab === "kecamatan" ? "Tambah Kecamatan" : "Tambah Komoditas"}</span>
              </button>
            </div>

            {/* List Tables */}
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-3">
                  <div className="w-8 h-8 border-2 border-[#006B54] border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-stone-400">Memuat data dari Supabase...</p>
                </div>
              ) : activeTab === "kecamatan" ? (
                
                // Kecamatan Table
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-stone-50 dark:bg-stone-950 text-stone-400 dark:text-stone-500 border-b border-stone-100 dark:border-stone-800">
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Kecamatan</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">Elevasi (MDPL)</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">pH Tanah</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">Curah Hujan (mm)</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">Liat %</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">Pasir %</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">Debu %</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">Tekstur Lahan</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">Resiko Bencana</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-850">
                    {filteredKecamatan.length > 0 ? (
                      filteredKecamatan.map((item) => (
                        <tr key={item.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-900/30 transition-colors">
                          <td className="px-6 py-4 text-sm font-semibold text-stone-900 dark:text-stone-100">{item.kecamatan}</td>
                          <td className="px-6 py-4 text-sm font-mono text-center font-bold">{isNaN(Number(item.elevasi_mdpl)) ? "N/A" : Number(item.elevasi_mdpl).toFixed(1)}</td>
                          <td className="px-6 py-4 text-sm font-mono text-center font-bold text-[#006B54] dark:text-[#10b981]">{isNaN(Number(item.ph_tanah_mean)) ? "N/A" : Number(item.ph_tanah_mean).toFixed(2)}</td>
                          <td className="px-6 py-4 text-sm font-mono text-center">{isNaN(Number(item.curah_hujan_tahunan)) ? "N/A" : Math.round(Number(item.curah_hujan_tahunan))}</td>
                          <td className="px-6 py-4 text-sm font-mono text-center">{isNaN(Number(item.tanah_liat)) ? "N/A" : Number(item.tanah_liat).toFixed(1)}%</td>
                          <td className="px-6 py-4 text-sm font-mono text-center">{isNaN(Number(item.tanah_pasir)) ? "N/A" : Number(item.tanah_pasir).toFixed(1)}%</td>
                          <td className="px-6 py-4 text-sm font-mono text-center text-stone-700 dark:text-stone-300">{isNaN(Number(item.tanah_debu)) ? "N/A" : Number(item.tanah_debu).toFixed(1)}%</td>
                          <td className="px-6 py-4 text-sm text-center font-medium text-stone-700 dark:text-stone-300">{item.tekstur_tanah}</td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.resiko_bencana === "Rendah"
                                ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10"
                                : "bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-500/10"
                            }`}>
                              {item.resiko_bencana}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex justify-center space-x-2">
                              <button 
                                onClick={() => openKecamatanModal("edit", item)}
                                className="p-1 hover:bg-stone-50 dark:hover:bg-stone-850 text-amber-600 dark:text-amber-400 rounded-lg transition-colors cursor-pointer"
                                title="Edit Kecamatan"
                              >
                                <span className="material-symbols-outlined text-sm">edit</span>
                              </button>
                              <button 
                                onClick={() => handleDeleteKecamatan(item.id, item.kecamatan)}
                                className="p-1 hover:bg-stone-50 dark:hover:bg-stone-850 text-red-600 dark:text-red-400 rounded-lg transition-colors cursor-pointer"
                                title="Hapus Kecamatan"
                              >
                                <span className="material-symbols-outlined text-sm">delete</span>
                              </button>
                            </div>
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
              ) : (
                
                // Komoditas Table
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-stone-50 dark:bg-stone-950 text-stone-400 dark:text-stone-500 border-b border-stone-100 dark:border-stone-800">
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Komoditas</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">Suhu Ideal (°C)</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">Hujan Ideal (mm)</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">Kelembapan (%)</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">pH Ideal</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">Elevasi (MDPL)</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-850">
                    {filteredKomoditas.length > 0 ? (
                      filteredKomoditas.map((item) => (
                        <tr key={item.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-900/30 transition-colors">
                          <td className="px-6 py-4 text-sm font-semibold text-stone-900 dark:text-stone-100">
                            <div>
                              <p className="font-bold">{item.nama_komoditas}</p>
                              <p className="text-[10px] text-stone-400 dark:text-stone-550 font-medium max-w-xs truncate">{item.deskripsi || "Tidak ada deskripsi"}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-mono text-center font-bold">{item.suhu_min_c}-{item.suhu_max_c}</td>
                          <td className="px-6 py-4 text-sm font-mono text-center font-bold text-[#006B54] dark:text-[#10b981]">{item.curah_hujan_min_mm}-{item.curah_hujan_max_mm}</td>
                          <td className="px-6 py-4 text-sm font-mono text-center">{item.kelembapan_min_persen}-{item.kelembapan_max_persen}</td>
                          <td className="px-6 py-4 text-sm font-mono text-center">{item.ph_min}-{item.ph_max}</td>
                          <td className="px-6 py-4 text-sm font-mono text-center">{item.elevasi_min_mdpl}-{item.elevasi_max_mdpl}</td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex justify-center space-x-2">
                              <button 
                                onClick={() => openKomoditasModal("edit", item)}
                                className="p-1 hover:bg-stone-50 dark:hover:bg-stone-850 text-amber-600 dark:text-amber-400 rounded-lg transition-colors cursor-pointer"
                                title="Edit Komoditas"
                              >
                                <span className="material-symbols-outlined text-sm">edit</span>
                              </button>
                              <button 
                                onClick={() => handleDeleteKomoditas(item.id, item.nama_komoditas)}
                                className="p-1 hover:bg-stone-50 dark:hover:bg-stone-850 text-red-600 dark:text-red-400 rounded-lg transition-colors cursor-pointer"
                                title="Hapus Komoditas"
                              >
                                <span className="material-symbols-outlined text-sm">delete</span>
                              </button>
                            </div>
                          </td>
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

            {/* Table Footer */}
            <div className="px-6 py-4 border-t border-stone-100 dark:border-stone-800 flex justify-between items-center text-xs text-stone-500">
              <p>
                Menampilkan{" "}
                {activeTab === "kecamatan" ? filteredKecamatan.length : filteredKomoditas.length} dari{" "}
                {activeTab === "kecamatan" ? kecamatanList.length : komoditasList.length} data
              </p>
              <div className="flex space-x-1">
                <button className="px-3 py-1 bg-[#006B54] text-white rounded-lg font-bold">1</button>
              </div>
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
                  {modalAction === "add" ? "Tambah" : "Edit"} {activeTab === "kecamatan" ? "Kecamatan" : "Komoditas"}
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
            {activeTab === "kecamatan" ? (
              
              // Kecamatan Form
              <form onSubmit={modalAction === "add" ? handleAddKecamatan : handleEditKecamatan} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">Nama Kecamatan</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Masukkan nama kecamatan..."
                      value={formKec.nama_kecamatan}
                      onChange={(e) => setFormKec({ ...formKec, nama_kecamatan: e.target.value })}
                      className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#006B54]/20 text-xs py-3 px-4 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">Elevasi (MDPL)</label>
                    <input 
                      type="number" 
                      required
                      step="any"
                      placeholder="Contoh: 12"
                      value={formKec.elevasi_mdpl}
                      onChange={(e) => setFormKec({ ...formKec, elevasi_mdpl: e.target.value })}
                      className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#006B54]/20 text-xs py-3 px-4 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">pH Tanah</label>
                    <input 
                      type="number" 
                      required
                      step="any"
                      placeholder="Contoh: 6.2"
                      value={formKec.ph_tanah}
                      onChange={(e) => setFormKec({ ...formKec, ph_tanah: e.target.value })}
                      className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#006B54]/20 text-xs py-3 px-4 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">Curah Hujan (mm/thn)</label>
                    <input 
                      type="number" 
                      step="any"
                      placeholder="Contoh: 2280"
                      value={formKec.curah_hujan_tahunan}
                      onChange={(e) => setFormKec({ ...formKec, curah_hujan_tahunan: e.target.value })}
                      className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#006B54]/20 text-xs py-3 px-4 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">Liat %</label>
                    <input 
                      type="number" 
                      required
                      step="any"
                      placeholder="Contoh: 30"
                      value={formKec.tanah_liat}
                      onChange={(e) => setFormKec({ ...formKec, tanah_liat: e.target.value })}
                      className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#006B54]/20 text-xs py-3 px-4 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">Pasir %</label>
                    <input 
                      type="number" 
                      required
                      step="any"
                      placeholder="Contoh: 30"
                      value={formKec.tanah_pasir}
                      onChange={(e) => setFormKec({ ...formKec, tanah_pasir: e.target.value })}
                      className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#006B54]/20 text-xs py-3 px-4 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">Debu %</label>
                    <input 
                      type="number" 
                      required
                      step="any"
                      placeholder="Contoh: 40"
                      value={formKec.tanah_debu}
                      onChange={(e) => setFormKec({ ...formKec, tanah_debu: e.target.value })}
                      className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#006B54]/20 text-xs py-3 px-4 transition-all"
                    />
                  </div>

                  <div className="col-span-2 space-y-1.5">
                    <label className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">Tekstur Tanah (Jenis Tanah)</label>
                    <select 
                      value={formKec.tekstur_tanah}
                      onChange={(e) => setFormKec({ ...formKec, tekstur_tanah: e.target.value })}
                      className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#006B54]/20 text-xs py-3 px-4 transition-all"
                    >
                      <option value="Aluvial">Aluvial</option>
                      <option value="Podsolik">Podsolik</option>
                    </select>
                  </div>

                  <div className="col-span-2 space-y-1.5">
                    <label className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">Resiko Bencana</label>
                    <select 
                      value={formKec.resiko_bencana}
                      onChange={(e) => setFormKec({ ...formKec, resiko_bencana: e.target.value })}
                      className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#006B54]/20 text-xs py-3 px-4 transition-all"
                    >
                      <option value="Rendah">Rendah</option>
                      <option value="Tinggi">Tinggi</option>
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
            ) : (
              
              // Komoditas Form
              <form onSubmit={modalAction === "add" ? handleAddKomoditas : handleEditKomoditas} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">Nama Komoditas</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Masukkan nama komoditas..."
                      value={formKom.nama_komoditas}
                      onChange={(e) => setFormKom({ ...formKom, nama_komoditas: e.target.value })}
                      className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#006B54]/20 text-xs py-3 px-4 transition-all"
                    />
                  </div>

                  <div className="col-span-2 space-y-1.5">
                    <label className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">Deskripsi Singkat</label>
                    <textarea 
                      placeholder="Masukkan deskripsi tanaman..."
                      value={formKom.deskripsi}
                      onChange={(e) => setFormKom({ ...formKom, deskripsi: e.target.value })}
                      rows={2}
                      className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#006B54]/20 text-xs py-3 px-4 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">Suhu Min (°C)</label>
                    <input 
                      type="number" 
                      required
                      step="any"
                      placeholder="Min"
                      value={formKom.suhu_min_c}
                      onChange={(e) => setFormKom({ ...formKom, suhu_min_c: e.target.value })}
                      className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#006B54]/20 text-xs py-3 px-4 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">Suhu Max (°C)</label>
                    <input 
                      type="number" 
                      required
                      step="any"
                      placeholder="Max"
                      value={formKom.suhu_max_c}
                      onChange={(e) => setFormKom({ ...formKom, suhu_max_c: e.target.value })}
                      className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#006B54]/20 text-xs py-3 px-4 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">Curah Hujan Min (mm)</label>
                    <input 
                      type="number" 
                      required
                      step="any"
                      placeholder="Min"
                      value={formKom.curah_hujan_min_mm}
                      onChange={(e) => setFormKom({ ...formKom, curah_hujan_min_mm: e.target.value })}
                      className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#006B54]/20 text-xs py-3 px-4 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">Curah Hujan Max (mm)</label>
                    <input 
                      type="number" 
                      required
                      step="any"
                      placeholder="Max"
                      value={formKom.curah_hujan_max_mm}
                      onChange={(e) => setFormKom({ ...formKom, curah_hujan_max_mm: e.target.value })}
                      className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#006B54]/20 text-xs py-3 px-4 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">Kelembapan Min (%)</label>
                    <input 
                      type="number" 
                      required
                      step="any"
                      placeholder="Min"
                      value={formKom.kelembapan_min_persen}
                      onChange={(e) => setFormKom({ ...formKom, kelembapan_min_persen: e.target.value })}
                      className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#006B54]/20 text-xs py-3 px-4 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">Kelembapan Max (%)</label>
                    <input 
                      type="number" 
                      required
                      step="any"
                      placeholder="Max"
                      value={formKom.kelembapan_max_persen}
                      onChange={(e) => setFormKom({ ...formKom, kelembapan_max_persen: e.target.value })}
                      className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#006B54]/20 text-xs py-3 px-4 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">pH Min</label>
                    <input 
                      type="number" 
                      required
                      step="any"
                      placeholder="Min"
                      value={formKom.ph_min}
                      onChange={(e) => setFormKom({ ...formKom, ph_min: e.target.value })}
                      className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#006B54]/20 text-xs py-3 px-4 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-stone-400 dark:text-stone-550 uppercase tracking-wider">pH Max</label>
                    <input 
                      type="number" 
                      required
                      step="any"
                      placeholder="Max"
                      value={formKom.ph_max}
                      onChange={(e) => setFormKom({ ...formKom, ph_max: e.target.value })}
                      className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#006B54]/20 text-xs py-3 px-4 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">Elevasi Min (MDPL)</label>
                    <input 
                      type="number" 
                      required
                      step="any"
                      placeholder="Min"
                      value={formKom.elevasi_min_mdpl}
                      onChange={(e) => setFormKom({ ...formKom, elevasi_min_mdpl: e.target.value })}
                      className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#006B54]/20 text-xs py-3 px-4 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">Elevasi Max (MDPL)</label>
                    <input 
                      type="number" 
                      required
                      step="any"
                      placeholder="Max"
                      value={formKom.elevasi_max_mdpl}
                      onChange={(e) => setFormKom({ ...formKom, elevasi_max_mdpl: e.target.value })}
                      className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#006B54]/20 text-xs py-3 px-4 transition-all"
                    />
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
            )}

          </div>
        </div>
      )}
    </div>
  );
}
