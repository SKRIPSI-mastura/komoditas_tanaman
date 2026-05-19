"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

export function Sidebar() {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Read state from localStorage reactively on navigation
    setIsAdmin(localStorage.getItem("admin_logged_in") === "true");
  }, [pathname]);

  const menuItems = [
    {
      group: "NAVIGASI UTAMA",
      items: [
        { name: "Dashboard", icon: "dashboard", href: "/dashboard" },
        ...(isAdmin ? [{ name: "Prediksi Iklim LSTM", icon: "cloud_sync", href: "/prediksi" }] : []),
        { 
          name: isAdmin ? "Data Kecamatan" : "Kelola Data (Admin Only)", 
          icon: isAdmin ? "map" : "lock", 
          href: "/kelola-data" 
        },
        { name: "Rekomendasi Tanaman", icon: "grass", href: "/rekomendasi" },
        { name: "Riwayat Prediksi", icon: "history", href: "/riwayat" },
      ]
    }
  ];

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-white dark:bg-stone-950 flex flex-col py-6 z-50 border-r border-[#006B54]/10 shadow-[4px_0_24px_rgba(0,107,84,0.03)]">
      {/* Brand Section */}
      <div className="px-7 mb-8 group">
        <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#006B54] to-[#10b981] flex items-center justify-center text-white shadow-lg shadow-[#006B54]/20 group-hover:rotate-6 transition-all duration-500">
                <span className="material-symbols-outlined text-2xl animate-pulse" data-icon="agriculture">agriculture</span>
            </div>
            <div>
                <h2 className="text-sm font-black tracking-tighter text-[#006B54] dark:text-[#10b981] leading-none mb-1">
                    AGRO-LSTM
                </h2>
                <h2 className="text-[10px] font-bold tracking-tight text-stone-400 dark:text-stone-500 leading-none">
                    Smart Recommendation
                </h2>
            </div>
        </div>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 overflow-y-auto px-4 space-y-5 scrollbar-hide">
        {menuItems.map((section) => (
          <div key={section.group}>
            <h3 className="px-4 text-[9px] font-black text-stone-400 dark:text-stone-500 uppercase tracking-[0.4em] mb-3">
              {section.group}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center px-4 py-3 space-x-3 rounded-2xl transition-all duration-300 group text-sm relative overflow-hidden",
                      isActive
                        ? "bg-[#006B54]/10 text-[#006B54] dark:bg-[#10b981]/15 dark:text-[#10b981] font-bold"
                        : "text-stone-600 dark:text-stone-400 hover:text-[#006B54] hover:bg-stone-50 dark:hover:bg-stone-900/50 transition-colors font-medium"
                    )}
                  >
                    {/* Active Accent */}
                    {isActive && (
                        <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-[#006B54] dark:bg-[#10b981] rounded-r-full" />
                    )}
                    
                    <span 
                      className={cn(
                        "material-symbols-outlined transition-all duration-300",
                        isActive 
                            ? "text-[#006B54] dark:text-[#10b981] scale-110" 
                            : "opacity-60 group-hover:opacity-100 group-hover:scale-110 group-hover:text-[#006B54] dark:group-hover:text-[#10b981]"
                      )}
                      data-icon={item.icon}
                    >
                      {item.icon}
                    </span>
                    <span className="truncate">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Action / Status Section */}
      <div className="px-4 mt-auto pt-2 pb-4 space-y-3">
        {/* Quick Action Button */}
        {isAdmin && (
          <Link 
              href="/prediksi" 
              className="w-full bg-[#006B54] hover:bg-[#00513f] text-white py-3 px-4 rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-[#006B54]/10 active:scale-95 transition-all group font-bold text-xs"
          >
              <span className="material-symbols-outlined text-base group-hover:rotate-90 transition-transform" data-icon="rocket_launch">rocket_launch</span>
              <span>Mulai Prediksi</span>
          </Link>
        )}

        {/* Engine Activity Widget */}
        <div className="bg-[#006B54]/5 dark:bg-stone-900/40 p-4 rounded-2xl border border-[#006B54]/10 relative overflow-hidden">
           <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-black text-[#006B54] dark:text-[#10b981] uppercase tracking-widest leading-none">LSTM Processor</span>
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
           </div>
           <div className="flex items-end justify-between gap-1 h-5">
                <div className="w-full bg-[#006B54]/20 dark:bg-emerald-500/10 h-[40%] rounded-t-sm animate-[h-pulse_2.2s_infinite_ease-in-out]" />
                <div className="w-full bg-[#006B54]/30 dark:bg-emerald-500/20 h-[60%] rounded-t-sm" />
                <div className="w-full bg-[#006B54]/10 dark:bg-emerald-500/5 h-[30%] rounded-t-sm animate-[h-pulse_1.8s_infinite_ease-in-out]" />
                <div className="w-full bg-[#006B54]/40 dark:bg-emerald-500/30 h-[80%] rounded-t-sm animate-[h-pulse_2s_infinite_ease-in-out]" />
                <div className="w-full bg-[#006B54]/20 dark:bg-emerald-500/10 h-[50%] rounded-t-sm" />
                <div className="w-full bg-[#006B54]/50 dark:bg-emerald-500/40 h-[95%] rounded-t-sm animate-[h-pulse_1.5s_infinite_ease-in-out]" />
                <div className="w-full bg-[#006B54]/30 dark:bg-emerald-500/20 h-[45%] rounded-t-sm" />
           </div>
        </div>

        {/* User Detail Hook */}
        {isAdmin ? (
          <div className="bg-stone-50 dark:bg-stone-900/30 p-3 rounded-2xl flex items-center space-x-3 border border-stone-100 dark:border-stone-800/50">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-[#006B54]/20 shrink-0">
                  <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCbtdwaBkH_pEAHF_ARgc0orbTbGHRHqKPWj5mbDF3hkTUvHHf5eYA5oP7SHKwkS1KvG0mlG4StBn8ynIZLu84n8bxR4tHpidUmnj6liJDC92iROb1zRrJCjOXu0csZW10DSqf40lVI1rct0F7_kHvd3cu4Ql5RoGOH7ENRq4DX1ZZHWPNFXXIhpLz6_reOHHJRp0KGApANhlSUwzS3Cg5w8KG5RfR4KDDY5Ns8btrrKyJdfeQXGlBs_n8gKdZnVintVhwuDmpwuOZy" alt="User" />
              </div>
              <div className="overflow-hidden bg-transparent flex-1">
                  <p className="text-xs font-bold text-stone-850 dark:text-stone-200 truncate leading-tight">Mastura, S.T.</p>
                  <div className="flex items-center space-x-1 mt-0.5">
                      <span className="w-1.5 h-1.5 bg-[#006B54] dark:bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-[9px] text-[#006B54] dark:text-[#10b981] font-bold uppercase tracking-wider">Admin Dinas</span>
                  </div>
              </div>
          </div>
        ) : (
          <div className="bg-stone-50 dark:bg-stone-900/30 p-3 rounded-2xl flex items-center justify-between border border-stone-100 dark:border-stone-800/50">
              <div className="flex items-center space-x-3 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-stone-200 dark:bg-stone-800 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-stone-500 text-base" data-icon="person">person</span>
                </div>
                <div className="overflow-hidden bg-transparent">
                    <p className="text-xs font-bold text-stone-705 dark:text-stone-300 truncate leading-tight">Tamu Publik</p>
                    <div className="flex items-center space-x-1 mt-0.5">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                        <span className="text-[9px] text-stone-500 font-bold uppercase tracking-wider">Pengguna Umum</span>
                    </div>
                </div>
              </div>
              <Link 
                href="/login" 
                className="text-[9px] font-black text-[#006B54] border border-[#006B54]/20 hover:bg-[#006B54] hover:text-white px-2 py-1 rounded-lg transition-all shadow-sm shrink-0"
              >
                Login
              </Link>
          </div>
        )}
      </div>
    {isAdmin && (
  <Link href="/admin" className="block w-full px-4 py-2 mt-2 text-sm text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors">
    Data Admin
  </Link>
)}
</aside>
  );
}
