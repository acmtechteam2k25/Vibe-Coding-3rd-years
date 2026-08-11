import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { geocodeAddress } from '@/lib/geocoding';
import { parseArrayField, stringifyArrayField } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const minPrice = searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : undefined;
    const bedrooms = searchParams.get('bedrooms') ? parseInt(searchParams.get('bedrooms')!) : undefined;
    const query = searchParams.get('query') || '';
    const amenities = searchParams.getAll('amenities');
    const ownerId = searchParams.get('ownerId') || undefined;

    const lat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : undefined;
    const lng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : undefined;
    const radiusKm = searchParams.get('radiusKm') ? parseFloat(searchParams.get('radiusKm')!) : undefined;

    const where: any = {};

    if (ownerId && ownerId !== 'me') {
      where.ownerId = ownerId;
    } else if (ownerId === 'me') {
      const user = await getCurrentUser();
      if (user) where.ownerId = user.id;
    } else {
      where.status = 'ACTIVE';
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    if (bedrooms !== undefined && bedrooms > 0) {
      where.bedrooms = { gte: bedrooms };
    }

    if (query) {
      where.OR = [
        { title: { contains: query } },
        { description: { contains: query } },
        { address: { contains: query } },
      ];
    }

    let properties = await prisma.property.findMany({
      where,
      include: {
        owner: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Transform stringified JSON amenities & images into arrays
    let formattedProperties = properties.map((p) => ({
      ...p,
      amenities: parseArrayField(p.amenities),
      images: parseArrayField(p.images),
    }));

    // Filter by amenities if requested
    if (amenities && amenities.length > 0) {
      formattedProperties = formattedProperties.filter((p) =>
        amenities.every((a) => p.amenities.includes(a))
      );
    }

    // Haversine distance filtering if lat, lng, radiusKm are provided
    if (lat !== undefined && lng !== undefined && radiusKm !== undefined && radiusKm > 0) {
      formattedProperties = formattedProperties.filter((p) => {
        const R = 6371; // Earth radius in km
        const dLat = ((p.lat - lat) * Math.PI) / 180;
        const dLng = ((p.lng - lng) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((lat * Math.PI) / 180) *
            Math.cos((p.lat * Math.PI) / 180) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        return distance <= radiusKm;
      });
    }

    return NextResponse.json(formattedProperties);
  } catch (error) {
    console.error('Failed to fetch properties:', error);
    return NextResponse.json({ error: 'Failed to fetch properties' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Unauthorized. Owner role required.' }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, price, address, bedrooms, bathrooms, areaSqft, amenities, images, lat, lng } = body;

    if (!title || !description || !price || !address) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let coordinates = { lat: lat || 0, lng: lng || 0 };
    if (!lat || !lng) {
      coordinates = await geocodeAddress(address);
    }

    const defaultImages = [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
    ];

    const newProperty = await prisma.property.create({
      data: {
        ownerId: user.id,
        title,
        description,
        price: parseInt(price),
        address,
        lat: coordinates.lat,
        lng: coordinates.lng,
        bedrooms: parseInt(bedrooms || 1),
        bathrooms: parseInt(bathrooms || 1),
        areaSqft: parseInt(areaSqft || 500),
        amenities: stringifyArrayField(amenities || []),
        images: stringifyArrayField(images && images.length > 0 ? images : defaultImages),
        status: 'ACTIVE',
      },
    });

    return NextResponse.json({
      ...newProperty,
      amenities: parseArrayField(newProperty.amenities),
      images: parseArrayField(newProperty.images),
    }, { status: 201 });
  } catch (error) {
    console.error('Failed to create property:', error);
    return NextResponse.json({ error: 'Failed to create property' }, { status: 500 });
  }
}
