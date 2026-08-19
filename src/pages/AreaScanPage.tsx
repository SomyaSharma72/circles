import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getFavorRequests, getCircles, getAllNeighbors } from '../services/api';
import { FavorRequest } from '../types';
import { useLocationContext } from '../context/LocationContext';
import { useAuth } from '../context/AuthContext';
import { UserAvatar } from '../components/UserAvatar';
import { CircleIconBadge, getCircleTheme } from '../components/CircleIcons';
import {
  calculateDistanceInMeters,
  formatDistance,
} from '../utils/location';
import {
  MapPin,
  Compass,
  ArrowRight,
  ShieldCheck,
  Navigation,
  Sparkles,
  Users,
  Wrench,
  Star,
  MessageSquare,
  X,
  Crosshair,
  Clock,
  ExternalLink,
  RefreshCw,
  Plus,
  Minus,
  Layers,
  CheckCircle2,
  AlertCircle,
  Lock,
  Globe,
} from 'lucide-react';

export type MarkerType = 'neighbor' | 'request' | 'circle';

export interface MapItem {
  id: string;
  type: MarkerType;
  title: string;
  subtitle?: string;
  category: string;
  lat: number;
  lng: number;
  distanceMeters: number;
  distanceFormatted: string;
  // Specific fields
  userId?: string;
  trustScore?: number;
  skills?: string[];
  profession?: string;
  urgency?: string;
  requestId?: string;
  circleId?: string;
  memberCount?: number;
  privacy?: string;
  icon?: string;
  avatarIndex?: number;
  activeStatus?: string;
}

