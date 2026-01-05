import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function SekolahDetailPublic() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [sekolah, setSekolah] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchSekolahDetail();
    }
  }, [id]);

  const fetchSekolahDetail = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sekolah')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setSekolah(data);
    } catch (error) {
      console.error('Error fetching sekolah detail:', error);
      setError('Gagal memuat detail sekolah');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const getAkreditasiColor = (akreditasi) => {
    switch (akreditasi) {
      case 'A': return 'bg-green-100 text-green-800 border-green-200';
      case 'B': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'C': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    return status === 'Negeri' 
      ? 'bg-blue-100 text-blue-800 border-blue-200' 
      : 'bg-green-100 text-green-800 border-green-200';
  };

  const getJenjangColor = (jenjang) => {
    switch (jenjang) {
      case 'SD': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'SMP': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'SMA': return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'SMK': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F0F8FF] via-white to-white pt-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4675C0]"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !sekolah) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F0F8FF] via-white to-white pt-24">
        <div className="max-w-6xl mx-auto px-4 text-center py-12">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Data sekolah tidak ditemukan</h3>
          <p className="text-gray-500 mb-4">{error || 'Sekolah dengan ID tersebut tidak ditemukan dalam database'}</p>
          <Link
            to="/daftar"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#4675C0] to-[#19335A] text-white rounded-lg hover:opacity-90"
          >
            Kembali ke Daftar Sekolah
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F0F8FF] via-white to-white">
      {/* Header dengan Navbar */}
      <div className="pt-24 pb-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="flex mb-6" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link to="/" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-[#4675C0]">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                  </svg>
                  Beranda
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                  </svg>
                  <Link to="/daftar" className="ml-1 text-sm font-medium text-gray-700 hover:text-[#4675C0] md:ml-2">
                    Daftar Sekolah
                  </Link>
                </div>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                  </svg>
                  <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                    Detail Sekolah
                  </span>
                </div>
              </li>
            </ol>
          </nav>

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{sekolah.nama_sekolah}</h1>
              <p className="text-gray-600 flex items-center gap-2">
                <span>NPSN: {sekolah.npsn}</span>
                <span>•</span>
                <span>ID: {sekolah.id}</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              {sekolah.latitude && sekolah.longitude && (
                <a
                  href={`https://www.google.com/maps?q=${sekolah.latitude},${sekolah.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
                  </svg>
                  Lihat di Google Maps
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informasi Utama */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informasi Dasar Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 pb-4 border-b border-gray-200">
                Informasi Dasar Sekolah
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Nama Sekolah</label>
                    <div className="text-gray-900 font-medium">{sekolah.nama_sekolah}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">NPSN</label>
                    <div className="text-gray-900 font-medium">{sekolah.npsn}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Jenjang Pendidikan</label>
                    <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full border ${getJenjangColor(sekolah.jenjang_pendidikan)}`}>
                      {sekolah.jenjang_pendidikan}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Status Sekolah</label>
                    <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(sekolah.status_sekolah)}`}>
                      {sekolah.status_sekolah}
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Akreditasi</label>
                    <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full border ${getAkreditasiColor(sekolah.akreditasi)}`}>
                      {sekolah.akreditasi || 'Belum Terakreditasi'}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Tanggal Akreditasi</label>
                    <div className="text-gray-900">{sekolah.tanggal_akreditasi || '-'}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Nomor Telepon</label>
                    <div className="text-gray-900">{sekolah.no_telepon || '-'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Alamat dan Lokasi Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 pb-4 border-b border-gray-200">
                Alamat dan Lokasi
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">Alamat Lengkap</label>
                  <div className="text-gray-900 bg-gray-50 p-4 rounded-lg">
                    {sekolah.alamat || 'Alamat belum diisi'}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Desa/Kelurahan</label>
                    <div className="text-gray-900">{sekolah.desa_kelurahan || '-'}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Kecamatan</label>
                    <div className="text-gray-900">{sekolah.kecamatan || '-'}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Kota/Kabupaten</label>
                    <div className="text-gray-900">Pekanbaru</div>
                  </div>
                </div>
                {sekolah.latitude && sekolah.longitude && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Latitude</label>
                      <div className="text-gray-900 font-mono">{sekolah.latitude}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Longitude</label>
                      <div className="text-gray-900 font-mono">{sekolah.longitude}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Gambar Sekolah */}
            {sekolah.gambar && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-6 pb-4 border-b border-gray-200">
                  Gambar Sekolah
                </h2>
                <div className="flex flex-col items-center">
                  <img 
                    src={sekolah.gambar} 
                    alt={sekolah.nama_sekolah}
                    className="w-full max-w-md h-auto rounded-lg shadow-lg"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/400x300?text=Gambar+Tidak+Tersedia';
                    }}
                  />
                  <p className="text-sm text-gray-500 mt-3 text-center">
                    Gambar sekolah: {sekolah.nama_sekolah}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 pb-4 border-b border-gray-200">
                Aksi Cepat
              </h3>
              <div className="space-y-3">
                <Link
                  to="/daftar"
                  className="w-full px-4 py-3 bg-gray-50 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                  </svg>
                  Kembali ke Daftar
                </Link>
                <Link
                  to="/peta"
                  className="w-full px-4 py-3 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
                  </svg>
                  Lihat di Peta
                </Link>
                {sekolah.latitude && sekolah.longitude && (
                  <a
                    href={`https://www.google.com/maps?q=${sekolah.latitude},${sekolah.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full px-4 py-3 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
                    </svg>
                    Google Maps
                  </a>
                )}
              </div>
            </div>

            {/* Informasi Kontak */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 pb-4 border-b border-gray-200">
                Informasi Kontak
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Telepon</div>
                    <div className="font-medium text-gray-900">{sekolah.no_telepon || 'Tidak tersedia'}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Lokasi</div>
                    <div className="font-medium text-gray-900">{sekolah.kecamatan || 'Pekanbaru'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Metadata Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 pb-4 border-b border-gray-200">
                Metadata
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">ID Database</span>
                  <span className="font-mono text-gray-900">{sekolah.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Terakhir Update</span>
                  <span className="text-gray-900">{formatDate(sekolah.updated_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(sekolah.status_sekolah)}`}>
                    {sekolah.status_sekolah}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-500">
              Data terakhir diupdate: {formatDate(sekolah.updated_at)}
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/daftar"
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Kembali ke Daftar
              </Link>
              <Link
                to="/peta"
                className="px-4 py-2 bg-gradient-to-r from-[#4675C0] to-[#19335A] text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                Lihat di Peta
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}