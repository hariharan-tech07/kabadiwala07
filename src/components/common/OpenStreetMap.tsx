import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { User, RecyclerFacility } from '../../types';
import { api } from '../../api/client';
import {
  MapPin, Navigation, Compass, Layers, ShieldCheck, Phone,
  Package, ExternalLink, RefreshCw, AlertTriangle, ArrowRight,
  Maximize2, Crosshair, CheckCircle2, Globe, Building2, Bike,
  Search, X, LocateFixed, MessageSquare, Truck, RotateCcw
} from 'lucide-react';

// Configure default Leaflet icon paths so internal icons don't fail
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

export interface GeoLotNode {
  id: string;
  lot_reference_id: string;
  scrapper_id: string;
  scrapper_name: string;
  recycler_id: string;
  category: string;
  estimated_weight: number;
  offered_rate_per_kg: number;
  status: string;
  collection_gps: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  created_at?: string;
}

export interface GeoScrapperNode {
  id: string;
  name: string;
  username: string;
  role: string;
  location: string;
  phone?: string;
  verified: boolean;
  latitude: number;
  longitude: number;
}

interface OpenStreetMapProps {
  currentUser?: User;
  mode?: 'scrapper_view' | 'recycler_view' | 'admin_view' | 'household_view' | 'all';
  height?: string;
  onSelectRecycler?: (facility: RecyclerFacility) => void;
  onSelectLot?: (lot: GeoLotNode) => void;
  onSelectScrapper?: (scrapper: GeoScrapperNode) => void;
  onOpenChat?: (target: { id: string; name: string; role: string; phone?: string }, lot?: any) => void;
  initialCenter?: [number, number];
  initialZoom?: number;
  userLocation?: { latitude: number; longitude: number; label?: string };
  facilities?: any[];
  hideFitAll?: boolean;
}

// Check if coordinates are within the territorial bounds of India
export function isInsideIndia(lat: number, lon: number): boolean {
  return lat >= 6.5 && lat <= 37.5 && lon >= 68.0 && lon <= 97.5;
}

// Calculate distance in km between two lat/lon points (Haversine formula)
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Regional Cluster Presets for instant navigation across major Indian hubs
const REGIONAL_CLUSTERS = [
  { name: 'Mumbai Dharavi', lat: 19.0402, lon: 72.8566, zoom: 13 },
  { name: 'Delhi NCR Okhla', lat: 28.5298, lon: 77.2711, zoom: 13 },
  { name: 'Bengaluru Peenya', lat: 13.0315, lon: 77.5210, zoom: 13 },
  { name: 'Hyderabad Sanathnagar', lat: 17.4589, lon: 78.4419, zoom: 13 },
  { name: 'Chennai Ambattur', lat: 13.0878, lon: 80.1636, zoom: 13 },
  { name: 'Kolkata Howrah', lat: 22.5958, lon: 88.2636, zoom: 13 },
  { name: 'Pune Pimpri', lat: 18.6298, lon: 73.7997, zoom: 13 },
  { name: 'Ahmedabad Vatva', lat: 22.9563, lon: 72.6394, zoom: 13 }
];

