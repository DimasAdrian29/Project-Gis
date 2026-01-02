import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ user, onLogout, sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();

  const menuItems = [
    {
      title: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
        </svg>
      ),
      path: '/dashboard',
      exact: true
    },
    {
      title: 'Data Sekolah',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
        </svg>
      ),
      path: '/dashboard/sekolah',
      children: [
        { title: 'Daftar Sekolah', path: '/dashboard/sekolah' },
        { title: 'Tambah Sekolah', path: '/dashboard/sekolah/tambah' },
        { title: 'Import Data', path: '/dashboard/sekolah/import' }
      ]
    },
   
  ];

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Fixed Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-[#4675C0] to-[#19335A] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">🏫</span>
            </div>
            <div>
              <h2 className="font-bold text-[#19335A]">Dashboard</h2>
              <p className="text-xs text-[#697A98]">Sekolah Pekanbaru</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-lg hover:bg-gray-100"
          >
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* User Profile */}
        <div className="px-4 py-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-[#4675C0] to-[#19335A] rounded-full flex items-center justify-center">
              <span className="text-white text-lg font-bold">
                {user?.nama_lengkap?.charAt(0) || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{user?.nama_lengkap || 'User'}</p>
              <p className="text-sm text-gray-500 truncate">{user?.email || 'user@example.com'}</p>
              <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                {user?.role || 'user'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Menu - dengan fixed height untuk scroll internal */}
        <div className="flex-1 overflow-hidden">
          <nav className="h-full px-2 py-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              if (item.show === false) return null;
              
              const isActive = location.pathname === item.path || 
                (item.children && item.children.some(child => location.pathname === child.path));
              
              return (
                <div key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-gradient-to-r from-[#4675C0] to-[#19335A] text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className={`${isActive ? 'text-white' : 'text-gray-500'}`}>
                      {item.icon}
                    </span>
                    {item.title}
                  </Link>
                  
                  {/* Submenu */}
                  {item.children && isActive && (
                    <div className="ml-10 mt-1 space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.path}
                          to={child.path}
                          className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                            location.pathname === child.path
                              ? 'text-[#4675C0] bg-blue-50'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                          }`}
                          onClick={() => setSidebarOpen(false)}
                        >
                          {child.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Fixed Sidebar Footer */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onLogout}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;