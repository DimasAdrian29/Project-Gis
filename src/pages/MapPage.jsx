import React, { useState, useEffect } from 'react';
import { MapView } from "../components/MapView";
import { FilterPanel } from "../components/FilterPanel";
import { RadiusControl } from "../components/RadiusControl";

export default function MapPage() {
  const [filters, setFilters] = useState({
    jenjang: [],
    status: [],
    akreditasi: []
  });
  
  const [radius, setRadius] = useState(500); // Default radius 500 meter
  const [totalSekolah, setTotalSekolah] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  const [stats, setStats] = useState({
    sd: 0,
    smp: 0,
    sma: 0,
    negeri: 0,
    swasta: 0
  });

  // Fungsi untuk menangani perubahan filter
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => {
      const newFilter = { ...prev };
      if (newFilter[filterType].includes(value)) {
        // Hapus filter jika sudah ada
        newFilter[filterType] = newFilter[filterType].filter(item => item !== value);
      } else {
        // Tambah filter
        newFilter[filterType].push(value);
      }
      return newFilter;
    });
  };

  // Fungsi reset filter
  const handleResetFilter = () => {
    setFilters({
      jenjang: [],
      status: [],
      akreditasi: []
    });
  };

  // Fungsi untuk update statistik
  const updateStats = (sekolahData) => {
    const newStats = {
      sd: 0,
      smp: 0,
      sma: 0,
      negeri: 0,
      swasta: 0
    };

    sekolahData.forEach(sekolah => {
      // Hitung berdasarkan jenjang
      if (sekolah.jenjang_pendidikan?.includes('SD') || sekolah.jenjang_pendidikan?.includes('MI')) {
        newStats.sd++;
      } else if (sekolah.jenjang_pendidikan?.includes('SMP') || sekolah.jenjang_pendidikan?.includes('MTs')) {
        newStats.smp++;
      } else if (sekolah.jenjang_pendidikan?.includes('SMA') || sekolah.jenjang_pendidikan?.includes('SMK')) {
        newStats.sma++;
      }

      // Hitung berdasarkan status
      if (sekolah.status_sekolah === 'Negeri') {
        newStats.negeri++;
      } else if (sekolah.status_sekolah === 'Swasta') {
        newStats.swasta++;
      }
    });

    setStats(newStats);
  };

  // Simulasi cek koneksi
  useEffect(() => {
    const checkOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener('online', checkOnlineStatus);
    window.addEventListener('offline', checkOnlineStatus);

    return () => {
      window.removeEventListener('online', checkOnlineStatus);
      window.removeEventListener('offline', checkOnlineStatus);
    };
  }, []);

  return (
    <main className="w-full bg-gradient-to-b from-[#F0F8FF] via-white to-white pt-24 pb-12">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        
        {/* Header Section */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#19335A] tracking-tight">
              <span className="bg-gradient-to-r from-[#19335A] to-[#4675C0] bg-clip-text text-transparent">
                Peta Sekolah Pekanbaru
              </span>
            </h1>
            <p className="text-[#697A98] mt-2 text-base">
              Eksplorasi lokasi dan data lengkap sekolah di Kota Pekanbaru, Riau.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border shadow-sm text-sm font-medium ${
              isOnline 
                ? 'text-green-700 border-green-200 bg-green-50' 
                : 'text-red-700 border-red-200 bg-red-50'
            }`}>
              <span className="flex h-2 w-2 relative">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                  isOnline ? 'bg-green-400' : 'bg-red-400'
                } opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${
                  isOnline ? 'bg-green-500' : 'bg-red-500'
                }`}></span>
              </span>
              {isOnline ? 'Database Terhubung' : 'Database Terputus'}
            </div>
            
            <div className="text-sm text-[#697A98] bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
              <span className="font-medium text-[#19335A]">Pusat Peta:</span> 0.5333°N, 101.45°E
            </div>
          </div>
        </div>

        {/* Stats Overview */}
       

        {/* Main Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8 items-start">
          
          {/* Sidebar Filter dan Kontrol */}
          <div className="lg:col-span-1 space-y-4 lg:sticky lg:top-28 z-10">
            <FilterPanel 
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={handleResetFilter}
              radius={radius}
              onRadiusChange={setRadius}
            />
            
            <RadiusControl 
              radius={radius}
              onRadiusChange={setRadius}
            />
            
            {/* Help Text */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <h4 className="text-sm font-semibold text-[#19335A] mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Panduan Penggunaan
              </h4>
              <ul className="text-xs text-[#697A98] space-y-2">
                <li className="flex items-start gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#60A5FA] mt-0.5 flex-shrink-0"></div>
                  <span><strong>SD/MI:</strong> Warna biru muda</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#FBBF24] mt-0.5 flex-shrink-0"></div>
                  <span><strong>SMP/MTs:</strong> Warna kuning</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#EF4444] mt-0.5 flex-shrink-0"></div>
                  <span><strong>SMA/SMK:</strong> Warna merah</span>
                </li>
                <li className="pt-2 border-t border-slate-100">
                  <strong>Klik marker</strong> untuk melihat detail sekolah dan foto
                </li>
              </ul>
            </div>
          </div>

          {/* Map Container */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-[0_8px_30px_rgba(143,200,235,0.15)] border border-[#B6BFD6]/50 overflow-hidden min-h-[600px] relative z-0">
              <MapView 
                filters={filters}
                radius={radius}
                onStatsUpdate={updateStats}
                onTotalChange={setTotalSekolah}
              />
              
              {/* Footer Map */}
              <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-slate-200 p-3 text-center z-10">
                <p className="text-xs text-[#697A98]">
                  <strong>Peta Interaktif Sekolah Pekanbaru</strong> • Radius aktif: {radius}m • 
                  Total sekolah: {totalSekolah} • Data diperbarui real-time dari Supabase
                </p>
              </div>
            </div>
            
            {/* Info Tambahan */}
            <div className="mt-4 p-4 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-[#19335A] mb-1">Fitur Peta</h4>
                  <p className="text-xs text-[#697A98]">
                    • Cakupan radius {radius}m • Marker berwarna sesuai jenjang • Foto sekolah • Filter real-time
                  </p>
                </div>
                <div className="text-xs text-[#697A98] flex items-center gap-4">
                  <div>
                    <span className="font-medium text-[#19335A]">Koordinat:</span> 0.5333°N, 101.45°E
                  </div>
                  <div>
                    <span className="font-medium text-[#19335A]">Zoom:</span> 12x
                  </div>
                  <div>
                    <span className="font-medium text-[#19335A]">Layer:</span> OSM
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}