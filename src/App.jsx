import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import MapPage from "./pages/MapPage";
import DaftarSekolah from "./pages/DaftarSekolah";
import AboutPage from "./pages/AboutPage";
import { Footer } from "./components/Footer";
import { Navbar } from "./components/navbar";

// Import CSS Leaflet dan fix icon
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix Leaflet icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function App() {
  return (
    <BrowserRouter>
      {/* Container Utama */}
      <div className="min-h-screen flex flex-col">
        
        <Navbar />

        {/* Main Content Area - Menggunakan semua sisa ruang */}
        <div className="flex-grow w-full">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/peta" element={<MapPage />} />
            <Route path="/daftar" element={<DaftarSekolah />} />
            <Route path="/tentang" element={<AboutPage />} />
            
            {/* Route fallback untuk 404 */}
            <Route path="*" element={
              <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-[#19335A] mb-4">404</h1>
                  <p className="text-[#697A98] mb-6">Halaman tidak ditemukan</p>
                  <a 
                    href="/" 
                    className="px-6 py-2 bg-gradient-to-r from-[#19335A] to-[#4675C0] text-white rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Kembali ke Beranda
                  </a>
                </div>
              </div>
            } />
          </Routes>
        </div>

        <Footer />
        
      </div>
    </BrowserRouter>
  );
}