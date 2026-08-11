import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { geocodeAddress } from '@/lib/geocoding';
import { parseArrayField, stringifyArrayField } from '@/lib/utils';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const property = await prisma.property.findUnique({
      where: { id: params.id },
      include: {
        owner: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    });

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...property,
      amenities: parseArrayField(property.amenities),
      images: parseArrayField(property.images),
    });
  } catch (error) {
    console.error('Error fetching property:', error);
    return NextResponse.json({ error: 'Failed to fetch property' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Unauthorized. Owner role required.' }, { status: 403 });
    }

    const existing = await prisma.property.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    if (existing.ownerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden. You do not own this property.' }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, price, address, status, bedrooms, bathrooms, areaSqft, amenities, images } = body;

    const dataToUpdate: any = {};
    if (title !== undefined) dataToUpdate.title = title;
    if (description !== undefined) dataToUpdate.description = description;
    if (price !== undefined) dataToUpdate.price = parseInt(price);
    if (status !== undefined) dataToUpdate.status = status;
    if (bedrooms !== undefined) dataToUpdate.bedrooms = parseInt(bedrooms);
    if (bathrooms !== undefined) dataToUpdate.bathrooms = parseInt(bathrooms);
    if (areaSqft !== undefined) dataToUpdate.areaSqft = parseInt(areaSqft);
    if (amenities !== undefined) dataToUpdate.amenities = stringifyArrayField(amenities);
    if (images !== undefined) dataToUpdate.images = stringifyArrayField(images);

    if (address && address !== existing.address) {
      dataToUpdate.address = address;
      const coords = await geocodeAddress(address);
      dataToUpdate.lat = coords.lat;
      dataToUpdate.lng = coords.lng;
    }

    const updated = await prisma.property.update({
      where: { id: params.id },
      data: dataToUpdate,
    });

    return NextResponse.json({
      ...updated,
      amenities: parseArrayField(updated.amenities),
      images: parseArrayField(updated.images),
    });
  } catch (error) {
    console.error('Error updating property:', error);
    return NextResponse.json({ error: 'Failed to update property' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const existing = await prisma.property.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    if (existing.ownerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const conversations = await prisma.conversation.findMany({
      where: { propertyId: params.id },
      select: { id: true },
    });
    const conversationIds = conversations.map((c) => c.id);

    if (conversationIds.length > 0) {
      await prisma.message.deleteMany({
        where: { conversationId: { in: conversationIds } },
      });
      await prisma.conversation.deleteMany({
        where: { propertyId: params.id },
      });
    }

    await prisma.property.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting property:', error);
    return NextResponse.json({ error: 'Failed to delete property' }, { status: 500 });
  }
}
