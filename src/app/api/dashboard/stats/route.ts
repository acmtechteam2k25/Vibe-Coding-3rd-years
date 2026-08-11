import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { Role, MessageType, OfferStatus, PropertyStatus, ConversationStatus } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role === Role.OWNER) {
      // 1. Owner - Pending offers count
      // SELECT COUNT(*) FROM "Message" m JOIN "Conversation" c ON m."conversationId" = c.id WHERE c."ownerId" = :ownerId AND m.type = 'OFFER' AND m."offerStatus" = 'PENDING';
      const pendingOffersCount = await prisma.message.count({
        where: {
          type: MessageType.OFFER,
          offerStatus: OfferStatus.PENDING,
          conversation: {
            ownerId: user.id,
          },
        },
      });

      // 2. Owner - Unanswered inquiries count
      // SELECT COUNT(*) FROM "Conversation" c WHERE c."ownerId" = :ownerId AND c."lastSenderRole" = 'TENANT' AND c.status != 'CLOSED';
      const unansweredInquiriesCount = await prisma.conversation.count({
        where: {
          ownerId: user.id,
          lastSenderRole: Role.TENANT,
          status: { not: ConversationStatus.CLOSED },
        },
      });

      // 3. Owner - Active listings count
      const activeListingsCount = await prisma.property.count({
        where: {
          ownerId: user.id,
          status: PropertyStatus.ACTIVE,
        },
      });

      return NextResponse.json({
        role: Role.OWNER,
        pendingOffersCount,
        unansweredInquiriesCount,
        activeListingsCount,
      });
    } else {
      // Tenant Stats
      // 1. Tenant - Awaiting your response count
      // SELECT COUNT(*) FROM "Conversation" c WHERE c."tenantId" = :tenantId AND c."lastSenderRole" = 'OWNER' AND c.status != 'CLOSED';
      const awaitingResponseCount = await prisma.conversation.count({
        where: {
          tenantId: user.id,
          lastSenderRole: Role.OWNER,
          status: { not: ConversationStatus.CLOSED },
        },
      });

      // 2. Tenant - Active negotiations count
      const activeNegotiationsCount = await prisma.conversation.count({
        where: {
          tenantId: user.id,
          status: { in: [ConversationStatus.NEGOTIATING, ConversationStatus.OPEN] },
        },
      });

      // 3. Saved properties count (stretch feature)
      const totalConversations = await prisma.conversation.count({
        where: { tenantId: user.id },
      });

      return NextResponse.json({
        role: Role.TENANT,
        awaitingResponseCount,
        activeNegotiationsCount,
        savedPropertiesCount: totalConversations,
      });
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
