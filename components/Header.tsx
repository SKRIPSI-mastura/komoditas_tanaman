"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(localStorage.getItem("admin_logged_in") === "true");
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
    } catch (e) {
      console.warn("Failed to call logout API", e);
    }
    localStorage.removeItem("admin_logged_in");
    setIsAdmin(false);
    router.push("/rekomendasi");
  };

  return (
    <header className="fixed top-0 right-0 left-0 md:left-64 h-16 z-40 bg-[#fafaee]/60 backdrop-blur-xl flex justify-between items-center px-4 md:px-8 border-b border-[#006B54]/5">
      {/* Page Title / Search Area */}
      <div className="flex items-center space-x-3 md:space-x-6">
        {/* Tombol Hamburger Menu (Mobile Only) */}
        <button
          onClick={() => window.dispatchEvent(new Event("toggle-sidebar"))}
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl text-stone-600 hover:bg-[#006B54]/5 hover:text-[#006B54] transition-all cursor-pointer"
          title="Buka Menu"
        >
          <span className="material-symbols-outlined text-2xl">menu</span>
        </button>

        {title ? (
          <div>
            <h1 className="text-sm font-black text-[#006B54] uppercase tracking-tighter leading-none">{title}</h1>
            {subtitle && <p className="text-[10px] text-on-surface-variant/50 font-bold uppercase tracking-widest mt-1 hidden sm:block">{subtitle}</p>}
          </div>
        ) : (
          <div className="bg-white/50 backdrop-blur-md border border-[#006B54]/10 flex items-center px-4 py-2 rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-[#006B54]/20 transition-all w-full max-w-[200px] sm:w-80">
            <span className="material-symbols-outlined text-on-surface-variant/40 text-sm mr-2" data-icon="search">search</span>
            <input 
              type="text" 
              placeholder="Search intelligence data..." 
              className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder-on-surface-variant/30 font-medium" 
            />
          </div>
        )}
      </div>

      {/* Global Actions */}
      <div className="flex items-center space-x-2">
        {isAdmin && (
          <div className="flex items-center bg-white/40 rounded-2xl p-1 border border-[#006B54]/5 shadow-sm">
              <button 
                  onClick={handleLogout}
                  title="Keluar dari Admin" 
                  className="w-9 h-9 flex items-center justify-center rounded-xl text-stone-500 hover:bg-rose-50 hover:text-rose-600 transition-all cursor-pointer"
              >
                  <span className="material-symbols-outlined text-xl" data-icon="logout">logout</span>
              </button>
          </div>
        )}
      </div>
    </header>
  );
}
