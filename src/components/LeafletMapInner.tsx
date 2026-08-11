'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import Link from 'next/link';

// Custom Map Marker Icon
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export interface MapProperty {
  id: string;
  title: string;
  price: number;
  lat: number;
  lng: number;
  address: string;
  images: string[];
}

interface MapProps {
  properties: MapProperty[];
  center?: { lat: number; lng: number };
  zoom?: number;
  onBoundsChange?: (bounds: { lat: number; lng: number; radiusKm: number }) => void;
  singlePin?: boolean;
}

function MapEventsHandler({ onBoundsChange }: { onBoundsChange?: (bounds: { lat: number; lng: number; radiusKm: number }) => void }) {
  const map = useMapEvents({
    moveend() {
      if (onBoundsChange) {
        const center = map.getCenter();
        const bounds = map.getBounds();
        const northEast = bounds.getNorthEast();
        // Compute approximate radius from center to corner
        const R = 6371;
        const dLat = ((northEast.lat - center.lat) * Math.PI) / 180;
        const dLng = ((northEast.lng - center.lng) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((center.lat * Math.PI) / 180) *
            Math.cos((northEast.lat * Math.PI) / 180) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
        const radiusKm = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        onBoundsChange({
          lat: center.lat,
          lng: center.lng,
          radiusKm: Math.max(radiusKm, 1),
        });
      }
    },
  });
  return null;
}

export default function LeafletMapInner({
  properties,
  center = { lat: 12.9716, lng: 77.5946 }, // Bangalore default
  zoom = 12,
  onBoundsChange,
}: MapProps) {
  const initialCenter: [number, number] = [
    properties.length > 0 ? properties[0].lat : center.lat,
    properties.length > 0 ? properties[0].lng : center.lng,
  ];

  return (
    <div className="w-full h-full min-h-[350px] relative rounded-2xl overflow-hidden shadow-inner border border-slate-200">
      <MapContainer
        center={initialCenter}
        zoom={zoom}
        scrollWheelZoom={false}
        className="w-full h-full min-h-[350px]"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEventsHandler onBoundsChange={onBoundsChange} />

        {properties.map((prop) => (
          <Marker key={prop.id} position={[prop.lat, prop.lng]} icon={customIcon}>
            <Popup className="rounded-xl shadow-lg">
              <div className="w-52 space-y-2 p-1">
                <img
                  src={prop.images[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=400&q=80'}
                  alt={prop.title}
                  className="w-full h-24 object-cover rounded-lg"
                />
                <h4 className="font-bold text-slate-900 text-xs line-clamp-1">{prop.title}</h4>
                <p className="text-[11px] text-slate-500 line-clamp-1">{prop.address}</p>
                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <span className="font-extrabold text-blue-600 text-xs">
                    ₹{prop.price.toLocaleString('en-IN')}/mo
                  </span>
                  <Link
                    href={`/properties/${prop.id}`}
                    className="text-[11px] bg-slate-900 text-white font-medium px-2 py-1 rounded-md hover:bg-blue-600 transition-colors"
                  >
                    View
                  </Link>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
