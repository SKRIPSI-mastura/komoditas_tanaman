export default function Page() {
  return (
    <div className="text-on-surface">
      
{/* SideNavBar */}
<aside className="h-screen w-64 fixed left-0 top-0 bg-[#f4f4e9] flex flex-col py-6">
<div className="px-6 mb-10">
<h1 className="text-xl font-bold tracking-tight text-[#006B54]">Editorial Agronomy</h1>
<p className="text-xs font-medium text-on-surface-variant/70 uppercase tracking-widest">Crop Intelligence</p>
</div>
<nav className="flex-1 space-y-1">
<a className="flex items-center px-6 py-3 text-[#3e4944] font-medium hover:bg-[#eeefe3] transition-colors duration-200" href="#">
<span className="material-symbols-outlined mr-3" data-icon="dashboard">dashboard</span>
                Dashboard
            </a>
<a className="flex items-center px-6 py-3 text-[#3e4944] font-medium hover:bg-[#eeefe3] transition-colors duration-200" href="#">
<span className="material-symbols-outlined mr-3" data-icon="database">database</span>
                Kelola Data
            </a>
<a className="flex items-center px-6 py-3 text-[#3e4944] font-medium hover:bg-[#eeefe3] transition-colors duration-200" href="#">
<span className="material-symbols-outlined mr-3" data-icon="psychology">psychology</span>
                Proses Rekomendasi
            </a>
<a className="flex items-center px-6 py-3 text-[#006B54] font-bold border-r-4 border-[#006B54] bg-[#eeefe3]" href="#">
<span className="material-symbols-outlined mr-3" data-icon="assessment">assessment</span>
                Hasil Rekomendasi
            </a>
</nav>
<div className="px-6 mt-auto pt-6 space-y-1">
<a className="flex items-center py-2 text-[#3e4944] font-medium hover:text-[#006B54] transition-colors" href="#">
<span className="material-symbols-outlined mr-3" data-icon="settings">settings</span>
                Settings
            </a>
<a className="flex items-center py-2 text-[#3e4944] font-medium hover:text-[#ba1a1a] transition-colors" href="#">
<span className="material-symbols-outlined mr-3" data-icon="logout">logout</span>
                Logout
            </a>
</div>
</aside>
{/* TopNavBar */}
<header className="fixed top-0 right-0 left-64 h-16 z-40 bg-[#fafaee]/80 backdrop-blur-md flex justify-between items-center px-8" style="box-shadow: 0 12px 32px rgba(26, 28, 21, 0.06);">
<div className="flex items-center bg-surface-container-highest px-4 py-2 rounded-xl w-96">
<span className="material-symbols-outlined text-on-surface-variant mr-2" data-icon="search">search</span>
<input className="bg-transparent border-none focus:ring-0 text-sm w-full" placeholder="Search insights..." type="text" />
</div>
<div className="flex items-center space-x-6">
<button className="relative text-on-surface-variant hover:text-primary transition-transform active:scale-95">
<span className="material-symbols-outlined" data-icon="notifications">notifications</span>
<span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full"></span>
</button>
<button className="text-on-surface-variant hover:text-primary transition-transform active:scale-95">
<span className="material-symbols-outlined" data-icon="help">help</span>
</button>
<div className="flex items-center space-x-3 pl-4 border-l border-outline-variant/20">
<div className="text-right">
<p className="text-xs font-bold text-on-surface leading-none">Admin Profile</p>
<p className="text-[10px] text-on-surface-variant uppercase tracking-tighter">Chief Agronomist</p>
</div>
<img className="w-10 h-10 rounded-full object-cover border-2 border-surface-container-highest" data-alt="close-up portrait of a professional agronomist in a clean field setting with soft natural lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAYehe5BiuR6MJQzAn3EwPkfNltJVGesOxsFC7v0-a0p0pI_RYMVzk27Y7l5HDwSalfQpVqpmSbsRXBPSXqyq8DzzNovW8b4wHEK9SST031TX1w5J2rHXDOJc5P5Z-_QSbIDxBDaWDBdWzxI_4LjGVuN8eH3tHw7gwXd2A0vJMqaWVn_2IfWRb7EdZ9zTK7t5h3688dsR7-BXjlvaZMlx78ySdf9JO33CxHtm_i-xPhGIUsxDBJxoFefg3teIGp_iBUUPSDQb3wb_dT" />
</div>
</div>
</header>
{/* Main Content */}
<main className="ml-64 pt-24 pb-12 px-8 min-h-screen">
{/* Header Section */}
<div className="mb-10 flex justify-between items-end">
<div>
<nav className="flex text-[10px] uppercase tracking-widest text-on-surface-variant mb-2">
<span>Analysis</span>
<span className="mx-2">/</span>
<span className="text-primary font-bold">Recommendation Results</span>
</nav>
<h2 className="text-4xl font-extrabold tracking-tight text-on-surface">Intelligence Summary</h2>
</div>
<div className="flex space-x-3">
<button className="px-6 py-2.5 rounded-xl border border-outline-variant/20 text-primary font-semibold text-sm hover:bg-surface-container transition-colors flex items-center">
<span className="material-symbols-outlined text-sm mr-2" data-icon="download">download</span>
                    Export PDF
                </button>
<button className="px-6 py-2.5 rounded-xl bg-gradient-to-br from-primary to-primary-container text-white font-bold text-sm flex items-center">
<span className="material-symbols-outlined text-sm mr-2" data-icon="share">share</span>
                    Share Insight
                </button>
</div>
</div>
{/* Bento Grid Section 1: Main Recommendation */}
<div className="grid grid-cols-12 gap-6 mb-6">
{/* Recommendation Hero Card */}
<div className="col-span-8 bg-surface-container-lowest rounded-xl p-8 relative overflow-hidden flex flex-col justify-between min-h-[320px]">
<div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full pointer-events-none"></div>
<div>
<span className="inline-flex items-center px-3 py-1 rounded-full bg-tertiary/10 text-tertiary text-xs font-bold uppercase tracking-wider mb-6">
<span className="material-symbols-outlined text-sm mr-1" data-icon="verified" data-weight="fill">verified</span>
                        Optimal Choice
                    </span>
<h3 className="text-5xl font-black text-primary leading-tight mb-2">Padi Inpari 32</h3>
<p className="text-on-surface-variant max-w-md">Varietas ini menunjukkan ketahanan tertinggi terhadap hawar daun bakteri dan memiliki potensi hasil yang konsisten di ekosistem lahan sawah irigasi.</p>
</div>
<div className="flex items-center mt-8 space-x-12">
<div className="flex flex-col">
<span className="text-on-surface-variant text-xs font-medium uppercase tracking-widest mb-1">Predicted Yield</span>
<div className="flex items-baseline">
<span className="text-5xl font-extrabold text-on-surface">15.4</span>
<span className="text-xl font-semibold text-on-surface-variant ml-2">Ton/Ha</span>
</div>
</div>
<div className="h-12 w-px bg-outline-variant/20"></div>
<div className="flex flex-col">
<span className="text-on-surface-variant text-xs font-medium uppercase tracking-widest mb-1">Growth Confidence</span>
<div className="flex items-center">
<span className="text-3xl font-bold text-tertiary">98.2%</span>
<span className="material-symbols-outlined text-tertiary ml-2" data-icon="trending_up">trending_up</span>
</div>
</div>
</div>
</div>
{/* Model Evaluation Metrics */}
<div className="col-span-4 bg-surface-container-low rounded-xl p-8 flex flex-col">
<h4 className="text-lg font-bold text-on-surface mb-6 flex items-center">
<span className="material-symbols-outlined mr-2 text-secondary" data-icon="analytics">analytics</span>
                    Model Metrics
                </h4>
<div className="space-y-6 flex-1">
<div className="p-4 bg-surface-container-lowest rounded-xl">
<div className="flex justify-between items-center mb-1">
<span className="text-xs font-bold text-on-surface-variant uppercase">MSE (Mean Squared Error)</span>
<span className="material-symbols-outlined text-primary text-sm" data-icon="info">info</span>
</div>
<p className="text-3xl font-black text-on-surface">0.023</p>
<div className="mt-2 w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
<div className="bg-primary h-full" style="width: 92%"></div>
</div>
</div>
<div className="p-4 bg-surface-container-lowest rounded-xl">
<div className="flex justify-between items-center mb-1">
<span className="text-xs font-bold text-on-surface-variant uppercase">R-Squared Score</span>
</div>
<p className="text-3xl font-black text-on-surface">0.967</p>
<p className="text-[10px] text-tertiary font-bold mt-1 flex items-center">
<span className="material-symbols-outlined text-xs mr-1" data-icon="check_circle">check_circle</span>
                            High Accuracy Range
                        </p>
</div>
<div className="p-4 bg-surface-container-highest rounded-xl border border-outline-variant/10">
<p className="text-xs font-medium text-on-surface-variant leading-relaxed italic">
                            "The LSTM model has converged with minimal loss, indicating high reliability for current seasonal data."
                        </p>
</div>
</div>
</div>
</div>
{/* Section 3: Data Comparison Chart */}
<div className="grid grid-cols-12 gap-6">
<div className="col-span-12 bg-surface-container-lowest rounded-xl p-8">
<div className="flex justify-between items-center mb-10">
<div>
<h4 className="text-xl font-bold text-on-surface">Production Trend Comparison</h4>
<p className="text-sm text-on-surface-variant">Comparative analysis between actual historical data and model predictions.</p>
</div>
<div className="flex space-x-6 items-center">
<div className="flex items-center">
<span className="w-3 h-3 rounded-full bg-secondary mr-2"></span>
<span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Actual Data</span>
</div>
<div className="flex items-center">
<span className="w-3 h-3 rounded-full bg-primary mr-2"></span>
<span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Predicted Yield</span>
</div>
</div>
</div>
{/* Chart Visual Mockup */}
<div className="relative h-80 w-full bg-surface-container-low rounded-xl overflow-hidden p-4">
<div className="absolute inset-0 flex items-end justify-between px-10 pb-8">
{/* Grid Lines */}
<div className="absolute inset-0 grid grid-rows-4 px-10 py-8 opacity-10">
<div className="border-t border-on-surface"></div>
<div className="border-t border-on-surface"></div>
<div className="border-t border-on-surface"></div>
<div className="border-t border-on-surface"></div>
</div>
{/* Mock Chart Paths */}
<svg className="absolute inset-0 w-full h-full px-10 py-8" preserveaspectratio="none">
{/* Actual Path */}
<path className="opacity-40" d="M0,80 L50,120 L100,100 L150,140 L200,110 L250,90 L300,105 L350,75 L400,95 L450,60 L500,85 L550,55 L600,70 L650,40 L700,50 L750,20 L800,45" fill="none" stroke="#2d5da7" stroke-linecap="round" strokeWidth="3"></path>
{/* Predicted Path */}
<path d="M0,85 L50,115 L100,105 L150,135 L200,115 L250,85 L300,110 L350,70 L400,100 L450,55 L500,90 L550,50 L600,75 L650,35 L700,55 L750,15 L800,40" fill="none" stroke="#005137" stroke-linecap="round" strokeWidth="4"></path>
</svg>
{/* X-Axis Labels */}
<div className="flex justify-between w-full mt-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter">
<span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
</div>
</div>
</div>
</div>
</div>
{/* Section 4: Recommendation Details & Tips */}
<div className="grid grid-cols-12 gap-6 mt-6">
<div className="col-span-4">
<div className="bg-primary p-6 rounded-xl text-on-primary h-full">
<h5 className="text-lg font-bold mb-4 flex items-center">
<span className="material-symbols-outlined mr-2" data-icon="lightbulb">lightbulb</span>
                        Actionable Tip
                    </h5>
<p className="text-sm leading-relaxed opacity-90 mb-6">
                        Berdasarkan prediksi curah hujan bulan depan, disarankan untuk mengoptimalkan pemupukan dasar pada minggu ke-2 setelah tanam untuk memaksimalkan potensi varietas Inpari 32.
                    </p>
<div className="flex items-center space-x-2">
<img className="w-12 h-12 rounded-lg object-cover" data-alt="vibrant green rice field macro detail with water droplets and morning dew under soft sunrise light" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCvN2BUuJnzzHjCmEWvfsUdsloEXXlK2tDiq_lEOov4DSPyJWRqiPZ8M7mKIZ9wkEeff92GFO7hx67VQXipGCx_lN3LaYwNfS7z2RjC0X7QeZrgNuVmb3Pa7VbvAM-3R0FO1XXioSfMgexU-_i7DOeWEC32ENYShPSBpzpMLIVmpJao33pH2tIqYRo-K8gZQB8pgpJ78x9lcxm4NzFISe1a_9sD9LlN9lzlS0bh3q54F-tSobNi7oWhn_y2L7NzQjbcnZGzxUTbdfj0" />
<div className="text-[10px] uppercase font-bold tracking-widest">
                            Contextual Focus: Irrigation
                        </div>
</div>
</div>
</div>
<div className="col-span-8">
<div className="bg-surface-container rounded-xl p-6 h-full flex flex-col justify-center">
<div className="flex items-center justify-between mb-4">
<h5 className="text-sm font-bold text-on-surface uppercase tracking-widest">Recommended Support Varietals</h5>
<a className="text-xs font-bold text-secondary flex items-center hover:underline" href="#">
                            View All Data <span className="material-symbols-outlined text-xs ml-1" data-icon="arrow_forward">arrow_forward</span>
</a>
</div>
<div className="grid grid-cols-3 gap-4">
<div className="bg-surface-container-lowest p-4 rounded-xl">
<p className="text-xs font-bold text-on-surface-variant mb-1">Sub-Option 1</p>
<p className="text-lg font-bold text-on-surface">Ciherang</p>
<p className="text-[10px] text-primary font-bold">89% Match</p>
</div>
<div className="bg-surface-container-lowest p-4 rounded-xl">
<p className="text-xs font-bold text-on-surface-variant mb-1">Sub-Option 2</p>
<p className="text-lg font-bold text-on-surface">Mekongga</p>
<p className="text-[10px] text-primary font-bold">84% Match</p>
</div>
<div className="bg-surface-container-lowest p-4 rounded-xl">
<p className="text-xs font-bold text-on-surface-variant mb-1">Sub-Option 3</p>
<p className="text-lg font-bold text-on-surface">Inpari 42</p>
<p className="text-[10px] text-primary font-bold">81% Match</p>
</div>
</div>
</div>
</div>
</div>
</main>

    </div>
  );
}
