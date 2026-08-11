'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PropertyCard from '@/components/PropertyCard';
import LeafletMap from '@/components/LeafletMap';
import { Search, SlidersHorizontal, Map, Grid, X, RotateCcw, Filter } from 'lucide-react';

const ALL_AMENITIES = [
  'WiFi',
  'Parking',
  'AC',
  'Furnished',
  'Gym',
  'Pool',
  'Elevator',
  'Security',
  'Balcony',
  'Pet Friendly',
];

export default function BrowsePropertiesPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [query, setQuery] = useState('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [bedrooms, setBedrooms] = useState<string>('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'split'>('split');
  const [mapBounds, setMapBounds] = useState<{ lat: number; lng: number; radiusKm: number } | null>(null);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.append('query', query);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (bedrooms) params.append('bedrooms', bedrooms);
      selectedAmenities.forEach((a) => params.append('amenities', a));

      if (mapBounds) {
        params.append('lat', mapBounds.lat.toString());
        params.append('lng', mapBounds.lng.toString());
        params.append('radiusKm', mapBounds.radiusKm.toString());
      }

      const res = await fetch(`/api/properties?${params.toString()}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setProperties(data);
      }
    } catch (err) {
      console.error('Failed to fetch properties:', err);
    } finally {
      setLoading(false);
    }
  }, [query, minPrice, maxPrice, bedrooms, selectedAmenities, mapBounds]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const resetFilters = () => {
    setQuery('');
    setMinPrice('');
    setMaxPrice('');
    setBedrooms('');
    setSelectedAmenities([]);
    setMapBounds(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Header & View Mode Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Browse Rental Properties</h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              Showing <span className="font-bold text-slate-900">{properties.length}</span> active property listings
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('split')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'split'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Map className="w-4 h-4" /> Split Map View
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Grid className="w-4 h-4" /> Grid Only
            </button>
          </div>
        </div>

        {/* Filter Bar & Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar Filters */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Filter className="w-4 h-4 text-blue-600" /> Filters
                </h3>
                <button
                  onClick={resetFilters}
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium"
                >
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              </div>

              {/* Search Bar */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Location / Title
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="City, locality, title..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Monthly Rent (₹)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>
              </div>

              {/* Bedrooms */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Bedrooms
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {['', '1', '2', '3', '4'].map((b) => (
                    <button
                      key={b || 'any'}
                      onClick={() => setBedrooms(b)}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all border ${
                        bedrooms === b
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {b ? `${b}+` : 'Any'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amenities Multi-Select */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Amenities
                </label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {ALL_AMENITIES.map((amenity) => {
                    const isChecked = selectedAmenities.includes(amenity);
                    return (
                      <label
                        key={amenity}
                        className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer hover:text-slate-900 py-0.5"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleAmenity(amenity)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                        />
                        <span>{amenity}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right Results Grid / Split Map View */}
          <div className={viewMode === 'split' ? 'lg:col-span-3 space-y-6' : 'lg:col-span-3'}>
            {viewMode === 'split' && (
              <div className="h-[380px] w-full rounded-2xl overflow-hidden shadow-sm border border-slate-200">
                <LeafletMap
                  properties={properties}
                  onBoundsChange={(b) => setMapBounds(b)}
                />
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="h-80 rounded-2xl bg-slate-200 animate-pulse" />
                ))}
              </div>
            ) : properties.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                <Search className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <h3 className="font-bold text-slate-900 text-base">No properties match your filter criteria</h3>
                <p className="text-slate-500 text-xs mt-1 mb-4">Try widening your price range or clearing map radius limits.</p>
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((prop) => (
                  <PropertyCard
                    key={prop.id}
                    id={prop.id}
                    title={prop.title}
                    price={prop.price}
                    address={prop.address}
                    bedrooms={prop.bedrooms}
                    bathrooms={prop.bathrooms}
                    areaSqft={prop.areaSqft}
                    images={prop.images}
                    amenities={prop.amenities}
                    status={prop.status}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
