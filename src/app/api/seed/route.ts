import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Role, PropertyStatus, ConversationStatus, MessageType, OfferStatus } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    // Clean existing data
    await prisma.message.deleteMany();
    await prisma.conversation.deleteMany();
    await prisma.property.deleteMany();
    await prisma.user.deleteMany();

    // 1. Create 3 Owners
    const owner1 = await prisma.user.create({
      data: {
        clerkId: 'user_owner_1',
        role: Role.OWNER,
        name: 'Rajesh Sharma',
        email: 'rajesh.sharma@homehub.demo',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      },
    });

    const owner2 = await prisma.user.create({
      data: {
        clerkId: 'user_owner_2',
        role: Role.OWNER,
        name: 'Ananya Verma',
        email: 'ananya.verma@homehub.demo',
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
      },
    });

    const owner3 = await prisma.user.create({
      data: {
        clerkId: 'user_owner_3',
        role: Role.OWNER,
        name: 'Vikram Malhotra',
        email: 'vikram.malhotra@homehub.demo',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      },
    });

    // 2. Create 6 Tenants
    const tenant1 = await prisma.user.create({
      data: {
        clerkId: 'user_tenant_1',
        role: Role.TENANT,
        name: 'Aarav Patel',
        email: 'aarav.patel@homehub.demo',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      },
    });

    const tenant2 = await prisma.user.create({
      data: {
        clerkId: 'user_tenant_2',
        role: Role.TENANT,
        name: 'Priya Singh',
        email: 'priya.singh@homehub.demo',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      },
    });

    const tenant3 = await prisma.user.create({
      data: {
        clerkId: 'user_tenant_3',
        role: Role.TENANT,
        name: 'Rohan Gupta',
        email: 'rohan.gupta@homehub.demo',
        avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
      },
    });

    const tenant4 = await prisma.user.create({
      data: {
        clerkId: 'user_tenant_4',
        role: Role.TENANT,
        name: 'Sneha Rao',
        email: 'sneha.rao@homehub.demo',
        avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
      },
    });

    const tenant5 = await prisma.user.create({
      data: {
        clerkId: 'user_tenant_5',
        role: Role.TENANT,
        name: 'Dev Kulkarni',
        email: 'dev.kulkarni@homehub.demo',
        avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80',
      },
    });

    const tenant6 = await prisma.user.create({
      data: {
        clerkId: 'user_tenant_6',
        role: Role.TENANT,
        name: 'Meera Iyer',
        email: 'meera.iyer@homehub.demo',
        avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80',
      },
    });

    // 3. Create 10 Properties
    const prop1 = await prisma.property.create({
      data: {
        ownerId: owner1.id,
        title: 'Luxury 3BHK Penthouse in Koramangala',
        description: 'Ultra-modern 3BHK penthouse featuring panoramic city views, private terrace garden, modular kitchen, and smart home automation.',
        price: 65000,
        address: 'Block 4, Koramangala, Bengaluru, Karnataka 560034',
        lat: 12.9352,
        lng: 77.6245,
        amenities: ['WiFi', 'Parking', 'AC', 'Furnished', 'Gym', 'Security', 'Balcony'],
        images: [
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80'
        ],
        status: PropertyStatus.ACTIVE,
        bedrooms: 3,
        bathrooms: 3,
        areaSqft: 2200,
      },
    });

    const prop2 = await prisma.property.create({
      data: {
        ownerId: owner1.id,
        title: 'Chic 2BHK Apartment near Indiranagar Metro',
        description: 'Fully furnished 2BHK with wooden flooring, vibrant decor, high-speed WiFi, and 24/7 power backup. 2 minutes walk from metro.',
        price: 45000,
        address: '100 Feet Road, Indiranagar, Bengaluru, Karnataka 560038',
        lat: 12.9784,
        lng: 77.6408,
        amenities: ['WiFi', 'Parking', 'AC', 'Furnished', 'Elevator', 'Security'],
        images: [
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'
        ],
        status: PropertyStatus.ACTIVE,
        bedrooms: 2,
        bathrooms: 2,
        areaSqft: 1350,
      },
    });

    const prop3 = await prisma.property.create({
      data: {
        ownerId: owner1.id,
        title: 'Spacious 4BHK Villa with Private Pool in EGL',
        description: 'Gated community luxury villa near Embassy Golf Links with private swimming pool, lush lawn, servant room, and EV charger point.',
        price: 120000,
        address: 'Inner Ring Road, Domlur, Bengaluru, Karnataka 560071',
        lat: 12.9610,
        lng: 77.6387,
        amenities: ['WiFi', 'Parking', 'AC', 'Furnished', 'Gym', 'Pool', 'Security', 'Balcony'],
        images: [
          'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80'
        ],
        status: PropertyStatus.ACTIVE,
        bedrooms: 4,
        bathrooms: 4,
        areaSqft: 3800,
      },
    });

    const prop4 = await prisma.property.create({
      data: {
        ownerId: owner2.id,
        title: 'Sea Facing 3BHK Apartment in Bandra West',
        description: 'Breathtaking sea view apartment on Carter Road. Features designer interiors, floor-to-ceiling windows, and concierge services.',
        price: 150000,
        address: 'Carter Road, Bandra West, Mumbai, Maharashtra 400050',
        lat: 19.0600,
        lng: 72.8250,
        amenities: ['WiFi', 'Parking', 'AC', 'Furnished', 'Gym', 'Elevator', 'Security', 'Balcony'],
        images: [
          'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=1200&q=80'
        ],
        status: PropertyStatus.ACTIVE,
        bedrooms: 3,
        bathrooms: 3,
        areaSqft: 1850,
      },
    });

    const prop5 = await prisma.property.create({
      data: {
        ownerId: owner2.id,
        title: 'Modern 1BHK Studio in HSR Layout',
        description: 'Ideal for tech professionals. Compact, fully automated studio apartment with high-speed fiber internet and dedicated workspace.',
        price: 28000,
        address: 'Sector 1, HSR Layout, Bengaluru, Karnataka 560102',
        lat: 12.9121,
        lng: 77.6446,
        amenities: ['WiFi', 'AC', 'Furnished', 'Security'],
        images: [
          'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=1200&q=80'
        ],
        status: PropertyStatus.ACTIVE,
        bedrooms: 1,
        bathrooms: 1,
        areaSqft: 650,
      },
    });

    const prop6 = await prisma.property.create({
      data: {
        ownerId: owner2.id,
        title: 'Premium 3BHK Condo in Cyber City Gurgaon',
        description: 'Luxury condominium right opposite Cyber Hub. High-rise living with clubhouse, tennis court, and underground parking.',
        price: 85000,
        address: 'DLF Phase 2, Gurgaon, Haryana 122002',
        lat: 28.4900,
        lng: 77.0900,
        amenities: ['WiFi', 'Parking', 'AC', 'Gym', 'Pool', 'Elevator', 'Security', 'Balcony'],
        images: [
          'https://images.unsplash.com/photo-1567496898669-ee935f5f647a?auto=format&fit=crop&w=1200&q=80'
        ],
        status: PropertyStatus.ACTIVE,
        bedrooms: 3,
        bathrooms: 3,
        areaSqft: 2100,
      },
    });

    const prop7 = await prisma.property.create({
      data: {
        ownerId: owner3.id,
        title: 'Elegant 2BHK Flat in Hitec City Hyderabad',
        description: 'Located in the heart of Hyderabad IT hub. Swimming pool, landscaped garden, multi-tier security, and children play area.',
        price: 38000,
        address: 'Hitec City, Hyderabad, Telangana 500081',
        lat: 17.4435,
        lng: 78.3772,
        amenities: ['WiFi', 'Parking', 'AC', 'Furnished', 'Gym', 'Pool', 'Elevator', 'Security'],
        images: [
          'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80'
        ],
        status: PropertyStatus.ACTIVE,
        bedrooms: 2,
        bathrooms: 2,
        areaSqft: 1400,
      },
    });

    const prop8 = await prisma.property.create({
      data: {
        ownerId: owner3.id,
        title: 'Cozy 2BHK Apartment in Koregaon Park Pune',
        description: 'Tree-lined serene neighborhood near popular cafes. Wooden interiors, modular fittings, and covered car parking included.',
        price: 42000,
        address: 'Lane 7, Koregaon Park, Pune, Maharashtra 411001',
        lat: 18.5362,
        lng: 73.8940,
        amenities: ['WiFi', 'Parking', 'AC', 'Furnished', 'Security', 'Balcony'],
        images: [
          'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=1200&q=80'
        ],
        status: PropertyStatus.ACTIVE,
        bedrooms: 2,
        bathrooms: 2,
        areaSqft: 1250,
      },
    });

    const prop9 = await prisma.property.create({
      data: {
        ownerId: owner3.id,
        title: '3BHK Duplex Home in Whitefield Bengaluru',
        description: 'Spacious duplex house close to ITPL and top international schools. Private backyard, inverter backup, and pet friendly.',
        price: 55000,
        address: 'EPIP Zone, Whitefield, Bengaluru, Karnataka 560066',
        lat: 12.9698,
        lng: 77.7499,
        amenities: ['WiFi', 'Parking', 'AC', 'Furnished', 'Pet Friendly', 'Security', 'Balcony'],
        images: [
          'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80'
        ],
        status: PropertyStatus.ACTIVE,
        bedrooms: 3,
        bathrooms: 3,
        areaSqft: 1950,
      },
    });

    const prop10 = await prisma.property.create({
      data: {
        ownerId: owner3.id,
        title: 'Heritage Style 2BHK Bungalow in Jubilee Hills',
        description: 'Charming bungalow surrounded by greenery. High ceilings, teakwood doors, marble flooring, and quiet residential street.',
        price: 75000,
        address: 'Road No 36, Jubilee Hills, Hyderabad, Telangana 500033',
        lat: 17.4319,
        lng: 78.4073,
        amenities: ['WiFi', 'Parking', 'AC', 'Furnished', 'Pet Friendly', 'Security'],
        images: [
          'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80'
        ],
        status: PropertyStatus.ACTIVE,
        bedrooms: 2,
        bathrooms: 2,
        areaSqft: 1600,
      },
    });

    // 4. Sample Conversations
    const conv1 = await prisma.conversation.create({
      data: {
        propertyId: prop2.id,
        tenantId: tenant1.id,
        ownerId: owner1.id,
        status: ConversationStatus.NEGOTIATING,
        lastSenderRole: Role.TENANT,
        lastMessageAt: new Date(Date.now() - 1000 * 60 * 30),
      },
    });

    await prisma.message.create({
      data: {
        conversationId: conv1.id,
        senderId: tenant1.id,
        type: MessageType.TEXT,
        text: 'Hi Rajesh! Is this 2BHK apartment still available for immediate possession from next month?',
        createdAt: new Date(Date.now() - 1000 * 60 * 120),
      },
    });

    await prisma.message.create({
      data: {
        conversationId: conv1.id,
        senderId: owner1.id,
        type: MessageType.TEXT,
        text: 'Hello Aarav! Yes, it is available. We are looking for a tenant who can move in by the 1st.',
        createdAt: new Date(Date.now() - 1000 * 60 * 90),
      },
    });

    await prisma.message.create({
      data: {
        conversationId: conv1.id,
        senderId: tenant1.id,
        type: MessageType.OFFER,
        text: 'I would like to make an offer of ₹41,000/month for a 12-month lease.',
        offerAmount: 41000,
        offerStatus: OfferStatus.PENDING,
        createdAt: new Date(Date.now() - 1000 * 60 * 30),
      },
    });

    const conv2 = await prisma.conversation.create({
      data: {
        propertyId: prop1.id,
        tenantId: tenant2.id,
        ownerId: owner1.id,
        status: ConversationStatus.OPEN,
        lastSenderRole: Role.TENANT,
        lastMessageAt: new Date(Date.now() - 1000 * 60 * 15),
      },
    });

    await prisma.message.create({
      data: {
        conversationId: conv2.id,
        senderId: tenant2.id,
        type: MessageType.TEXT,
        text: 'Does the penthouse come with dedicated covered parking for 2 cars?',
        createdAt: new Date(Date.now() - 1000 * 60 * 15),
      },
    });

    const conv3 = await prisma.conversation.create({
      data: {
        propertyId: prop4.id,
        tenantId: tenant3.id,
        ownerId: owner2.id,
        status: ConversationStatus.NEGOTIATING,
        lastSenderRole: Role.OWNER,
        lastMessageAt: new Date(Date.now() - 1000 * 60 * 60),
      },
    });

    await prisma.message.create({
      data: {
        conversationId: conv3.id,
        senderId: tenant3.id,
        type: MessageType.OFFER,
        text: 'Offered ₹135,000/month',
        offerAmount: 135000,
        offerStatus: OfferStatus.COUNTERED,
        createdAt: new Date(Date.now() - 1000 * 60 * 180),
      },
    });

    await prisma.message.create({
      data: {
        conversationId: conv3.id,
        senderId: owner2.id,
        type: MessageType.OFFER,
        text: 'I can offer ₹142,000/month including maintenance fees.',
        offerAmount: 142000,
        offerStatus: OfferStatus.PENDING,
        createdAt: new Date(Date.now() - 1000 * 60 * 60),
      },
    });

    return NextResponse.json({ success: true, message: 'Database seeded with 3 owners, 6 tenants, 10 properties, and conversations.' });
  } catch (error) {
    console.error('Seed API error:', error);
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
  }
}
