import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";

export default function Page() {
  return (
    <div className="bg-background text-on-surface">
      
<Sidebar />
<Header />
{/* Main Content */}
<main className="ml-64 pt-24 pb-12 px-8 min-h-screen">
{/* Welcome Header */}
<section className="mb-10">
<div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
<div>
<p className="text-primary font-bold text-sm uppercase tracking-widest mb-1 font-label">Dashboard Overview</p>
<h1 className="text-4xl font-extrabold text-on-surface tracking-tight">Selamat Datang, Admin</h1>
<p className="text-on-surface-variant mt-2 max-w-2xl font-body">Pantau kesehatan ekosistem pertanian dan optimalkan hasil panen melalui kecerdasan buatan berbasis LSTM.</p>
</div>
<div className="flex space-x-3">
<button className="bg-primary hover:bg-primary-container text-white px-6 py-3 rounded-xl font-bold flex items-center space-x-2 transition-all">
<span className="material-symbols-outlined text-lg" data-icon="add">add</span>
<span>Input Data Baru</span>
</button>
</div>
</div>
</section>
{/* Bento Grid Statistics */}
<section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
{/* Total Data */}
<div className="md:col-span-2 bg-surface-container-lowest p-8 rounded-xl relative overflow-hidden flex flex-col justify-between min-h-[220px]">
<div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-secondary/10 to-transparent rounded-bl-full"></div>
<div>
<span className="material-symbols-outlined text-primary mb-4 p-3 bg-primary/5 rounded-lg" data-icon="database">database</span>
<h3 className="text-on-surface-variant text-sm font-bold uppercase tracking-wider">Total Data Terinput</h3>
</div>
<div className="mt-4">
<div className="text-5xl font-black text-primary font-headline">1,240</div>
<p className="text-tertiary font-medium text-sm mt-2 flex items-center">
<span className="material-symbols-outlined text-xs mr-1" data-icon="trending_up">trending_up</span>
                        +12% dibanding bulan lalu
                    </p>
</div>
</div>
{/* Status Sistem */}
<div className="bg-surface-container-lowest p-8 rounded-xl flex flex-col justify-between">
<div>
<span className="material-symbols-outlined text-tertiary mb-4 p-3 bg-tertiary/5 rounded-lg" data-icon="dynamic_feed">dynamic_feed</span>
<h3 className="text-on-surface-variant text-sm font-bold uppercase tracking-wider">Status Sistem</h3>
</div>
<div className="mt-auto">
<div className="flex items-center space-x-2 mb-2">
<div className="w-3 h-3 bg-tertiary rounded-full animate-pulse"></div>
<span className="text-2xl font-bold text-on-surface">Aktif</span>
</div>
<p className="text-on-surface-variant text-xs">Semua sensor LSTM beroperasi normal.</p>
</div>
</div>
{/* Wilayah Terdaftar */}
<div className="bg-surface-container-lowest p-8 rounded-xl flex flex-col justify-between">
<div>
<span className="material-symbols-outlined text-secondary mb-4 p-3 bg-secondary/5 rounded-lg" data-icon="map">map</span>
<h3 className="text-on-surface-variant text-sm font-bold uppercase tracking-wider">Wilayah</h3>
</div>
<div className="mt-auto">
<div className="text-4xl font-black text-on-surface">15</div>
<p className="text-on-surface-variant text-sm mt-1">Kecamatan Terdaftar</p>
</div>
</div>
</section>
{/* Health & Environment Section */}
<section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
{/* Health Gauge */}
<div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
<h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-6">Indeks Kesehatan Tanah</h3>
<div className="flex flex-col items-center py-4">
<div className="relative w-40 h-40 flex items-center justify-center">
{/* Circular Progress Simulation */}
<svg className="w-full h-full transform -rotate-90">
<circle className="text-surface-container" cx="80" cy="80" fill="transparent" r="70" stroke="currentColor" strokeWidth="12"></circle>
<circle className="text-tertiary" cx="80" cy="80" fill="transparent" r="70" stroke="currentColor" strokeDasharray="440" strokeDashoffset="66" strokeWidth="12"></circle>
</svg>
<div className="absolute inset-0 flex flex-col items-center justify-center">
<span className="text-3xl font-black text-on-surface">85%</span>
<span className="text-[10px] uppercase font-bold text-tertiary">Optimal</span>
</div>
</div>
<p className="text-center text-on-surface-variant text-sm mt-6">Kondisi hara dan kelembapan di wilayah utama stabil.</p>
</div>
</div>

{/* Environment Chip Card */}
<div className="bg-primary p-8 rounded-xl text-white relative overflow-hidden shadow-lg hover:brightness-105 transition-all">
<div className="absolute -right-4 -bottom-4 opacity-10">
<span className="material-symbols-outlined text-9xl" data-icon="eco">eco</span>
</div>
<h3 className="text-xs font-bold uppercase tracking-[0.2em] opacity-80 mb-4">Laporan Lingkungan</h3>
<div className="grid grid-cols-2 gap-4">
<div className="bg-white/10 backdrop-blur-md p-3 rounded-lg">
<p className="text-[10px] uppercase opacity-70">Kelembapan</p>
<p className="text-xl font-bold">68%</p>
</div>
<div className="bg-white/10 backdrop-blur-md p-3 rounded-lg">
<p className="text-[10px] uppercase opacity-70">UV Index</p>
<p className="text-xl font-bold">4.2</p>
</div>
</div>
<div className="mt-6 flex items-center space-x-2">
<span className="material-symbols-outlined text-sm" data-icon="location_on">location_on</span>
<span className="text-xs font-medium opacity-90">Pemantauan Real-time Wilayah Utama</span>
</div>
</div>
</section>
{/* Bottom Detail Section: Recent Data */}
<section className="mt-8">
<div className="bg-surface-container-low rounded-xl overflow-hidden">
<div className="px-8 py-6 border-b border-outline-variant/10 flex justify-between items-center">
<h3 className="font-bold text-on-surface">Data Input Terbaru</h3>
<button className="text-primary text-sm font-bold hover:underline">Lihat Semua</button>
</div>
<div className="overflow-x-auto">
<table className="w-full text-left border-collapse">
<thead>
<tr className="bg-surface-container-high/30">
<th className="px-8 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">ID Lahan</th>
<th className="px-8 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Kecamatan</th>
<th className="px-8 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Tipe Komoditas</th>
<th className="px-8 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Status</th>
<th className="px-8 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Aksi</th>
</tr>
</thead>
<tbody className="divide-y divide-outline-variant/5">
<tr className="hover:bg-surface-container-high transition-colors group">
<td className="px-8 py-5 text-sm font-medium text-on-surface">#AGR-0921</td>
<td className="px-8 py-5 text-sm text-on-surface-variant">Sukasari</td>
<td className="px-8 py-5 text-sm text-on-surface-variant">Padi Varietas Unggul</td>
<td className="px-8 py-5">
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-tertiary/10 text-tertiary">
                                        Terverifikasi
                                    </span>
</td>
<td className="px-8 py-5">
<button className="opacity-0 group-hover:opacity-100 transition-opacity">
<span className="material-symbols-outlined text-primary" data-icon="more_horiz">more_horiz</span>
</button>
</td>
</tr>
<tr className="hover:bg-surface-container-high transition-colors group">
<td className="px-8 py-5 text-sm font-medium text-on-surface">#AGR-0922</td>
<td className="px-8 py-5 text-sm text-on-surface-variant">Cicendo</td>
<td className="px-8 py-5 text-sm text-on-surface-variant">Jagung Hibrida</td>
<td className="px-8 py-5">
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-secondary/10 text-secondary">
                                        Proses LSTM
                                    </span>
</td>
<td className="px-8 py-5">
<button className="opacity-0 group-hover:opacity-100 transition-opacity">
<span className="material-symbols-outlined text-primary" data-icon="more_horiz">more_horiz</span>
</button>
</td>
</tr>
<tr className="hover:bg-surface-container-high transition-colors group">
<td className="px-8 py-5 text-sm font-medium text-on-surface">#AGR-0923</td>
<td className="px-8 py-5 text-sm text-on-surface-variant">Coblong</td>
<td className="px-8 py-5 text-sm text-on-surface-variant">Kedelai</td>
<td className="px-8 py-5">
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-tertiary/10 text-tertiary">
                                        Terverifikasi
                                    </span>
</td>
<td className="px-8 py-5">
<button className="opacity-0 group-hover:opacity-100 transition-opacity">
<span className="material-symbols-outlined text-primary" data-icon="more_horiz">more_horiz</span>
</button>
</td>
</tr>
</tbody>
</table>
</div>
</div>
</section>
</main>
{/* FAB Overlay (Suppressed for Dashboard Context but available for major action if needed) */}
{/* Included for potential 'Add Data' shortcut on top-level */}
<div className="fixed bottom-8 right-8 z-50">
<button className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-[0_12px_32px_rgba(26,28,21,0.2)] active:scale-95 transition-transform">
<span className="material-symbols-outlined text-2xl" data-icon="chat_bubble">chat_bubble</span>
</button>
</div>

    </div>
  );
}
