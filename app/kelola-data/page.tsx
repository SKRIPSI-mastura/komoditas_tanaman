import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";

export default function Page() {
  return (
    <div className="bg-background text-on-surface">
      
<Sidebar />
<Header />
{/* Main Content */}
<main className="ml-64 pt-24 pb-12 px-8 min-h-screen">
{/* Page Header */}
<div className="mb-8">
<h2 className="text-3xl font-extrabold text-on-surface tracking-tight">Kelola Data Agronomi</h2>
<p className="text-on-surface-variant mt-1">Manajemen input dan pemantauan variabel lingkungan tanaman</p>
</div>
{/* Success Notification */}
<div className="mb-6 flex items-center bg-tertiary-fixed text-on-tertiary-fixed px-6 py-4 rounded-xl shadow-sm border-l-4 border-tertiary">
<span className="material-symbols-outlined mr-3" data-icon="check_circle" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
<span className="font-semibold tracking-wide">Data Berhasil Disimpan</span>
<button className="ml-auto opacity-70 hover:opacity-100">
<span className="material-symbols-outlined" data-icon="close">close</span>
</button>
</div>
{/* Form Section */}
<section className="bg-surface-container-low rounded-3xl p-8 mb-8 relative overflow-hidden">
{/* Decorative Gradient Soul */}
<div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-secondary/10 to-secondary-container/20 rounded-bl-full pointer-events-none"></div>
<div className="flex items-center mb-6">
<span className="material-symbols-outlined text-primary mr-2" data-icon="add_box">add_box</span>
<h3 className="text-xl font-bold text-on-surface">Input Data Baru</h3>
</div>
<form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
<div className="space-y-1.5">
<label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">Periode</label>
<input className="w-full bg-surface-container-highest border-none rounded-xl focus:ring-2 focus:ring-primary/40 text-sm py-3 px-4" type="month" />
</div>
<div className="space-y-1.5">
<label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">Kecamatan</label>
<select className="w-full bg-surface-container-highest border-none rounded-xl focus:ring-2 focus:ring-primary/40 text-sm py-3 px-4">
<option>Pilih Kecamatan</option>
<option>Sukomanunggal</option>
<option>Wonokromo</option>
<option>Gubeng</option>
</select>
</div>
<div className="space-y-1.5">
<label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">T2M (°C)</label>
<input className="w-full bg-surface-container-highest border-none rounded-xl focus:ring-2 focus:ring-primary/40 text-sm py-3 px-4" placeholder="28.5" step="0.1" type="number" />
</div>
<div className="space-y-1.5">
<label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">T2M_MAX (°C)</label>
<input className="w-full bg-surface-container-highest border-none rounded-xl focus:ring-2 focus:ring-primary/40 text-sm py-3 px-4" placeholder="32.0" step="0.1" type="number" />
</div>
<div className="space-y-1.5">
<label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">T2M_MIN (°C)</label>
<input className="w-full bg-surface-container-highest border-none rounded-xl focus:ring-2 focus:ring-primary/40 text-sm py-3 px-4" placeholder="24.2" step="0.1" type="number" />
</div>
<div className="space-y-1.5">
<label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">RH2M (%)</label>
<input className="w-full bg-surface-container-highest border-none rounded-xl focus:ring-2 focus:ring-primary/40 text-sm py-3 px-4" placeholder="85" step="1" type="number" />
</div>
<div className="space-y-1.5">
<label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">PRECTOT (mm)</label>
<input className="w-full bg-surface-container-highest border-none rounded-xl focus:ring-2 focus:ring-primary/40 text-sm py-3 px-4" placeholder="12.5" step="0.1" type="number" />
</div>
<div className="space-y-1.5">
<label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">WS2M (m/s)</label>
<input className="w-full bg-surface-container-highest border-none rounded-xl focus:ring-2 focus:ring-primary/40 text-sm py-3 px-4" placeholder="2.4" step="0.1" type="number" />
</div>
<div className="space-y-1.5">
<label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">Luas Panen (Ha)</label>
<input className="w-full bg-surface-container-highest border-none rounded-xl focus:ring-2 focus:ring-primary/40 text-sm py-3 px-4" placeholder="1250" step="1" type="number" />
</div>
<div className="space-y-1.5">
<label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">Produksi (Ton)</label>
<input className="w-full bg-surface-container-highest border-none rounded-xl focus:ring-2 focus:ring-primary/40 text-sm py-3 px-4" placeholder="45000" step="1" type="number" />
</div>
<div className="lg:col-span-5 flex justify-end mt-2">
<button className="px-8 py-3 text-secondary font-semibold hover:bg-secondary/5 rounded-xl transition-colors mr-4" type="reset">Reset</button>
<button className="px-10 py-3 bg-gradient-to-br from-primary to-primary-container text-white font-bold rounded-xl active:scale-95 transition-transform" type="submit">Simpan Data</button>
</div>
</form>
</section>
{/* Table Section */}
<section className="bg-surface-container-lowest rounded-3xl overflow-hidden">
<div className="p-8 border-b border-surface-container-low flex justify-between items-center">
<div className="flex items-center">
<span className="material-symbols-outlined text-primary mr-2" data-icon="table_rows">table_rows</span>
<h3 className="text-xl font-bold text-on-surface">Data Histori Agronomi</h3>
</div>
<div className="flex space-x-2">
<button className="flex items-center px-4 py-2 bg-surface-container-high rounded-lg text-sm font-medium hover:bg-surface-container-highest transition-colors">
<span className="material-symbols-outlined text-sm mr-2" data-icon="filter_list">filter_list</span>
                        Filter
                    </button>
<button className="flex items-center px-4 py-2 bg-surface-container-high rounded-lg text-sm font-medium hover:bg-surface-container-highest transition-colors">
<span className="material-symbols-outlined text-sm mr-2" data-icon="download">download</span>
                        Export CSV
                    </button>
</div>
</div>
<div className="overflow-x-auto">
<table className="w-full text-left">
<thead>
<tr className="bg-surface-container-low/30">
<th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Periode</th>
<th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Kecamatan</th>
<th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">T2M</th>
<th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">T2M_MAX</th>
<th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">T2M_MIN</th>
<th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">RH2M</th>
<th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">PRECTOT</th>
<th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">WS2M</th>
<th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider text-right">L. Panen</th>
<th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider text-right">Produksi</th>
<th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider text-center">Aksi</th>
</tr>
</thead>
<tbody className="divide-y divide-surface-container-low">
<tr className="hover:bg-surface-container-high transition-colors group">
<td className="px-6 py-5 font-semibold text-sm">Januari 2024</td>
<td className="px-6 py-5 text-sm">Sukomanunggal</td>
<td className="px-6 py-5 text-sm">28.2°</td>
<td className="px-6 py-5 text-sm">31.5°</td>
<td className="px-6 py-5 text-sm">25.0°</td>
<td className="px-6 py-5 text-sm">82%</td>
<td className="px-6 py-5 text-sm">11.2</td>
<td className="px-6 py-5 text-sm">3.1</td>
<td className="px-6 py-5 text-sm text-right">1,420 Ha</td>
<td className="px-6 py-5 text-sm text-right">52,100 Ton</td>
<td className="px-6 py-5">
<div className="flex justify-center space-x-2">
<button className="p-2 text-secondary hover:bg-secondary-container/20 rounded-lg transition-colors">
<span className="material-symbols-outlined text-sm" data-icon="edit">edit</span>
</button>
<button className="p-2 text-error hover:bg-error-container/40 rounded-lg transition-colors">
<span className="material-symbols-outlined text-sm" data-icon="delete">delete</span>
</button>
</div>
</td>
</tr>
<tr className="hover:bg-surface-container-high transition-colors">
<td className="px-6 py-5 font-semibold text-sm">Februari 2024</td>
<td className="px-6 py-5 text-sm">Wonokromo</td>
<td className="px-6 py-5 text-sm">27.8°</td>
<td className="px-6 py-5 text-sm">30.2°</td>
<td className="px-6 py-5 text-sm">24.5°</td>
<td className="px-6 py-5 text-sm">88%</td>
<td className="px-6 py-5 text-sm">15.8</td>
<td className="px-6 py-5 text-sm">2.8</td>
<td className="px-6 py-5 text-sm text-right">850 Ha</td>
<td className="px-6 py-5 text-sm text-right">31,400 Ton</td>
<td className="px-6 py-5">
<div className="flex justify-center space-x-2">
<button className="p-2 text-secondary hover:bg-secondary-container/20 rounded-lg transition-colors">
<span className="material-symbols-outlined text-sm" data-icon="edit">edit</span>
</button>
<button className="p-2 text-error hover:bg-error-container/40 rounded-lg transition-colors">
<span className="material-symbols-outlined text-sm" data-icon="delete">delete</span>
</button>
</div>
</td>
</tr>
<tr className="hover:bg-surface-container-high transition-colors">
<td className="px-6 py-5 font-semibold text-sm">Maret 2024</td>
<td className="px-6 py-5 text-sm">Gubeng</td>
<td className="px-6 py-5 text-sm">28.5°</td>
<td className="px-6 py-5 text-sm">32.1°</td>
<td className="px-6 py-5 text-sm">25.5°</td>
<td className="px-6 py-5 text-sm">80%</td>
<td className="px-6 py-5 text-sm">8.4</td>
<td className="px-6 py-5 text-sm">3.5</td>
<td className="px-6 py-5 text-sm text-right">2,100 Ha</td>
<td className="px-6 py-5 text-sm text-right">76,800 Ton</td>
<td className="px-6 py-5">
<div className="flex justify-center space-x-2">
<button className="p-2 text-secondary hover:bg-secondary-container/20 rounded-lg transition-colors">
<span className="material-symbols-outlined text-sm" data-icon="edit">edit</span>
</button>
<button className="p-2 text-error hover:bg-error-container/40 rounded-lg transition-colors">
<span className="material-symbols-outlined text-sm" data-icon="delete">delete</span>
</button>
</div>
</td>
</tr>
</tbody>
</table>
</div>
<div className="px-8 py-6 flex items-center justify-between border-t border-surface-container-low">
<p className="text-sm text-on-surface-variant font-medium">Menampilkan 3 dari 124 data</p>
<div className="flex space-x-1">
<button className="px-4 py-2 text-sm font-semibold text-on-surface-variant opacity-50 cursor-not-allowed">Sebelumnya</button>
<button className="px-4 py-2 text-sm font-bold bg-primary text-white rounded-lg">1</button>
<button className="px-4 py-2 text-sm font-semibold text-on-surface hover:bg-surface-container-high rounded-lg">2</button>
<button className="px-4 py-2 text-sm font-semibold text-on-surface hover:bg-surface-container-high rounded-lg">3</button>
<button className="px-4 py-2 text-sm font-semibold text-primary">Selanjutnya</button>
</div>
</div>
</section>
</main>
{/* Floating Action Button (Contextual for New Record) */}
<button className="fixed bottom-8 right-8 bg-gradient-to-br from-primary to-primary-container text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform z-50">
<span className="material-symbols-outlined" data-icon="cloud_upload">cloud_upload</span>
</button>

    </div>
  );
}
