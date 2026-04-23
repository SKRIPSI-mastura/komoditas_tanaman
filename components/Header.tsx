"use client";

import Link from "next/link";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="fixed top-0 right-0 left-64 h-16 z-40 bg-[#fafaee]/60 backdrop-blur-xl flex justify-between items-center px-8 border-b border-[#006B54]/5">
      {/* Page Title / Search Area */}
      <div className="flex items-center space-x-6">
        {title ? (
          <div>
            <h1 className="text-sm font-black text-[#006B54] uppercase tracking-tighter leading-none">{title}</h1>
            {subtitle && <p className="text-[10px] text-on-surface-variant/50 font-bold uppercase tracking-widest mt-1">{subtitle}</p>}
          </div>
        ) : (
          <div className="bg-white/50 backdrop-blur-md border border-[#006B54]/10 flex items-center px-4 py-2 rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-[#006B54]/20 transition-all w-80">
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
        {/* Secondary Actions Group */}
        <div className="flex items-center bg-white/40 rounded-2xl p-1 border border-[#006B54]/5 shadow-sm">
            <button title="Notifications" className="w-9 h-9 flex items-center justify-center rounded-xl text-on-surface-variant/40 hover:bg-white hover:text-[#006B54] transition-all relative group">
                <span className="material-symbols-outlined text-xl" data-icon="notifications">notifications</span>
                <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#ba1a1a] rounded-full border-2 border-[#fafaee]" />
            </button>
            <button title="Help Center" className="w-9 h-9 flex items-center justify-center rounded-xl text-on-surface-variant/40 hover:bg-white hover:text-[#006B54] transition-all">
                <span className="material-symbols-outlined text-xl" data-icon="help">help</span>
            </button>
        </div>

        <div className="h-4 w-px bg-on-surface-variant/10 mx-2" />

        {/* Primary Settings/Logout Group */}
        <div className="flex items-center bg-white/40 rounded-2xl p-1 border border-[#006B54]/5 shadow-sm">
            <Link 
                href="/settings" 
                title="System Settings" 
                className="w-9 h-9 flex items-center justify-center rounded-xl text-on-surface-variant/40 hover:bg-white hover:text-[#006B54] transition-all"
            >
                <span className="material-symbols-outlined text-xl" data-icon="settings">settings</span>
            </Link>
            <Link 
                href="/logout" 
                title="Sign Out" 
                className="w-9 h-9 flex items-center justify-center rounded-xl text-on-surface-variant/40 hover:bg-error/10 hover:text-error transition-all"
            >
                <span className="material-symbols-outlined text-xl" data-icon="logout">logout</span>
            </Link>
        </div>
      </div>
    </header>
  );
}
