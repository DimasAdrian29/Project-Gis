import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { getCurrentUser, logoutUser } from '../supabaseClient';
import Sidebar from '../components/Sidebar';

export default function DashboardLayout() {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Cek authentication
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate('/login');
    } else {
      setUser(currentUser);
    }
  }, [navigate]);

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#19335A] to-[#4675C0]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  const getPageTitle = () => {
    if (location.pathname === '/dashboard') return 'Dashboard';
    if (location.pathname.includes('/dashboard/sekolah/tambah')) return 'Tambah Sekolah';
    if (location.pathname.includes('/dashboard/sekolah/import')) return 'Import Data';
    if (location.pathname.includes('/dashboard/sekolah')) return 'Data Sekolah';
    if (location.pathname.includes('/dashboard/users')) return 'Manajemen User';
    if (location.pathname.includes('/dashboard/stats')) return 'Statistik';
    return 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Sidebar - HANYA untuk desktop */}
      <div className="hidden lg:block fixed inset-y-0 left-0 z-30 w-64">
        <Sidebar 
          user={user}
          onLogout={handleLogout}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
      </div>

      {/* Mobile Sidebar */}
      <div className="lg:hidden">
        {sidebarOpen && (
          <div className="fixed inset-0 z-40">
            <div 
              className="absolute inset-0 bg-gray-600 bg-opacity-75"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="absolute inset-y-0 left-0 z-50 w-64">
              <Sidebar 
                user={user}
                onLogout={handleLogout}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="lg:pl-64 min-h-screen">
        {/* Sticky Header */}
        <header className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
                </svg>
              </button>
              
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {getPageTitle()}
                </h1>
                <p className="text-sm text-gray-500">
                  {user?.nama_lengkap || 'Administrator Sistem'} • {new Date().toLocaleDateString('id-ID')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-gray-50 to-white min-h-[calc(100vh-73px)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}