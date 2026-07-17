// app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";

/* ─────────────────────────── Types ─────────────────────────── */
interface RowData {
  [key: string]: string;
}

type TabKey = "users" | "elevasi";

/* ─────────────────────────── Component ─────────────────────── */
export default function AdminPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState<TabKey>("users");

  // Data states
  const [userData, setUserData] = useState<RowData[]>([]);
  const [elevasiData, setElevasiData] = useState<RowData[]>([]);

  // Loading states per tab
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingElevasi, setLoadingElevasi] = useState(false);

  // Search / filter
  const [search, setSearch] = useState("");

  /* ── Auth check ── */
  useEffect(() => {
    const logged = localStorage.getItem("admin_logged_in") === "true";
    if (!logged) {
      router.push("/login");
    } else {
      setIsAdmin(true);
    }
  }, [router]);

  /* ── Fetch admin-users data ── */
  useEffect(() => {
    if (!isAdmin) return;
    setLoadingUsers(true);
    fetch("/api/admin-users")
      .then((r) => r.json())
      .then((json) => {
        setUserData(json.data || []);
        setLoadingUsers(false);
      })
      .catch(() => setLoadingUsers(false));
  }, [isAdmin]);

  /* ── Fetch elevasi data ── */
  useEffect(() => {
    if (!isAdmin) return;
    setLoadingElevasi(true);
    fetch("/api/admin-data")
      .then((r) => r.json())
      .then((json) => {
        setElevasiData(json.data || []);
        setLoadingElevasi(false);
      })
      .catch(() => setLoadingElevasi(false));
  }, [isAdmin]);

  /* ── Guard ── */
  if (!isAdmin) return null;

  /* ── Helpers ── */
  const activeData = activeTab === "users" ? userData : elevasiData;
  const isLoading = activeTab === "users" ? loadingUsers : loadingElevasi;

  const filtered = activeData.filter((row) =>
    Object.values(row).some((v) =>
      v.toLowerCase().includes(search.toLowerCase())
    )
  );

  const headers = activeData.length > 0 ? Object.keys(activeData[0]) : [];

  const tabConfig: Record<TabKey, { label: string; icon: string; count: number }> = {
    users: {
      label: "Data Admin Pengguna",
      icon: "manage_accounts",
      count: userData.length,
    },
    elevasi: {
      label: "Data Elevasi Kecamatan",
      icon: "terrain",
      count: elevasiData.length,
    },
  };

  /* ── Render ── */
  return (
    <div className="bg-stone-50 dark:bg-stone-950 text-stone-800 dark:text-stone-100 min-h-screen">
      <Sidebar />
      <Header title="Panel Admin" subtitle="Manajemen Data & Pengguna Sistem" />

      <main className="ml-0 md:ml-64 pt-20 pb-12 px-4 md:px-8 min-h-screen transition-all">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* ── Page Header ── */}
          <section className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 p-8 rounded-3xl relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#006B54]/5 to-transparent rounded-bl-full pointer-events-none" />
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2">
                <p className="text-[#006B54] dark:text-[#10b981] font-bold text-xs uppercase tracking-widest font-mono">
                  Panel Administrasi Sistem
                </p>
                <h1 className="text-3xl font-extrabold text-stone-900 dark:text-white tracking-tight leading-tight">
                  Manajemen Data Master
                </h1>
                <p className="text-stone-500 dark:text-stone-400 text-sm max-w-2xl leading-relaxed">
                  Akses eksklusif untuk melihat dan mengelola data pengguna admin dan data elevasi kecamatan yang digunakan sebagai basis sistem rekomendasi LSTM.
                </p>
              </div>
              {/* Admin badge */}
              <div className="shrink-0 flex items-center space-x-3 bg-[#006B54]/5 border border-[#006B54]/10 px-5 py-3 rounded-2xl">
                <span className="material-symbols-outlined text-[#006B54] text-2xl" data-icon="verified_user">verified_user</span>
                <div>
                  <p className="text-xs font-bold text-[#006B54] uppercase tracking-wider">Sesi Admin Aktif</p>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">Akses penuh diizinkan</p>
                </div>
              </div>
            </div>
          </section>

          {/* ── Stats Cards ── */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 p-6 rounded-3xl shadow-sm flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-[#006B54]/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[#006B54] text-xl" data-icon="people">people</span>
              </div>
              <div>
                <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Total Admin</p>
                <p className="text-2xl font-black text-stone-900 dark:text-white font-mono">
                  {loadingUsers ? "…" : userData.length}
                </p>
                <p className="text-xs text-stone-400">Pengguna terdaftar</p>
              </div>
            </div>

            <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 p-6 rounded-3xl shadow-sm flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-amber-600 text-xl" data-icon="terrain">terrain</span>
              </div>
              <div>
                <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Data Elevasi</p>
                <p className="text-2xl font-black text-stone-900 dark:text-white font-mono">
                  {loadingElevasi ? "…" : elevasiData.length}
                </p>
                <p className="text-xs text-stone-400">Kecamatan terpetakan</p>
              </div>
            </div>

            <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 p-6 rounded-3xl shadow-sm flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-emerald-600 text-xl animate-pulse" data-icon="database">database</span>
              </div>
              <div>
                <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Status Database</p>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">Online</p>
                <p className="text-xs text-stone-400">Semua sumber data aktif</p>
              </div>
            </div>
          </section>

          {/* ── Data Table Card ── */}
          <section className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-3xl overflow-hidden shadow-sm">

            {/* Card Header */}
            <div className="p-6 border-b border-stone-100 dark:border-stone-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-sm font-bold text-stone-900 dark:text-white">
                    {tabConfig[activeTab].label}
                  </h2>
                  <p className="text-xs text-stone-400 mt-0.5">
                    {filtered.length} baris data ditemukan
                    {search ? ` untuk "${search}"` : ""}
                  </p>
                </div>

                {/* Search */}
                <div className="flex items-center bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl px-4 py-2 space-x-2 w-full sm:w-72 focus-within:ring-2 focus-within:ring-[#006B54]/20 transition-all">
                  <span className="material-symbols-outlined text-stone-400 text-sm" data-icon="search">search</span>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari data…"
                    className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder-stone-400 dark:placeholder-stone-500"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="text-stone-400 hover:text-stone-600 transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm" data-icon="close">close</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Tabs */}
              <div className="flex space-x-2 mt-4">
                {(Object.keys(tabConfig) as TabKey[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => { setActiveTab(key); setSearch(""); }}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      activeTab === key
                        ? "bg-[#006B54] text-white shadow-sm shadow-[#006B54]/20"
                        : "bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700"
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm" data-icon={tabConfig[key].icon}>
                      {tabConfig[key].icon}
                    </span>
                    <span>{tabConfig[key].label}</span>
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                      activeTab === key
                        ? "bg-white/20 text-white"
                        : "bg-stone-200 dark:bg-stone-700 text-stone-500"
                    }`}>
                      {tabConfig[key].count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-3">
                  <div className="w-8 h-8 border-2 border-[#006B54] border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-stone-400">Memuat data…</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-3">
                  <span className="material-symbols-outlined text-5xl text-stone-300" data-icon="search_off">search_off</span>
                  <p className="text-stone-400 text-sm">
                    {search ? `Tidak ada data untuk "${search}"` : "Tidak ada data tersedia."}
                  </p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-stone-50 dark:bg-stone-950 text-stone-400 dark:text-stone-500 border-b border-stone-100 dark:border-stone-800">
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">#</th>
                      {headers.map((h) => (
                        <th key={h} className="px-6 py-4 text-xs font-bold uppercase tracking-wider">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                    {filtered.map((row, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-stone-50/70 dark:hover:bg-stone-800/40 transition-colors"
                      >
                        <td className="px-6 py-4 text-xs font-mono text-stone-400">{idx + 1}</td>
                        {headers.map((h, i) => (
                          <td key={h} className="px-6 py-4 text-sm">
                            {/* Special styling for first column (usually a name) */}
                            {i === 0 ? (
                              <span className="font-semibold text-stone-800 dark:text-stone-200">{row[h]}</span>
                            ) : h.toLowerCase().includes("peran") || h.toLowerCase().includes("role") ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#006B54]/10 text-[#006B54] dark:text-[#10b981] border border-[#006B54]/10">
                                {row[h]}
                              </span>
                            ) : h.toLowerCase().includes("login") || h.toLowerCase().includes("tanggal") ? (
                              <span className="text-xs text-stone-500 dark:text-stone-400 font-mono">{row[h]}</span>
                            ) : h.toLowerCase().includes("email") ? (
                              <span className="text-xs text-[#006B54] dark:text-[#10b981]">{row[h]}</span>
                            ) : (
                              <span className="text-stone-700 dark:text-stone-300">{row[h]}</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Footer */}
            {!isLoading && filtered.length > 0 && (
              <div className="px-6 py-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                <p className="text-xs text-stone-400">
                  Menampilkan <span className="font-bold text-stone-600 dark:text-stone-300">{filtered.length}</span> dari{" "}
                  <span className="font-bold text-stone-600 dark:text-stone-300">{activeData.length}</span> baris
                </p>
                <p className="text-[10px] text-stone-300 dark:text-stone-600 font-mono">
                  Sumber: CSV lokal — Aceh Utara Agro System
                </p>
              </div>
            )}
          </section>

        </div>
      </main>
    </div>
  );
}
