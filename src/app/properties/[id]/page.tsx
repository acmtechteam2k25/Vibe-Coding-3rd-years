'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LeafletMap from '@/components/LeafletMap';
import OfferModal from '@/components/OfferModal';
import {
  Bed,
  Bath,
  Maximize2,
  MapPin,
  CheckCircle,
  MessageSquare,
  Tag,
  Clock,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  User,
  Share2,
} from 'lucide-react';

export default function PropertyDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [startingChat, setStartingChat] = useState(false);

  useEffect(() => {
    fetch(`/api/properties/${params.id}`)
      .then((res) => res.json())
      .then((data) => setProperty(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleStartConversation = async (withOffer = false) => {
    setStartingChat(true);
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId: params.id }),
      });
      const conversation = await res.json();
      if (conversation?.id) {
        if (withOffer) {
          setShowOfferModal(true);
        } else {
          router.push(`/conversations/${conversation.id}`);
        }
      }
    } catch (e) {
      console.error('Failed to initiate conversation:', e);
    } finally {
      setStartingChat(false);
    }
  };

  const handleOfferSubmit = async (amount: number, note?: string) => {
    try {
      const convRes = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId: params.id }),
      });
      const conversation = await convRes.json();

      if (conversation?.id) {
        await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversationId: conversation.id,
            type: 'OFFER',
            text: note || undefined,
            offerAmount: amount,
          }),
        });

        router.push(`/conversations/${conversation.id}`);
      }
    } catch (e) {
      console.error('Failed to post offer:', e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-16 w-full space-y-6 animate-pulse">
          <div className="h-96 bg-slate-200 rounded-3xl" />
          <div className="h-20 bg-slate-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!property || property.error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Navbar />
        <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-2xl text-center border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Property Not Found</h2>
          <p className="text-slate-500 text-xs mt-1 mb-4">The listing you requested could not be located.</p>
          <button
            onClick={() => router.push('/properties')}
            className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl"
          >
            Back to Properties
          </button>
        </div>
      </div>
    );
  }

  const images = property.images && property.images.length > 0
    ? property.images
    : ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80'];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 space-y-8">
        {/* Back Link & Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> Verified Owner Listing
            </span>
          </div>
        </div>

        {/* Gallery Carousel Header */}
        <div className="space-y-4">
          <div className="relative aspect-[21/9] w-full rounded-3xl overflow-hidden shadow-lg bg-slate-900 border border-slate-200">
            <img
              src={images[activeImageIndex]}
              alt={property.title}
              className="w-full h-full object-cover"
            />
            
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-md p-2 rounded-full text-slate-900 hover:bg-white transition-all shadow-md"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-md p-2 rounded-full text-slate-900 hover:bg-white transition-all shadow-md"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full">
              Photo {activeImageIndex + 1} of {images.length}
            </div>
          </div>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-24 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    activeImageIndex === idx ? 'border-blue-600 scale-105 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Details & Map */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {property.title}
                  </h1>
                  <span className="text-2xl font-extrabold text-blue-600">
                    ₹{property.price.toLocaleString('en-IN')}<span className="text-sm font-normal text-slate-500">/mo</span>
                  </span>
                </div>
                <p className="text-slate-500 text-sm flex items-center gap-1.5 mt-2">
                  <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                  {property.address}
                </p>
              </div>

              {/* Specs Bar */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center font-medium">
                <div>
                  <span className="block text-xs text-slate-400 uppercase tracking-wider">Bedrooms</span>
                  <span className="text-lg font-bold text-slate-900 flex items-center justify-center gap-1 mt-0.5">
                    <Bed className="w-4 h-4 text-blue-600" /> {property.bedrooms} Beds
                  </span>
                </div>
                <div>
                  <span className="block text-xs text-slate-400 uppercase tracking-wider">Bathrooms</span>
                  <span className="text-lg font-bold text-slate-900 flex items-center justify-center gap-1 mt-0.5">
                    <Bath className="w-4 h-4 text-indigo-600" /> {property.bathrooms} Baths
                  </span>
                </div>
                <div>
                  <span className="block text-xs text-slate-400 uppercase tracking-wider">Carpet Area</span>
                  <span className="text-lg font-bold text-slate-900 flex items-center justify-center gap-1 mt-0.5">
                    <Maximize2 className="w-4 h-4 text-emerald-600" /> {property.areaSqft} sqft
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="font-bold text-slate-900 text-base mb-2">Description</h3>
                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                  {property.description}
                </p>
              </div>

              {/* Amenities */}
              <div>
                <h3 className="font-bold text-slate-900 text-base mb-3">Included Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {property.amenities?.map((amenity: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-3.5 py-1.5 bg-blue-50 text-blue-700 font-semibold text-xs rounded-xl border border-blue-100/80 flex items-center gap-1.5"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-blue-600" /> {amenity}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Map Section */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" /> Exact Location Map
              </h3>
              <div className="h-80 w-full rounded-2xl overflow-hidden border border-slate-200">
                <LeafletMap
                  properties={[
                    {
                      id: property.id,
                      title: property.title,
                      price: property.price,
                      lat: property.lat,
                      lng: property.lng,
                      address: property.address,
                      images: property.images,
                    },
                  ]}
                  center={{ lat: property.lat, lng: property.lng }}
                  zoom={15}
                  singlePin
                />
              </div>
            </div>
          </div>

          {/* Right Column: Landlord Card & Action Buttons */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-lg space-y-6 sticky top-24">
              <div className="border-b border-slate-100 pb-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Listed By</div>
                <div className="flex items-center gap-3">
                  <img
                    src={property.owner?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                    alt={property.owner?.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-blue-500 shadow-sm"
                  />
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">{property.owner?.name || 'Property Owner'}</h4>
                    <p className="text-xs text-slate-500">{property.owner?.email}</p>
                  </div>
                </div>

                {/* Owner Response Time Badge (Stretch Feature) */}
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200/60">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  Usually responds within 2 hours
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => handleStartConversation(false)}
                  disabled={startingChat}
                  className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" /> Ask a Question (Chat)
                </button>

                <button
                  onClick={() => handleStartConversation(true)}
                  disabled={startingChat}
                  className="w-full py-3.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Tag className="w-4 h-4 text-emerald-400" /> Make a Rental Offer
                </button>
              </div>

              <div className="text-center pt-2">
                <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                  Single-threaded secure chat & offer tracking
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <OfferModal
        isOpen={showOfferModal}
        onClose={() => setShowOfferModal(false)}
        onSubmit={handleOfferSubmit}
        askingPrice={property.price}
      />

      <Footer />
    </div>
  );
}
