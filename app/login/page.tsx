"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Page() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError(true);
      return;
    }
    // Simple demo logic: support default credentials or any login for ease of testing
    localStorage.setItem("admin_logged_in", "true");
    router.push("/kelola-data");
  };

  return (
    <div className="bg-background text-on-surface min-h-screen flex items-center justify-center organic-bg overflow-hidden p-6">
      
      {/* Subtle Background Element */}
      <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-container rounded-full blur-[120px]"></div>
        <div className="absolute top-1/2 -right-48 w-[500px] h-[500px] bg-tertiary-fixed-dim rounded-full blur-[150px]"></div>
      </div>
      
      {/* Login Container */}
      <main className="relative z-10 w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-surface-container-lowest rounded-full mb-6 shadow-sm border border-outline-variant/10">
            <span className="material-symbols-outlined text-primary text-3xl" data-icon="psychology">psychology</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-primary mb-2">Editorial Agronomy</h1>
          <p className="text-on-surface-variant font-medium tracking-wide uppercase text-xs">Crop Intelligence Platform</p>
        </div>
        
        {/* Notification Placeholder (Error State) */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-error-container border-l-4 border-error flex items-start gap-3 transition-all duration-300">
            <span className="material-symbols-outlined text-on-error-container text-xl" data-icon="report">report</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-on-error-container">Kesalahan Autentikasi</p>
              <p className="text-xs text-on-error-container/80">Username dan password tidak boleh kosong!</p>
            </div>
            <button onClick={() => setError(false)} className="text-on-error-container/50 hover:text-on-error-container">
              <span className="material-symbols-outlined text-lg" data-icon="close">close</span>
            </button>
          </div>
        )}
        
        {/* Login Card */}
        <section className="bg-surface-container-lowest p-8 md:p-10 rounded-[2rem] shadow-[0_12px_32px_rgba(26,28,21,0.06)] relative overflow-hidden">
          {/* Glassy Corner Accent */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-secondary/5 to-transparent -mr-16 -mt-16 rounded-full"></div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Input */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1" htmlFor="username">Username</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-xl" data-icon="person">person</span>
                <input 
                  className="w-full pl-12 pr-4 py-4 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/40 text-on-surface placeholder:text-outline/60 transition-all" 
                  id="username" 
                  name="username" 
                  placeholder="Masukkan username admin" 
                  type="text" 
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError(false);
                  }}
                />
              </div>
            </div>
            
            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant" htmlFor="password">Password</label>
                <a className="text-xs font-semibold text-secondary hover:text-primary transition-colors" href="#">Lupa Password?</a>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-xl" data-icon="lock">lock</span>
                <input 
                  className="w-full pl-12 pr-4 py-4 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/40 text-on-surface placeholder:text-outline/60 transition-all" 
                  id="password" 
                  name="password" 
                  placeholder="••••••••" 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(false);
                  }}
                />
                <button 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface" 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined text-xl" data-icon={showPassword ? "visibility_off" : "visibility"}>
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>
            
            {/* Login Button */}
            <div className="pt-2">
              <button className="w-full bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold py-4 rounded-xl shadow-lg hover:shadow-primary/20 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer" type="submit">
                <span>Login</span>
                <span className="material-symbols-outlined text-xl" data-icon="arrow_forward">arrow_forward</span>
              </button>
            </div>

            {/* Kembali ke Portal Button */}
            <div className="mt-3">
              <button 
                type="button"
                onClick={() => router.push("/dashboard")}
                className="w-full bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 border border-stone-200 text-xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm" data-icon="home">home</span>
                <span>Kembali ke Portal Publik</span>
              </button>
            </div>
          </form>
          
          {/* Footer / Help */}
          <div className="mt-8 pt-6 border-t border-outline-variant/10 text-center">
            <p className="text-xs text-on-surface-variant">
              © 2024 Agronomy LSTM Intelligence System.<br />
              Dilindungi oleh enkripsi standar keamanan data.
            </p>
          </div>
        </section>
        
        {/* Decorative Elements Below Form */}
        <div className="mt-12 grid grid-cols-3 gap-4 opacity-40">
          <div className="h-1 bg-primary/20 rounded-full"></div>
          <div className="h-1 bg-tertiary/20 rounded-full"></div>
          <div className="h-1 bg-secondary/20 rounded-full"></div>
        </div>
      </main>
      
      {/* Side Image Decorative Card (Hidden on Mobile) */}
      <div className="hidden lg:block fixed bottom-12 right-12 w-64 bg-surface-container-lowest p-4 rounded-2xl shadow-xl rotate-3 border border-outline-variant/10">
        <div className="w-full aspect-square rounded-xl overflow-hidden mb-3">
          <img className="w-full h-full object-cover" data-alt="Close-up of vibrant green plant sprouts emerging from rich dark soil in a modern greenhouse environment" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDdEryBTlEwCwDp4SQjwaLEeSvdWLje46sYUuYtjZ0UgQiP8NfTOj3-RCfPFy_7Epj-7OgypkDDFLKJs0hfFtFDWqkh1k7KhQhcOo1fostwzooRnGHVvG0gh2VuCx3S2BJBao8fImslNAknq8wZHcNH5MmiRKTlAV_X2Jjv_7u_WBwhdPkJxQmnY-iaPx_ni192I2u6VqnhiI1XwoDBTn0dTAYvWtjmprrc29iitESfyuu2XxIRO2FX1zoPmeaaV_-uG7J89KYbt1Vq" />
        </div>
        <p className="text-[10px] font-bold text-primary uppercase tracking-tighter">Biological Insight Hub</p>
        <p className="text-[9px] text-on-surface-variant">Monitoring soil moisture &amp; LSTM predictions in real-time.</p>
      </div>
      
    </div>
  );
}
