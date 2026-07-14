"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense, useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Pastikan sesi lama selalu dibersihkan saat halaman login dibuka
  // Sehingga pengguna tidak pernah auto-login saat masuk sebagai guest
  useEffect(() => {
    localStorage.removeItem("admin_logged_in");
    localStorage.removeItem("admin_username");
    localStorage.removeItem("admin_nama");
    localStorage.removeItem("admin_peran");
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!username.trim() || !password.trim()) {
      setErrorMsg("Username dan password tidak boleh kosong!");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });

      if (!res.ok) {
        // Handle unauthorized or other errors specifically
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Server error: ${res.status}`);
      }

      const data = await res.json();

      if (data.status === "success") {
        // Login berhasil — simpan info admin ke localStorage
        localStorage.setItem("admin_logged_in", "true");
        localStorage.setItem("admin_username", data.data.username);
        localStorage.setItem("admin_nama", data.data.nama);
        localStorage.setItem("admin_peran", data.data.peran);

        // Arahkan ke halaman rekomendasi atau halaman yang sebelumnya dicoba
        const redirectTo = searchParams.get("redirect") || "/rekomendasi";
        router.push(redirectTo);
      } else {
        // Tampilkan pesan error dari server (USER_NOT_FOUND atau WRONG_PASSWORD)
        setErrorMsg(data.message || "Terjadi kesalahan. Silakan coba lagi.");
        setPassword(""); // Reset password field
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setErrorMsg(
        err.message || "Tidak dapat terhubung ke server. Silakan coba lagi."
      );
    } finally {
      setIsLoading(false);
    }
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

        {/* Error Notification */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-error-container border-l-4 border-error flex items-start gap-3 transition-all duration-300 animate-pulse-once">
            <span className="material-symbols-outlined text-on-error-container text-xl shrink-0" data-icon="report">report</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-on-error-container">Autentikasi Gagal</p>
              <p className="text-xs text-on-error-container/80 mt-0.5">{errorMsg}</p>
            </div>
            <button
              onClick={() => setErrorMsg("")}
              className="text-on-error-container/50 hover:text-on-error-container shrink-0"
            >
              <span className="material-symbols-outlined text-lg" data-icon="close">close</span>
            </button>
          </div>
        )}

        {/* Login Card */}
        <section className="bg-surface-container-lowest p-8 md:p-10 rounded-[2rem] shadow-[0_12px_32px_rgba(26,28,21,0.06)] relative overflow-hidden">
          {/* Glassy Corner Accent */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-secondary/5 to-transparent -mr-16 -mt-16 rounded-full"></div>

          <div className="mb-6">
            <h2 className="text-lg font-extrabold text-on-surface tracking-tight">Masuk sebagai Admin Dinas</h2>
            <p className="text-xs text-on-surface-variant mt-1">
              Hanya personel Dinas Pertanian yang terdaftar dapat mengakses panel administrasi ini.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">

            {/* Username Input */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1" htmlFor="username">
                Username
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-xl" data-icon="person">person</span>
                <input
                  className="w-full pl-12 pr-4 py-4 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/40 text-on-surface placeholder:text-outline/60 transition-all"
                  id="username"
                  name="username"
                  placeholder="Masukkan username admin"
                  type="text"
                  value={username}
                  autoComplete="username"
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setErrorMsg("");
                  }}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-xl" data-icon="lock">lock</span>
                <input
                  className="w-full pl-12 pr-12 py-4 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/40 text-on-surface placeholder:text-outline/60 transition-all"
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  autoComplete="current-password"
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMsg("");
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
            <div className="pt-2 space-y-3">
              <button
                className="w-full bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold py-4 rounded-xl shadow-lg hover:shadow-primary/20 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Memverifikasi Akun...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-xl" data-icon="login">login</span>
                    <span>Masuk sebagai Admin</span>
                  </>
                )}
              </button>

              {/* Kembali ke Portal Publik */}
              <button
                type="button"
                onClick={() => router.push("/rekomendasi")}
                className="w-full bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 border border-stone-200 dark:border-stone-700 text-xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm" data-icon="person">person</span>
                <span>Masuk sebagai User (Tanpa Login)</span>
              </button>
            </div>
          </form>

          {/* Info box */}
          <div className="mt-6 p-3 bg-stone-50 dark:bg-stone-900/40 border border-stone-100 dark:border-stone-800 rounded-xl">
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-stone-400 text-sm shrink-0 mt-0.5" data-icon="info">info</span>
              <p className="text-[10px] text-stone-500 dark:text-stone-400 leading-relaxed">
                Akses sebagai User tidak memerlukan login dan hanya dapat melihat halaman hasil rekomendasi tanaman. 
                Login sebagai Admin diperlukan untuk mengakses seluruh panel administrasi, data, riwayat, dan modul prediksi LSTM.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-5 border-t border-outline-variant/10 text-center">
            <p className="text-xs text-on-surface-variant">
              © 2024 Agronomy LSTM Intelligence System.<br />
              Akses terbatas untuk personel Dinas Pertanian Aceh Utara.
            </p>
          </div>
        </section>

        {/* Decorative Bottom Bar */}
        <div className="mt-10 grid grid-cols-3 gap-4 opacity-40">
          <div className="h-1 bg-primary/20 rounded-full"></div>
          <div className="h-1 bg-tertiary/20 rounded-full"></div>
          <div className="h-1 bg-secondary/20 rounded-full"></div>
        </div>
      </main>

      {/* Side Decorative Card */}
      <div className="hidden lg:block fixed bottom-12 right-12 w-64 bg-surface-container-lowest p-4 rounded-2xl shadow-xl rotate-3 border border-outline-variant/10">
        <div className="w-full aspect-square rounded-xl overflow-hidden mb-3">
          <img
            className="w-full h-full object-cover"
            alt="Tanaman pangan hijau segar di lahan pertanian Aceh Utara"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDdEryBTlEwCwDp4SQjwaLEeSvdWLje46sYUuYtjZ0UgQiP8NfTOj3-RCfPFy_7Epj-7OgypkDDFLKJs0hfFtFDWqkh1k7KhQhcOo1fostwzooRnGHVvG0gh2VuCx3S2BJBao8fImslNAknq8wZHcNH5MmiRKTlAV_X2Jjv_7u_WBwhdPkJxQmnY-iaPx_ni192I2u6VqnhiI1XwoDBTn0dTAYvWtjmprrc29iitESfyuu2XxIRO2FX1zoPmeaaV_-uG7J89KYbt1Vq"
          />
        </div>
        <p className="text-[10px] font-bold text-primary uppercase tracking-tighter">Biological Insight Hub</p>
        <p className="text-[9px] text-on-surface-variant">Monitoring soil &amp; LSTM predictions in real-time.</p>
      </div>

    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
