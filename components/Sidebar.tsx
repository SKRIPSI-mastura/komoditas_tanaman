"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    {
      group: "MAIN NAVIGATION",
      items: [
        { name: "Dashboard", icon: "dashboard", href: "/dashboard" },
        { name: "Kelola Data", icon: "database", href: "/kelola-data" },
      ]
    },
    {
      group: "ANALYSIS ENGINE",
      items: [
        { name: "Proses Rekomendasi", icon: "psychology", href: "/proses-lstm" },
        { name: "Hasil Rekomendasi", icon: "assessment", href: "/hasil-rekomendasi" },
      ]
    }
  ];

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-[#f4f4e9]/95 backdrop-blur-xl dark:bg-stone-950/95 flex flex-col py-6 z-50 border-r border-[#006B54]/10 shadow-[20px_0_60px_rgba(0,0,0,0.03)]">
      {/* Brand Section */}
      <div className="px-7 mb-8 group">
        <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#006B54] to-[#00a884] flex items-center justify-center text-white shadow-lg shadow-[#006B54]/30 group-hover:rotate-6 transition-all duration-500">
                <span className="material-symbols-outlined text-2xl" data-icon="agriculture">agriculture</span>
            </div>
            <div>
                <h2 className="text-sm font-black tracking-tighter text-[#006B54] dark:text-[#00a884] leading-none mb-1">
                    EDITORIAL
                </h2>
                <h2 className="text-xs font-bold tracking-tight text-on-surface-variant leading-none">
                    AGRONOMY
                </h2>
            </div>
        </div>
      </div>

      {/* Quick Search */}
      <div className="px-5 mb-6">
          <div className="bg-white/40 dark:bg-stone-900/40 border border-[#006B54]/10 rounded-2xl flex items-center px-3 py-2 focus-within:ring-2 focus-within:ring-[#006B54]/20 transition-all">
              <span className="material-symbols-outlined text-on-surface-variant/40 text-lg mr-2" data-icon="search">search</span>
              <input 
                type="text" 
                placeholder="Quick search..." 
                className="bg-transparent border-none focus:ring-0 text-xs w-full placeholder-on-surface-variant/30 font-medium"
              />
          </div>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 overflow-y-auto px-4 space-y-5 scrollbar-hide">
        {menuItems.map((section) => (
          <div key={section.group}>
            <h3 className="px-4 text-[9px] font-black text-on-surface-variant/30 uppercase tracking-[0.4em] mb-2">
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
                      "flex items-center px-4 py-2.5 space-x-3 rounded-2xl transition-all duration-300 group text-sm relative overflow-hidden",
                      isActive
                        ? "bg-white text-[#006B54] shadow-sm border border-[#006B54]/5 font-black"
                        : "text-[#3e4944]/70 dark:text-stone-400 hover:text-[#006B54] hover:bg-white/50 transition-colors font-semibold"
                    )}
                  >
                    {/* Active Accent */}
                    {isActive && (
                        <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-[#006B54] rounded-r-full" />
                    )}
                    
                    <span 
                      className={cn(
                        "material-symbols-outlined transition-all duration-300",
                        isActive 
                            ? "text-[#006B54] scale-110" 
                            : "opacity-40 group-hover:opacity-100 group-hover:scale-110"
                      )}
                      data-icon={item.icon}
                    >
                      {item.icon}
                    </span>
                    <span>{item.name}</span>
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
        <Link 
            href="/kelola-data" 
            className="w-full bg-[#006B54] hover:bg-[#00513f] text-white py-2.5 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-[#006B54]/10 active:scale-95 transition-all group"
        >
            <span className="material-symbols-outlined text-base group-hover:rotate-90 transition-transform" data-icon="add_circle">add_circle</span>
            <span className="text-xs font-bold">Input Data Baru</span>
        </Link>

        {/* Engine Activity Widget */}
        <div className="bg-[#eeefe3]/60 dark:bg-stone-900/60 backdrop-blur-md p-3 rounded-2xl border border-[#006B54]/5 relative overflow-hidden">
           <div className="flex items-center justify-between mb-1.5">
                <span className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest leading-none">LSTM Pulse</span>
                <span className="w-1 h-1 bg-[#006B54] rounded-full animate-pulse shadow-[0_0_8px_#006B54]" />
           </div>
           <div className="flex items-end justify-between gap-1 h-4">
                <div className="w-full bg-[#006B54]/20 h-[40%] rounded-t-sm" />
                <div className="w-full bg-[#006B54]/30 h-[60%] rounded-t-sm" />
                <div className="w-full bg-[#006B54]/10 h-[30%] rounded-t-sm" />
                <div className="w-full bg-[#006B54]/40 h-[80%] rounded-t-sm animate-[h-pulse_2s_infinite_ease-in-out]" />
                <div className="w-full bg-[#006B54]/20 h-[50%] rounded-t-sm" />
                <div className="w-full bg-[#006B54]/50 h-[90%] rounded-t-sm" />
                <div className="w-full bg-[#006B54]/30 h-[45%] rounded-t-sm" />
           </div>
        </div>



        {/* User Detail Hook */}
        <div className="bg-white/30 dark:bg-stone-900/30 p-2 rounded-xl flex items-center space-x-3 border border-white/50 dark:border-stone-800/50">
            <div className="w-7 h-7 rounded-full overflow-hidden border border-[#006B54]/20 shrink-0">
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCbtdwaBkH_pEAHF_ARgc0orbTbGHRHqKPWj5mbDF3hkTUvHHf5eYA5oP7SHKwkS1KvG0mlG4StBn8ynIZLu84n8bxR4tHpidUmnj6liJDC92iROb1zRrJCjOXu0csZW10DSqf40lVI1rct0F7_kHvd3cu4Ql5RoGOH7ENRq4DX1ZZHWPNFXXIhpLz6_reOHHJRp0KGApANhlSUwzS3Cg5w8KG5RfR4KDDY5Ns8btrrKyJdfeQXGlBs_n8gKdZnVintVhwuDmpwuOZy" alt="User" />
            </div>
            <div className="overflow-hidden">
                <p className="text-[10px] font-black text-on-surface truncate leading-tight">Admin Utama</p>
                <div className="flex items-center space-x-1 mt-0.5">
                    <span className="w-1 h-1 bg-[#006B54] rounded-full" />
                    <span className="text-[8px] text-on-surface-variant font-bold opacity-60 uppercase tracking-tighter">System Admin</span>
                </div>
            </div>
        </div>
      </div>
    </aside>
  );
}