export const OpenStreetMap: React.FC<OpenStreetMapProps> = ({
  currentUser,
  mode = 'scrapper_view',
  height = '480px',
  onSelectRecycler,
  onSelectLot,
  onSelectScrapper,
  onOpenChat,
  initialCenter,
  initialZoom = 13,
  userLocation,
  hideFitAll = false
}) => {
  const safeUser: User = currentUser || {
    id: 'user_fallback',
    name: 'Field Collector',
    username: 'collector',
    role: 'scrapper',
    location: userLocation?.label || 'Field Operations',
    phone: '9876543210',
    verified: true,
    latitude: userLocation?.latitude || 13.0315,
    longitude: userLocation?.longitude || 77.5210
  };

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const selfMarkerRef = useRef<L.Marker | null>(null);
  const inspectedMarkerRef = useRef<L.Marker | null>(null);

  // Prevent fitBounds from overriding manual "Locate Me" flyTo
  const skipNextFitBoundsRef = useRef<boolean>(false);
  const initialFitDoneRef = useRef<boolean>(false);

  const [loading, setLoading] = useState(true);
  const [geoData, setGeoData] = useState<{
    scrappers: GeoScrapperNode[];
    recyclers: RecyclerFacility[];
    lots: GeoLotNode[];
  }>({ scrappers: [], recyclers: [], lots: [] });

  // Priority coordinate resolution:
  // 1. userLocation prop (if provided)
  // 2. Saved custom pin in localStorage
  // 3. User profile coordinates
  // 4. Fallback
  const [myCoords, setMyCoords] = useState<[number, number]>(() => {
    if (userLocation?.latitude && userLocation?.longitude) {
      return [userLocation.latitude, userLocation.longitude];
    }
    try {
      const pinned = localStorage.getItem('kc_user_pinned_coords');
      if (pinned) {
        const parsed = JSON.parse(pinned);
        if (typeof parsed.latitude === 'number' && typeof parsed.longitude === 'number') {
          return [parsed.latitude, parsed.longitude];
        }
      }
    } catch {}

    if (safeUser.latitude && safeUser.longitude) {
      return [safeUser.latitude, safeUser.longitude];
    }
    return [13.0315, 77.5210];
  });

  const myCoordsRef = useRef<[number, number]>(myCoords);
  useEffect(() => {
    myCoordsRef.current = myCoords;
  }, [myCoords]);

  // Clicked location inspector state (does NOT move myCoords)
  const [inspectedLocation, setInspectedLocation] = useState<{
    lat: number;
    lon: number;
    name: string;
    address: string;
    distanceKm?: number;
    loading?: boolean;
  } | null>(null);

  const [locationLabel, setLocationLabel] = useState<string>(() => {
    if (userLocation?.label) return userLocation.label;
    try {
      const pinned = localStorage.getItem('kc_user_pinned_coords');
      if (pinned) {
        const parsed = JSON.parse(pinned);
        if (parsed.label) return parsed.label;
      }
    } catch {}
    return safeUser.location || 'Current Position';
  });

  const [locationSource, setLocationSource] = useState<'gps' | 'ip' | 'manual' | 'preset'>('preset');

  // Search & Geocoding state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ place_id: number; lat: string; lon: string; display_name: string; name?: string }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const [locating, setLocating] = useState(false);
  const [locStatus, setLocStatus] = useState<string | null>(null);
  const [locError, setLocError] = useState<string | null>(null);

  // Layer toggles
  const isHousehold = safeUser.role === 'household' || mode === 'household_view';
  const isScrapperPortalOnly = mode === 'scrapper_view' || safeUser.role === 'scrapper';
  const [showRecyclers, setShowRecyclers] = useState(!isHousehold);
  const [showScrappers, setShowScrappers] = useState(isHousehold || (!isScrapperPortalOnly && (mode === 'admin_view' || mode === 'recycler_view' || mode === 'all')));
  const [showLots, setShowLots] = useState(!isScrapperPortalOnly && !isHousehold);
  const [showRadius, setShowRadius] = useState(true);

  // Map Tile Style: 'voyager' (clean, modern, high contrast) vs 'standard' (classic OSM)
  const [tileStyle, setTileStyle] = useState<'voyager' | 'standard'>('voyager');

  // Selected item card
  const [selectedNode, setSelectedNode] = useState<{
    type: 'recycler' | 'scrapper' | 'lot' | 'self';
    data: any;
    distance?: number;
  } | null>(null);

  // Fetch all live nodes
  const loadData = async () => {
    try {
      setLoading(true);
      const data = await api.getGeoNodes();
      setGeoData(data);
    } catch (err) {
      console.warn('Failed to load geo nodes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    if ((mapContainerRef.current as any)._leaflet_id) {
      (mapContainerRef.current as any)._leaflet_id = null;
      delete (mapContainerRef.current as any)._leaflet_id;
    }

    const center = initialCenter || myCoords || [13.0315, 77.5210];

    const map = L.map(mapContainerRef.current, {
      center,
      zoom: initialZoom,
      zoomControl: false,
      attributionControl: true
    });

    // Add zoom control at bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Initial tile layer: CartoDB Voyager with fallback
    const tileUrl =
      tileStyle === 'voyager'
        ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    const tile = L.tileLayer(tileUrl, {
      maxZoom: 19,
      subdomains: ['a', 'b', 'c', 'd'],
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
    });

    // Auto-fallback if Carto tile fails to load: switch automatically to OpenStreetMap standard tiles
    tile.on('tileerror', () => {
      if (tileStyle === 'voyager' && mapInstanceRef.current && tileLayerRef.current) {
        console.warn('Carto tile error detected, falling back gracefully to standard OSM tiles.');
        try {
          mapInstanceRef.current.removeLayer(tileLayerRef.current);
          const fallbackTile = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            subdomains: ['a', 'b', 'c'],
            attribution: '&copy; OpenStreetMap contributors'
          }).addTo(mapInstanceRef.current);
          tileLayerRef.current = fallbackTile;
        } catch {}
      }
    });

    tile.addTo(map);
    tileLayerRef.current = tile;

    const layerGroup = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;
    layerGroupRef.current = layerGroup;

    // Immediately and progressively trigger invalidateSize after mount to ensure tiles paint properly
    const t1 = setTimeout(() => map.invalidateSize(), 50);
    const t2 = setTimeout(() => map.invalidateSize(), 150);
    const t3 = setTimeout(() => map.invalidateSize(), 350);
    const t4 = setTimeout(() => map.invalidateSize(), 700);

    const handleWindowResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };
    window.addEventListener('resize', handleWindowResize);

    // Interactive Map Inspector: Click anywhere to see the location name & address
    // Crucial: The user's own location is NOT moved or pinned to the clicked point!
    const onMapClick = async (e: L.LeafletMouseEvent) => {
      const lat = Math.round(e.latlng.lat * 10000) / 10000;
      const lon = Math.round(e.latlng.lng * 10000) / 10000;

      const currentPos = myCoordsRef.current;
      const dist = currentPos ? calculateDistanceKm(currentPos[0], currentPos[1], lat, lon) : undefined;

      setInspectedLocation({
        lat,
        lon,
        name: 'Locating place name...',
        address: `Coordinates: ${lat.toFixed(4)}, ${lon.toFixed(4)}`,
        distanceKm: dist,
        loading: true
      });
      setLocStatus(`Inspecting: ${lat.toFixed(4)}, ${lon.toFixed(4)}...`);

      try {
        const geoInfo = await api.reverseGeocode(lat, lon);
        const place =
          geoInfo?.name ||
          (geoInfo?.display_name ? geoInfo.display_name.split(',').slice(0, 3).join(', ') : '') ||
          `Point (${lat.toFixed(4)}, ${lon.toFixed(4)})`;
        const fullAddress = geoInfo?.display_name || place;

        setInspectedLocation({
          lat,
          lon,
          name: place,
          address: fullAddress,
          distanceKm: dist,
          loading: false
        });
        setLocStatus(`Location Name: ${place}`);

        // Update or place inspected marker on map
        if (mapInstanceRef.current) {
          if (inspectedMarkerRef.current) {
            mapInstanceRef.current.removeLayer(inspectedMarkerRef.current);
            inspectedMarkerRef.current = null;
          }

          const inspectedHtml = `
            <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
              <div style="background: #0f172a; color: #ffffff; padding: 3px 8px; border-radius: 6px; font-weight: 800; font-size: 11px; border: 1.5px solid #38bdf8; box-shadow: 0 4px 12px rgba(0,0,0,0.35); white-space: nowrap; max-width: 170px; overflow: hidden; text-overflow: ellipsis; display: flex; align-items: center; gap: 4px;">
                <span>📍</span>
                <span style="overflow: hidden; text-overflow: ellipsis;">${place}</span>
              </div>
              <div style="width: 10px; height: 10px; border-radius: 9999px; background: #0284c7; border: 2px solid #ffffff; box-shadow: 0 2px 4px rgba(0,0,0,0.4); margin-top: 2px;"></div>
            </div>
          `;

          const inspectedIcon = L.divIcon({
            className: 'kc-inspected-point-marker',
            html: inspectedHtml,
            iconSize: [170, 38],
            iconAnchor: [85, 36]
          });

          const marker = L.marker([lat, lon], { icon: inspectedIcon, zIndexOffset: 950 }).addTo(mapInstanceRef.current);
          inspectedMarkerRef.current = marker;

          marker.bindPopup(`
            <div style="font-family: system-ui, sans-serif; min-width: 210px; padding: 2px;">
              <div style="font-weight: 800; font-size: 13px; color: #0f172a; display: flex; align-items: center; gap: 5px; margin-bottom: 3px;">
                <span style="font-size: 15px;">📍</span>
                <span>${place}</span>
              </div>
              <div style="font-size: 11px; color: #475569; line-height: 1.35; margin-bottom: 6px;">
                ${fullAddress}
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e2e8f0; padding-top: 5px; font-size: 10px; color: #64748b; font-family: monospace;">
                <span>${lat.toFixed(4)}, ${lon.toFixed(4)}</span>
                ${dist !== undefined ? `<span style="font-weight: 700; color: #0284c7;">${dist} km away</span>` : ''}
              </div>
              <div style="margin-top: 5px; padding: 3px 6px; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 4px; font-size: 9px; color: #065f46; font-weight: 600;">
                ✓ Inspected place (your personal location pin remains unchanged)
              </div>
            </div>
          `).openPopup();
        }
      } catch {
        setInspectedLocation({
          lat,
          lon,
          name: `Point (${lat.toFixed(4)}, ${lon.toFixed(4)})`,
          address: `Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`,
          distanceKm: dist,
          loading: false
        });
        setLocStatus(`Location: ${lat.toFixed(4)}, ${lon.toFixed(4)}`);
      }
      setTimeout(() => setLocStatus(null), 5000);
    };

    map.on('click', onMapClick);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      window.removeEventListener('resize', handleWindowResize);
      map.off('click', onMapClick);
      if (inspectedMarkerRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(inspectedMarkerRef.current);
        inspectedMarkerRef.current = null;
      }
      try {
        map.remove();
      } catch {
        // safe ignore
      }
      mapInstanceRef.current = null;
      tileLayerRef.current = null;
      layerGroupRef.current = null;
      selfMarkerRef.current = null;
    };
  }, []);

  // Listen to ResizeObserver to ensure tiles render immediately when tab or container displays
  useEffect(() => {
    if (!mapContainerRef.current) return;
    const observer = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });
    observer.observe(mapContainerRef.current);
    return () => observer.disconnect();
  }, []);

  // Listen to parent initialCenter changes (e.g. user selects city hub or GPS resolves)
  useEffect(() => {
    if (initialCenter && initialCenter[0] && initialCenter[1]) {
      setMyCoords([initialCenter[0], initialCenter[1]]);
      if (mapInstanceRef.current) {
        skipNextFitBoundsRef.current = true;
        mapInstanceRef.current.flyTo(initialCenter, initialZoom || 13, { animate: true });
        mapInstanceRef.current.invalidateSize();
      }
    }
  }, [initialCenter?.[0], initialCenter?.[1], initialZoom]);

  // Background auto-detection on initial mount if user is on uncustomized default coordinates
  useEffect(() => {
    const autoDetectIPLocation = async () => {
      try {
        const hasPinned = localStorage.getItem('kc_user_pinned_coords');
        if (hasPinned) return; // User previously saved their own pin

        const ipData = await api.lookupIpLocation();
        if (ipData && typeof ipData.latitude === 'number' && typeof ipData.longitude === 'number') {
          // Strictly verify the coordinates are in India before panning!
          if (isInsideIndia(ipData.latitude, ipData.longitude)) {
            if (!safeUser.latitude || safeUser.latitude === 13.0315) {
              setMyCoords([ipData.latitude, ipData.longitude]);
              const place = [ipData.city, ipData.region, ipData.country].filter(Boolean).join(', ');
              setLocationLabel(`${place || 'Local Area'} (Network IP)`);
              setLocationSource('ip');
              setLocStatus(`Auto-detected city: ${ipData.city || 'Network IP'}`);
              if (mapInstanceRef.current) {
                mapInstanceRef.current.flyTo([ipData.latitude, ipData.longitude], 12, { animate: true });
              }
              setTimeout(() => setLocStatus(null), 4000);
            }
          }
        }
      } catch (err) {
        console.warn('Initial IP location check failed:', err);
      }
    };

    autoDetectIPLocation();
  }, []);

  // Address and City Search Handler
  const handleSearchSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setShowSearchResults(true);
    try {
      const results = await api.geocode(searchQuery);
      setSearchResults(results);
      if (results.length === 0) {
        setLocError(`No locations found for "${searchQuery}". Please check spelling or enter postal code.`);
        setTimeout(() => setLocError(null), 5000);
      } else {
        // Automatically pin my location to the searched location and display the location name!
        handleSelectSearchResult(results[0]);
      }
    } catch (err) {
      console.warn('Geocoding search failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (result: { lat: string; lon: string; display_name: string; name?: string }) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    if (isNaN(lat) || isNaN(lon)) return;

    skipNextFitBoundsRef.current = true;
    setMyCoords([lat, lon]);
    const shortName =
      result.name ||
      (result.display_name ? result.display_name.split(',')[0].trim() : '') ||
      'Searched Location';
    const fullAddress = result.display_name || shortName;

    setLocationLabel(shortName);
    setLocationSource('manual');
    setLocStatus(`Pinned to: ${shortName}`);
    setShowSearchResults(false);
    setSearchQuery(shortName);

    localStorage.setItem('kc_user_pinned_coords', JSON.stringify({
      latitude: lat,
      longitude: lon,
      label: shortName
    }));

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lon], 15, { animate: true, duration: 0.8 });
    }

    api.updateUserLocation(safeUser.id, lat, lon, shortName).catch(console.warn);
    setTimeout(() => setLocStatus(null), 5000);
  };

  // Switch Tile Layer when tileStyle toggles
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const tileUrl =
      tileStyle === 'voyager'
        ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    const newTile = L.tileLayer(tileUrl, {
      maxZoom: 19,
      subdomains: ['a', 'b', 'c', 'd'],
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
    });

    newTile.on('tileerror', () => {
      if (tileStyle === 'voyager' && mapInstanceRef.current && tileLayerRef.current) {
        try {
          mapInstanceRef.current.removeLayer(tileLayerRef.current);
          const fallbackTile = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            subdomains: ['a', 'b', 'c'],
            attribution: '&copy; OpenStreetMap contributors'
          }).addTo(mapInstanceRef.current);
          tileLayerRef.current = fallbackTile;
        } catch {}
      }
    });

    newTile.addTo(map);
    tileLayerRef.current = newTile;
  }, [tileStyle]);

  // Update markers whenever data, toggles, or myCoords change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();
    const bounds: L.LatLngExpression[] = [];

    // 1. Current User / Self Marker (Vivid Pulsing Radar Marker)
    if (myCoords) {
      bounds.push(myCoords);
      const isScrapper = safeUser.role === 'scrapper';
      const isRecycler = safeUser.role === 'recycler';

      const themeColor = isScrapper ? '#059669' : isHousehold ? '#2563eb' : isRecycler ? '#1d4ed8' : '#6366f1';
      const roleTitle = isScrapper ? 'Scrapper Field Agent' : isHousehold ? 'Household Residence' : isRecycler ? 'Processing Plant' : 'Admin Hub';

      const displayPinLabel = locationLabel
        ? (locationLabel.length > 22 ? locationLabel.slice(0, 20) + '...' : locationLabel)
        : 'YOU ARE HERE';

      const selfHtml = `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
          <!-- Top floating badge showing location name -->
          <div style="margin-bottom: 2px; background: #0f172a; color: #ffffff; padding: 2.5px 8px; border-radius: 9999px; font-size: 10px; font-weight: 800; border: 1.5px solid #ffffff; box-shadow: 0 4px 8px rgba(0,0,0,0.35); white-space: nowrap; display: flex; align-items: center; gap: 4px;">
            <span style="display: inline-block; width: 6px; height: 6px; border-radius: 9999px; background: #22c55e;"></span>
            <span>📍 ${displayPinLabel}</span>
          </div>
          <!-- Pulse rings -->
          <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 38px; height: 38px; border-radius: 9999px; background: ${themeColor}; opacity: 0.35; animation: pulse 1.8s infinite;"></div>
            <div style="position: absolute; width: 26px; height: 26px; border-radius: 9999px; background: ${themeColor}; opacity: 0.6;"></div>
            <div style="position: relative; width: 16px; height: 16px; border-radius: 9999px; background: #ffffff; border: 3px solid ${themeColor}; box-shadow: 0 2px 5px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center;">
              <div style="width: 6px; height: 6px; border-radius: 9999px; background: ${themeColor};"></div>
            </div>
          </div>
        </div>
      `;

      const selfIcon = L.divIcon({
        className: 'kc-self-marker-v2',
        html: selfHtml,
        iconSize: [140, 52],
        iconAnchor: [70, 46]
      });

      const selfMarker = L.marker(myCoords, { icon: selfIcon, zIndexOffset: 1000 }).addTo(layerGroup);
      selfMarkerRef.current = selfMarker;

      selfMarker.bindPopup(`
        <div style="font-family: system-ui, sans-serif; min-width: 210px; padding: 2px;">
          <div style="font-weight: 800; font-size: 13px; color: #0f172a; display: flex; align-items: center; gap: 5px; margin-bottom: 3px;">
            <span style="font-size: 15px;">📍</span>
            <span>${locationLabel || safeUser.name}</span>
          </div>
          <div style="font-size: 11px; color: #475569; margin-bottom: 5px;">
            ${safeUser.name} (${roleTitle})
          </div>
          <div style="font-size: 10px; font-family: monospace; color: #059669; font-weight: 700; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 4px; padding: 3px 6px;">
            ✓ Pinned at: ${myCoords[0].toFixed(4)}, ${myCoords[1].toFixed(4)}
          </div>
        </div>
      `);

      selfMarker.on('click', () => {
        setSelectedNode({
          type: 'self',
          data: {
            name: safeUser.name,
            role: safeUser.role,
            location: locationLabel || safeUser.location,
            coords: myCoords
          }
        });
      });
    }

    // 2. Recycler Facilities (High-Visibility Royal Blue Badge + Service Radius)
    if (showRecyclers && !isHousehold) {
      geoData.recyclers.forEach((facility) => {
        const lat = facility.latitude;
        const lon = facility.longitude;
        bounds.push([lat, lon]);

        const dist = myCoords ? calculateDistanceKm(myCoords[0], myCoords[1], lat, lon) : undefined;

        // Radius circle if enabled
        if (showRadius && facility.service_radius_km) {
          L.circle([lat, lon], {
            radius: facility.service_radius_km * 1000,
            color: '#2563eb',
            fillColor: '#3b82f6',
            fillOpacity: 0.08,
            weight: 1.5,
            dashArray: '5, 5'
          }).addTo(layerGroup);
        }

        const rawFacilityName = facility.facility_name || (facility as any).name || 'Recycling Center';
        const facilityNameShort = rawFacilityName.replace('Private Limited', 'Pvt Ltd').replace('Enterprises', 'Ent');

        const facilityHtml = `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; transition: transform 0.15s ease-in-out;">
            <div style="background: linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%); color: #ffffff; padding: 4px 8px; border-radius: 7px; font-weight: 800; font-size: 11px; border: 2px solid #ffffff; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.35); white-space: nowrap; display: flex; align-items: center; gap: 5px;">
              <span style="font-size: 13px;">🏭</span>
              <div style="display: flex; flex-direction: column; line-height: 1.1;">
                <span>${facilityNameShort}</span>
                <span style="font-size: 9px; font-weight: 600; color: #93c5fd;">CPCB Auth • ${dist !== undefined ? dist + ' km' : 'Verified'}</span>
              </div>
            </div>
            <!-- Pin Pointer -->
            <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 7px solid #1e40af;"></div>
          </div>
        `;

        const facilityIcon = L.divIcon({
          className: 'kc-recycler-marker-v2',
          html: facilityHtml,
          iconSize: [140, 42],
          iconAnchor: [70, 42]
        });

        const marker = L.marker([lat, lon], { icon: facilityIcon, zIndexOffset: 500 }).addTo(layerGroup);
        marker.on('click', () => {
          setSelectedNode({
            type: 'recycler',
            data: facility,
            distance: dist
          });
          if (onSelectRecycler) onSelectRecycler(facility);
        });
      });
    }

    // 3. Scrapper Nodes (High-Visibility Emerald Green Badges)
    if (showScrappers) {
      geoData.scrappers.forEach((scrapper) => {
        if (scrapper.id === safeUser.id) return; // Skip self to prevent duplicate

        const lat = scrapper.latitude;
        const lon = scrapper.longitude;
        bounds.push([lat, lon]);

        const dist = myCoords ? calculateDistanceKm(myCoords[0], myCoords[1], lat, lon) : undefined;

        const scrapperHtml = `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
            <div style="background: linear-gradient(135deg, #047857 0%, #059669 100%); color: #ffffff; padding: 3px 8px; border-radius: 7px; font-weight: 800; font-size: 11px; border: 2px solid #ffffff; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.35); white-space: nowrap; display: flex; align-items: center; gap: 4px;">
              <span style="font-size: 12px;">🚲</span>
              <span>${(scrapper?.name || 'Collector').split(' ')[0]}</span>
              ${scrapper.verified ? '<span style="background: #ffffff; color: #047857; font-size: 9px; font-weight: 900; padding: 0.5px 3.5px; border-radius: 9999px;">✓</span>' : ''}
            </div>
            <!-- Pin Pointer -->
            <div style="width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 6px solid #047857;"></div>
          </div>
        `;

        const scrapperIcon = L.divIcon({
          className: 'kc-scrapper-marker-v2',
          html: scrapperHtml,
          iconSize: [110, 36],
          iconAnchor: [55, 36]
        });

        const marker = L.marker([lat, lon], { icon: scrapperIcon, zIndexOffset: 400 }).addTo(layerGroup);
        marker.on('click', () => {
          setSelectedNode({
            type: 'scrapper',
            data: scrapper,
            distance: dist
          });
          if (onSelectScrapper) onSelectScrapper(scrapper);
        });
      });
    }

    // 4. Traceable Scrap Lots (Vibrant Amber / Orange Badges)
    if (showLots && !isHousehold) {
      geoData.lots.forEach((lot) => {
        const lat = lot.collection_gps.latitude;
        const lon = lot.collection_gps.longitude;
        bounds.push([lat, lon]);

        const dist = myCoords ? calculateDistanceKm(myCoords[0], myCoords[1], lat, lon) : undefined;

        const lotHtml = `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
            <div style="background: linear-gradient(135deg, #b45309 0%, #d97706 100%); color: #ffffff; padding: 3px 8px; border-radius: 7px; font-weight: 800; font-size: 11px; border: 2px solid #ffffff; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.35); white-space: nowrap; display: flex; align-items: center; gap: 4px;">
              <span style="font-size: 12px;">📦</span>
              <span>${lot?.estimated_weight || 0}kg ${(lot?.category || 'E-Waste').split(' ')[0]}</span>
              <span style="background: #78350f; color: #fef3c7; font-size: 9px; padding: 1px 4px; border-radius: 4px; font-family: monospace;">₹${lot.offered_rate_per_kg}/k</span>
            </div>
            <!-- Pin Pointer -->
            <div style="width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 6px solid #b45309;"></div>
          </div>
        `;

        const lotIcon = L.divIcon({
          className: 'kc-lot-marker-v2',
          html: lotHtml,
          iconSize: [140, 36],
          iconAnchor: [70, 36]
        });

        const marker = L.marker([lat, lon], { icon: lotIcon, zIndexOffset: 450 }).addTo(layerGroup);
        marker.on('click', () => {
          setSelectedNode({
            type: 'lot',
            data: lot,
            distance: dist
          });
          if (onSelectLot) onSelectLot(lot);
        });
      });
    }

    // Adjust map bounds on initial load once nodes are loaded
    if (skipNextFitBoundsRef.current) {
      // User just triggered "Locate Me" or jumped to a cluster; do not override zoom with fitBounds!
      skipNextFitBoundsRef.current = false;
    } else if (!initialFitDoneRef.current && (geoData.scrappers.length > 0 || geoData.recyclers.length > 0 || geoData.lots.length > 0)) {
      try {
        if (bounds.length === 1) {
          map.setView(bounds[0], 13);
        } else if (bounds.length > 1) {
          map.fitBounds(bounds as L.LatLngBoundsExpression, { padding: [40, 40], maxZoom: 14 });
        }
        initialFitDoneRef.current = true;
      } catch {
        // Safe fallback
      }
    }
  }, [geoData, myCoords, showRecyclers, showScrappers, showLots, showRadius]);

  // Multi-tier accurate "Locate Me":
  // Tier 1: True Browser Hardware GPS
  // Tier 2: Automatic Network IP Geolocation fallback (Fast & accurate to user's real city in India)
  // Tier 3: Friendly prompt to search city or click map
  const handleLocateMe = async () => {
    setLocError(null);
    setLocStatus('Requesting device GPS...');
    setLocating(true);
    skipNextFitBoundsRef.current = true;

    // Phase 1: Try real browser GPS (First High Accuracy, then Standard Accuracy fallback)
    let gpsAcquired = false;
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      const getPos = (highAccuracy: boolean) =>
        new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 5000,
            enableHighAccuracy: highAccuracy,
            maximumAge: 30000
          });
        });

      let pos: GeolocationPosition | null = null;
      try {
        pos = await getPos(true);
      } catch {
        // High accuracy timed out or unavailable on laptops without GPS chips; fallback immediately to WiFi/cell standard accuracy
        try {
          pos = await getPos(false);
        } catch (gpsErr: any) {
          console.warn('Browser GPS permission restricted/timed out, attempting IP Geolocation fallback:', gpsErr?.message);
        }
      }

      if (pos) {
        const lat = Math.round(pos.coords.latitude * 10000) / 10000;
        const lon = Math.round(pos.coords.longitude * 10000) / 10000;
        const acc = Math.round(pos.coords.accuracy || 20);

        setMyCoords([lat, lon]);
        setLocationSource('gps');
        gpsAcquired = true;

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([lat, lon], 15, { animate: true, duration: 0.8 });
        }

        try {
          const geoInfo = await api.reverseGeocode(lat, lon);
          const place =
            geoInfo?.name ||
            (geoInfo?.display_name ? geoInfo.display_name.split(',').slice(0, 3).join(',') : '') ||
            'Live GPS Position';
          setLocationLabel(`${place} (GPS ±${acc}m)`);
          setLocStatus(`Live GPS Pinned: ${place}`);
          localStorage.setItem('kc_user_pinned_coords', JSON.stringify({
            latitude: lat,
            longitude: lon,
            label: `${place} (GPS)`
          }));
          api.updateUserLocation(safeUser.id, lat, lon, place).catch(console.warn);
        } catch {
          setLocationLabel(`Live GPS (±${acc}m)`);
          setLocStatus(`Location Pinned (±${acc}m)`);
        }

        setTimeout(() => setLocStatus(null), 4000);
      }
    }

    if (gpsAcquired) {
      setLocating(false);
      return;
    }

    // Phase 2: Automatic Network IP Geolocation Fallback
    setLocStatus('Browser GPS restricted; locating via Network IP...');
    try {
      const ipData = await api.lookupIpLocation();
      if (ipData && typeof ipData.latitude === 'number' && typeof ipData.longitude === 'number' && isInsideIndia(ipData.latitude, ipData.longitude)) {
        const lat = ipData.latitude;
        const lon = ipData.longitude;
        const place = [ipData.city, ipData.region, ipData.country].filter(Boolean).join(', ');

        setMyCoords([lat, lon]);
        setLocationSource('ip');
        setLocationLabel(`${place} (Network IP)`);
        setLocStatus(`Pinned via Network IP: ${place}`);

        localStorage.setItem('kc_user_pinned_coords', JSON.stringify({
          latitude: lat,
          longitude: lon,
          label: `${place} (Network IP)`
        }));

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([lat, lon], 13, { animate: true, duration: 0.8 });
        }

        api.updateUserLocation(safeUser.id, lat, lon, place).catch(console.warn);
        setTimeout(() => setLocStatus(null), 5000);
        setLocating(false);
        return;
      }
    } catch (ipErr) {
      console.warn('IP lookup fallback failed:', ipErr);
    }

    // Phase 3: Neither GPS nor IP resolved; inform user clearly (no Bangalore override)
    setLocating(false);
    setLocStatus(null);
    setLocError('Could not detect location. Please use the search bar above to type your city or click on the map to pin.');
    setTimeout(() => setLocError(null), 6000);
  };

  // Jump smoothly to a specific regional cluster
  const handleJumpToCluster = (cluster: (typeof REGIONAL_CLUSTERS)[0]) => {
    skipNextFitBoundsRef.current = true;
    setMyCoords([cluster.lat, cluster.lon]);
    setLocationLabel(cluster.name);
    setLocationSource('preset');
    setLocStatus(`Jumped to ${cluster.name}`);
    localStorage.setItem('kc_user_pinned_coords', JSON.stringify({
      latitude: cluster.lat,
      longitude: cluster.lon,
      label: cluster.name
    }));
    api.updateUserLocation(safeUser.id, cluster.lat, cluster.lon, cluster.name).catch(console.warn);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([cluster.lat, cluster.lon], cluster.zoom, { animate: true, duration: 0.8 });
    }
    setTimeout(() => setLocStatus(null), 3000);
  };

  // Zoom to fit all visible nodes
  const handleFitAll = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const bounds: L.LatLngExpression[] = [];
    if (myCoords) bounds.push(myCoords);
    if (showRecyclers && !isHousehold) geoData.recyclers.forEach((r) => bounds.push([r.latitude, r.longitude]));
    if (showScrappers) geoData.scrappers.forEach((s) => bounds.push([s.latitude, s.longitude]));
    if (showLots && !isHousehold) geoData.lots.forEach((l) => bounds.push([l.collection_gps.latitude, l.collection_gps.longitude]));

    if (bounds.length === 1) {
      map.setView(bounds[0], 13);
    } else if (bounds.length > 1) {
      map.fitBounds(bounds as L.LatLngBoundsExpression, { padding: [50, 50], maxZoom: 14 });
    }
  };

  const getOpenStreetMapDirectionsUrl = (targetLat: number, targetLon: number) => {
    if (!myCoords) return `https://www.openstreetmap.org/?mlat=${targetLat}&mlon=${targetLon}#map=16/${targetLat}/${targetLon}`;
    return `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${myCoords[0]}%2C${myCoords[1]}%3B${targetLat}%2C${targetLon}`;
  };

  return (
    <div className="relative rounded-xl border border-slate-300 bg-white overflow-hidden shadow-sm flex flex-col">
      {/* High-Density Top Control Bar */}
      <div className="px-3.5 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2.5 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-slate-900">
                Spatial Traceability Grid
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                FOSS OpenStreetMap
              </span>
              {locStatus && (
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 animate-in fade-in">
                  <CheckCircle2 className="w-3 h-3" />
                  {locStatus}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500">
              Zero-cost GIS network bridging informal scrappers with CPCB recyclers
            </p>
          </div>
        </div>

        {/* Primary Action Controls */}
        <div className="flex items-center flex-wrap gap-1.5">
          {/* LOCATE ME BUTTON (High visibility & instant response) */}
          <button
            type="button"
            id="gps-locate-me-btn"
            onClick={handleLocateMe}
            disabled={locating}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer ${
              locating
                ? 'bg-emerald-600 text-white animate-pulse'
                : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white'
            }`}
            title="Pinpoint your live GPS coordinates with zero lag"
          >
            <Navigation className={`w-3.5 h-3.5 ${locating ? 'animate-spin' : ''}`} />
            <span>{locating ? 'Locating...' : 'Locate Me'}</span>
          </button>

          {/* Fit All Nodes */}
          {!hideFitAll && (
            <button
              type="button"
              onClick={handleFitAll}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 transition-colors shadow-2xs cursor-pointer"
              title="Zoom to fit all visible entities"
            >
              <Maximize2 className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Fit All</span>
            </button>
          )}

          {/* Refresh Canvas / Invalidate Size */}
          <button
            type="button"
            onClick={() => {
              if (mapInstanceRef.current) {
                mapInstanceRef.current.invalidateSize();
                if (myCoords) {
                  mapInstanceRef.current.panTo(myCoords);
                }
              }
              setLocStatus('Map canvas refreshed');
              setTimeout(() => setLocStatus(null), 3000);
            }}
            className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 transition-colors shadow-2xs cursor-pointer"
            title="Fix map display or recenter on your pin"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Recenter</span>
          </button>

          {/* Refresh Data */}
          <button
            type="button"
            onClick={loadData}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 transition-colors shadow-2xs cursor-pointer"
            title="Refresh active GIS nodes"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* Layer Filter Buttons */}
          <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-300 shadow-2xs text-[11px]">
            {!isHousehold && (
              <button
                type="button"
                onClick={() => setShowRecyclers(!showRecyclers)}
                className={`px-2 py-1 rounded font-bold transition-all cursor-pointer ${
                  showRecyclers
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                🏭 Recyclers ({geoData.recyclers.length})
              </button>
            )}
            {isHousehold ? (
              <button
                type="button"
                onClick={() => setShowScrappers(!showScrappers)}
                className={`px-2 py-1 rounded font-bold transition-all cursor-pointer ${
                  showScrappers
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                🚲 Neighborhood Scrappers ({geoData.scrappers.length})
              </button>
            ) : !isScrapperPortalOnly ? (
              <>
                <button
                  type="button"
                  onClick={() => setShowScrappers(!showScrappers)}
                  className={`px-2 py-1 rounded font-bold transition-all cursor-pointer ${
                    showScrappers
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  🚲 Scrappers ({geoData.scrappers.length})
                </button>
                <button
                  type="button"
                  onClick={() => setShowLots(!showLots)}
                  className={`px-2 py-1 rounded font-bold transition-all cursor-pointer ${
                    showLots
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  📦 Lots ({geoData.lots.length})
                </button>
              </>
            ) : null}
          </div>

          {/* Style Toggle (Clean Voyager vs Classic OSM) */}
          <button
            type="button"
            onClick={() => setTileStyle(tileStyle === 'voyager' ? 'standard' : 'voyager')}
            className="px-2 py-1 text-[11px] font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shadow-2xs"
            title="Switch between high-contrast Clean Voyager and Standard OSM maps"
          >
            {tileStyle === 'voyager' ? '🗺️ High-Contrast' : '🗺️ Standard OSM'}
          </button>
        </div>
      </div>

      {/* Address & City Search Bar with Active Location Status */}
      <div className="px-3.5 py-2 bg-white border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-2.5 z-20">
        {/* City / Address Search Input */}
        <form
          onSubmit={handleSearchSubmit}
          className="relative flex-1 max-w-md flex items-center gap-1.5"
        >
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your city or locality (e.g. Mumbai, Surat, Delhi, Indiranagar)..."
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setSearchResults([]); setShowSearchResults(false); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={isSearching || !searchQuery.trim()}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white rounded-lg text-xs font-semibold shrink-0 transition-colors shadow-xs cursor-pointer flex items-center gap-1"
          >
            {isSearching ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
            <span>Search</span>
          </button>

          {/* Autocomplete Results Dropdown */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-300 rounded-xl shadow-2xl z-50 max-h-56 overflow-y-auto divide-y divide-slate-100 animate-in fade-in">
              <div className="px-3 py-1.5 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                <span>Select Your Location</span>
                <button
                  type="button"
                  onClick={() => setShowSearchResults(false)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  ✕
                </button>
              </div>
              {searchResults.map((res) => (
                <button
                  key={res.place_id}
                  type="button"
                  onClick={() => handleSelectSearchResult(res)}
                  className="w-full text-left px-3 py-2 hover:bg-emerald-50 transition-colors flex items-start gap-2 text-xs cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900 truncate">
                      {res.name || (res.display_name ? res.display_name.split(',')[0] : 'Search Location')}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {res.display_name}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </form>

        {/* Current Active Location Pill & Click-To-Pin Reminder */}
        <div className="flex items-center gap-2 text-xs">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 font-medium shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-semibold truncate max-w-[200px] sm:max-w-xs" title={locationLabel}>
              {locationLabel}
            </span>
            <span className="text-[9px] uppercase px-1.5 py-0.5 rounded font-bold bg-emerald-200/80 text-emerald-900">
              {locationSource === 'gps' ? 'GPS' : locationSource === 'ip' ? 'Network IP' : locationSource === 'manual' ? 'Custom Pin' : 'Hub'}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            (💡 Click anywhere on map to drop pin)
          </span>
        </div>
      </div>

      {/* Quick Regional Hub Shortcuts Bar */}
      <div className="px-3.5 py-1.5 bg-slate-100/90 border-b border-slate-200 flex items-center justify-between text-[11px] text-slate-600 overflow-x-auto gap-2">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="font-bold text-slate-700 uppercase text-[10px] tracking-wider">Quick Cluster:</span>
          {REGIONAL_CLUSTERS.map((cluster) => (
            <button
              key={cluster.name}
              type="button"
              onClick={() => handleJumpToCluster(cluster)}
              className="px-2 py-0.5 rounded-md bg-white border border-slate-300 hover:border-emerald-500 hover:text-emerald-700 font-semibold transition-all cursor-pointer shadow-2xs text-[10px]"
            >
              📍 {cluster.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 shrink-0 text-[10px] text-slate-500 font-medium">
          <span>Coords: <strong className="font-mono text-slate-800">{myCoords[0].toFixed(4)}, {myCoords[1].toFixed(4)}</strong></span>
          <label className="inline-flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={showRadius}
              onChange={(e) => setShowRadius(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500 w-3 h-3"
            />
            <span>Service Radii</span>
          </label>
        </div>
      </div>

      {/* Alert banner if geolocation had error or warning */}
      {locError && (
        <div className="px-3.5 py-2 bg-amber-50 border-b border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{locError}</span>
          </div>
          <button
            type="button"
            onClick={() => setLocError(null)}
            className="text-amber-700 font-bold hover:text-amber-950 text-xs cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Clicked Location Inspector Banner */}
      {inspectedLocation && (
        <div className="px-3.5 py-2 bg-sky-50 border-b border-sky-200 text-slate-800 text-xs flex items-center justify-between gap-2.5 animate-in fade-in">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-base shrink-0">📍</span>
            <div className="min-w-0">
              <div className="font-bold text-slate-900 truncate flex items-center gap-1.5">
                <span>{inspectedLocation.name}</span>
                {inspectedLocation.distanceKm !== undefined && (
                  <span className="text-[10px] font-bold text-sky-800 bg-sky-100 border border-sky-200 px-1.5 py-0.2 rounded shrink-0">
                    {inspectedLocation.distanceKm} km away
                  </span>
                )}
                <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded hidden sm:inline shrink-0">
                  (Your personal location pin is unchanged)
                </span>
              </div>
              <div className="text-[11px] text-slate-500 truncate font-mono">
                {inspectedLocation.address}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setInspectedLocation(null);
              if (inspectedMarkerRef.current && mapInstanceRef.current) {
                mapInstanceRef.current.removeLayer(inspectedMarkerRef.current);
                inspectedMarkerRef.current = null;
              }
            }}
            className="text-slate-400 hover:text-slate-700 font-bold p-1 rounded hover:bg-sky-100 transition-colors cursor-pointer shrink-0 text-xs"
            title="Dismiss inspected location"
          >
            ✕
          </button>
        </div>
      )}

      {/* Map Canvas Container */}
      <div className="relative w-full" style={{ height }}>
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Selected Node Elevated Inspection Drawer / Overlay */}
        {selectedNode && (
          <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-30 bg-white/95 backdrop-blur-md p-4 rounded-xl border border-slate-300 shadow-xl text-xs animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                {selectedNode.type === 'recycler' && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-100 text-blue-800 border border-blue-300">
                    CPCB Authorized Processing Plant
                  </span>
                )}
                {selectedNode.type === 'scrapper' && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Registered Informal Collector
                  </span>
                )}
                {selectedNode.type === 'lot' && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                    Field Scrap Lot: {selectedNode.data.lot_reference_id}
                  </span>
                )}
                {selectedNode.type === 'self' && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-slate-900 text-white border border-slate-800">
                    Your Coordinates (Active)
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedNode(null)}
                className="text-slate-400 hover:text-slate-800 font-bold text-sm p-1 rounded hover:bg-slate-100 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Recycler Details */}
            {selectedNode.type === 'recycler' && (
              <div className="space-y-2">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">{selectedNode.data.facility_name}</h4>
                  <p className="text-slate-600 text-[11px] leading-relaxed mt-0.5">{selectedNode.data.address}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 py-2 border-y border-slate-200 text-[11px]">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">CPCB Auth</span>
                    <strong className="font-mono text-slate-800">{selectedNode.data.cpcb_auth_number}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">Distance</span>
                    {selectedNode.distance !== undefined ? (
                      <strong className="text-blue-700 font-extrabold">{selectedNode.distance} km away</strong>
                    ) : (
                      <span className="text-slate-400">Hub Center</span>
                    )}
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">Capacity</span>
                    <span className="font-semibold text-slate-700">{selectedNode.data.daily_capacity_tons} Tons/Day</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">Service Zone</span>
                    <span className="font-semibold text-slate-700">±{selectedNode.data.service_radius_km} km radius</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <a
                    href={getOpenStreetMapDirectionsUrl(selectedNode.data.latitude, selectedNode.data.longitude)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs shadow-xs transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    OSM Route / Directions
                  </a>
                  {selectedNode.data.contact_phone && (
                    <a
                      href={`tel:${selectedNode.data.contact_phone}`}
                      className="p-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
                      title="Call facility coordinator"
                    >
                      <Phone className="w-4 h-4 text-slate-700" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Scrapper Details */}
            {selectedNode.type === 'scrapper' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-slate-900 text-sm">{selectedNode.data.name}</h4>
                  {selectedNode.data.verified && (
                    <span className="text-[10px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-bold border border-emerald-300">
                      Aadhaar Verified
                    </span>
                  )}
                </div>
                <p className="text-slate-600 text-[11px]">{selectedNode.data.location}</p>
                {selectedNode.distance !== undefined && (
                  <div className="text-[11px] text-emerald-700 font-extrabold">
                    📍 {selectedNode.distance} km from your live position
                  </div>
                )}
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  {onOpenChat && (
                    <button
                      type="button"
                      onClick={() => onOpenChat({
                        id: selectedNode.data.id,
                        name: selectedNode.data.name,
                        role: 'scrapper',
                        phone: selectedNode.data.phone
                      })}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Chat with Scrapper</span>
                    </button>
                  )}
                  {onSelectScrapper && isHousehold && (
                    <button
                      type="button"
                      onClick={() => onSelectScrapper(selectedNode.data)}
                      className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Book Pickup</span>
                    </button>
                  )}
                  {selectedNode.data.phone && (
                    <a
                      href={`tel:${selectedNode.data.phone}`}
                      className="p-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
                      title="Call scrapper directly"
                    >
                      <Phone className="w-4 h-4 text-emerald-600" />
                    </a>
                  )}
                  <a
                    href={getOpenStreetMapDirectionsUrl(selectedNode.data.latitude, selectedNode.data.longitude)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs shadow-xs transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Navigate</span>
                  </a>
                </div>
              </div>
            )}

            {/* Lot Details */}
            {selectedNode.type === 'lot' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 text-sm">{selectedNode.data.category}</span>
                  <span className="font-mono text-emerald-700 font-extrabold text-sm">
                    ₹{selectedNode.data.offered_rate_per_kg}/kg
                  </span>
                </div>
                <div className="text-slate-600 text-[11px] space-y-1">
                  <div>
                    Collector: <strong>{selectedNode.data.scrapper_name}</strong> • Weight:{' '}
                    <strong className="text-slate-900">{selectedNode.data.estimated_weight} kg</strong>
                  </div>
                  <div className="text-slate-700 truncate">
                    <strong>Pickup Destination:</strong> {selectedNode.data.collection_gps?.hub_name || selectedNode.data.collection_gps?.address || 'Scrapper Main Aggregation Hub'}
                  </div>
                  <div className="pt-0.5">
                    <span className="inline-block text-[10px] font-black text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded border border-emerald-200">
                      📍 Registered Main Hub (Not Live Roving GPS)
                    </span>
                  </div>
                  {selectedNode.distance !== undefined && (
                    <div className="text-amber-800 font-extrabold">
                      Distance: {selectedNode.distance} km
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 pt-1">
                  {onOpenChat && (
                    <button
                      type="button"
                      onClick={() => onOpenChat({
                        id: selectedNode.data.scrapper_id,
                        name: selectedNode.data.scrapper_name,
                        role: 'scrapper'
                      }, selectedNode.data)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Chat with Collector</span>
                    </button>
                  )}
                  <a
                    href={getOpenStreetMapDirectionsUrl(
                      selectedNode.data.collection_gps.latitude,
                      selectedNode.data.collection_gps.longitude
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold text-xs shadow-xs transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Route</span>
                  </a>
                </div>
              </div>
            )}

            {/* Self Details */}
            {selectedNode.type === 'self' && (
              <div className="space-y-1.5">
                <h4 className="font-extrabold text-slate-900 text-sm">{selectedNode.data.name}</h4>
                <p className="text-slate-600 text-[11px]">{selectedNode.data.location}</p>
                <div className="font-mono text-[11px] text-slate-700 bg-slate-100 p-2 rounded-lg border border-slate-200">
                  Latitude: {selectedNode.data.coords[0].toFixed(5)}°N<br />
                  Longitude: {selectedNode.data.coords[1].toFixed(5)}°E
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* High-Visibility Floating Legend & GIS Status Footer */}
      <div className="px-3.5 py-2.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-700 gap-2">
        <div className="flex items-center flex-wrap gap-4">
          {!isHousehold && (
            <span className="flex items-center gap-1.5 font-bold text-slate-800">
              <span className="w-3 h-3 rounded-full bg-blue-600 border border-white shadow-xs inline-block"></span>
              <span>Authorized Recyclers ({geoData.recyclers.length})</span>
            </span>
          )}
          <span className="flex items-center gap-1.5 font-bold text-slate-800">
            <span className="w-3 h-3 rounded-full bg-emerald-600 border border-white shadow-xs inline-block"></span>
            <span>{isHousehold ? 'Neighborhood Scrappers' : 'Scrap Collectors'} ({geoData.scrappers.length})</span>
          </span>
          {!isHousehold && (
            <span className="flex items-center gap-1.5 font-bold text-slate-800">
              <span className="w-3 h-3 rounded-full bg-amber-600 border border-white shadow-xs inline-block"></span>
              <span>Active Scrap Lots ({geoData.lots.length})</span>
            </span>
          )}
          <span className="flex items-center gap-1.5 font-bold text-indigo-700">
            <span className="w-3 h-3 rounded-full bg-indigo-600 border-2 border-white shadow-xs inline-block animate-ping"></span>
            <span>You Are Here</span>
          </span>
        </div>

        <div className="text-[11px] text-slate-500 font-medium">
          OpenStreetMap Free Cartography • Real-time Haversine Geodesic Math
        </div>
      </div>
    </div>
  );
};
