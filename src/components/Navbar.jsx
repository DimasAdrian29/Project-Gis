import { Link } from "react-router-dom";
import { getCurrentUser, logoutUser } from '../supabaseClient';
import { useState, useEffect } from 'react';

export function Navbar() {
  // Palet Warna:
  // Primary: #4675C0 (Tombol, Logo)
  // Dark:    #19335A (Teks Utama)
  // Muted:   #697A98 (Teks Sekunder/Link)
  // Pale:    #B6BFD6 (Border)
  // Light:   #8FC8EB (Hover/Shadow)

  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Cek user login saat komponen mount
  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
  }, []);

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    setShowUserMenu(false);
  };

  return (
    <nav className="fixed w-full top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#B6BFD6]/30 transition-all duration-300">
      
      {/* Container sejajar dengan Footer (px-8) */}
      <div className="max-w-7xl mx-auto px-8 h-20 flex justify-between items-center">
        
        {/* === Bagian Kiri: Logo & Judul === */}
        <Link to="/" className="flex items-center gap-3 group cursor-pointer">
          
          {/* Ikon Bulat */}
          <div className="relative w-10 h-10 flex items-center justify-center">
             {/* Animasi Ping Halus di belakang logo */}
             <div className="absolute inset-0 bg-[#8FC8EB] rounded-full opacity-20 group-hover:animate-ping"></div>
             
             {/* Circle Utama */}
             <div className="relative w-10 h-10 bg-[#4675C0] rounded-full flex items-center justify-center text-white shadow-lg shadow-[#4675C0]/30 transition-transform duration-300 group-hover:scale-110">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="w-5 h-5"
                >
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
             </div>
          </div>

          {/* Teks Identitas */}
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-[#19335A] leading-none tracking-tight group-hover:text-[#4675C0] transition-colors duration-300">
              WebGIS Sekolah
            </h1>
            <span className="text-sm text-[#697A98] font-medium mt-0.5">
              Kota Pekanbaru
            </span>
          </div>
        </Link>

        {/* === Bagian Kanan: Menu Navigasi === */}
        <div className="flex items-center gap-6 md:gap-8">
          
          {/* Menu Beranda (Style Button Primary) */}
          <Link
            to="/"
            className="px-6 py-2.5 rounded-full font-semibold text-white bg-[#4675C0] hover:bg-[#19335A] shadow-[0_4px_14px_0_rgba(70,117,192,0.39)] hover:shadow-[0_6px_20px_rgba(25,51,90,0.23)] hover:-translate-y-0.5 transition-all duration-300 ease-out"
          >
            Beranda
          </Link>

          {/* Menu Peta (Style Link) */}
          <Link
            to="/peta"
            className="text-[#697A98] font-medium hover:text-[#4675C0] hover:scale-105 transition-all duration-300"
          >
            Peta
          </Link>

          {/* Menu Daftar Sekolah (Style Link) */}
          <Link
            to="/daftar"
            className="text-[#697A98] font-medium hover:text-[#4675C0] hover:scale-105 transition-all duration-300"
          >
            Daftar Sekolah
          </Link>

          {/* Menu Tentang (Style Link) */}
          <Link
            to="/tentang"
            className="text-[#697A98] font-medium hover:text-[#4675C0] hover:scale-105 transition-all duration-300"
          >
            Tentang
          </Link>
          
          {/* ===== TOMBOL LOGIN/LOGOUT ===== */}
          {user ? (
            // Jika user sudah login: Tampilkan User Menu
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 pl-4 pr-3 py-2.5 rounded-full font-semibold text-white bg-gradient-to-r from-[#19335A] to-[#4675C0] hover:opacity-90 shadow-[0_4px_14px_0_rgba(25,51,90,0.39)] hover:shadow-[0_6px_20px_rgba(70,117,192,0.23)] hover:-translate-y-0.5 transition-all duration-300 ease-out"
              >
                {/* Avatar User */}
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold">
                    {user.nama_lengkap?.charAt(0) || 'A'}
                  </span>
                </div>
                
                {/* Nama Pendek User */}
                <span>{user.nama_lengkap?.split(' ')[0] || 'Admin'}</span>
                
                {/* Dropdown Icon */}
                <svg 
                  className={`w-4 h-4 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <>
                  {/* Overlay untuk menutup dropdown saat klik di luar */}
                  <div 
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                  />
                  
                  {/* Menu Dropdown */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-[#B6BFD6]/50 z-50 overflow-hidden">
                    {/* Header User Info */}
                    <div className="p-4 bg-gradient-to-r from-[#19335A]/5 to-[#4675C0]/5 border-b border-[#B6BFD6]/30">
                      <div className="font-medium text-[#19335A] truncate">
                        {user.nama_lengkap || 'Administrator'}
                      </div>
                      <div className="text-sm text-[#697A98] truncate">
                        {user.email}
                      </div>
                      <div className="mt-1">
                        <span className="inline-block px-2 py-0.5 text-xs font-medium bg-[#4675C0] text-white rounded-full">
                          {user.role === 'admin' ? 'Administrator' : 'Operator'}
                        </span>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <Link
                        to="/dashboard"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-[#19335A] hover:bg-[#F0F8FF] transition-colors duration-200"
                      >
                        <svg className="w-4 h-4 text-[#4675C0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                        </svg>
                        <span>Dashboard</span>
                      </Link>

                      <Link
                        to="/dashboard/settings"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-[#19335A] hover:bg-[#F0F8FF] transition-colors duration-200"
                      >
                        <svg className="w-4 h-4 text-[#4675C0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                        <span>Pengaturan</span>
                      </Link>
                    </div>

                    {/* Logout Button */}
                    <div className="border-t border-[#B6BFD6]/30 p-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:opacity-90 transition-opacity duration-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                        </svg>
                        <span>Keluar</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            // Jika user belum login: Tampilkan Tombol Login
            <Link
              to="/login"
              className="px-6 py-2.5 rounded-full font-semibold text-white bg-gradient-to-r from-[#19335A] to-[#4675C0] hover:opacity-90 shadow-[0_4px_14px_0_rgba(25,51,90,0.39)] hover:shadow-[0_6px_20px_rgba(70,117,192,0.23)] hover:-translate-y-0.5 transition-all duration-300 ease-out flex items-center gap-2"
            >
              {/* Icon Login */}
              <svg 
                className="w-4 h-4"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              
              <span>Login Admin</span>
            </Link>
          )}
          
        </div>

      </div>
    </nav>
  );
}