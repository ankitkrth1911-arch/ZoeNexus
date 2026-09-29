import React from 'react';
import { MapPin, Layers, Navigation, ShieldCheck, AlertTriangle } from 'lucide-react';
import { InteractiveMap } from '../overview/InteractiveMap';
import { MOCK_DISTRICTS } from '../../data/mockData';
import { useCommandStore } from '../../store/useCommandStore';
import { StatusPill } from '../common/StatusPill';

export const LiveMapScreen: React.FC = () => {
  const { selectedDistrictId, setSelectedDistrictId, openDrawer } = useCommandStore();

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#111722] border border-[#1e293b]">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#00e5bc]" />
            <h1 className="font-heading text-lg font-bold text-white tracking-tight">
              Geospatial Health Mesh &amp; Transit Corridors
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time geospatial visualization of district stock-out risk choropleths, peripheral PHC telemetry, and cross-district flow arcs.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <Navigation className="w-3.5 h-3.5 text-[#00e5bc]" />
          <span>Western Corridor: 5 Districts • 4,382 PHCs</span>
        </div>
      </div>

      {/* Main Full-Height Interactive Map */}
      <div className="h-[600px] w-full">
        <InteractiveMap />
      </div>

      {/* District Quick-Selection Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 font-mono text-xs">
        {MOCK_DISTRICTS.map((d) => {
          const isSelected = selectedDistrictId === d.id;

          return (
            <div
              key={d.id}
              onClick={() => {
                setSelectedDistrictId(d.id);
                openDrawer('district', d.id);
              }}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 ${
                isSelected
                  ? 'bg-[#161f2e] border-[#00e5bc] shadow-[0_0_12px_rgba(0,229,188,0.2)]'
                  : 'bg-[#111722] border-[#1e293b] hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs truncate">{d.name.split(' ')[0]}</span>
                <StatusPill status={d.riskLevel} size="sm" />
              </div>

              <div className="space-y-1 text-[11px] text-slate-400">
                <div className="flex justify-between">
                  <span>Stock Buffer:</span>
                  <span className={d.daysOfStockAvg < 5 ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                    {d.daysOfStockAvg} days
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Bed Occupancy:</span>
                  <span className="text-slate-200">{d.bedOccupancy}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Staff Attendance:</span>
                  <span className="text-slate-200">{d.staffAttendance}%</span>
                </div>
              </div>

              <div className="text-[10px] text-[#00e5bc] pt-1 border-t border-slate-800 text-right">
                Inspect District →
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
