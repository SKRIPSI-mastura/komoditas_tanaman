export default function Page() {
  return (
    <div className="bg-background text-on-surface">
      
{/* SideNavBar */}
<aside className="h-screen w-64 fixed left-0 top-0 bg-[#f4f4e9] dark:bg-stone-900 flex flex-col py-6 z-50">
<div className="px-6 mb-10">
<h1 className="text-xl font-bold tracking-tight text-[#006B54] dark:text-[#00a884]">Editorial Agronomy</h1>
<p className="text-xs font-medium text-on-surface-variant tracking-wide">Crop Intelligence</p>
</div>
<nav className="flex-1 space-y-1">
<a className="flex items-center px-6 py-3 space-x-3 text-[#3e4944] dark:text-stone-400 font-medium hover:bg-[#eeefe3] dark:hover:bg-stone-800 transition-colors duration-200" href="#">
<span className="material-symbols-outlined" data-icon="dashboard">dashboard</span>
<span className="text-sm">Dashboard</span>
</a>
<a className="flex items-center px-6 py-3 space-x-3 text-[#3e4944] dark:text-stone-400 font-medium hover:bg-[#eeefe3] dark:hover:bg-stone-800 transition-colors duration-200" href="#">
<span className="material-symbols-outlined" data-icon="database">database</span>
<span className="text-sm">Kelola Data</span>
</a>
<a className="flex items-center px-6 py-3 space-x-3 text-[#006B54] dark:text-[#00a884] font-bold border-r-4 border-[#006B54] transition-all duration-150" href="#">
<span className="material-symbols-outlined" data-icon="psychology" style="font-variation-settings: 'FILL' 1;">psychology</span>
<span className="text-sm">Proses Rekomendasi</span>
</a>
<a className="flex items-center px-6 py-3 space-x-3 text-[#3e4944] dark:text-stone-400 font-medium hover:bg-[#eeefe3] dark:hover:bg-stone-800 transition-colors duration-200" href="#">
<span className="material-symbols-outlined" data-icon="assessment">assessment</span>
<span className="text-sm">Hasil Rekomendasi</span>
</a>
</nav>
<div className="px-6 pt-6 border-t border-outline-variant/10">
<div className="flex items-center space-x-3 mb-6">
<img alt="Admin Avatar" className="w-10 h-10 rounded-full object-cover" data-alt="professional portrait of an agronomist expert with a warm smile and neutral background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDe-ajgCniTsfCgv9Wy3yI6dcBv1u6tT0v4baMxNj3DIcFShlmNtbvGxXtQyRPvvVc_mLGq7TUNnvQvtmjHKTx2o3eISQ6FfdZD2JbV_5-U6FF2H4BoTwRdQ52yiBiknORZ4GUzKP0_NGABguWl_yLF1gDOSG3-hdQ0MHO39Z1LdMNKaQOQBx1Gnw6jH4JIf545NhZHaBAIegwDbvMyeWXzt08w8xB_oSrUS8M15Lwlm5sbwgytV0rTAkL0LjZwyl7dnjqEbsTbYnOw" />
<div>
<p className="text-sm font-bold text-on-surface">Dr. Agron</p>
<p className="text-[10px] text-on-surface-variant uppercase tracking-tighter">System Admin</p>
</div>
</div>
<a className="flex items-center space-x-3 text-[#3e4944] py-2 hover:text-primary transition-colors" href="#">
<span className="material-symbols-outlined" data-icon="settings">settings</span>
<span className="text-sm font-medium">Settings</span>
</a>
<a className="flex items-center space-x-3 text-[#3e4944] py-2 hover:text-error transition-colors" href="#">
<span className="material-symbols-outlined" data-icon="logout">logout</span>
<span className="text-sm font-medium">Logout</span>
</a>
</div>
</aside>
{/* TopNavBar */}
<header className="fixed top-0 right-0 left-64 h-16 z-40 bg-[#fafaee]/80 dark:bg-stone-950/80 backdrop-blur-md flex justify-between items-center px-8 w-full shadow-[0_12px_32px_rgba(26,28,21,0.06)]">
<div className="flex items-center gap-4">
<span className="text-lg font-black text-[#1a1c15] dark:text-stone-100 uppercase tracking-widest">Agronomy LSTM</span>
</div>
<div className="flex items-center space-x-6">
<button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors" data-icon="notifications">notifications</button>
<button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors" data-icon="help">help</button>
<div className="h-8 w-[1px] bg-outline-variant/20"></div>
<div className="flex items-center space-x-3">
<span className="text-xs font-bold tracking-widest uppercase text-on-surface-variant">Active Instance: ID-992</span>
</div>
</div>
</header>
{/* Main Content */}
<main className="ml-64 pt-16 min-h-screen bg-background p-8">
<div className="max-w-6xl mx-auto space-y-8">
{/* Page Header */}
<div className="flex flex-col space-y-2">
<h2 className="text-3xl font-extrabold text-on-surface tracking-tight">Intelligence Processing Unit</h2>
<p className="text-on-surface-variant max-w-2xl">Configure neural parameters and execute the Long Short-Term Memory (LSTM) model to generate precision agricultural recommendations.</p>
</div>
{/* Bento Grid Layout */}
<div className="grid grid-cols-12 gap-6">
{/* Parameter Card */}
<div className="col-span-12 lg:col-span-4 space-y-6">
<div className="bg-surface-container-lowest p-6 rounded-xl relative overflow-hidden">
{/* Visual Soul Accent */}
<div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-secondary to-secondary-container opacity-10 -mr-8 -mt-8 rounded-full"></div>
<div className="flex items-center space-x-2 mb-6">
<span className="material-symbols-outlined text-primary" data-icon="tune">tune</span>
<h3 className="font-bold text-sm uppercase tracking-widest text-on-surface-variant">LSTM Parameters</h3>
</div>
<div className="space-y-5">
<div>
<label className="text-[10px] uppercase tracking-widest text-on-surface-variant mb-1 block">Epochs</label>
<div className="bg-surface-container-highest px-4 py-3 rounded-lg flex justify-between items-center">
<span className="font-bold text-primary">100</span>
<span className="text-[10px] text-outline italic">Iterations</span>
</div>
</div>
<div>
<label className="text-[10px] uppercase tracking-widest text-on-surface-variant mb-1 block">Batch Size</label>
<div className="bg-surface-container-highest px-4 py-3 rounded-lg flex justify-between items-center">
<span className="font-bold text-primary">32</span>
<span className="text-[10px] text-outline italic">Samples/Step</span>
</div>
</div>
<div>
<label className="text-[10px] uppercase tracking-widest text-on-surface-variant mb-1 block">Hidden Layers</label>
<div className="bg-surface-container-highest px-4 py-3 rounded-lg flex justify-between items-center">
<span className="font-bold text-primary">3 Units</span>
<span className="text-[10px] text-outline italic">Deep Learning</span>
</div>
</div>
</div>
<div className="mt-8 p-4 bg-surface-container rounded-lg">
<p className="text-xs text-on-surface-variant leading-relaxed">
<span className="font-bold text-tertiary">Note:</span> Optimal results are typically achieved with standard soil density variance settings.
                            </p>
</div>
</div>
</div>
{/* Execution & Stepper Area */}
<div className="col-span-12 lg:col-span-8 space-y-6">
{/* Primary CTA Card */}
<div className="bg-surface-container-low p-1 rounded-xl">
<div className="bg-surface-container-lowest rounded-lg p-10 flex flex-col items-center justify-center text-center space-y-6 border border-outline-variant/5">
<div className="w-20 h-20 bg-surface-container flex items-center justify-center rounded-full">
<span className="material-symbols-outlined text-4xl text-primary" data-icon="play_circle" style="font-variation-settings: 'FILL' 1;">play_circle</span>
</div>
<div>
<h3 className="text-2xl font-extrabold text-on-surface">Ready for Initialization</h3>
<p className="text-on-surface-variant text-sm mt-1">The system is primed for model training using the latest crop dataset.</p>
</div>
<button className="bg-gradient-to-br from-primary to-primary-container text-white px-10 py-4 rounded-full font-bold text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/10">
                                Jalankan Rekomendasi
                            </button>
</div>
</div>
{/* Process Stepper (Illustrated State) */}
<div className="bg-surface-container-low p-8 rounded-xl space-y-8">
<div className="flex items-center justify-between relative">
{/* Progress Line */}
<div className="absolute top-5 left-0 w-full h-[2px] bg-surface-container-highest z-0"></div>
<div className="absolute top-5 left-0 w-[60%] h-[2px] bg-primary z-0"></div>
{/* Step 1: Active */}
<div className="relative z-10 flex flex-col items-center space-y-2">
<div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center border-4 border-surface-container-low">
<span className="material-symbols-outlined text-sm" data-icon="check">check</span>
</div>
<span className="text-[10px] font-bold uppercase tracking-tighter text-primary">Preprocessing</span>
</div>
{/* Step 2: Processing */}
<div className="relative z-10 flex flex-col items-center space-y-2">
<div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center border-4 border-surface-container-low animate-pulse">
<span className="material-symbols-outlined text-sm" data-icon="hourglass_empty">hourglass_empty</span>
</div>
<span className="text-[10px] font-bold uppercase tracking-tighter text-primary">Split Data (80:20)</span>
</div>
{/* Step 3: Pending */}
<div className="relative z-10 flex flex-col items-center space-y-2">
<div className="w-10 h-10 bg-surface-container-highest text-on-surface-variant rounded-full flex items-center justify-center border-4 border-surface-container-low">
<span className="material-symbols-outlined text-sm" data-icon="model_training">model_training</span>
</div>
<span className="text-[10px] font-bold uppercase tracking-tighter text-on-surface-variant">Pelatihan Model</span>
</div>
</div>
{/* Status Console */}
<div className="bg-[#1a1c15] text-[#8df7c6] p-4 rounded-lg font-mono text-[11px] space-y-1">
<p className="opacity-50">[SYSTEM] Initialization sequence started...</p>
<p className="opacity-50">[DATA] Loading 12,402 sensor nodes from cluster_alpha...</p>
<p className="opacity-100"><span className="animate-pulse">●</span> [PROCESS] Normalizing soil pH and nitrogen vectors... OK</p>
<p className="text-white opacity-90">[SYSTEM] Shuffling dataset with random_state=42</p>
<p className="text-primary-fixed">&gt;&gt; Performing 80/20 train-test split...</p>
</div>
</div>
</div>
{/* Secondary Data Visualization (Asymmetric Detail) */}
<div className="col-span-12 space-y-6">
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
<div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/10">
<div className="flex justify-between items-start mb-4">
<span className="text-[10px] font-bold uppercase text-on-surface-variant tracking-widest">Model Complexity</span>
<span className="text-secondary material-symbols-outlined" data-icon="insights">insights</span>
</div>
<div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
<div className="h-full w-3/4 bg-gradient-to-r from-secondary to-secondary-container"></div>
</div>
<p className="mt-3 text-2xl font-extrabold text-on-surface">Deep LSTM</p>
<p className="text-[10px] text-on-surface-variant">Optimized for multi-variate time series data</p>
</div>
<div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/10">
<div className="flex justify-between items-start mb-4">
<span className="text-[10px] font-bold uppercase text-on-surface-variant tracking-widest">System Health</span>
<span className="text-tertiary material-symbols-outlined" data-icon="memory" style="font-variation-settings: 'FILL' 1;">memory</span>
</div>
<div className="flex items-end space-x-1 h-8">
<div className="w-full bg-tertiary/20 h-4 rounded-sm"></div>
<div className="w-full bg-tertiary/20 h-6 rounded-sm"></div>
<div className="w-full bg-tertiary h-8 rounded-sm"></div>
<div className="w-full bg-tertiary/20 h-5 rounded-sm"></div>
<div className="w-full bg-tertiary/20 h-3 rounded-sm"></div>
</div>
<p className="mt-3 text-2xl font-extrabold text-on-surface">98.2%</p>
<p className="text-[10px] text-on-surface-variant">Compute efficiency during tensor allocation</p>
</div>
<div className="bg-primary p-5 rounded-xl text-on-primary relative overflow-hidden">
<div className="absolute -right-4 -bottom-4 opacity-10">
<span className="material-symbols-outlined text-8xl" data-icon="eco">eco</span>
</div>
<div className="relative z-10">
<span className="text-[10px] font-bold uppercase tracking-widest text-on-primary-container">Total Dataset</span>
<p className="mt-4 text-3xl font-extrabold">12.4k Rows</p>
<p className="text-[10px] opacity-80 mt-1">Verified agricultural metric points</p>
<div className="mt-4 flex -space-x-2">
<div className="w-6 h-6 rounded-full border-2 border-primary bg-secondary-container"></div>
<div className="w-6 h-6 rounded-full border-2 border-primary bg-tertiary-fixed"></div>
<div className="w-6 h-6 rounded-full border-2 border-primary bg-surface-variant"></div>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
</main>
{/* Background Decorative Gradient */}
<div className="fixed top-0 right-0 -z-10 w-full h-full opacity-30 pointer-events-none">
<div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full"></div>
<div className="absolute bottom-0 left-64 w-[300px] h-[300px] bg-secondary/5 blur-[100px] rounded-full"></div>
</div>

    </div>
  );
}
