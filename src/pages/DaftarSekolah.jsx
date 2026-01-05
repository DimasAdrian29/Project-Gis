import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';

export default function DaftarSekolah() {
  const [sekolah, setSekolah] = useState([]);
  const [filteredSekolah, setFilteredSekolah] = useState([]);
  const [displayedSekolah, setDisplayedSekolah] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchError, setSearchError] = useState('');

  // State untuk filter
  const [filters, setFilters] = useState({
    status: [],
    akreditasi: [],
    jenjang: []
  });

  // State untuk pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [totalPages, setTotalPages] = useState(1);

  // Options untuk dropdown filter
  const statusOptions = ['Negeri', 'Swasta'];
  const akreditasiOptions = ['A', 'B', 'C', 'TT'];
  const jenjangOptions = ['SD', 'SMP', 'SMA', 'SMK'];

  // Statistik
  const [stats, setStats] = useState({
    total: 0,
    negeri: 0,
    swasta: 0,
    byJenjang: { SD: 0, SMP: 0, SMA: 0, SMK: 0 },
    byAkreditasi: { A: 0, B: 0, C: 0, TT: 0 }
  });

  // Fetch data sekolah
  const fetchSekolah = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sekolah')
        .select('*')
        .order('nama_sekolah', { ascending: true });

      if (error) throw error;

      const sekolahData = data || [];
      console.log('Data sekolah berhasil diambil:', sekolahData.length, 'items');

      setSekolah(sekolahData);
      setFilteredSekolah(sekolahData);
      calculateStats(sekolahData);
      updatePagination(sekolahData);
    } catch (error) {
      console.error('Error fetching schools:', error.message);
      setSearchError('Gagal memuat data sekolah');
    } finally {
      setLoading(false);
    }
  };

  // Hitung statistik
  const calculateStats = (data) => {
    try {
      const newStats = {
        total: data.length,
        negeri: 0,
        swasta: 0,
        byJenjang: { SD: 0, SMP: 0, SMA: 0, SMK: 0 },
        byAkreditasi: { A: 0, B: 0, C: 0, TT: 0 }
      };

      data.forEach(item => {
        // Hitung status
        if (item.status_sekolah === 'Negeri') newStats.negeri++;
        if (item.status_sekolah === 'Swasta') newStats.swasta++;

        // Hitung jenjang
        const jenjang = item.jenjang_pendidikan?.toUpperCase() || '';
        if (jenjang.includes('SD')) newStats.byJenjang.SD++;
        if (jenjang.includes('SMP')) newStats.byJenjang.SMP++;
        if (jenjang.includes('SMA')) newStats.byJenjang.SMA++;
        if (jenjang.includes('SMK')) newStats.byJenjang.SMK++;

        // Hitung akreditasi
        const akreditasi = item.akreditasi?.toUpperCase() || '';
        if (akreditasi === 'A') newStats.byAkreditasi.A++;
        else if (akreditasi === 'B') newStats.byAkreditasi.B++;
        else if (akreditasi === 'C') newStats.byAkreditasi.C++;
        else newStats.byAkreditasi.TT++;
      });

      setStats(newStats);
    } catch (error) {
      console.error('Error calculating stats:', error);
    }
  };

  // Filter data berdasarkan kriteria - DIPERBAIKI
  const applyFilters = () => {
    try {
      console.log('Memulai filtering dengan:', {
        searchTerm,
        filters,
        totalSekolah: sekolah.length
      });

      let result = [...sekolah];

      // Filter berdasarkan search term
      if (searchTerm && searchTerm.trim() !== '') {
        const searchLower = searchTerm.toLowerCase().trim();
        console.log('Mencari dengan kata kunci:', searchLower);

        result = result.filter(item => {
          const namaMatch = item.nama_sekolah?.toLowerCase().includes(searchLower) || false;
          const npsnMatch = item.npsn?.toString().includes(searchTerm) || false;
          const alamatMatch = item.alamat?.toLowerCase().includes(searchLower) || false;
          const kecamatanMatch = item.kecamatan?.toLowerCase().includes(searchLower) || false;

          return namaMatch || npsnMatch || alamatMatch || kecamatanMatch;
        });

        console.log('Hasil setelah search:', result.length);
      }

      // Filter status
      if (filters.status.length > 0) {
        result = result.filter(item => {
          return filters.status.includes(item.status_sekolah);
        });
        console.log('Hasil setelah filter status:', result.length);
      }

      // Filter jenjang
      if (filters.jenjang.length > 0) {
        result = result.filter(item => {
          const jenjang = item.jenjang_pendidikan?.toUpperCase() || '';
          return filters.jenjang.some(filter => {
            const filterUpper = filter.toUpperCase();
            return jenjang.includes(filterUpper);
          });
        });
        console.log('Hasil setelah filter jenjang:', result.length);
      }

      // Filter akreditasi
      if (filters.akreditasi.length > 0) {
        result = result.filter(item => {
          const akreditasi = item.akreditasi?.toUpperCase() || '';

          if (filters.akreditasi.includes('TT')) {
            // Jika termasuk TT, tampilkan semua yang bukan A, B, atau C
            return !['A', 'B', 'C'].includes(akreditasi) || filters.akreditasi.includes(akreditasi);
          }

          return filters.akreditasi.includes(akreditasi);
        });
        console.log('Hasil setelah filter akreditasi:', result.length);
      }

      console.log('Filtering selesai. Total hasil:', result.length);
      setFilteredSekolah(result);
      setCurrentPage(1); // Reset ke halaman pertama saat filter berubah
      updatePagination(result);
      setSearchError('');
    } catch (error) {
      console.error('Error dalam applyFilters:', error);
      setSearchError('Terjadi kesalahan saat memfilter data');
      // Fallback ke data asli jika ada error
      setFilteredSekolah(sekolah);
      setCurrentPage(1);
      updatePagination(sekolah);
    }
  };

  // Update pagination
  const updatePagination = (data) => {
    try {
      const total = data.length;
      const pages = Math.ceil(total / itemsPerPage) || 1;
      setTotalPages(pages);

      // Pastikan currentPage valid
      const validCurrentPage = Math.min(Math.max(currentPage, 1), pages);
      if (currentPage !== validCurrentPage) {
        setCurrentPage(validCurrentPage);
      }

      // Hitung data yang akan ditampilkan di halaman saat ini
      const startIndex = (validCurrentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const currentData = data.slice(startIndex, endIndex);
      setDisplayedSekolah(currentData);

      console.log('Pagination updated:', {
        total,
        pages,
        currentPage: validCurrentPage,
        startIndex,
        endIndex,
        itemsDisplayed: currentData.length
      });
    } catch (error) {
      console.error('Error dalam updatePagination:', error);
    }
  };

  // Handle perubahan filter
  const handleFilterChange = (filterType, value) => {
    try {
      setFilters(prev => {
        const newFilters = { ...prev };
        if (newFilters[filterType].includes(value)) {
          newFilters[filterType] = newFilters[filterType].filter(item => item !== value);
        } else {
          newFilters[filterType] = [...newFilters[filterType], value];
        }
        return newFilters;
      });
    } catch (error) {
      console.error('Error dalam handleFilterChange:', error);
    }
  };

  // Reset semua filter
  const handleResetFilters = () => {
    try {
      setFilters({
        status: [],
        akreditasi: [],
        jenjang: []
      });
      setSearchTerm('');
      setFilteredSekolah(sekolah);
      setCurrentPage(1);
      updatePagination(sekolah);
      setSearchError('');
    } catch (error) {
      console.error('Error dalam reset filters:', error);
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
  };

  // Format URL gambar
  const getImageUrl = (gambar) => {
    try {
      if (!gambar) return null;
      if (gambar.startsWith('http')) return gambar;
      if (gambar.startsWith('schools/')) {
        return `https://ofnftvsliwcpsydrjhci.supabase.co/storage/v1/object/public/${gambar}`;
      }
      return gambar;
    } catch (error) {
      console.error('Error getting image URL:', error);
      return null;
    }
  };

  // Warna berdasarkan jenjang
  const getJenjangColor = (jenjang) => {
    try {
      if (!jenjang) return '#8B5CF6';
      if (jenjang.includes('SD') || jenjang.includes('MI')) return '#60A5FA';
      if (jenjang.includes('SMP') || jenjang.includes('MTs')) return '#FBBF24';
      if (jenjang.includes('SMA') || jenjang.includes('SMK')) return '#EF4444';
      return '#8B5CF6';
    } catch (error) {
      return '#8B5CF6';
    }
  };

  // Warna background untuk badge akreditasi
  const getAkreditasiBadgeColor = (akreditasi) => {
    try {
      const akreditasiUpper = akreditasi?.toUpperCase() || 'TT';
      switch (akreditasiUpper) {
        case 'A': return 'bg-green-100 text-green-800 border-green-200';
        case 'B': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'C': return 'bg-orange-100 text-orange-800 border-orange-200';
        default: return 'bg-red-100 text-red-800 border-red-200';
      }
    } catch (error) {
      return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Fungsi untuk mengganti halaman
  const goToPage = (page) => {
    try {
      if (page < 1 || page > totalPages) return;
      setCurrentPage(page);
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const currentData = filteredSekolah.slice(startIndex, endIndex);
      setDisplayedSekolah(currentData);

      // Scroll ke atas dengan smooth
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Error dalam goToPage:', error);
    }
  };

  // Generate array halaman untuk pagination
  const getPageNumbers = () => {
    try {
      const pageNumbers = [];
      const maxPagesToShow = 5;

      if (totalPages <= maxPagesToShow) {
        // Tampilkan semua halaman jika total halaman <= 5
        for (let i = 1; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        // Tampilkan dengan ellipsis
        if (currentPage <= 3) {
          pageNumbers.push(1, 2, 3, 4, '...', totalPages);
        } else if (currentPage >= totalPages - 2) {
          pageNumbers.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
        } else {
          pageNumbers.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
        }
      }

      return pageNumbers;
    } catch (error) {
      console.error('Error dalam getPageNumbers:', error);
      return [1];
    }
  };

  // Gunakan debounce untuk search
  useEffect(() => {
    const timer = setTimeout(() => {
      applyFilters();
    }, 300); // Delay 300ms untuk mengurangi frekuensi update

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchSekolah();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters]);

  useEffect(() => {
    updatePagination(filteredSekolah);
  }, [currentPage, filteredSekolah]);

  return (
    <main className="w-full bg-gradient-to-b from-[#F0F8FF] via-white to-white pt-24 pb-12">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">

        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[#19335A] tracking-tight">
                <span className="bg-gradient-to-r from-[#19335A] to-[#4675C0] bg-clip-text text-transparent">
                  Daftar Sekolah Pekanbaru
                </span>
              </h1>
              <p className="text-[#697A98] mt-2 text-base">
                Eksplorasi data lengkap semua sekolah di Kota Pekanbaru
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/peta"
                className="px-4 py-2 bg-gradient-to-r from-[#19335A] to-[#4675C0] text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                Lihat Peta
              </Link>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-white p-4 rounded-xl border border-blue-100">
              <div className="text-xs text-blue-800 font-medium mb-1">Total Sekolah</div>
              <div className="text-xl font-bold text-[#19335A]">
                {stats.total}
                <span className="text-xs font-normal text-[#697A98] ml-1">data</span>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-white p-4 rounded-xl border border-blue-200">
              <div className="text-xs text-blue-800 font-medium mb-1">Sekolah Negeri</div>
              <div className="text-xl font-bold text-[#19335A]">
                {stats.negeri}
                <span className="text-xs font-normal text-[#697A98] ml-1">sekolah</span>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-white p-4 rounded-xl border border-green-200">
              <div className="text-xs text-green-800 font-medium mb-1">Sekolah Swasta</div>
              <div className="text-xl font-bold text-[#19335A]">
                {stats.swasta}
                <span className="text-xs font-normal text-[#697A98] ml-1">sekolah</span>
              </div>
            </div>

            <div className="bg-gradient-to-r from-slate-50 to-white p-4 rounded-xl border border-slate-200">
              <div className="text-xs text-slate-800 font-medium mb-1">Berakreditasi A</div>
              <div className="text-xl font-bold text-[#19335A]">
                {stats.byAkreditasi.A}
                <span className="text-xs font-normal text-[#697A98] ml-1">sekolah</span>
              </div>
            </div>

            <div className="bg-gradient-to-r from-slate-50 to-white p-4 rounded-xl border border-slate-200">
              <div className="text-xs text-slate-800 font-medium mb-1">Halaman</div>
              <div className="text-xl font-bold text-[#19335A]">
                {currentPage}
                <span className="text-xs font-normal text-[#697A98] ml-1">/{totalPages}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8 items-start">

          {/* Sidebar Filter */}
          <div className="lg:col-span-1 space-y-4 lg:sticky lg:top-28 z-10">
            {/* Search Box */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Cari sekolah..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4675C0]/20 focus:border-[#4675C0]"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    ✕
                  </button>
                )}
              </div>
              <div className="text-xs text-slate-500 mt-2">
                Cari berdasarkan nama, NPSN, alamat, atau kecamatan
              </div>
              {searchError && (
                <div className="text-xs text-red-500 mt-2">
                  ⚠️ {searchError}
                </div>
              )}
            </div>

            {/* Filter Panel */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Header Filter */}
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-[#19335A] flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filter Data
                </h3>
                <button
                  onClick={handleResetFilters}
                  className="text-xs font-medium text-[#4675C0] hover:text-[#19335A] hover:underline transition-colors"
                >
                  Reset
                </button>
              </div>

              {/* Filter Content */}
              <div className="p-4 space-y-6 max-h-[500px] overflow-y-auto">
                {/* Filter Status */}
                <div>
                  <h4 className="text-sm font-semibold text-[#19335A] mb-3 uppercase tracking-wider">
                    Status Sekolah
                  </h4>
                  <div className="space-y-2">
                    {statusOptions.map((status) => (
                      <label key={status} className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative flex items-center">
                          <input
                            type="checkbox"
                            checked={filters.status.includes(status)}
                            onChange={() => handleFilterChange('status', status)}
                            className="peer h-4 w-4 appearance-none rounded border border-slate-300 bg-white checked:bg-[#4675C0] checked:border-[#4675C0] focus:ring-2 focus:ring-[#4675C0]/20 transition-all"
                          />
                          <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity"
                            xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${status === 'Negeri' ? 'bg-blue-500' : 'bg-green-500'
                            }`}></div>
                          <span className="text-sm text-[#697A98] group-hover:text-[#4675C0] transition-colors">
                            {status}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-slate-100"></div>

                {/* Filter Jenjang */}
                <div>
                  <h4 className="text-sm font-semibold text-[#19335A] mb-3 uppercase tracking-wider">
                    Jenjang Pendidikan
                  </h4>
                  <div className="space-y-2">
                    {jenjangOptions.map((jenjang) => (
                      <label key={jenjang} className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative flex items-center">
                          <input
                            type="checkbox"
                            checked={filters.jenjang.includes(jenjang)}
                            onChange={() => handleFilterChange('jenjang', jenjang)}
                            className="peer h-4 w-4 appearance-none rounded border border-slate-300 bg-white checked:bg-[#4675C0] checked:border-[#4675C0] focus:ring-2 focus:ring-[#4675C0]/20 transition-all"
                          />
                          <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity"
                            xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{
                            backgroundColor: getJenjangColor(jenjang)
                          }}></div>
                          <span className="text-sm text-[#697A98] group-hover:text-[#4675C0] transition-colors">
                            {jenjang}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-slate-100"></div>

                {/* Filter Akreditasi */}
                <div>
                  <h4 className="text-sm font-semibold text-[#19335A] mb-3 uppercase tracking-wider">
                    Akreditasi
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {akreditasiOptions.map((akreditasi) => (
                      <label key={akreditasi} className="cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.akreditasi.includes(akreditasi)}
                          onChange={() => handleFilterChange('akreditasi', akreditasi)}
                          className="peer sr-only"
                        />
                        <div className={`
                          p-3 rounded-lg border transition-all transform hover:scale-[1.02]
                          peer-checked:ring-2 peer-checked:ring-offset-1 peer-checked:ring-[#4675C0]/30
                          ${filters.akreditasi.includes(akreditasi)
                            ? 'border-[#4675C0] bg-white shadow-sm'
                            : 'border-slate-200 bg-slate-50 hover:bg-white'}
                        `}>
                          <div className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${akreditasi === 'A' ? 'bg-green-500' :
                              akreditasi === 'B' ? 'bg-yellow-500' :
                                akreditasi === 'C' ? 'bg-orange-500' : 'bg-red-500'
                              } text-white font-bold text-sm mb-1`}>
                              {akreditasi}
                            </div>
                            <div className="text-xs font-medium text-[#19335A]">
                              {akreditasi === 'TT' ? 'Lainnya' : akreditasi}
                            </div>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Active Filters Info */}
                {Object.values(filters).flat().length > 0 && (
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-sm text-blue-800 mb-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium">Filter Aktif:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {filters.status.map(item => (
                        <span key={item} className={`text-xs px-2 py-1 rounded font-medium ${item === 'Negeri' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                          }`}>
                          {item}
                        </span>
                      ))}
                      {filters.jenjang.map(item => (
                        <span key={item} className="text-xs px-2 py-1 rounded font-medium text-white" style={{
                          backgroundColor: getJenjangColor(item)
                        }}>
                          {item}
                        </span>
                      ))}
                      {filters.akreditasi.map(item => (
                        <span key={item} className={`text-xs px-2 py-1 rounded font-medium ${item === 'A' ? 'bg-green-100 text-green-800' :
                          item === 'B' ? 'bg-yellow-100 text-yellow-800' :
                            item === 'C' ? 'bg-orange-100 text-orange-800' :
                              'bg-red-100 text-red-800'
                          }`}>
                          {item === 'TT' ? 'Lainnya' : item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Results Summary */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-sm font-semibold text-[#19335A] mb-2">Hasil Pencarian</div>
              <div className="text-3xl font-bold text-[#4675C0] mb-1">
                {filteredSekolah.length}
              </div>
              <div className="text-xs text-[#697A98]">
                {searchTerm ? `Hasil untuk "${searchTerm}"` : 'Semua sekolah'}
                <div className="mt-1">Halaman {currentPage} dari {totalPages}</div>
              </div>
            </div>
          </div>

          {/* Card Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4675C0] mb-4"></div>
                <p className="text-[#697A98]">Memuat data sekolah...</p>
              </div>
            ) : filteredSekolah.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📚</div>
                <h3 className="text-xl font-bold text-[#19335A] mb-2">
                  {searchTerm ? `Tidak ditemukan sekolah dengan "${searchTerm}"` : 'Tidak ada data sekolah'}
                </h3>
                <p className="text-[#697A98] mb-4">
                  {searchTerm ? 'Coba gunakan kata kunci lain atau' : 'Coba ubah filter pencarian Anda'}
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-[#19335A] text-white rounded-lg hover:bg-[#142847] transition-colors"
                >
                  {searchTerm ? 'Hapus Pencarian' : 'Reset Semua Filter'}
                </button>
              </div>
            ) : (
              <>
                {/* Grid Controls */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                  <div className="text-sm text-[#697A98]">
                    Menampilkan <span className="font-bold text-[#19335A]">
                      {Math.min((currentPage - 1) * itemsPerPage + 1, filteredSekolah.length)}
                    </span> -{' '}
                    <span className="font-bold text-[#19335A]">
                      {Math.min(currentPage * itemsPerPage, filteredSekolah.length)}
                    </span> dari{' '}
                    <span className="font-bold text-[#19335A]">{filteredSekolah.length}</span> sekolah
                    <span className="text-xs block sm:inline"> ({itemsPerPage} per halaman)</span>
                  </div>

                </div>

                {/* School Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayedSekolah.map((item) => {
                    const imageUrl = getImageUrl(item.gambar);
                    const jenjangColor = getJenjangColor(item.jenjang_pendidikan);

                    return (
                      <div key={item.id} className="group">
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col">

                          {/* Gambar Sekolah */}
                          <div className="relative h-48 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50">
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={item.nama_sekolah}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  e.target.src = `https://placehold.co/600x400/${jenjangColor.replace('#', '')}/ffffff?text=${encodeURIComponent(item.nama_sekolah)}`;
                                  e.target.className = 'w-full h-full object-cover';
                                }}
                              />
                            ) : (
                              <div
                                className="w-full h-full flex flex-col items-center justify-center p-4 text-center"
                                style={{ backgroundColor: `${jenjangColor}15` }}
                              >
                                <div className="text-4xl mb-2">🏫</div>
                                <div className="text-sm font-medium text-slate-600">
                                  {item.nama_sekolah}
                                </div>
                              </div>
                            )}

                            {/* Badge Jenjang di atas gambar */}
                            <div
                              className="absolute top-3 left-3 px-3 py-1 rounded-full text-white text-xs font-bold shadow-md"
                              style={{ backgroundColor: jenjangColor }}
                            >
                              {item.jenjang_pendidikan || 'Sekolah'}
                            </div>

                            {/* Badge Status di atas gambar */}
                            {item.status_sekolah && (
                              <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold shadow-md ${item.status_sekolah === 'Negeri'
                                ? 'bg-blue-500 text-white'
                                : 'bg-green-500 text-white'
                                }`}>
                                {item.status_sekolah}
                              </div>
                            )}
                          </div>

                          {/* Card Body */}
                          <div className="p-4 flex-grow">
                            {/* Nama Sekolah */}
                            <h3 className="font-bold text-lg text-[#19335A] mb-2 line-clamp-1" title={item.nama_sekolah}>
                              {item.nama_sekolah}
                            </h3>

                            {/* Info Bar */}
                            <div className="flex items-center justify-between mb-3">
                              <div className="text-xs text-slate-500">
                                NPSN: <span className="font-medium text-[#19335A]">{item.npsn || '-'}</span>
                              </div>
                              <div className={`px-2 py-1 rounded text-xs font-bold ${getAkreditasiBadgeColor(item.akreditasi)}`}>
                                {item.akreditasi || 'TT'}
                              </div>
                            </div>

                            {/* Lokasi */}
                            <div className="flex items-start gap-2 mb-3">
                              <svg className="w-4 h-4 text-[#697A98] mt-0.5 flex-shrink-0"
                                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <div className="min-w-0">
                                <div className="text-sm font-medium text-[#19335A] mb-0.5 line-clamp-1">
                                  {item.kecamatan || 'Kecamatan tidak tersedia'}
                                </div>
                                <div className="text-xs text-[#697A98] line-clamp-2">
                                  {item.alamat || 'Alamat tidak tersedia'}
                                </div>
                              </div>
                            </div>

                            {/* Kontak */}
                            {item.no_telepon && (
                              <div className="flex items-center gap-2 mb-3">
                                <svg className="w-4 h-4 text-[#697A98] flex-shrink-0"
                                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <span className="text-sm text-[#19335A] truncate">
                                  {item.no_telepon}
                                </span>
                              </div>
                            )}

                            {/* Detail Info Grid */}
                            <div className="grid grid-cols-2 gap-2 mb-3">
                              <div className="bg-slate-50 rounded p-2">
                                <div className="text-xs text-slate-500 mb-0.5">Desa/Kelurahan</div>
                                <div className="text-sm font-medium text-[#19335A] truncate">
                                  {item.desa_kelurahan || '-'}
                                </div>
                              </div>
                              <div className="bg-slate-50 rounded p-2">
                                <div className="text-xs text-slate-500 mb-0.5">Tanggal Akreditasi</div>
                                <div className="text-sm font-medium text-[#19335A] truncate">
                                  {item.tanggal_akreditasi || '-'}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Card Footer */}
                          <div className="p-4 border-t border-slate-100 bg-slate-50">
                            <div className="flex justify-between items-center">
                              <div className="text-xs text-slate-500">
                                <span className="inline-flex items-center gap-1">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  {item.updated_at ? new Date(item.updated_at).toLocaleDateString('id-ID') : '-'}
                                </span>
                              </div>
                              {/* UBAH LINK INI: dari /peta menjadi /dashboard/sekolah/detail/{id} */}
                              <Link
                                to={`/sekolah/${item.id}`}
                                className="text-xs bg-gradient-to-r from-[#19335A] to-[#4675C0] text-white px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity font-medium flex items-center gap-1 group/link"
                              >
                                <span>Detail</span>
                                <svg className="w-3 h-3 transition-transform group-hover/link:translate-x-1"
                                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                    d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {filteredSekolah.length > itemsPerPage && (
                  <div className="mt-8 pt-6 border-t border-slate-200">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                      <div className="text-sm text-[#697A98]">
                        Menampilkan {Math.min((currentPage - 1) * itemsPerPage + 1, filteredSekolah.length)} -{' '}
                        {Math.min(currentPage * itemsPerPage, filteredSekolah.length)} dari {filteredSekolah.length} sekolah
                      </div>

                      <div className="flex items-center gap-1">
                        {/* Tombol Previous */}
                        <button
                          onClick={() => goToPage(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-3 py-2 text-sm border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                          </svg>
                          Sebelumnya
                        </button>

                        {/* Tombol Halaman */}
                        <div className="flex items-center gap-1 mx-2">
                          {getPageNumbers().map((page, index) => (
                            page === '...' ? (
                              <span key={`ellipsis-${index}`} className="px-3 py-2 text-slate-400">
                                ...
                              </span>
                            ) : (
                              <button
                                key={page}
                                onClick={() => goToPage(page)}
                                className={`px-3 py-2 text-sm rounded transition-colors ${currentPage === page
                                  ? 'bg-gradient-to-r from-[#19335A] to-[#4675C0] text-white'
                                  : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
                                  }`}
                              >
                                {page}
                              </button>
                            )
                          ))}
                        </div>

                        {/* Tombol Next */}
                        <button
                          onClick={() => goToPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="px-3 py-2 text-sm border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                        >
                          Selanjutnya
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Page Jump */}
                    <div className="flex justify-center items-center gap-2 mt-4">
                      <span className="text-sm text-[#697A98]">Lompat ke halaman:</span>
                      <input
                        type="number"
                        min="1"
                        max={totalPages}
                        value={currentPage}
                        onChange={(e) => {
                          const page = parseInt(e.target.value);
                          if (page >= 1 && page <= totalPages) {
                            goToPage(page);
                          }
                        }}
                        className="w-16 px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-[#4675C0]"
                      />
                      <span className="text-sm text-[#697A98]">dari {totalPages}</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}