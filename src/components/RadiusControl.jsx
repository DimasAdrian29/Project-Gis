import React from 'react';

export function RadiusControl({ radius, onRadiusChange }) {
  const radiusOptions = [100, 250, 500, 1000, 2000, 5000]; // dalam meter

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-[#19335A] flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
          </svg>
          Radius Cakupan
        </h4>
        <span className="text-sm font-medium text-[#4675C0] bg-blue-50 px-2 py-1 rounded">
          {radius} m
        </span>
      </div>

      <div className="space-y-3">
        {/* Slider untuk radius */}
        <div>
          <input
            type="range"
            min="50"
            max="10000"
            step="50"
            value={radius}
            onChange={(e) => onRadiusChange(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#4675C0] [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-lg"
          />
          <div className="flex justify-between text-xs text-[#697A98] mt-1">
            <span>50m</span>
            <span>5km</span>
            <span>10km</span>
          </div>
        </div>

        {/* Tombol preset radius */}
        <div className="grid grid-cols-3 gap-2">
          {radiusOptions.map((r) => (
            <button
              key={r}
              onClick={() => onRadiusChange(r)}
              className={`py-2 text-xs font-medium rounded-lg transition-all ${
                radius === r
                  ? 'bg-[#4675C0] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {r < 1000 ? `${r}m` : `${r / 1000}km`}
            </button>
          ))}
        </div>

        <div className="pt-3 border-t border-slate-100">
          <div className="flex items-start gap-2 text-xs text-[#697A98]">
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <p>Radius menunjukkan cakupan wilayah sekitar sekolah. Semakin besar radius, semakin luas area yang ditampilkan.</p>
          </div>
        </div>
      </div>
    </div>
  );
}