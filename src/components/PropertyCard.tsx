'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Bed, Bath, Maximize2, MapPin, CheckCircle, Tag } from 'lucide-react';

export interface PropertyCardProps {
  id: string;
  title: string;
  price: number;
  address: string;
  bedrooms: number;
  bathrooms: number;
  areaSqft: number;
  images: string[];
  amenities: string[];
  status: 'ACTIVE' | 'INACTIVE' | 'RENTED';
  ownerName?: string;
  ownerAvatar?: string | null;
}

export default function PropertyCard({
  id,
  title,
  price,
  address,
  bedrooms,
  bathrooms,
  areaSqft,
  images,
  amenities,
  status,
  ownerName,
}: PropertyCardProps) {
  const displayImage = images && images.length > 0
    ? images[0]
    : 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80';

  const formattedPrice = `₹${price.toLocaleString('en-IN')}`;

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      {/* Property Thumbnail Image */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
        <img
          src={displayImage}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-80" />

        {/* Price Badge */}
        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-xl text-slate-900 font-bold text-lg shadow-md border border-slate-100 flex items-baseline gap-1">
          {formattedPrice}
          <span className="text-xs text-slate-500 font-normal">/mo</span>
        </div>

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          {status === 'ACTIVE' && (
            <span className="bg-emerald-500/90 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm backdrop-blur-sm flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Active
            </span>
          )}
          {status === 'RENTED' && (
            <span className="bg-blue-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Rented
            </span>
          )}
          {status === 'INACTIVE' && (
            <span className="bg-amber-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
              Inactive
            </span>
          )}
        </div>
      </div>

      {/* Content Details */}
      <div className="p-5 flex flex-col flex-1 justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-lg line-clamp-1 group-hover:text-blue-600 transition-colors">
            {title}
          </h3>

          <p className="text-slate-500 text-xs flex items-center gap-1 mt-1.5 line-clamp-1">
            <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            {address}
          </p>

          {/* Key Specs Grid */}
          <div className="grid grid-cols-3 gap-2 my-4 py-2.5 px-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 font-medium">
            <div className="flex items-center gap-1.5">
              <Bed className="w-4 h-4 text-blue-600" />
              <span>{bedrooms} Beds</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Bath className="w-4 h-4 text-indigo-600" />
              <span>{bathrooms} Baths</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Maximize2 className="w-4 h-4 text-emerald-600" />
              <span>{areaSqft} sqft</span>
            </div>
          </div>

          {/* Amenities Pills */}
          {amenities && amenities.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {amenities.slice(0, 3).map((amenity, idx) => (
                <span
                  key={idx}
                  className="text-[11px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-medium border border-blue-100/60"
                >
                  {amenity}
                </span>
              ))}
              {amenities.length > 3 && (
                <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                  +{amenities.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* View Details Action Button */}
        <Link
          href={`/properties/${id}`}
          className="w-full mt-2 text-center py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-blue-600 text-white font-semibold text-sm transition-colors shadow-sm"
        >
          View Property & Inquire
        </Link>
      </div>
    </div>
  );
}
