import { Link } from "react-router-dom";

export function Navbar() {
  // Palet Warna:
  // Primary: #4675C0 (Tombol, Logo)
  // Dark:    #19335A (Teks Utama)
  // Muted:   #697A98 (Teks Sekunder/Link)
  // Pale:    #B6BFD6 (Border)
  // Light:   #8FC8EB (Hover/Shadow)

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

          {/* Menu Tentang (Style Link) */}
          <Link
            to="/tentang"
            className="text-[#697A98] font-medium hover:text-[#4675C0] hover:scale-105 transition-all duration-300"
          >
            Tentang
          </Link>
          {/* Menu Tentang (Style Link) */}
          <Link
            to="/daftar"
            className="text-[#697A98] font-medium hover:text-[#4675C0] hover:scale-105 transition-all duration-300"
          >
            Daftar Sekolah
          </Link>
          
        </div>

      </div>
    </nav>
  );
}