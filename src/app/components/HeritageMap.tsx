import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Leaf } from 'lucide-react';
import { HERITAGE_LOCATIONS } from '../heritageData';

// Custom Marker Icon Creator
const getIconSvg = (type: string) => {
  if (type === 'Tiệm di sản') return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`;
  if (type === 'Vùng nguyên liệu' || type === 'Nguồn dược liệu quý') return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22v-7l-2-2"></path><path d="M17 22v-5l-2-3"></path><path d="M7 22v-5l2-3"></path><path d="M12 11c0-4 3-7 3-7s-2 3-3 7"></path><path d="M17 14c0-4 3-7 3-7s-2 3-3 7"></path><path d="M7 14c0-4-3-7-3-7s2 3 3 7"></path></svg>`;
  if (type === 'Chợ dược liệu') return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>`;
  if (type === 'Làng nghề') return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1 9.8a7 7 0 0 1-9 8.2z"></path></svg>`;
};

const createCustomIcon = (color: string, type: string) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div class="marker-pin-wrapper group">
        <div class="marker-pulse" style="background-color: ${color}"></div>
        <div class="marker-pin" style="background-color: ${color}; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 50%; box-shadow: 0 8px 25px rgba(0,0,0,0.25); border: 3px solid white;">
          ${getIconSvg(type)}
        </div>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -22]
  });
};

function MapUpdater({ selectedLocationId, markers }: { selectedLocationId: string | null, markers: any[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (selectedLocationId && (markers || []).length > 0) {
      const target = markers.find(l => l.id === selectedLocationId);
      if (target && target.position) {
        const pos = target.position;
        const lat = Number(pos[0]);
        const lon = Number(pos[1]);
        
        if (!isNaN(lat) && !isNaN(lon)) {
          const offsetLat = lat + 0.005;
          map.flyTo([offsetLat, lon], 15, { 
            duration: 2,
            easeLinearity: 0.1
          });
        }
      }
    } else if (!selectedLocationId) {
      map.flyTo([16.0544, 108.2022], 12.5, { duration: 1.5 });
    }
  }, [selectedLocationId, markers, map]);
  
  return null;
}

function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const mapContainer = map.getContainer();
    const observer = new ResizeObserver(() => {
      map.invalidateSize();
    });
    observer.observe(mapContainer);
    return () => observer.disconnect();
  }, [map]);
  return null;
}

function ZoomControls() {
  const map = useMap();
  return (
    <div className="absolute bottom-32 right-6 z-[1000] flex flex-col gap-2 pointer-events-auto">
      <div className="bg-white border border-black/5 rounded-2xl flex flex-col overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
        <button 
          className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-slate-50 transition-all font-medium text-xl"
          onClick={(e) => { e.stopPropagation(); map.zoomIn(); }}
        >+</button>
        <div className="h-px bg-slate-100 mx-2" />
        <button 
          className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-slate-50 transition-all font-medium text-xl"
          onClick={(e) => { e.stopPropagation(); map.zoomOut(); }}
        >−</button>
      </div>
    </div>
  );
}

export interface HeritageMapProps {
  selectedLocationId?: string | null;
  onLocationSelect?: (locationId: string) => void;
  data?: any[];
}

export function HeritageMap({ selectedLocationId, onLocationSelect, data: propsData }: HeritageMapProps) {
  const [mounted, setMounted] = useState(false);
  const [mapStyle] = useState<'hybrid' | 'roadmap' | 'satellite'>('roadmap');

  useEffect(() => {
    setMounted(true);
  }, []);

  const markers = useMemo(() => {
    const dataToUse = propsData || HERITAGE_LOCATIONS;
    return (dataToUse || []).filter(loc => loc && loc.isVisible !== false).map(loc => {
      let resolvedPosition: [number, number] = [16.0544, 108.2022];
      if (loc.lat !== undefined && loc.lon !== undefined) {
        resolvedPosition = [Number(loc.lat), Number(loc.lon)];
      } else if (Array.isArray(loc.position) && loc.position.length === 2) {
        resolvedPosition = [Number(loc.position[0]), Number(loc.position[1])];
      }

      return {
        ...loc,
        position: resolvedPosition,
        icon: createCustomIcon(loc.color || '#10b981', loc.type || 'Khu bảo tồn')
      };
    });
  }, [propsData]);

  if (!mounted) return <div className="h-full w-full bg-slate-100 animate-pulse" />;

  const center: [number, number] = [16.0544, 108.2022];
  const zoom = 12.5;

  const getTileUrl = () => {
    switch(mapStyle) {
      case 'roadmap': return "https://mt1.google.com/vt/lyrs=m&hl=vi&x={x}&y={y}&z={z}";
      case 'satellite': return "https://mt1.google.com/vt/lyrs=s&hl=vi&x={x}&y={y}&z={z}";
      default: return "https://mt1.google.com/vt/lyrs=y&hl=vi&x={x}&y={y}&z={z}";
    }
  };

  return (
    <div className="w-full h-full relative z-0 overflow-hidden">
      <style>{`
        /* VISION: CLEAN GOOGLE MAP EXPERIENCE */
        .leaflet-container { background: #f8fafc !important; outline: none; }
        .marker-pin-wrapper { position: relative; }
        .marker-pulse {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 48px;
          height: 48px;
          border-radius: 50%;
          opacity: 0.3;
          animation: marker-pulse-anim 3s infinite;
        }
        @keyframes marker-pulse-anim {
          0% { transform: translate(-50%, -50%) scale(0.6); opacity: 0.5; }
          100% { transform: translate(-50%, -50%) scale(3); opacity: 0; }
        }
      `}</style>

      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        zoomControl={false}
        className="z-0"
      >
        <TileLayer
          key={mapStyle}
          attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
          url={getTileUrl()}
        />
        
        <MapUpdater selectedLocationId={selectedLocationId || null} markers={markers} />
        <MapResizer />
        <ZoomControls />

        {markers.map((loc: any) => (
          <Marker 
            key={loc.id} 
            position={loc.position}
            icon={loc.icon}
            eventHandlers={{
              click: () => onLocationSelect && onLocationSelect(loc.id)
            }}
          />
        ))}
      </MapContainer>
    </div>
  );
}
