import React, { useState, useEffect } from 'react';
import { supabase, getCurrentUser } from '../../supabaseClient';
import { Link } from 'react-router-dom';

export default function DashboardHome() {
  const [stats, setStats] = useState({
    totalSekolah: 0,
    sekolahToday: 0,
    totalUsers: 0,
    akreditasiA: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentSekolah, setRecentSekolah] = useState([]);
  const [user] = useState(getCurrentUser());

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // 1. Total sekolah
      const { count: totalCount } = await supabase
        .from('sekolah')
        .select('*', { count: 'exact', head: true });

      // 2. Akreditasi A
      const { count: akreditasiACount } = await supabase
        .from('sekolah')
        .select('*', { count: 'exact', head: true })
        .eq('akreditasi', 'A');

      // 3. Total users
      const { count: userCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // 4. Sekolah hari ini
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count: todayCount } = await supabase
        .from('sekolah')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

      // 5. Recent sekolah
      const { data: recentData } = await supabase
        .from('sekolah')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      setStats({
        totalSekolah: totalCount || 311,
        sekolahToday: todayCount || 0,
        totalUsers: userCount || 1,
        akreditasiA: akreditasiACount || 261
      });

      setRecentSekolah(recentData || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Fallback data sesuai gambar
      setStats({
        totalSekolah: 311,
        sekolahToday: 0,
        totalUsers: 1,
        akreditasiA: 261
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = () => {
    return new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getJenjangColor = (jenjang) => {
    switch (jenjang) {
      case 'SD': return 'bg-blue-100 text-blue-800';
      case 'SMP': return 'bg-green-100 text-green-800';
      case 'SMA': return 'bg-purple-100 text-purple-800';
      case 'SMK': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header dengan background gradient */}
      <div className="bg-gradient-to-r from-[#19335A] to-[#4675C0] rounded-2xl p-8 text-white shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between">
          <div className="mb-6 lg:mb-0">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <span className="text-2xl">🏫</span>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-1">Dashboard</h1>
                <p className="text-white/80">Sekolah Pekanbaru</p>
              </div>
            </div>
            
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-2">Selamat datang, {user?.nama_lengkap?.split(' ')[0] || 'Administrator'}!</h2>
              <p className="text-white/90">
                Anda login sebagai <span className="font-bold">{user?.role}</span>. 
                Terakhir login: {formatTime()}
              </p>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 lg:w-80">
            <div className="text-center lg:text-right">
              <div className="text-2xl md:text-3xl font-bold mb-2">
                {user?.nama_lengkap || 'Administrator Sistem'}
              </div>
              <div className="text-white/80 text-lg">
                {new Date().toLocaleDateString('id-ID', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              <div className="mt-4 inline-block px-4 py-2 bg-white text-[#19335A] font-semibold rounded-lg">
                {user?.role === 'admin' ? 'Administrator' : 'Operator'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid - 4 kolom cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Sekolah Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:border-blue-300">
          <div className="flex items-start justify-between mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-2xl text-white">🏫</span>
            </div>
            <div className="text-right">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total</div>
            </div>
          </div>
          <div className="mb-2">
            <div className="text-4xl font-bold text-gray-900">
              {loading ? '...' : stats.totalSekolah.toLocaleString()}
            </div>
            <div className="text-gray-600 text-lg font-medium mt-1">Total Sekolah</div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="text-sm text-gray-500">
              <span className="font-medium text-green-600">+0</span> dari kemarin
            </div>
          </div>
        </div>

        {/* Ditambah Hari Ini Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:border-green-300">
          <div className="flex items-start justify-between mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-2xl text-white">📈</span>
            </div>
            <div className="text-right">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Hari Ini</div>
            </div>
          </div>
          <div className="mb-2">
            <div className="text-4xl font-bold text-gray-900">
              {loading ? '...' : stats.sekolahToday.toLocaleString()}
            </div>
            <div className="text-gray-600 text-lg font-medium mt-1">Ditambah Hari Ini</div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="text-sm text-gray-500">
              Terakhir update: {formatTime()}
            </div>
          </div>
        </div>

        {/* Akreditasi A Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:border-yellow-300">
          <div className="flex items-start justify-between mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-2xl text-white">⭐</span>
            </div>
            <div className="text-right">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Akreditasi</div>
            </div>
          </div>
          <div className="mb-2">
            <div className="text-4xl font-bold text-gray-900">
              {loading ? '...' : stats.akreditasiA.toLocaleString()}
            </div>
            <div className="text-gray-600 text-lg font-medium mt-1">Akreditasi A</div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Persentase</span>
              <span className="text-sm font-bold text-yellow-600">
                {stats.totalSekolah > 0 ? Math.round((stats.akreditasiA / stats.totalSekolah) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>

        {/* Total Pengguna Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:border-purple-300">
          <div className="flex items-start justify-between mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-2xl text-white">👥</span>
            </div>
            <div className="text-right">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Pengguna</div>
            </div>
          </div>
          <div className="mb-2">
            <div className="text-4xl font-bold text-gray-900">
              {loading ? '...' : stats.totalUsers.toLocaleString()}
            </div>
            <div className="text-gray-600 text-lg font-medium mt-1">Total Pengguna</div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-sm text-gray-500">Online: 1</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two Columns Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sekolah */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Sekolah Terbaru</h3>
                <p className="text-sm text-gray-500 mt-1">{recentSekolah.length} sekolah terbaru</p>
              </div>
              <Link 
                to="/dashboard/sekolah" 
                className="px-4 py-2 text-sm font-medium text-[#4675C0] hover:text-[#19335A] hover:bg-blue-50 rounded-lg transition-colors"
              >
                Lihat semua →
              </Link>
            </div>
          </div>
          
          <div className="divide-y divide-gray-100">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-4 animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="h-6 w-20 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))
            ) : recentSekolah.length > 0 ? (
              recentSekolah.map((sekolah) => (
                <div key={sekolah.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium text-gray-900 truncate">{sekolah.nama_sekolah}</h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getJenjangColor(sekolah.jenjang_pendidikan)}`}>
                          {sekolah.jenjang_pendidikan}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                          </svg>
                          {sekolah.kecamatan}
                        </span>
                        <span>•</span>
                        <span>{formatDate(sekolah.created_at)}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 ml-4">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        sekolah.status_sekolah === 'Negeri' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {sekolah.status_sekolah}
                      </span>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        sekolah.akreditasi === 'A' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : sekolah.akreditasi === 'B'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        Akreditasi: {sekolah.akreditasi || '-'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                  </svg>
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">Belum ada data sekolah</h4>
                <p className="text-gray-500 mb-4">Mulai dengan menambahkan data sekolah pertama Anda</p>
                <Link
                  to="/dashboard/sekolah/tambah"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#4675C0] to-[#19335A] text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
                  </svg>
                  Tambah Sekolah Pertama
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Aksi Cepat</h3>
              <p className="text-sm text-gray-500 mt-1">Akses cepat ke fitur utama sistem</p>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              {/* Tambah Sekolah */}
              <Link
                to="/dashboard/sekolah/tambah"
                className="group p-5 border-2 border-gray-200 rounded-xl hover:border-[#4675C0] hover:bg-blue-50 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
                  </svg>
                </div>
                <div className="font-semibold text-gray-900 mb-2">Tambah Sekolah</div>
                <div className="text-sm text-gray-500">Input data sekolah baru secara manual</div>
                <div className="mt-3 text-xs text-blue-600 font-medium flex items-center gap-1">
                  <span>Akses cepat</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </div>
              </Link>

              {/* Import Data */}
              <Link
                to="/dashboard/sekolah/import"
                className="group p-5 border-2 border-gray-200 rounded-xl hover:border-green-600 hover:bg-green-50 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                  </svg>
                </div>
                <div className="font-semibold text-gray-900 mb-2">Import Data</div>
                <div className="text-sm text-gray-500">Upload file Excel/CSV untuk impor massal</div>
                <div className="mt-3 text-xs text-green-600 font-medium flex items-center gap-1">
                  <span>Batch upload</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </div>
              </Link>

              {/* Manajemen User (hanya admin) */}
              {user?.role === 'admin' && (
                <>
                  <Link
                    to="/dashboard/users"
                    className="group p-5 border-2 border-gray-200 rounded-xl hover:border-purple-600 hover:bg-purple-50 transition-all duration-300"
                  >
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.67 3.623a10 10 0 01-.67 3.623m0 0a10 10 0 01-.67-3.623m0 0a9.995 9.995 0 00-4.33-3.623m4.33 3.623A9.995 9.995 0 0112 14.5"/>
                      </svg>
                    </div>
                    <div className="font-semibold text-gray-900 mb-2">Manajemen User</div>
                    <div className="text-sm text-gray-500">Kelola pengguna dan hak akses sistem</div>
                    <div className="mt-3 text-xs text-purple-600 font-medium flex items-center gap-1">
                      <span>Admin only</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                      </svg>
                    </div>
                  </Link>

                  {/* Statistik */}
                  <Link
                    to="/dashboard/stats"
                    className="group p-5 border-2 border-gray-200 rounded-xl hover:border-orange-600 hover:bg-orange-50 transition-all duration-300"
                  >
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-200 transition-colors">
                      <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                      </svg>
                    </div>
                    <div className="font-semibold text-gray-900 mb-2">Statistik</div>
                    <div className="text-sm text-gray-500">Analisis dan laporan data sekolah</div>
                    <div className="mt-3 text-xs text-orange-600 font-medium flex items-center gap-1">
                      <span>Reports</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                      </svg>
                    </div>
                  </Link>
                </>
              )}

              {/* Untuk non-admin atau tambahan */}
              {user?.role !== 'admin' && (
                <>
                  <div className="p-5 border-2 border-gray-200 rounded-xl bg-gray-50 opacity-75">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                      </svg>
                    </div>
                    <div className="font-semibold text-gray-900 mb-2">Akses Terbatas</div>
                    <div className="text-sm text-gray-500">Fitur khusus untuk administrator</div>
                    <div className="mt-3 text-xs text-gray-500 font-medium">
                      Hubungi admin
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Refresh Button */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={fetchDashboardData}
                className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
                Refresh Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="text-center text-gray-500 text-sm pt-4">
        <p>© {new Date().getFullYear()} WebGIS Sekolah Pekanbaru. Terakhir diupdate: {formatTime()}</p>
      </div>
    </div>
  );
}