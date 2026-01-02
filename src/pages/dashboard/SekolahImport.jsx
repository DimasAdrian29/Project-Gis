import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

export default function SekolahImport() {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check file type
      const validTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'];
      if (!validTypes.includes(selectedFile.type)) {
        alert('Hanya file Excel (.xlsx, .xls) atau CSV yang diperbolehkan');
        e.target.value = '';
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleImport = async () => {
    if (!file) {
      alert('Pilih file terlebih dahulu');
      return;
    }

    setLoading(true);
    setImportResult(null);

    try {
      // Read file
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = e.target.result;
        // Parse CSV/Excel here (simplified example)
        // You'll need to implement proper parsing based on your file format
        
        // For now, show a placeholder
        setImportResult({
          success: true,
          message: 'File berhasil diupload. Proses parsing data...',
          total: 0,
          successCount: 0,
          errorCount: 0,
          errors: []
        });
      };
      reader.readAsText(file);
    } catch (error) {
      console.error('Import error:', error);
      setImportResult({
        success: false,
        message: 'Gagal memproses file: ' + error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    // Create template CSV content
    const headers = [
      'nama_sekolah', 'npsn', 'jenjang_pendidikan', 'status_sekolah',
      'alamat', 'desa_kelurahan', 'kecamatan', 'no_telepon',
      'tanggal_akreditasi', 'akreditasi', 'latitude', 'longitude'
    ];
    
    const exampleData = [
      'SD Negeri 123 Pekanbaru', '12345678', 'SD', 'Negeri',
      'Jl. Contoh No. 123', 'Simpang Tiga', 'Bukit Raya', '081234567890',
      '2023-01-15', 'A', '0.510440', '101.447197'
    ];
    
    const csvContent = [
      headers.join(','),
      exampleData.join(',')
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'template_import_sekolah.csv';
    link.click();
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Import Data Sekolah</h1>
        <p className="text-gray-600">
          Upload file Excel atau CSV untuk mengimpor data sekolah secara massal.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {/* Upload Area */}
        <div className="mb-8">
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#4675C0] transition-colors">
            <input
              type="file"
              id="file-upload"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />
            
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="w-16 h-16 mx-auto bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-[#4675C0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"/>
                </svg>
              </div>
              
              <div className="mb-2">
                <span className="text-[#4675C0] font-medium">Klik untuk upload</span> atau drag and drop
              </div>
              <p className="text-sm text-gray-500 mb-4">
                File CSV atau Excel (maks. 10MB)
              </p>
              
              {file && (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </div>
              )}
            </label>
          </div>
        </div>

        {/* Instructions */}
        <div className="mb-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Petunjuk Import
          </h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Gunakan template yang disediakan untuk format yang benar</li>
            <li>• Pastikan data NPSN unik dan tidak duplikat</li>
            <li>• Kolom wajib: nama_sekolah dan npsn</li>
            <li>• Format tanggal: YYYY-MM-DD</li>
            <li>• Status sekolah: "Negeri" atau "Swasta"</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={downloadTemplate}
            className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            Download Template
          </button>
          
          <button
            onClick={handleImport}
            disabled={loading || !file}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#4675C0] to-[#19335A] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Memproses...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                </svg>
                Mulai Import
              </>
            )}
          </button>
          
          <button
            onClick={() => navigate('/dashboard/sekolah')}
            className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Kembali
          </button>
        </div>

        {/* Result */}
        {importResult && (
          <div className={`mt-6 p-4 rounded-lg ${
            importResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-start gap-3">
              <div className={`p-1 rounded-full ${
                importResult.success ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
              }`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {importResult.success ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                  )}
                </svg>
              </div>
              <div>
                <h4 className={`font-medium ${
                  importResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {importResult.success ? 'Import Berhasil' : 'Import Gagal'}
                </h4>
                <p className={`text-sm ${
                  importResult.success ? 'text-green-700' : 'text-red-700'
                }`}>
                  {importResult.message}
                </p>
                
                {importResult.total > 0 && (
                  <div className="mt-3 space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">Total data: </span>
                      {importResult.total}
                    </div>
                    <div className="text-sm text-green-600">
                      <span className="font-medium">Berhasil: </span>
                      {importResult.successCount}
                    </div>
                    <div className="text-sm text-red-600">
                      <span className="font-medium">Gagal: </span>
                      {importResult.errorCount}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}