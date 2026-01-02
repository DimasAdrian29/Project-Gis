import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

export default function SekolahForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    nama_sekolah: '',
    npsn: '',
    jenjang_pendidikan: '',
    status_sekolah: 'Negeri',
    alamat: '',
    desa_kelurahan: '',
    kecamatan: '',
    no_telepon: '',
    tanggal_akreditasi: '',
    akreditasi: '',
    latitude: '',
    longitude: '',
    gambar: ''
  });

  useEffect(() => {
    if (isEdit) {
      fetchSekolahData();
    }
  }, [id]);

  const fetchSekolahData = async () => {
    try {
      const { data, error } = await supabase
        .from('sekolah')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      if (data) {
        setFormData({
          nama_sekolah: data.nama_sekolah || '',
          npsn: data.npsn || '',
          jenjang_pendidikan: data.jenjang_pendidikan || '',
          status_sekolah: data.status_sekolah || 'Negeri',
          alamat: data.alamat || '',
          desa_kelurahan: data.desa_kelurahan || '',
          kecamatan: data.kecamatan || '',
          no_telepon: data.no_telepon || '',
          tanggal_akreditasi: data.tanggal_akreditasi || '',
          akreditasi: data.akreditasi || '',
          latitude: data.latitude || '',
          longitude: data.longitude || '',
          gambar: data.gambar || ''
        });
        
        if (data.gambar) {
          setPreviewImage(data.gambar);
        }
      }
    } catch (error) {
      console.error('Error fetching sekolah data:', error);
      alert('Gagal memuat data sekolah');
      navigate('/dashboard/sekolah');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validasi file
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      alert('Format file tidak didukung. Gunakan JPG, PNG, atau GIF.');
      return;
    }

    if (file.size > maxSize) {
      alert('Ukuran file terlalu besar. Maksimal 5MB.');
      return;
    }

    setUploading(true);

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `sekolah/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('gambar')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('gambar')
        .getPublicUrl(filePath);

      // Update form data with new image URL
      setFormData(prev => ({
        ...prev,
        gambar: publicUrl
      }));
      
      // Set preview
      setPreviewImage(publicUrl);
      
      alert('Gambar berhasil diupload!');
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Gagal mengupload gambar. Silakan coba lagi.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      gambar: ''
    }));
    setPreviewImage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validasi
      if (!formData.nama_sekolah.trim()) {
        throw new Error('Nama sekolah wajib diisi');
      }
      if (!formData.npsn.trim()) {
        throw new Error('NPSN wajib diisi');
      }

      const dataToSubmit = {
        ...formData,
        npsn: formData.npsn.toString(),
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        updated_at: new Date().toISOString()
      };

      let result;
      if (isEdit) {
        result = await supabase
          .from('sekolah')
          .update(dataToSubmit)
          .eq('id', id);
      } else {
        result = await supabase
          .from('sekolah')
          .insert([dataToSubmit]);
      }

      if (result.error) throw result.error;

      alert(`Data sekolah berhasil ${isEdit ? 'diperbarui' : 'ditambahkan'}`);
      navigate('/dashboard/sekolah');
    } catch (error) {
      console.error('Error saving sekolah:', error);
      alert(error.message || `Gagal ${isEdit ? 'memperbarui' : 'menambahkan'} data sekolah`);
    } finally {
      setLoading(false);
    }
  };

  const jenjangOptions = ['SD', 'SMP', 'SMA', 'SMK', ];
  const akreditasiOptions = ['A', 'B', 'C', 'Belum Terakreditasi'];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {isEdit ? 'Edit Data Sekolah' : 'Tambah Data Sekolah'}
        </h1>
        <p className="text-gray-600">
          {isEdit 
            ? 'Perbarui informasi data sekolah di bawah ini.' 
            : 'Isi form di bawah untuk menambahkan data sekolah baru.'}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Kolom Kiri */}
            <div className="space-y-6">
              {/* Nama Sekolah */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Sekolah <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nama_sekolah"
                  value={formData.nama_sekolah}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4675C0] focus:border-transparent"
                  placeholder="Contoh: SD Negeri 123 Pekanbaru"
                  required
                />
              </div>

              {/* NPSN */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  NPSN <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="npsn"
                  value={formData.npsn}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4675C0] focus:border-transparent"
                  placeholder="Nomor Pokok Sekolah Nasional"
                  required
                />
              </div>

              {/* Jenjang & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jenjang Pendidikan
                  </label>
                  <select
                    name="jenjang_pendidikan"
                    value={formData.jenjang_pendidikan}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4675C0] focus:border-transparent"
                  >
                    <option value="">Pilih Jenjang</option>
                    {jenjangOptions.map(jenjang => (
                      <option key={jenjang} value={jenjang}>{jenjang}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status Sekolah
                  </label>
                  <select
                    name="status_sekolah"
                    value={formData.status_sekolah}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4675C0] focus:border-transparent"
                  >
                    <option value="Negeri">Negeri</option>
                    <option value="Swasta">Swasta</option>
                  </select>
                </div>
              </div>

              {/* Alamat */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alamat Lengkap
                </label>
                <textarea
                  name="alamat"
                  value={formData.alamat}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4675C0] focus:border-transparent"
                  placeholder="Jl. Contoh No. 123"
                />
              </div>
            </div>

            {/* Kolom Kanan */}
            <div className="space-y-6">
              {/* Desa & Kecamatan */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Desa/Kelurahan
                  </label>
                  <input
                    type="text"
                    name="desa_kelurahan"
                    value={formData.desa_kelurahan}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4675C0] focus:border-transparent"
                    placeholder="Nama desa/kelurahan"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kecamatan
                  </label>
                  <input
                    type="text"
                    name="kecamatan"
                    value={formData.kecamatan}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4675C0] focus:border-transparent"
                    placeholder="Nama kecamatan"
                  />
                </div>
              </div>

              {/* Telepon & Akreditasi */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    No. Telepon
                  </label>
                  <input
                    type="text"
                    name="no_telepon"
                    value={formData.no_telepon}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4675C0] focus:border-transparent"
                    placeholder="081234567890"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Akreditasi
                  </label>
                  <select
                    name="akreditasi"
                    value={formData.akreditasi}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4675C0] focus:border-transparent"
                  >
                    <option value="">Pilih Akreditasi</option>
                    {akreditasiOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tanggal Akreditasi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Akreditasi
                </label>
                <input
                  type="date"
                  name="tanggal_akreditasi"
                  value={formData.tanggal_akreditasi}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4675C0] focus:border-transparent"
                />
              </div>

              {/* Koordinat */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4675C0] focus:border-transparent"
                    placeholder="0.510440"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4675C0] focus:border-transparent"
                    placeholder="101.447197"
                  />
                </div>
              </div>

              {/* Upload Gambar */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Gambar Sekolah
                </label>
                
                {/* File Upload Area */}
                <div className="mt-1">
                  <div className="flex items-center justify-center w-full">
                    <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                      uploading 
                        ? 'border-blue-300 bg-blue-50' 
                        : 'border-gray-300 hover:border-[#4675C0] hover:bg-blue-50'
                    }`}>
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {uploading ? (
                          <>
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4675C0] mb-2"></div>
                            <p className="text-sm text-gray-500">Mengupload gambar...</p>
                          </>
                        ) : (
                          <>
                            <svg className="w-8 h-8 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"/>
                            </svg>
                            <p className="text-sm text-gray-500">
                              <span className="font-semibold">Klik untuk upload</span> atau drag and drop
                            </p>
                            <p className="text-xs text-gray-400">JPG, PNG, GIF (maks. 5MB)</p>
                          </>
                        )}
                      </div>
                      <input 
                        ref={fileInputRef}
                        type="file" 
                        className="hidden"
                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                        onChange={handleFileChange}
                        disabled={uploading}
                      />
                    </label>
                  </div>

                  {/* URL Gambar Manual (Fallback) */}
                  <div className="mt-3">
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Atau masukkan URL gambar manual:
                    </label>
                    <input
                      type="url"
                      name="gambar"
                      value={formData.gambar}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4675C0] focus:border-transparent"
                      placeholder="https://example.com/gambar.jpg"
                    />
                  </div>

                  {/* Image Preview */}
                  {previewImage && (
                    <div className="mt-4">
                      <label className="block text-xs font-medium text-gray-500 mb-2">
                        Preview Gambar:
                      </label>
                      <div className="relative inline-block">
                        <img 
                          src={previewImage} 
                          alt="Preview"
                          className="w-48 h-32 object-cover rounded-lg border border-gray-200"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/192x128?text=Gambar+Tidak+Tersedia';
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                          title="Hapus gambar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                          </svg>
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 truncate">
                        URL: {previewImage}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/dashboard/sekolah')}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading || uploading}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className="px-6 py-2.5 bg-gradient-to-r from-[#4675C0] to-[#19335A] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Menyimpan...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/>
                  </svg>
                  {isEdit ? 'Perbarui Data' : 'Simpan Data'}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}