import React from 'react';

export function FilterPanel({ filters, onFilterChange, onReset, radius, onRadiusChange }) {
  
  const handleCheckboxChange = (filterType, value) => {
    onFilterChange(filterType, value);
  };

  // Hitung total filter aktif
  const activeFiltersCount = 
    filters.jenjang.length + 
    filters.status.length + 
    filters.akreditasi.length;

  // Fungsi untuk reset semua filter
  const handleFullReset = () => {
    onReset();
    if (onRadiusChange) {
      onRadiusChange(500); // Reset ke radius default
    }
  };

  return (
    <div className="space-y-4">
      <aside className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header Filter */}
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/>
            </svg>
            <h3 className="font-bold text-[#19335A]">Filter Data</h3>
          </div>
          
          <div className="flex items-center gap-3">
            {activeFiltersCount > 0 && (
              <span className="text-xs font-medium bg-gradient-to-r from-[#4675C0] to-[#19335A] text-white px-2 py-1 rounded-full">
                {activeFiltersCount} aktif
              </span>
            )}
            <button 
              onClick={handleFullReset}
              className="text-xs font-medium text-[#4675C0] hover:text-[#19335A] hover:underline transition-colors"
            >
              Reset Semua
            </button>
          </div>
        </div>

        {/* Container Opsi */}
        <div className="p-5 space-y-6 max-h-[500px] overflow-y-auto">
          {/* Group 1: Jenjang */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-[#19335A] uppercase tracking-wider">Jenjang Pendidikan</h4>
              {filters.jenjang.length > 0 && (
                <span className="text-xs text-[#4675C0]">{filters.jenjang.length} dipilih</span>
              )}
            </div>
            <div className="space-y-2.5">
              {[
                { label: 'SD / MI', color: '#60A5FA' },
                { label: 'SMP / MTs', color: '#FBBF24' },
                { label: 'SMA / SMK', color: '#EF4444' }
              ].map((item) => (
                <label key={item.label} className="flex items-center gap-3 cursor-pointer group hover:bg-slate-50 p-2 rounded-lg transition-colors">
                  <div className="relative flex items-center">
                    <input 
                      type="checkbox" 
                      checked={filters.jenjang.includes(item.label)}
                      onChange={() => handleCheckboxChange('jenjang', item.label)}
                      className="peer h-4 w-4 appearance-none rounded border border-slate-300 bg-white checked:bg-[#4675C0] checked:border-[#4675C0] focus:ring-2 focus:ring-[#4675C0]/20 transition-all" 
                    />
                    <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity" 
                         xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <div className="flex-1 flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <div>
                      <span className="text-sm text-[#697A98] group-hover:text-[#4675C0] transition-colors">{item.label}</span>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {item.label.includes('SD') ? 'Sekolah Dasar' : 
                         item.label.includes('SMP') ? 'Sekolah Menengah Pertama' : 
                         'Sekolah Menengah Atas'}
                      </div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

          {/* Group 2: Status */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-[#19335A] uppercase tracking-wider">Status Sekolah</h4>
              {filters.status.length > 0 && (
                <span className="text-xs text-[#4675C0]">{filters.status.length} dipilih</span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Negeri', color: 'bg-blue-100 text-blue-800 border-blue-200' },
                { label: 'Swasta', color: 'bg-green-100 text-green-800 border-green-200' }
              ].map((item) => (
                <label key={item.label} className="cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={filters.status.includes(item.label)}
                    onChange={() => handleCheckboxChange('status', item.label)}
                    className="peer sr-only" 
                  />
                  <div className={`
                    p-3 rounded-lg border transition-all transform hover:scale-[1.02]
                    peer-checked:ring-2 peer-checked:ring-offset-1 peer-checked:ring-[#4675C0]/30
                    ${filters.status.includes(item.label) 
                      ? `${item.color} ring-2 ring-offset-1 ring-[#4675C0]/30` 
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-white'}
                  `}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{item.label}</span>
                      {filters.status.includes(item.label) && (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                        </svg>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      {item.label === 'Negeri' ? 'Pemerintah' : 'Non-Pemerintah'}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

          {/* Group 3: Akreditasi */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-[#19335A] uppercase tracking-wider">Akreditasi</h4>
              {filters.akreditasi.length > 0 && (
                <span className="text-xs text-[#4675C0]">{filters.akreditasi.length} dipilih</span>
              )}
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'A', label: 'A', color: 'bg-green-500', description: 'Sangat Baik' },
                  { value: 'B', label: 'B', color: 'bg-yellow-500', description: 'Baik' },
                  { value: 'C', label: 'C', color: 'bg-orange-500', description: 'Cukup' }
                ].map((item) => (
                  <label key={item.value} className="cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={filters.akreditasi.includes(item.value)}
                      onChange={() => handleCheckboxChange('akreditasi', item.value)}
                      className="peer sr-only" 
                    />
                    <div className={`
                      p-3 rounded-lg border transition-all transform group-hover:scale-[1.02]
                      peer-checked:ring-2 peer-checked:ring-offset-1 peer-checked:ring-[#4675C0]/30
                      ${filters.akreditasi.includes(item.value) 
                        ? 'border-[#4675C0] bg-white shadow-sm' 
                        : 'border-slate-200 bg-slate-50 hover:bg-white'}
                    `}>
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.color} text-white font-bold text-lg mb-2`}>
                          {item.label}
                        </div>
                        <div className="text-xs font-medium text-[#19335A]">{item.description}</div>
                        {filters.akreditasi.includes(item.value) && (
                          <div className="mt-1">
                            <svg className="w-4 h-4 text-[#4675C0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              
              {/* Filter TT (Selain A, B, C) */}
              <label className="flex items-center gap-3 cursor-pointer group hover:bg-slate-50 p-3 rounded-lg transition-colors">
                <div className="relative flex items-center">
                  <input 
                    type="checkbox" 
                    checked={filters.akreditasi.includes('TT')}
                    onChange={() => handleCheckboxChange('akreditasi', 'TT')}
                    className="peer h-4 w-4 appearance-none rounded border border-slate-300 bg-white checked:bg-red-500 checked:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all" 
                  />
                  <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity" 
                       xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <span className="text-red-700 font-bold">TT</span>
                    </div>
                    <div>
                      <span className="text-sm text-[#697A98] group-hover:text-red-600 transition-colors">
                        Lainnya (Selain A, B, C)
                      </span>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Tidak terakreditasi / Status khusus
                      </div>
                    </div>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Info Filter Aktif */}
          {activeFiltersCount > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm text-blue-800 mb-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span className="font-medium">Filter Aktif:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {filters.jenjang.map(item => {
                  let color = '#60A5FA';
                  if (item.includes('SMP')) color = '#FBBF24';
                  if (item.includes('SMA')) color = '#EF4444';
                  
                  return (
                    <span 
                      key={item} 
                      className="text-xs px-2 py-1 rounded font-medium text-white"
                      style={{ backgroundColor: color }}
                    >
                      {item}
                    </span>
                  );
                })}
                {filters.status.map(item => (
                  <span 
                    key={item} 
                    className={`text-xs px-2 py-1 rounded font-medium ${
                      item === 'Negeri' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {item}
                  </span>
                ))}
                {filters.akreditasi.map(item => {
                  let bgColor = 'bg-slate-100 text-slate-800';
                  if (item === 'A') bgColor = 'bg-green-100 text-green-800';
                  if (item === 'B') bgColor = 'bg-yellow-100 text-yellow-800';
                  if (item === 'C') bgColor = 'bg-orange-100 text-orange-800';
                  if (item === 'TT') bgColor = 'bg-red-100 text-red-800';
                  
                  return (
                    <span key={item} className={`text-xs px-2 py-1 rounded font-medium ${bgColor}`}>
                      {item === 'TT' ? 'Lainnya' : item}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}