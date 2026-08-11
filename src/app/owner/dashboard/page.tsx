'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  Tag,
  MessageSquare,
  Building,
  PlusCircle,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Upload,
  X,
  Clock,
  Sparkles,
} from 'lucide-react';

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

export default function OwnerDashboard() {
  const searchParams = useSearchParams();
  const [stats, setStats] = useState({
    pendingOffersCount: 0,
    unansweredInquiriesCount: 0,
    activeListingsCount: 0,
  });
  const [properties, setProperties] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(searchParams.get('action') === 'add');
  const [editingProperty, setEditingProperty] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    address: '',
    bedrooms: '2',
    bathrooms: '2',
    areaSqft: '1200',
    amenities: ['WiFi', 'Parking', 'AC', 'Furnished'],
    images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80'],
  });
  const [submitting, setSubmitting] = useState(false);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Load Live Stats (§5)
      const statsRes = await fetch('/api/dashboard/stats');
      const statsData = await statsRes.json();
      if (statsData && !statsData.error) {
        setStats({
          pendingOffersCount: statsData.pendingOffersCount || 0,
          unansweredInquiriesCount: statsData.unansweredInquiriesCount || 0,
          activeListingsCount: statsData.activeListingsCount || 0,
        });
      }

      // 2. Load Owner Properties
      const propsRes = await fetch('/api/properties?ownerId=me');
      const propsData = await propsRes.json();
      if (Array.isArray(propsData)) setProperties(propsData);

      // 3. Load Inquiries / Conversations
      const convsRes = await fetch('/api/conversations');
      const convsData = await convsRes.json();
      if (Array.isArray(convsData)) setConversations(convsData);
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleAmenityToggle = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);
    const body = new FormData();
    files.forEach((f) => body.append('files', f));

    try {
      const res = await fetch('/api/upload', { method: 'POST', body });
      const data = await res.json();
      if (data.urls) {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...data.urls],
        }));
      }
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  const handleSubmitProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const endpoint = editingProperty ? `/api/properties/${editingProperty.id}` : '/api/properties';
      const method = editingProperty ? 'PATCH' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowAddModal(false);
        setEditingProperty(null);
        resetForm();
        loadDashboardData();
      }
    } catch (err) {
      console.error('Failed to save property:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      price: '',
      address: '',
      bedrooms: '2',
      bathrooms: '2',
      areaSqft: '1200',
      amenities: ['WiFi', 'Parking', 'AC', 'Furnished'],
      images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80'],
    });
  };

  const handleToggleStatus = async (propId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await fetch(`/api/properties/${propId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      loadDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProperty = async (propId: string) => {
    if (!confirm('Are you sure you want to delete this listing? All conversation history will be deleted.')) return;
    try {
      await fetch(`/api/properties/${propId}`, { method: 'DELETE' });
      loadDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 space-y-8">
        {/* Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Owner Dashboard</h1>
            <p className="text-slate-500 text-sm mt-1">Manage listings, view live inquiry counts, and handle rental offers.</p>
          </div>

          <button
            onClick={() => {
              resetForm();
              setEditingProperty(null);
              setShowAddModal(true);
            }}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-md shadow-blue-500/20 flex items-center gap-2 w-fit"
          >
            <PlusCircle className="w-4 h-4" /> Add New Property
          </button>
        </div>

        {/* Live Stat Cards (§5 Exact SQL logic) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shadow-inner">
              <Tag className="w-7 h-7" />
            </div>
            <div>
              <div className="text-3xl font-extrabold text-slate-900">{stats.pendingOffersCount}</div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
                Pending Offers
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shadow-inner">
              <MessageSquare className="w-7 h-7" />
            </div>
            <div>
              <div className="text-3xl font-extrabold text-slate-900">{stats.unansweredInquiriesCount}</div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
                Unanswered Inquiries
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shadow-inner">
              <Building className="w-7 h-7" />
            </div>
            <div>
              <div className="text-3xl font-extrabold text-slate-900">{stats.activeListingsCount}</div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
                Active Listings
              </div>
            </div>
          </div>
        </div>

        {/* My Properties Section */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-slate-900">My Rental Listings</h2>
            <span className="text-xs font-semibold text-slate-500">Total: {properties.length}</span>
          </div>

          {loading ? (
            <div className="h-40 bg-slate-100 rounded-2xl animate-pulse" />
          ) : properties.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              <Building className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="font-semibold text-slate-700">No properties listed yet.</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
              >
                Create First Listing
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[11px] font-bold">
                    <th className="py-3 px-4">Property</th>
                    <th className="py-3 px-4">Rent</th>
                    <th className="py-3 px-4">Specs</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {properties.map((prop) => (
                    <tr key={prop.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-4 font-semibold text-slate-900 flex items-center gap-3">
                        <img
                          src={prop.images[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=200&q=80'}
                          alt=""
                          className="w-12 h-12 rounded-xl object-cover"
                        />
                        <div>
                          <div className="font-bold line-clamp-1">{prop.title}</div>
                          <div className="text-xs text-slate-400 font-normal line-clamp-1">{prop.address}</div>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-bold text-slate-900">
                        ₹{prop.price.toLocaleString('en-IN')}/mo
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-600 font-medium">
                        {prop.bedrooms} Bed | {prop.bathrooms} Bath | {prop.areaSqft} sqft
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                            prop.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : prop.status === 'RENTED'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {prop.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right space-x-2">
                        <Link
                          href={`/properties/${prop.id}`}
                          className="p-2 text-slate-600 hover:text-blue-600 inline-block transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleToggleStatus(prop.id, prop.status)}
                          className="p-2 text-slate-600 hover:text-amber-600 transition-colors"
                          title="Toggle Active/Inactive"
                        >
                          {prop.status === 'ACTIVE' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDeleteProperty(prop.id)}
                          className="p-2 text-slate-600 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Tenant Inquiries List */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-slate-900">Tenant Inquiries & Conversations</h2>
            <span className="text-xs font-semibold text-slate-500">Sorted: Unanswered First</span>
          </div>

          {conversations.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">No tenant inquiries received yet.</div>
          ) : (
            <div className="space-y-3">
              {conversations.map((conv) => {
                const isUnanswered = conv.lastSenderRole === 'TENANT' && conv.status !== 'CLOSED';
                const lastMessage = conv.messages && conv.messages[0];

                return (
                  <Link
                    key={conv.id}
                    href={`/conversations/${conv.id}`}
                    className={`block p-4 rounded-2xl border transition-all hover:shadow-md ${
                      isUnanswered
                        ? 'bg-blue-50/40 border-blue-200 shadow-xs'
                        : 'bg-slate-50/50 border-slate-200/80 hover:bg-slate-100/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={conv.tenant?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                          alt={conv.tenant?.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                            {conv.tenant?.name || 'Tenant'}
                            {isUnanswered && (
                              <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-extrabold uppercase">
                                Unanswered
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 font-medium line-clamp-1">
                            Property: {conv.property?.title}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] text-slate-400 font-medium">
                          {new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <div className="text-xs font-semibold text-slate-700 mt-0.5">
                          Status: <span className="capitalize text-blue-600">{conv.status.toLowerCase()}</span>
                        </div>
                      </div>
                    </div>

                    {lastMessage && (
                      <p className="text-xs text-slate-600 mt-2.5 bg-white p-2.5 rounded-xl border border-slate-100 line-clamp-1">
                        <span className="font-bold">{lastMessage.sender?.name}:</span> {lastMessage.text || `Submitted an offer of ₹${lastMessage.offerAmount?.toLocaleString('en-IN')}`}
                      </p>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Add / Edit Property Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-slate-900 mb-1">
              {editingProperty ? 'Edit Property Listing' : 'Post New Rental Property'}
            </h3>
            <p className="text-xs text-slate-500 mb-6">Coordinates auto-resolved via Nominatim OpenStreetMap API on submit.</p>

            <form onSubmit={handleSubmitProperty} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Spacious 2BHK Apartment in Indiranagar"
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Monthly Rent (₹)</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="45000"
                    className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Carpet Area (sqft)</label>
                  <input
                    type="number"
                    required
                    value={formData.areaSqft}
                    onChange={(e) => setFormData({ ...formData, areaSqft: e.target.value })}
                    placeholder="1200"
                    className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Full Address (for Geocoding)</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g. 100 Feet Road, Indiranagar, Bengaluru, Karnataka 560038"
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Bedrooms</label>
                  <input
                    type="number"
                    required
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Bathrooms</label>
                  <input
                    type="number"
                    required
                    value={formData.bathrooms}
                    onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Highlight key features, connectivity, power backup..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Amenities Checklist</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  {ALL_AMENITIES.map((amenity) => (
                    <label key={amenity} className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.amenities.includes(amenity)}
                        onChange={() => handleAmenityToggle(amenity)}
                        className="rounded text-blue-600 w-4 h-4"
                      />
                      <span>{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Property Images</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Saving Property...' : 'Save & Publish Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
