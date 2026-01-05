import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import MapPage from "./pages/MapPage";
import DaftarSekolah from "./pages/DaftarSekolah";
import AboutPage from "./pages/AboutPage";
import LoginPage from "./pages/LoginPage";
import DashboardHome from "./pages/dashboard/DashboardHome";
import DashboardLayout from "./layouts/DashboardLayout";
import SekolahList from "./pages/dashboard/SekolahList";
import SekolahForm from "./pages/dashboard/SekolahForm";
import SekolahImport from "./pages/dashboard/SekolahImport";
import SekolahDetail from "./pages/dashboard/SekolahDetail";
import SekolahDetailPublic from "./pages/SekolahDetailPublic"; // TAMBAHKAN INI
import { Footer } from "./components/Footer";
import { Navbar } from "./components/Navbar";
import { getCurrentUser } from "./supabaseClient";

// Import CSS Leaflet
import 'leaflet/dist/leaflet.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const user = getCurrentUser();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Layout untuk public routes (dengan navbar & footer)
const PublicLayout = ({ children }) => {
  return (
    <>
      <Navbar />
      <div className="flex-grow">
        {children}
      </div>
      <Footer />
    </>
  );
};

// Layout untuk dashboard (tanpa navbar & footer)
const DashboardWrapper = ({ children }) => {
  return <>{children}</>;
};

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Routes>
          {/* Public Routes dengan Navbar & Footer */}
          <Route path="/" element={
            <PublicLayout>
              <HomePage />
            </PublicLayout>
          } />
          <Route path="/peta" element={
            <PublicLayout>
              <MapPage />
            </PublicLayout>
          } />
          <Route path="/daftar" element={
            <PublicLayout>
              <DaftarSekolah />
            </PublicLayout>
          } />
          <Route path="/tentang" element={
            <PublicLayout>
              <AboutPage />
            </PublicLayout>
          } />
          <Route path="/login" element={<LoginPage />} />
          {/* TAMBAHKAN ROUTE DETAIL PUBLIK */}
          <Route path="/sekolah/:id" element={
            <PublicLayout>
              <SekolahDetailPublic />
            </PublicLayout>
          } />
          
          {/* Dashboard Routes tanpa Navbar & Footer */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardWrapper>
                <DashboardLayout />
              </DashboardWrapper>
            </ProtectedRoute>
          }>
            <Route index element={<DashboardHome />} />
            <Route path="sekolah" element={<SekolahList />} />
            <Route path="sekolah/tambah" element={<SekolahForm />} />
            <Route path="sekolah/edit/:id" element={<SekolahForm />} />
            <Route path="sekolah/import" element={<SekolahImport />} />
            <Route path="sekolah/detail/:id" element={<SekolahDetail />} />
            <Route path="users" element={<div>Halaman Manajemen User</div>} />
            <Route path="stats" element={<div>Halaman Statistik</div>} />
            <Route path="settings" element={<div>Halaman Pengaturan</div>} />
          </Route>
          
          {/* 404 */}
          <Route path="*" element={
            <PublicLayout>
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
            </PublicLayout>
          } />
        </Routes>
      </div>
    </BrowserRouter>
  );
}