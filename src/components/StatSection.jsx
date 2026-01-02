import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; // Sesuaikan path

export function StatSection() {
  const [statsData, setStatsData] = useState({
    total: 0,
    kecamatan: 0,
    jenjang: 0,
    negeri: 0,
    swasta: 0,
    akreditasiA: 0,
    loading: true,
    lastUpdated: null
  });

  // Fetch data statistik dari Supabase
  const fetchStatsData = async () => {
    try {
      setStatsData(prev => ({ ...prev, loading: true }));
      
      // 1. Ambil semua data sekolah
      const { data: sekolahData, error: sekolahError } = await supabase
        .from('sekolah')
        .select('*');

      if (sekolahError) throw sekolahError;

      // 2. Hitung statistik
      const totalSekolah = sekolahData?.length || 0;
      
      // Hitung jumlah kecamatan unik
      const kecamatanSet = new Set();
      sekolahData?.forEach(sekolah => {
        if (sekolah.kecamatan) kecamatanSet.add(sekolah.kecamatan);
      });
      
      // Hitung jumlah jenjang unik
      const jenjangSet = new Set();
      sekolahData?.forEach(sekolah => {
        if (sekolah.jenjang_pendidikan) {
          const jenjang = sekolah.jenjang_pendidikan.includes('SD') ? 'SD' : 
                         sekolah.jenjang_pendidikan.includes('SMP') ? 'SMP' : 
                         sekolah.jenjang_pendidikan.includes('SMA') ? 'SMA' : 'Lainnya';
          jenjangSet.add(jenjang);
        }
      });
      
      // Hitung status sekolah
      const negeriCount = sekolahData?.filter(s => s.status_sekolah === 'Negeri').length || 0;
      const swastaCount = sekolahData?.filter(s => s.status_sekolah === 'Swasta').length || 0;
      
      // Hitung akreditasi A
      const akreditasiACount = sekolahData?.filter(s => 
        s.akreditasi?.toUpperCase() === 'A'
      ).length || 0;

      // 3. Update state dengan data baru
      setStatsData({
        total: totalSekolah,
        kecamatan: kecamatanSet.size,
        jenjang: jenjangSet.size,
        negeri: negeriCount,
        swasta: swastaCount,
        akreditasiA: akreditasiACount,
        loading: false,
        lastUpdated: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error fetching stats data:', error);
      setStatsData(prev => ({ ...prev, loading: false }));
    }
  };

  // Fetch data saat komponen dimount
  useEffect(() => {
    fetchStatsData();
    
    // Setup interval untuk auto-refresh (opsional)
    const intervalId = setInterval(() => {
      fetchStatsData();
    }, 300000); // Refresh setiap 5 menit

    return () => clearInterval(intervalId);
  }, []);

  // Stats dengan data real-time dari database
  const stats = [
    {
      id: 1,
      label: "Total Sekolah",
      value: statsData.total,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
        </svg>
      ),
      delay: "0ms",
      subtitle: "Seluruh kota Pekanbaru",
      color: "from-blue-500 to-blue-600",
      detail: `${statsData.negeri} Negeri • ${statsData.swasta} Swasta`
    },
    {
      id: 2,
      label: "Kecamatan",
      value: statsData.kecamatan,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
        </svg>
      ),
      delay: "150ms",
      subtitle: "Wilayah cakupan",
      color: "from-green-500 to-emerald-600",
      detail: "Data terdistribusi merata"
    },
    {
      id: 3,
      label: "Jenjang Pendidikan",
      value: statsData.jenjang,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.499 5.216c-.25.051-.5.099-.75.145m-15.482 0a75.453 75.453 0 00-5.683 2.809m0 0v1.066c0 1.258.08 2.522.234 3.774.155 1.252.486 2.482.986 3.65m8.948-11.232a59.68 59.68 0 01-5.91 2.272M12 3.493c.75.159 1.5.34 2.245.542" />
        </svg>
      ),
      delay: "300ms",
      subtitle: "Tingkat pendidikan",
      color: "from-purple-500 to-purple-600",
      detail: "SD, SMP, SMA/SMK"
    },
    {
      id: 4,
      label: "Akreditasi A",
      value: statsData.akreditasiA,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
        </svg>
      ),
      delay: "450ms",
      subtitle: "Sekolah berpredikat",
      color: "from-yellow-500 to-amber-600",
      detail: `${Math.round((statsData.akreditasiA / statsData.total) * 100) || 0}% dari total`
    },
  ];

  return (
    <section className="relative px-4 md:px-8 py-16 md:py-20 bg-gradient-to-b from-[#F0F8FF] to-white border-b border-[#B6BFD6]/30">
      
      <style>{`
        @keyframes fadeInUpCard {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .animate-card {
          animation: fadeInUpCard 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
          opacity: 0;
        }
        .loading-pulse {
          animation: pulse 1.5s ease-in-out infinite;
        }
      `}</style>

      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#8FC8EB]/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[10%] left-[-5%] w-[300px] h-[300px] bg-[#4675C0]/5 rounded-full blur-[80px]"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-12 animate-card">
          <h2 className="text-3xl md:text-4xl font-bold text-[#19335A] mb-4">
            <span className="bg-gradient-to-r from-[#19335A] to-[#4675C0] bg-clip-text text-transparent">
              Ringkasan Data Pendidikan
            </span>
          </h2>
          <p className="text-[#697A98] text-lg max-w-2xl mx-auto">
            Data real-time dari database sekolah Kota Pekanbaru
          </p>
          
          {/* Last Updated Info */}
          {statsData.lastUpdated && !statsData.loading && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-slate-600">
                  Data diperbarui: {new Date(statsData.lastUpdated).toLocaleTimeString('id-ID', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
              <button 
                onClick={fetchStatsData}
                className="ml-2 text-xs text-[#4675C0] hover:text-[#19335A] hover:underline"
                title="Refresh data"
              >
                Refresh
              </button>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div
              key={stat.id}
              style={{ animationDelay: stat.delay }}
              className="
                animate-card
                group relative
                bg-white 
                rounded-2xl 
                p-6
                text-center 
                border border-[#B6BFD6]/50
                shadow-[0_4px_20px_rgba(143,200,235,0.15)] 
                hover:shadow-[0_15px_30px_rgba(70,117,192,0.15)] 
                hover:-translate-y-2 
                transition-all duration-300 ease-out
                flex flex-col
              "
            >
              {/* Background gradient on hover */}
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#8FC8EB]/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              {/* Icon Container */}
              <div className="relative mx-auto mb-4 w-14 h-14 flex items-center justify-center rounded-xl bg-gradient-to-br from-slate-50 to-white border border-slate-100 text-[#4675C0] group-hover:scale-110 transition-transform duration-300">
                {stat.icon}
              </div>

              {/* Value - dengan loading state */}
              <div className="relative mb-2">
                {statsData.loading ? (
                  <div className="inline-block">
                    <div className="text-4xl font-extrabold text-transparent bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg loading-pulse">
                      00
                    </div>
                  </div>
                ) : (
                  <h3 className="text-4xl md:text-5xl font-extrabold text-[#19335A] tracking-tight">
                    {stat.value}
                    {stat.id === 1 && (
                      <span className="text-2xl text-slate-400 ml-1">+</span>
                    )}
                  </h3>
                )}
              </div>

              {/* Label */}
              <p className="relative text-[#697A98] font-semibold uppercase tracking-wide text-sm mb-1 group-hover:text-[#4675C0] transition-colors">
                {stat.label}
              </p>

              {/* Subtitle */}
              <p className="relative text-xs text-slate-500 mb-2">
                {stat.subtitle}
              </p>

              {/* Detail Info */}
              {stat.detail && !statsData.loading && (
                <div className="mt-auto pt-3 border-t border-slate-100">
                  <p className="text-xs text-slate-600">
                    {stat.detail}
                  </p>
                </div>
              )}
              
              {/* Loading indicator */}
              {statsData.loading && (
                <div className="mt-2">
                  <div className="inline-flex items-center gap-2 text-xs text-slate-400">
                    <div className="w-2 h-2 bg-slate-300 rounded-full animate-pulse"></div>
                    Memuat data...
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Additional Stats Banner */}
        {!statsData.loading && (
          <div className="mt-12 animate-card" style={{ animationDelay: '600ms' }}>
            <div className="bg-gradient-to-r from-[#19335A]/5 to-[#4675C0]/5 rounded-2xl p-6 border border-[#B6BFD6]/30">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#19335A]">{statsData.negeri}</div>
                  <div className="text-sm text-[#697A98]">Sekolah Negeri</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#19335A]">{statsData.swasta}</div>
                  <div className="text-sm text-[#697A98]">Sekolah Swasta</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#19335A]">
                    {statsData.total > 0 ? Math.round((statsData.negeri / statsData.total) * 100) : 0}%
                  </div>
                  <div className="text-sm text-[#697A98]">Persentase Negeri</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#19335A]">
                    {statsData.total > 0 ? Math.round((statsData.akreditasiA / statsData.total) * 100) : 0}%
                  </div>
                  <div className="text-sm text-[#697A98]">Berakreditasi A</div>
                </div>
              </div>
              
              {/* Data Source Info */}
              <div className="mt-4 pt-4 border-t border-slate-200 text-center">
                <div className="inline-flex items-center gap-2 text-xs text-slate-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span>Data bersumber dari Database Dinas Pendidikan Kota Pekanbaru</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {!statsData.loading && statsData.total === 0 && (
          <div className="mt-8 text-center">
            <div className="inline-flex flex-col items-center p-6 bg-yellow-50 rounded-xl border border-yellow-200">
              <svg className="w-12 h-12 text-yellow-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.342 16.5c-.77.833.192 2.5 1.732 2.5z"/>
              </svg>
              <h4 className="font-medium text-yellow-800 mb-1">Data Belum Tersedia</h4>
              <p className="text-sm text-yellow-600 mb-3">
                Database sekolah sedang tidak dapat diakses
              </p>
              <button
                onClick={fetchStatsData}
                className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors text-sm font-medium"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}