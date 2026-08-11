'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import { MapProperty } from './LeafletMapInner';

const LeafletMapInner = dynamic(() => import('./LeafletMapInner'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[350px] bg-slate-100 animate-pulse rounded-2xl flex flex-col items-center justify-center text-slate-400 text-sm gap-2">
      <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
      <span>Loading Interactive Map...</span>
    </div>
  ),
});

interface LeafletMapWrapperProps {
  properties: MapProperty[];
  center?: { lat: number; lng: number };
  zoom?: number;
  onBoundsChange?: (bounds: { lat: number; lng: number; radiusKm: number }) => void;
  singlePin?: boolean;
}

export default function LeafletMap(props: LeafletMapWrapperProps) {
  return <LeafletMapInner {...props} />;
}
