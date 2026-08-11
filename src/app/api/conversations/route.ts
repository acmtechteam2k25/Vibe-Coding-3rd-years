import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { Role, ConversationStatus } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { propertyId } = await req.json();
    if (!propertyId) {
      return NextResponse.json({ error: 'propertyId is required' }, { status: 400 });
    }

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    const tenantId = user.role === Role.TENANT ? user.id : bodyTenantId(req, user.id);
    const ownerId = property.ownerId;

    // Get or create conversation (idempotent unique constraint on propertyId + tenantId)
    let conversation = await prisma.conversation.findUnique({
      where: {
        propertyId_tenantId: {
          propertyId,
          tenantId,
        },
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          propertyId,
          tenantId,
          ownerId,
          status: ConversationStatus.OPEN,
          lastSenderRole: user.role,
        },
      });
    }

    return NextResponse.json(conversation);
  } catch (error) {
    console.error('Error creating/fetching conversation:', error);
    return NextResponse.json({ error: 'Failed to process conversation' }, { status: 500 });
  }
}

function bodyTenantId(req: NextRequest, defaultId: string): string {
  // If owner is initiating demo conversation, fallback cleanly
  return defaultId;
}

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ tenantId: user.id }, { ownerId: user.id }],
      },
      include: {
        property: true,
        tenant: { select: { id: true, name: true, email: true, avatarUrl: true } },
        owner: { select: { id: true, name: true, email: true, avatarUrl: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { lastMessageAt: 'desc' },
    });

    return NextResponse.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
}