export const AreaScanPage: React.FC = () => {
  const { location, refreshLocation, isDetecting } = useLocationContext();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [filterType, setFilterType] = useState<'all' | 'neighbors' | 'requests' | 'circles'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [maxRadiusKm, setMaxRadiusKm] = useState<number>(3);
  const [mapZoom, setMapZoom] = useState<number>(1);
  const [centerCoords, setCenterCoords] = useState<{ lat: number; lng: number }>({
    lat: location.lat,
    lng: location.lng,
  });

  const [selectedItem, setSelectedItem] = useState<MapItem | null>(null);
  const [hoveredItem, setHoveredItem] = useState<MapItem | null>(null);

  const [dbRequests, setDbRequests] = useState<FavorRequest[]>([]);
  const [dbCircles, setDbCircles] = useState<any[]>([]);
  const [dbNeighbors, setDbNeighbors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [containerDimensions, setContainerDimensions] = useState<{ width: number; height: number }>({
    width: 800,
    height: 520,
  });

  // Track container dimensions with ResizeObserver
  useEffect(() => {
    if (!mapContainerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          setContainerDimensions({
            width: entry.contentRect.width,
            height: entry.contentRect.height,
          });
        }
      }
    });
    observer.observe(mapContainerRef.current);
    return () => observer.disconnect();
  }, []);

  // Sync center with live detected location initially or when requested
  useEffect(() => {
    setCenterCoords({ lat: location.lat, lng: location.lng });
  }, [location.lat, location.lng]);

  // Fetch real requests, circles, and neighbors
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [reqs, circs, neighs] = await Promise.all([
          getFavorRequests().catch(() => []),
          getCircles().catch(() => []),
          getAllNeighbors().catch(() => []),
        ]);
        if (isMounted) {
          setDbRequests(reqs || []);
          setDbCircles(circs || []);
          setDbNeighbors(neighs || []);
        }
      } catch (err) {
        console.warn('Map data load error:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Build unified map items anchored to geographic coordinates
  const mapItems: MapItem[] = useMemo(() => {
    const items: MapItem[] = [];

    // 1. Neighbors
    const neighborsSource =
      dbNeighbors.length > 0
        ? dbNeighbors
        : [
            {
              _id: 'user_priya_1',
              name: 'Priya Sharma',
              neighborhood: location.neighborhood || 'Central Block',
              profession: 'Software Engineer & Volunteer',
              trustScore: 98,
              skills: ['Scooter Jumpstart', 'Balcony Gardening', 'Pet Care'],
              location: { coordinates: [location.lng + 0.0035, location.lat + 0.0022] },
            },
            {
              _id: 'user_aarav_2',
              name: 'Aarav Patel',
              neighborhood: location.neighborhood ? `${location.neighborhood} North` : 'North Block',
              profession: 'Mechanical Engineer & DIY Maker',
              trustScore: 95,
              skills: ['Bosch Impact Drill', 'Vehicle Battery', 'Plumbing'],
              location: { coordinates: [location.lng - 0.0042, location.lat + 0.0038] },
            },
            {
              _id: 'user_rohan_3',
              name: 'Rohan Gupta',
              neighborhood: location.neighborhood ? `${location.neighborhood} East` : 'East Block',
              profession: 'Fitness Coach & Pet Sitter',
              trustScore: 92,
              skills: ['Dog Walking', 'Heavy Lifting', 'Bicycle Repair'],
              location: { coordinates: [location.lng + 0.0055, location.lat - 0.0032] },
            },
            {
              _id: 'user_ananya_4',
              name: 'Ananya Iyer',
              neighborhood: location.neighborhood ? `${location.neighborhood} South` : 'South Block',
              profession: 'IT Solutions Architect & Baker',
              trustScore: 99,
              skills: ['Wi-Fi & Mesh Setup', 'Home Baking', 'Medicine Pickup'],
              location: { coordinates: [location.lng - 0.0038, location.lat - 0.0025] },
            },
            {
              _id: 'user_vikram_5',
              name: 'Vikram Malhotra',
              neighborhood: location.neighborhood ? `${location.neighborhood} West` : 'West Block',
              profession: 'Youth Sports Director',
              trustScore: 96,
              skills: ['Childcare & Sports', 'Emergency Rides', 'First Aid'],
              location: { coordinates: [location.lng - 0.0062, location.lat + 0.0015] },
            },
            {
              _id: 'user_meera_6',
              name: 'Meera Kapoor',
              neighborhood: location.neighborhood ? `${location.neighborhood} Central` : 'Central Circle',
              profession: 'Educator & Academic Coach',
              trustScore: 97,
              skills: ['Math & Physics Tutoring', 'Study Circle', 'Book Lending'],
              location: { coordinates: [location.lng + 0.0022, location.lat - 0.0058] },
            },
          ];

    neighborsSource.forEach((n: any) => {
      if (user && n._id === user._id) return;
      const coords = n.location?.coordinates || [location.lng, location.lat];
      const lng = Number(coords[0]);
      const lat = Number(coords[1]);
      const meters = calculateDistanceInMeters(location.lat, location.lng, lat, lng);
      items.push({
        id: `neighbor_${n._id}`,
        type: 'neighbor',
        title: n.name,
        subtitle: n.profession || 'Verified Neighbor',
        category: 'Neighbor',
        lat,
        lng,
        distanceMeters: meters,
        distanceFormatted: formatDistance(meters),
        userId: n._id,
        trustScore: n.trustScore || 95,
        skills: n.skills || ['Community Helper'],
        profession: n.profession,
        activeStatus: 'Active nearby',
      });
    });

    // 2. Open Requests
    dbRequests.forEach((req: FavorRequest) => {
      if (req.status !== 'Open') return;
      const coords = req.location?.coordinates || [location.lng, location.lat];
      const lng = Number(coords[0]);
      const lat = Number(coords[1]);
      const meters = calculateDistanceInMeters(location.lat, location.lng, lat, lng);
      items.push({
        id: `req_${req._id}`,
        type: 'request',
        title: req.title,
        subtitle: req.locationName || 'Local Neighborhood',
        category: req.category || 'General Help',
        lat,
        lng,
        distanceMeters: meters,
        distanceFormatted: formatDistance(meters),
        requestId: req._id,
        urgency: req.urgency,
        userId: typeof req.requester === 'object' ? req.requester?._id : req.requester,
        trustScore: typeof req.requester === 'object' ? req.requester?.trustScore : 95,
      });
    });

    // 3. Active Circles
    dbCircles.forEach((c: any) => {
      const coords = c.location?.coordinates || [location.lng, location.lat];
      const lng = Number(coords[0]);
      const lat = Number(coords[1]);
      const meters = calculateDistanceInMeters(location.lat, location.lng, lat, lng);
      items.push({
        id: `circle_${c._id}`,
        type: 'circle',
        title: c.name,
        subtitle: c.neighborhood || 'Local Circle',
        category: c.category || 'Community',
        lat,
        lng,
        distanceMeters: meters,
        distanceFormatted: formatDistance(meters),
        circleId: c._id,
        memberCount: Array.isArray(c.members) ? c.members.length : 1,
        privacy: c.privacy || 'Public',
        icon: c.icon || 'gardening',
      });
    });

    return items;
  }, [dbNeighbors, dbRequests, dbCircles, location.lat, location.lng, location.neighborhood, user]);

  // Filter items by type and radius
  const filteredItems = useMemo(() => {
    return mapItems.filter((item) => {
      // Type filter
      if (filterType === 'neighbors' && item.type !== 'neighbor') return false;
      if (filterType === 'requests' && item.type !== 'request') return false;
      if (filterType === 'circles' && item.type !== 'circle') return false;

      // Category filter
      if (selectedCategory !== 'All') {
        const itemCat = item.category.toLowerCase();
        const selCat = selectedCategory.toLowerCase();
        if (!itemCat.includes(selCat) && !selCat.includes(itemCat)) return false;
      }

      // Radius filter in KM
      const kmDistance = item.distanceMeters / 1000;
      if (kmDistance > maxRadiusKm * 1.6) return false;

      return true;
    });
  }, [mapItems, filterType, selectedCategory, maxRadiusKm]);

  // Calculate pure mathematical pixel coordinates for a geographic coordinate
  const projectCoordinates = (lat: number, lng: number) => {
    const centerLat = centerCoords.lat;
    const centerLng = centerCoords.lng;

    const dLat = lat - centerLat;
    const dLng = (lng - centerLng) * Math.cos((centerLat * Math.PI) / 180);

    // Convert degrees to kilometers
    const kmX = dLng * 111.32;
    const kmY = dLat * 110.574;

    const mapScaleDimension = Math.min(containerDimensions.width, containerDimensions.height);
    const radiusPixels = (mapScaleDimension * 0.42) * mapZoom;

    // Center is (width/2, height/2)
    const x = containerDimensions.width / 2 + (kmX / maxRadiusKm) * radiusPixels;
    const y = containerDimensions.height / 2 - (kmY / maxRadiusKm) * radiusPixels;

    return { x, y, isVisible: x >= 20 && x <= containerDimensions.width - 20 && y >= 20 && y <= containerDimensions.height - 20 };
  };

  const handleCenterOnMe = () => {
    setCenterCoords({ lat: location.lat, lng: location.lng });
    setMapZoom(1);
  };

  const handleMarkerClick = (item: MapItem, e: React.MouseEvent) => {
    e.stopPropagation();
    // Do NOT move the marker, do NOT recenter the map. Simply update selected item state!
    setSelectedItem((prev) => (prev?.id === item.id ? null : item));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Header & Map Command Card */}
      <div className="bg-white rounded-3xl p-5 border border-[#E6DFD3] shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 shrink-0 shadow-2xs">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-[#2F2F2F] font-heading">
                  Neighborhood Live Geographic Map
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  {location.source === 'gps' ? 'Live GPS Verified' : 'Local Circle'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium flex items-center gap-2 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-[#C96C4A]" />
                <span>{location.neighborhood || 'Local Neighborhood'}</span>
                <span>•</span>
                <span>GPS: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => refreshLocation()}
              disabled={isDetecting}
              className="px-3.5 py-2 bg-orange-50 hover:bg-orange-100 text-orange-800 text-xs font-bold rounded-xl border border-orange-200 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isDetecting ? 'animate-spin' : ''}`} />
              <span>{isDetecting ? 'Locating...' : 'Recalibrate GPS'}</span>
            </button>

            <button
              onClick={handleCenterOnMe}
              className="px-3.5 py-2 bg-[#F5F1E8] hover:bg-[#EAE4D9] text-[#2F2F2F] text-xs font-bold rounded-xl border border-[#E6DFD3] transition flex items-center gap-1.5 cursor-pointer"
            >
              <Crosshair className="w-3.5 h-3.5 text-[#355E3B]" />
              <span>Center on Me</span>
            </button>

            {/* Radius selector */}
            <div className="flex items-center bg-[#F5F1E8] p-1 rounded-xl border border-[#E6DFD3]">
              {[1, 3, 5, 10].map((km) => (
                <button
                  key={km}
                  onClick={() => setMaxRadiusKm(km)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                    maxRadiusKm === km
                      ? 'bg-[#355E3B] text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {km} km
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-t border-[#E6DFD3] pt-3">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              filterType === 'all'
                ? 'bg-[#2F2F2F] text-white shadow-2xs'
                : 'bg-[#F5F1E8] text-slate-700 hover:bg-[#EAE4D9] border border-[#E6DFD3]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Nearby ({mapItems.length})</span>
          </button>

          <button
            onClick={() => setFilterType('neighbors')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              filterType === 'neighbors'
                ? 'bg-[#355E3B] text-white shadow-2xs'
                : 'bg-[#F5F1E8] text-slate-700 hover:bg-[#EAE4D9] border border-[#E6DFD3]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Neighbors ({mapItems.filter((i) => i.type === 'neighbor').length})</span>
          </button>

          <button
            onClick={() => setFilterType('requests')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              filterType === 'requests'
                ? 'bg-[#C96C4A] text-white shadow-2xs'
                : 'bg-[#F5F1E8] text-slate-700 hover:bg-[#EAE4D9] border border-[#E6DFD3]'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Open Requests ({mapItems.filter((i) => i.type === 'request').length})</span>
          </button>

          <button
            onClick={() => setFilterType('circles')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              filterType === 'circles'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-[#F5F1E8] text-slate-700 hover:bg-[#EAE4D9] border border-[#E6DFD3]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Active Circles ({mapItems.filter((i) => i.type === 'circle').length})</span>
          </button>
        </div>
      </div>

      {/* Main Geographic Map Canvas Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div
            ref={mapContainerRef}
            onClick={() => setSelectedItem(null)}
            className="relative w-full h-[520px] bg-[#F7F4EE] rounded-3xl border border-[#E6DFD3] overflow-hidden shadow-2xs cursor-crosshair select-none"
            style={{
              backgroundImage: `
                radial-gradient(circle at 50% 50%, rgba(53, 94, 59, 0.04) 0%, transparent 70%),
                linear-gradient(to right, rgba(230, 223, 211, 0.45) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(230, 223, 211, 0.45) 1px, transparent 1px)
              `,
              backgroundSize: '100% 100%, 48px 48px, 48px 48px',
            }}
          >
            {/* Concentric Geographic Distance Rings */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {/* Inner Circle (1km approx) */}
              <div
                className="rounded-full border border-emerald-700/20 bg-emerald-500/3 flex items-start justify-center transition-all duration-300"
                style={{
                  width: `${(containerDimensions.height * 0.35) * mapZoom}px`,
                  height: `${(containerDimensions.height * 0.35) * mapZoom}px`,
                }}
              >
                <span className="text-[10px] font-bold text-emerald-800/60 bg-emerald-50/80 px-2 py-0.5 rounded-full mt-1 border border-emerald-200/50">
                  {(maxRadiusKm * 0.35).toFixed(1)} km
                </span>
              </div>
            </div>

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {/* Middle Circle */}
              <div
                className="rounded-full border border-dashed border-[#C96C4A]/25 flex items-start justify-center transition-all duration-300"
                style={{
                  width: `${(containerDimensions.height * 0.65) * mapZoom}px`,
                  height: `${(containerDimensions.height * 0.65) * mapZoom}px`,
                }}
              >
                <span className="text-[10px] font-bold text-[#C96C4A]/70 bg-orange-50/80 px-2 py-0.5 rounded-full mt-1 border border-orange-200/50">
                  {(maxRadiusKm * 0.65).toFixed(1)} km
                </span>
              </div>
            </div>

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {/* Outer Boundary Circle */}
              <div
                className="rounded-full border border-slate-400/30 flex items-start justify-center transition-all duration-300"
                style={{
                  width: `${(containerDimensions.height * 0.88) * mapZoom}px`,
                  height: `${(containerDimensions.height * 0.88) * mapZoom}px`,
                }}
              >
                <span className="text-[10px] font-bold text-slate-600 bg-slate-100/90 px-2 py-0.5 rounded-full mt-1 border border-slate-200">
                  {maxRadiusKm} km perimeter
                </span>
              </div>
            </div>

            {/* Map Controls (Zoom in, Zoom out, Recenter) */}
            <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5 bg-white/95 backdrop-blur-xs p-1.5 rounded-2xl border border-[#E6DFD3] shadow-xs">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMapZoom((z) => Math.min(z + 0.25, 2.0));
                }}
                className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100 transition font-bold"
                title="Zoom in"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMapZoom((z) => Math.max(z - 0.25, 0.6));
                }}
                className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100 transition font-bold"
                title="Zoom out"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCenterOnMe();
                }}
                className="w-8 h-8 flex items-center justify-center rounded-xl text-[#355E3B] hover:bg-emerald-50 transition"
                title="Center on me"
              >
                <Crosshair className="w-4 h-4" />
              </button>
            </div>

            {/* User Center Live Beacon */}
            {(() => {
              const userProj = projectCoordinates(location.lat, location.lng);
              return (
                <div
                  className="absolute pointer-events-none z-10 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                  style={{ left: `${userProj.x}px`, top: `${userProj.y}px` }}
                >
                  <div className="relative flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 animate-ping absolute"></div>
                    <div className="w-6 h-6 rounded-full bg-[#355E3B] border-2 border-white shadow-md flex items-center justify-center text-white">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <div className="mt-1 px-2 py-0.5 bg-[#2F2F2F] text-white text-[10px] font-bold rounded-full shadow-2xs whitespace-nowrap">
                    You ({location.neighborhood || 'Here'})
                  </div>
                </div>
              );
            })()}

            {/* Geographic Invariant Markers */}
            {filteredItems.map((item) => {
              const proj = projectCoordinates(item.lat, item.lng);
              if (!proj.isVisible) return null;

              const isSelected = selectedItem?.id === item.id;
              const isHovered = hoveredItem?.id === item.id;

              return (
                <div
                  key={item.id}
                  onClick={(e) => handleMarkerClick(item, e)}
                  onMouseEnter={() => setHoveredItem(item)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform duration-150 ${
                    isSelected ? 'scale-115 z-30' : isHovered ? 'scale-110 z-25' : 'hover:scale-105'
                  }`}
                  style={{ left: `${proj.x}px`, top: `${proj.y}px` }}
                >
                  {/* Neighbor Marker with Illustrated Avatar */}
                  {item.type === 'neighbor' && (
                    <div className="flex flex-col items-center group">
                      <div
                        className={`relative rounded-full p-0.5 border-2 transition-all shadow-md ${
                          isSelected
                            ? 'border-[#355E3B] ring-4 ring-emerald-500/25 bg-emerald-50'
                            : 'border-white bg-white hover:border-[#355E3B]'
                        }`}
                      >
                        <UserAvatar userId={item.userId} name={item.title} size="sm" />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#355E3B] text-white flex items-center justify-center text-[9px] font-extrabold border border-white">
                          ★
                        </div>
                      </div>
                      <div
                        className={`mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-2xs whitespace-nowrap transition-all ${
                          isSelected
                            ? 'bg-[#355E3B] text-white'
                            : 'bg-white text-slate-800 border border-[#E6DFD3]'
                        }`}
                      >
                        {item.title.split(' ')[0]}
                      </div>
                    </div>
                  )}

                  {/* Request Marker with Category & Urgency Badge */}
                  {item.type === 'request' && (
                    <div className="flex flex-col items-center group">
                      <div
                        className={`w-9 h-9 rounded-2xl flex items-center justify-center shadow-md border-2 transition-all ${
                          isSelected
                            ? 'bg-[#C96C4A] text-white border-white ring-4 ring-orange-500/30 scale-110'
                            : 'bg-[#C96C4A] text-white border-white hover:bg-orange-600'
                        }`}
                      >
                        <Wrench className="w-4 h-4" />
                      </div>
                      <div
                        className={`mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-2xs whitespace-nowrap ${
                          isSelected ? 'bg-[#C96C4A] text-white' : 'bg-white text-[#C96C4A] border border-orange-200'
                        }`}
                      >
                        Request
                      </div>
                    </div>
                  )}

                  {/* Active Circle Marker with Illustrated Category Icon */}
                  {item.type === 'circle' && (
                    <div className="flex flex-col items-center group">
                      <div
                        className={`relative rounded-2xl p-1 border-2 transition-all shadow-md bg-white ${
                          isSelected
                            ? 'border-indigo-600 ring-4 ring-indigo-500/25 scale-110'
                            : 'border-white hover:border-indigo-500'
                        }`}
                      >
                        <CircleIconBadge iconKey={item.icon} category={item.category} size="sm" />
                      </div>
                      <div
                        className={`mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-2xs whitespace-nowrap ${
                          isSelected ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-900 border border-indigo-200'
                        }`}
                      >
                        Circle
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Map Status Legend */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-2 bg-white rounded-2xl border border-[#E6DFD3] text-xs text-slate-600">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#355E3B] inline-block border border-white"></span>
                <span>Neighbors</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-[#C96C4A] inline-block border border-white"></span>
                <span>Open Requests</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-indigo-600 inline-block border border-white"></span>
                <span>Active Circles</span>
              </span>
            </div>
            <div className="text-slate-500">
              Showing {filteredItems.length} nearby pins in {maxRadiusKm} km range
            </div>
          </div>
        </div>

        {/* Right Sidebar: Selected Pin Inspector & Nearby List */}
        <div className="space-y-4">
          {selectedItem ? (
            <div className="bg-white rounded-3xl p-5 border-2 border-[#355E3B] shadow-sm space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  {selectedItem.type === 'neighbor' && (
                    <UserAvatar userId={selectedItem.userId} name={selectedItem.title} size="lg" />
                  )}
                  {selectedItem.type === 'request' && (
                    <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-800 flex items-center justify-center font-bold">
                      <Wrench className="w-6 h-6" />
                    </div>
                  )}
                  {selectedItem.type === 'circle' && (
                    <CircleIconBadge iconKey={selectedItem.icon} category={selectedItem.category} size="md" />
                  )}

                  <div>
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider mb-1 ${
                        selectedItem.type === 'neighbor'
                          ? 'bg-emerald-100 text-emerald-800'
                          : selectedItem.type === 'request'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}
                    >
                      {selectedItem.type === 'neighbor'
                        ? 'Neighbor Profile'
                        : selectedItem.type === 'request'
                        ? 'Favor Request'
                        : 'Active Circle'}
                    </span>
                    <h2 className="text-base font-extrabold text-[#2F2F2F] leading-tight">
                      {selectedItem.title}
                    </h2>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-3 h-3 text-[#C96C4A]" />
                      <span>{selectedItem.distanceFormatted} away</span>
                      <span>•</span>
                      <span>{selectedItem.subtitle}</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedItem(null)}
                  className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Neighbor Specific Body */}
              {selectedItem.type === 'neighbor' && (
                <div className="space-y-3 pt-2 border-t border-[#E6DFD3]">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 text-amber-600 font-bold bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
                      <Star className="w-3.5 h-3.5 fill-amber-500" />
                      <span>{selectedItem.trustScore}% Trust Score</span>
                    </div>
                    <span className="text-emerald-700 font-medium flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> ID Verified
                    </span>
                  </div>

                  {selectedItem.skills && selectedItem.skills.length > 0 && (
                    <div>
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Offerings & Skills
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedItem.skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 bg-[#F5F1E8] text-[#2F2F2F] text-xs font-semibold rounded-lg border border-[#E6DFD3]"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 flex gap-2">
                    <Link
                      to={`/chats?userId=${selectedItem.userId}`}
                      className="flex-1 py-2 bg-[#355E3B] hover:bg-[#2A4B2F] text-white text-xs font-bold rounded-xl transition text-center flex items-center justify-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Message</span>
                    </Link>
                    <Link
                      to={`/profile/${selectedItem.userId}`}
                      className="flex-1 py-2 bg-[#F5F1E8] hover:bg-[#EAE4D9] text-[#2F2F2F] text-xs font-bold rounded-xl border border-[#E6DFD3] transition text-center flex items-center justify-center gap-1.5"
                    >
                      <span>View Profile</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}

              {/* Request Specific Body */}
              {selectedItem.type === 'request' && (
                <div className="space-y-3 pt-2 border-t border-[#E6DFD3]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2.5 py-1 bg-orange-50 text-orange-800 font-bold rounded-lg border border-orange-200">
                      Category: {selectedItem.category}
                    </span>
                    <span className="text-rose-600 font-bold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {selectedItem.urgency} Urgency
                    </span>
                  </div>

                  <div className="pt-2">
                    <Link
                      to={`/requests/${selectedItem.requestId}`}
                      className="w-full py-2 bg-[#C96C4A] hover:bg-[#B35938] text-white text-xs font-bold rounded-xl transition text-center flex items-center justify-center gap-1.5"
                    >
                      <span>Help Neighbor / View Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}

              {/* Circle Specific Body */}
              {selectedItem.type === 'circle' && (
                <div className="space-y-3 pt-2 border-t border-[#E6DFD3]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2.5 py-1 bg-indigo-50 text-indigo-800 font-bold rounded-lg border border-indigo-200">
                      {selectedItem.category}
                    </span>
                    <span className="text-slate-600 font-bold flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-indigo-600" />
                      {selectedItem.memberCount} Neighbors Joined
                    </span>
                  </div>

                  <div className="pt-2">
                    <Link
                      to={`/circles/${selectedItem.circleId}`}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition text-center flex items-center justify-center gap-1.5"
                    >
                      <span>Open Circle & Group Chat</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-5 border border-[#E6DFD3] shadow-2xs space-y-3 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#355E3B] flex items-center justify-center mx-auto">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-extrabold text-[#2F2F2F]">Interactive Neighborhood Pin</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Click any neighbor, request, or circle pin on the map to inspect details, send direct messages, or join local circles.
              </p>
            </div>
          )}

          {/* Quick List of Nearby Community Items */}
          <div className="bg-white rounded-3xl p-5 border border-[#E6DFD3] shadow-2xs space-y-3">
            <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
              Nearby in {maxRadiusKm} km Radius
            </h3>
            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1 scrollbar-thin">
              {filteredItems.slice(0, 6).map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                    selectedItem?.id === item.id
                      ? 'bg-emerald-50 border-[#355E3B]'
                      : 'bg-[#FDFBF7] hover:bg-[#F5F1E8] border-[#E6DFD3]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {item.type === 'neighbor' && (
                      <UserAvatar userId={item.userId} name={item.title} size="sm" />
                    )}
                    {item.type === 'request' && (
                      <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
                        <Wrench className="w-4 h-4" />
                      </div>
                    )}
                    {item.type === 'circle' && (
                      <CircleIconBadge iconKey={item.icon} category={item.category} size="sm" />
                    )}
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#2F2F2F] truncate">{item.title}</div>
                      <div className="text-[11px] text-slate-500 truncate">{item.distanceFormatted} away</div>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AreaScanPage;
