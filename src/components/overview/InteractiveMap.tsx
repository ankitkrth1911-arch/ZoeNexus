import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Layers,
  Maximize2,
  Minimize2,
  Navigation,
  Info,
  Check,
  TrendingDown,
  Truck,
  Repeat,
} from 'lucide-react';
import { useCommandStore } from '../../store/useCommandStore';
import { MOCK_DISTRICTS, MOCK_PHCS } from '../../data/mockData';

export const InteractiveMap: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const flowsLayerRef = useRef<L.LayerGroup | null>(null);
  const circlesLayerRef = useRef<L.LayerGroup | null>(null);

  const {
    selectedDistrictId,
    setSelectedDistrictId,
    openDrawer,
    mapMetricOverlay,
    setMapMetricOverlay,
    showFlowArcs,
    setShowFlowArcs,
    showPulsingPHCs,
    setShowPulsingPHCs,
    transfers,
    focusedPanelId,
    setFocusedPanelId,
  } = useCommandStore();

  const isFocused = focusedPanelId === 'map-panel';

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center on Maharashtra Health Grid corridor (around Satara / Pune: 18.2° N, 74.3° E)
    const map = L.map(mapContainerRef.current, {
      center: [18.25, 74.45],
      zoom: 8,
      minZoom: 6,
      maxZoom: 13,
      zoomControl: true,
      attributionControl: false,
    });

    // High-trust dark basemap tiles (CartoDB Dark Matter free tiles)
    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      {
        subdomains: 'abcd',
        maxZoom: 19,
      }
    ).addTo(map);

    // Add layers groups
    const circlesGroup = L.layerGroup().addTo(map);
    const markersGroup = L.layerGroup().addTo(map);
    const flowsGroup = L.layerGroup().addTo(map);

    circlesLayerRef.current = circlesGroup;
    markersLayerRef.current = markersGroup;
    flowsLayerRef.current = flowsGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update District Choropleths & PHC markers & Flow Arcs whenever state changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old layers
    circlesLayerRef.current?.clearLayers();
    markersLayerRef.current?.clearLayers();
    flowsLayerRef.current?.clearLayers();

    // 1. Render District Circles / Choropleth Nodes
    MOCK_DISTRICTS.forEach((d) => {
      let fillColor = '#10b981';
      let strokeColor = '#10b981';
      let radius = 28000;

      if (mapMetricOverlay === 'risk') {
        if (d.stockoutRiskScore >= 70) {
          fillColor = '#ef4444';
          strokeColor = '#ef4444';
        } else if (d.stockoutRiskScore >= 35) {
          fillColor = '#f59e0b';
          strokeColor = '#f59e0b';
        } else {
          fillColor = '#10b981';
          strokeColor = '#10b981';
        }
      } else if (mapMetricOverlay === 'beds') {
        fillColor = d.bedOccupancy > 85 ? '#ef4444' : d.bedOccupancy > 75 ? '#f59e0b' : '#38bdf8';
        strokeColor = fillColor;
      } else if (mapMetricOverlay === 'staff') {
        fillColor = d.staffAttendance < 90 ? '#f59e0b' : '#10b981';
        strokeColor = fillColor;
      } else if (mapMetricOverlay === 'stock') {
        fillColor = d.daysOfStockAvg < 5 ? '#ef4444' : d.daysOfStockAvg < 15 ? '#f59e0b' : '#10b981';
        strokeColor = fillColor;
      }

      const isSelected = selectedDistrictId === d.id;

      const circle = L.circle([d.lat, d.lng], {
        radius: isSelected ? radius * 1.15 : radius,
        color: strokeColor,
        weight: isSelected ? 3 : 1.5,
        opacity: isSelected ? 0.9 : 0.6,
        fillColor: fillColor,
        fillOpacity: isSelected ? 0.25 : 0.12,
        dashArray: isSelected ? undefined : '4, 4',
      });

      // Tooltip & Click handler
      circle.bindTooltip(
        `<div style="font-family: 'Inter', sans-serif; font-size: 11px; padding: 4px;">
          <div style="font-weight: 700; color: #fff;">${d.name}</div>
          <div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #94a3b8; margin-top: 2px;">
            Risk: <span style="color: ${strokeColor}; font-weight: 600;">${d.stockoutRiskScore}%</span> • Stock: ${d.daysOfStockAvg}d • Beds: ${d.bedOccupancy}%
          </div>
          <div style="color: #00e5bc; font-size: 10px; margin-top: 4px;">Click to view full district telemetry</div>
        </div>`,
        { direction: 'top', className: 'custom-leaflet-tooltip' }
      );

      circle.on('click', () => {
        setSelectedDistrictId(d.id);
        openDrawer('district', d.id);
      });

      circlesLayerRef.current?.addLayer(circle);

      // District Center Label Marker
      const labelIcon = L.divIcon({
        className: 'custom-district-marker',
        html: `
          <div class="px-2 py-0.5 rounded border text-[10px] font-mono font-semibold whitespace-nowrap shadow-md cursor-pointer transition-transform hover:scale-105 ${
            isSelected
              ? 'bg-[#111722] border-[#00e5bc] text-[#00e5bc] shadow-[0_0_10px_rgba(0,229,188,0.3)]'
              : 'bg-[#0b0f17]/90 border-slate-700 text-slate-200 hover:border-slate-500'
          }">
            ${d.name.split(' ')[0]} ${d.stockoutRiskScore >= 70 ? '⚠️' : '✓'}
          </div>
        `,
        iconSize: [80, 20],
        iconAnchor: [40, 10],
      });

      const labelMarker = L.marker([d.lat, d.lng], { icon: labelIcon });
      labelMarker.on('click', () => {
        setSelectedDistrictId(d.id);
        openDrawer('district', d.id);
      });
      circlesLayerRef.current?.addLayer(labelMarker);
    });

    // 2. Render Pulsing Critical PHCs
    if (showPulsingPHCs) {
      MOCK_PHCS.forEach((p) => {
        const isCritical = p.avgDaysOfStock < 3;
        const isSelected = selectedDistrictId === p.districtId;

        const phcMarkerHtml = `
          <div class="relative flex items-center justify-center cursor-pointer group">
            ${isCritical ? '<div class="absolute w-6 h-6 rounded-full bg-red-500/40 animate-ping"></div>' : ''}
            <div class="w-3.5 h-3.5 rounded-full border ${
              isCritical
                ? 'bg-red-500 border-red-200 shadow-[0_0_8px_#ef4444]'
                : p.avgDaysOfStock < 7
                ? 'bg-amber-400 border-amber-100'
                : 'bg-emerald-400 border-emerald-100'
            }"></div>
          </div>
        `;

        const phcIcon = L.divIcon({
          className: 'phc-pulse-icon',
          html: phcMarkerHtml,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const phcMarker = L.marker([p.lat, p.lng], { icon: phcIcon });

        phcMarker.bindTooltip(
          `<div style="font-family: 'Inter', sans-serif; font-size: 11px;">
            <div style="font-weight: 700; color: #fff;">${p.name}</div>
            <div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: ${isCritical ? '#ef4444' : '#10b981'};">
              ${p.type} • Stock: ${p.avgDaysOfStock} days • Beds: ${p.occupiedBeds}/${p.totalBeds}
            </div>
            <div style="color: #00e5bc; font-size: 10px;">Click for PHC inventory</div>
          </div>`,
          { direction: 'top' }
        );

        phcMarker.on('click', () => {
          setSelectedDistrictId(p.districtId);
          openDrawer('phc', p.id);
        });

        markersLayerRef.current?.addLayer(phcMarker);
      });
    }

    // 3. Render Animated Redistribution Flow Arcs
    if (showFlowArcs) {
      transfers.forEach((trf) => {
        const donor = MOCK_DISTRICTS.find((d) => d.id === trf.donorDistrictId);
        const receiver = MOCK_DISTRICTS.find((d) => d.id === trf.receiverDistrictId);

        if (!donor || !receiver) return;

        // Create curved arc coordinates (quadratic bezier midpoint elevation)
        const latMid = (donor.lat + receiver.lat) / 2 + 0.12;
        const lngMid = (donor.lng + receiver.lng) / 2 + 0.14;

        const curvePoints: L.LatLngExpression[] = [
          [donor.lat, donor.lng],
          [latMid, lngMid],
          [receiver.lat, receiver.lng],
        ];

        const isApproved = trf.status === 'approved';

        const polyline = L.polyline(curvePoints, {
          color: isApproved ? '#10b981' : '#00e5bc',
          weight: 2.5,
          opacity: 0.85,
          dashArray: '6, 6',
          className: 'flow-arc-active',
        });

        polyline.bindTooltip(
          `<div style="font-family: 'JetBrains Mono', monospace; font-size: 11px;">
            <div style="font-weight: 700; color: #00e5bc;">TRANSFER CORRIDOR ${trf.id}</div>
            <div style="color: #fff; margin-top: 2px;">${trf.quantity.toLocaleString()} ${trf.unit} of ${trf.medicineName}</div>
            <div style="color: #94a3b8; font-size: 10px;">${donor.name.split(' ')[0]} → ${receiver.name.split(' ')[0]} (${trf.distanceKm} km, ${trf.estTransitHours}h)</div>
            <div style="color: #10b981; font-weight: 600; margin-top: 2px;">Status: ${trf.status.toUpperCase()}</div>
          </div>`,
          { direction: 'center' }
        );

        flowsLayerRef.current?.addLayer(polyline);

        // Add transit badge midpoint marker
        const badgeIcon = L.divIcon({
          className: 'transfer-flow-badge',
          html: `
            <div class="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold whitespace-nowrap shadow-lg flex items-center gap-1 ${
              isApproved
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500'
                : 'bg-teal-950 text-teal-300 border border-teal-500'
            }">
              <span class="w-1.5 h-1.5 rounded-full ${isApproved ? 'bg-emerald-400' : 'bg-[#00e5bc] animate-pulse'}"></span>
              ${trf.quantity >= 1000 ? `${(trf.quantity / 1000).toFixed(0)}k` : trf.quantity} ${trf.medicineCode.split('-')[1]}
            </div>
          `,
          iconSize: [60, 16],
          iconAnchor: [30, 8],
        });

        const badgeMarker = L.marker([latMid, lngMid], { icon: badgeIcon });
        flowsLayerRef.current?.addLayer(badgeMarker);
      });
    }
  }, [
    selectedDistrictId,
    mapMetricOverlay,
    showFlowArcs,
    showPulsingPHCs,
    transfers,
    setSelectedDistrictId,
    openDrawer,
  ]);

  return (
    <div
      className={`relative w-full rounded-xl border border-[#1e293b] bg-[#0b0f17] overflow-hidden flex flex-col ${
        isFocused ? 'fixed inset-4 z-50 shadow-2xl h-[calc(100vh-2rem)]' : 'h-[440px]'
      }`}
    >
      {/* Top Map Action Bar */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex items-center justify-between pointer-events-none">
        {/* Layer Selection Chips */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-[#111722]/95 border border-[#2a3a52] rounded-lg p-1 backdrop-blur-md shadow-xl text-xs font-mono">
          <span className="text-[10px] text-slate-400 px-2 flex items-center gap-1 uppercase font-semibold">
            <Layers className="w-3 h-3 text-[#00e5bc]" /> Overlay:
          </span>
          {(
            [
              { id: 'risk', label: 'Stock-out Risk' },
              { id: 'stock', label: 'Days of Stock' },
              { id: 'beds', label: 'Bed Occupancy' },
              { id: 'staff', label: 'Staff Attendance' },
            ] as const
          ).map((m) => (
            <button
              key={m.id}
              onClick={() => setMapMetricOverlay(m.id)}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                mapMetricOverlay === m.id
                  ? 'bg-[#00e5bc]/20 text-[#00e5bc] border border-[#00e5bc]/40 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Right Map Action Toggles */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Flow Arcs Toggle */}
          <button
            onClick={() => setShowFlowArcs(!showFlowArcs)}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 border backdrop-blur-md shadow-xl transition-all ${
              showFlowArcs
                ? 'bg-teal-950/80 text-[#00e5bc] border-[#00e5bc]/40'
                : 'bg-[#111722]/90 text-slate-400 border-[#2a3a52] hover:text-white'
            }`}
            title="Toggle animated redistribution flow corridors"
          >
            <Repeat className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Flow Arcs</span>
          </button>

          {/* Critical PHC Markers Toggle */}
          <button
            onClick={() => setShowPulsingPHCs(!showPulsingPHCs)}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 border backdrop-blur-md shadow-xl transition-all ${
              showPulsingPHCs
                ? 'bg-red-950/80 text-red-300 border-red-500/40'
                : 'bg-[#111722]/90 text-slate-400 border-[#2a3a52] hover:text-white'
            }`}
            title="Toggle pulsing indicators on critical PHCs"
          >
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span className="hidden sm:inline">Critical PHCs</span>
          </button>

          {/* Fullscreen / Focus Mode Button */}
          <button
            onClick={() => setFocusedPanelId(isFocused ? null : 'map-panel')}
            className="p-1.5 rounded-lg bg-[#111722]/90 hover:bg-[#161f2e] border border-[#2a3a52] text-slate-300 hover:text-white backdrop-blur-md shadow-xl transition-all"
            title={isFocused ? 'Exit Focus Mode' : 'Focus Map Fullscreen'}
          >
            {isFocused ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Leaflet Map DOM Node */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[380px] z-10" />

      {/* Bottom Map Legend */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-[#111722]/90 backdrop-blur-md border border-[#1e293b] rounded-lg p-2.5 text-[11px] font-mono shadow-xl flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] shadow-[0_0_6px_#ef4444]" />
          <span className="text-slate-300">Critical (&lt;3d stock / &gt;70% risk)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
          <span className="text-slate-300">Warning (3–7d)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
          <span className="text-slate-300">Healthy (&gt;7d stock)</span>
        </div>
        <div className="hidden md:flex items-center gap-1.5 pl-2 border-l border-slate-800 text-teal-400">
          <span className="w-4 h-0.5 bg-[#00e5bc] border-dashed inline-block" />
          <span>Donor → Receiver Corridor</span>
        </div>
      </div>
    </div>
  );
};
