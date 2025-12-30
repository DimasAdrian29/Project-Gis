import React, { useEffect, useState, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { supabase } from '../supabaseClient';
import 'leaflet/dist/leaflet.css';

// Konfigurasi ikon custom untuk setiap jenjang
const createSchoolIcon = (jenjang) => {
  let color;
  let iconText;
  
  if (jenjang.includes('SD') || jenjang.includes('MI')) {
    color = '#60A5FA'; // Biru muda untuk SD
    iconText = 'SD';
  } else if (jenjang.includes('SMP') || jenjang.includes('MTs')) {
    color = '#FBBF24'; // Kuning untuk SMP
    iconText = 'SMP';
  } else if (jenjang.includes('SMA') || jenjang.includes('SMK') || jenjang.includes('MA')) {
    color = '#EF4444'; // Merah untuk SMA/SMK
    iconText = jenjang.includes('SMK') ? 'SMK' : 'SMA';
  } else {
    color = '#8B5CF6'; // Ungu untuk lainnya
    iconText = 'SCH';
  }

  return L.divIcon({
    html: `
      <div class="relative">
        <div style="
          background-color: ${color};
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 11px;
          transition: all 0.2s ease;
        ">
          ${iconText}
        </div>
        <div style="
          position: absolute;
          top: -4px;
          right: -4px;
          width: 16px;
          height: 16px;
          background-color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        ">
          <div style="
            width: 8px;
            height: 8px;
            background-color: ${color};
            border-radius: 50%;
          "></div>
        </div>
      </div>
    `,
    className: 'school-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
};

export function MapView({ filters, radius }) {
  const [sekolah, setSekolah] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [mapCenter] = useState([0.5333, 101.45]);
  const mapRef = useRef(null);

  // Fungsi untuk mengambil data dengan filter
  const fetchSekolah = async () => {
    try {
      setLoading(true);
      let query = supabase.from('sekolah').select('*');

      // Terapkan filter berdasarkan jenjang
      if (filters.jenjang.length > 0) {
        const jenjangValues = filters.jenjang.map(j => {
          if (j.includes('SD')) return 'SD';
          if (j.includes('SMP')) return 'SMP';
          if (j.includes('SMA')) return 'SMA';
          return j;
        });
        query = query.in('jenjang_pendidikan', jenjangValues);
      }

      // Terapkan filter berdasarkan status
      if (filters.status.length > 0) {
        query = query.in('status_sekolah', filters.status);
      }

      // Terapkan filter berdasarkan akreditasi
      if (filters.akreditasi.length > 0) {
        const filteredAkreditasi = filters.akreditasi.filter(a => a !== 'TT');
        const hasTT = filters.akreditasi.includes('TT');
        
        if (filteredAkreditasi.length > 0 && hasTT) {
          query = query.or(`akreditasi.in.(${filteredAkreditasi.join(',')}),akreditasi.not.in.(A,B,C)`);
        } else if (hasTT) {
          query = query.not('akreditasi', 'in', '("A","B","C")');
        } else if (filteredAkreditasi.length > 0) {
          query = query.in('akreditasi', filteredAkreditasi);
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      setSekolah(data || []);
    } catch (error) {
      console.error('Error fetching schools:', error.message);
      setSekolah([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSekolah();
  }, [filters]);

  // Fungsi untuk mendapatkan warna berdasarkan jenjang
  const getJenjangColor = (jenjang) => {
    if (jenjang.includes('SD') || jenjang.includes('MI')) return '#60A5FA';
    if (jenjang.includes('SMP') || jenjang.includes('MTs')) return '#FBBF24';
    if (jenjang.includes('SMA') || jenjang.includes('SMK') || jenjang.includes('MA')) return '#EF4444';
    return '#8B5CF6';
  };

  // Fungsi untuk mendapatkan label akreditasi
  const getAkreditasiLabel = (akreditasi) => {
    if (!akreditasi) return { label: 'Tidak Ada', color: 'bg-slate-500 text-white' };
    
    const upperAkreditasi = akreditasi.toUpperCase();
    
    switch(upperAkreditasi) {
      case 'A': return { label: 'A', color: 'bg-green-500 text-white', desc: 'Sangat Baik' };
      case 'B': return { label: 'B', color: 'bg-yellow-500 text-white', desc: 'Baik' };
      case 'C': return { label: 'C', color: 'bg-orange-500 text-white', desc: 'Cukup' };
      default: return { 
        label: akreditasi, 
        color: 'bg-red-500 text-white',
        desc: 'Status Khusus'
      };
    }
  };

  // Format URL gambar (tetap ada jika dibutuhkan di komponen lain)
  const getImageUrl = (gambar) => {
    if (!gambar) return null;
    if (gambar.startsWith('http')) return gambar;
    if (gambar.startsWith('schools/')) {
      return `https://ofnftvsliwcpsydrjhci.supabase.co/storage/v1/object/public/${gambar}`;
    }
    return gambar;
  };

  // Custom tile layer untuk performa lebih baik
  const CustomTileLayer = useMemo(() => {
    return (
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
        minZoom={10}
      />
    );
  }, []);

  // Komponen Popup yang efisien
  const EfficientPopup = ({ item }) => {
    const lat = parseFloat(item.latitude);
    const lng = parseFloat(item.longitude);
    const jenjangColor = getJenjangColor(item.jenjang_pendidikan);
    const akreditasiInfo = getAkreditasiLabel(item.akreditasi);
    
    return (
      <div className="efficient-popup w-[320px]">
        {/* Header kompak */}
        <div 
          className="p-3 text-white rounded-t-lg flex justify-between items-start"
          style={{ background: jenjangColor }}
        >
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base mb-1 truncate" title={item.nama_sekolah}>
              {item.nama_sekolah}
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-medium">
                {item.jenjang_pendidikan}
              </span>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                item.status_sekolah === 'Negeri' 
                  ? 'bg-blue-500/30' 
                  : 'bg-green-500/30'
              }`}>
                {item.status_sekolah}
              </span>
            </div>
          </div>
          <div className={`${akreditasiInfo.color} w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ml-2 flex-shrink-0`}>
            {akreditasiInfo.label.charAt(0)}
          </div>
        </div>

        {/* Konten informasi utama - tanpa scroll */}
        <div className="p-3 space-y-3">
          {/* Baris informasi pertama */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="text-xs text-slate-500">NPSN</div>
              <div className="text-sm font-medium text-[#19335A] truncate">
                {item.npsn || '-'}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-slate-500">Telepon</div>
              <div className="text-sm font-medium text-[#19335A] truncate">
                {item.no_telepon || '-'}
              </div>
            </div>
          </div>

          {/* Baris informasi kedua */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="text-xs text-slate-500">Kecamatan</div>
              <div className="text-sm font-medium text-[#19335A] truncate">
                {item.kecamatan || '-'}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-slate-500">Desa/Kelurahan</div>
              <div className="text-sm font-medium text-[#19335A] truncate">
                {item.desa_kelurahan || '-'}
              </div>
            </div>
          </div>

          {/* Info akreditasi */}
          <div className="flex items-center justify-between bg-slate-50 rounded p-2">
            <div className="text-xs text-slate-600">Akreditasi</div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${akreditasiInfo.color}`}>
                {akreditasiInfo.label}
              </span>
              {item.tanggal_akreditasi && (
                <span className="text-xs text-slate-500">
                  ({item.tanggal_akreditasi})
                </span>
              )}
            </div>
          </div>

          {/* Alamat singkat */}
          <div className="space-y-1">
            <div className="text-xs text-slate-500">Alamat</div>
            <div className="text-sm text-[#19335A] line-clamp-2 leading-tight">
              {item.alamat || 'Alamat tidak tersedia'}
            </div>
          </div>

          {/* Info radius */}
          <div className="flex items-center gap-2 text-xs text-slate-600 bg-blue-50 rounded p-2">
            <svg className="w-3 h-3 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <span>Cakupan: <span className="font-medium text-blue-700">{radius}m</span> dari lokasi</span>
          </div>

          {/* Koordinat */}
          <div className="flex justify-between items-center text-xs text-slate-500 border-t border-slate-200 pt-2">
            <span className="truncate mr-2">
              {lat.toFixed(4)}°N, {lng.toFixed(4)}°E
            </span>
            <button
              onClick={() => {
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
                }
              }}
              className="text-blue-600 hover:text-blue-800 text-xs font-medium"
            >
              Salin
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full h-[600px] bg-[#F8FAFC] rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {loading ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-white/90">
          <div className="mb-6 relative">
            <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-75"></div>
            <div className="relative w-20 h-20 bg-white rounded-full shadow-lg border border-blue-100 flex items-center justify-center">
              <span className="text-4xl">🗺️</span>
            </div>
          </div>
          <h3 className="text-xl font-bold text-[#19335A] mb-2">Memuat Peta...</h3>
          <p className="text-sm text-[#697A98] mb-4">
            Mengambil data sekolah dari database
          </p>
          <div className="w-48 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-[#4675C0] w-1/3 rounded-full animate-[loading_1s_ease-in-out_infinite]"></div>
          </div>
        </div>
      ) : (
        <MapContainer
          center={mapCenter}
          zoom={12}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
          className="z-0"
          ref={mapRef}
        >
          {CustomTileLayer}
          
          {/* Legend untuk peta - lebih kompak */}
          <div className="absolute bottom-4 left-4 z-[1000] bg-white p-3 rounded-lg shadow-lg border border-slate-200 max-w-[180px]">
            <div className="text-xs font-semibold text-[#19335A] mb-2 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
              Legenda
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#60A5FA] border border-white shadow-sm"></div>
                <span className="text-xs text-[#697A98]">SD/MI</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#FBBF24] border border-white shadow-sm"></div>
                <span className="text-xs text-[#697A98]">SMP/MTs</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#EF4444] border border-white shadow-sm"></div>
                <span className="text-xs text-[#697A98]">SMA/SMK</span>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-100">
                <div className="text-xs text-[#697A98] flex items-center gap-1">
                  <div className="w-3 h-3 border border-dashed border-[#4675C0] rounded-full"></div>
                  <span>Radius: {radius}m</span>
                </div>
              </div>
            </div>
          </div>

          {/* Counter sekolah - lebih kecil */}
          <div className="absolute top-4 right-4 z-[1000] bg-white px-3 py-2 rounded-lg shadow-lg border border-slate-200">
            <div className="text-sm font-semibold text-[#19335A]">
              <span className="text-[#4675C0]">{sekolah.length}</span> sekolah
            </div>
            <div className="text-xs text-[#697A98]">
              Radius: {radius}m
            </div>
          </div>

          {/* Render semua sekolah */}
          {sekolah.map((item) => {
            const lat = parseFloat(item.latitude);
            const lng = parseFloat(item.longitude);
            
            if (isNaN(lat) || isNaN(lng)) return null;

            const isSelected = selectedSchool?.id === item.id;
            const schoolIcon = createSchoolIcon(item.jenjang_pendidikan);
            const jenjangColor = getJenjangColor(item.jenjang_pendidikan);

            return (
              <React.Fragment key={item.id}>
                {/* Circle radius */}
                <Circle
                  center={[lat, lng]}
                  radius={radius}
                  pathOptions={{
                    fillColor: jenjangColor,
                    fillOpacity: isSelected ? 0.15 : 0.08,
                    color: jenjangColor,
                    opacity: isSelected ? 0.5 : 0.3,
                    weight: isSelected ? 2 : 1,
                    dashArray: isSelected ? '5, 5' : '10, 10'
                  }}
                />
                
                {/* Marker dengan popup efisien */}
                <Marker 
                  position={[lat, lng]}
                  icon={schoolIcon}
                  eventHandlers={{
                    click: () => {
                      setSelectedSchool(item);
                    }
                  }}
                >
                  <Popup
                    maxWidth={340}
                    minWidth={320}
                    className="efficient-popup-container"
                  >
                    <EfficientPopup item={item} />
                  </Popup>
                </Marker>
              </React.Fragment>
            );
          })}
        </MapContainer>
      )}
      
      <style>{`
        @keyframes loading {
          0% { transform: translateX(-150%); width: 20%; }
          50% { width: 60%; }
          100% { transform: translateX(250%); width: 20%; }
        }
        
        /* Styling untuk popup efisien */
        .efficient-popup-container .leaflet-popup-content-wrapper {
          border-radius: 8px;
          padding: 0;
          overflow: visible;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .efficient-popup-container .leaflet-popup-content {
          margin: 0;
          width: auto !important;
          line-height: 1.4;
        }
        
        .efficient-popup-container .leaflet-popup-tip {
          background: white;
          border: 1px solid #e2e8f0;
        }
        
        /* Utility classes */
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .truncate {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        /* Marker hover effect */
        .school-marker:hover > div > div {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }
      `}</style>
    </div>
  );
}