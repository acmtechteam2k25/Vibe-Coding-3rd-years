import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { MessageType, OfferStatus, ConversationStatus } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { conversationId, type, text, offerAmount } = await req.json();
    if (!conversationId || !type) {
      return NextResponse.json({ error: 'conversationId and type are required' }, { status: 400 });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Verify user is member of conversation
    if (conversation.tenantId !== user.id && conversation.ownerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const isOffer = type === MessageType.OFFER;
    const offerStatus = isOffer ? OfferStatus.PENDING : undefined;

    // Create the message
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: user.id,
        type,
        text: text || (isOffer ? `Submitted an offer of ₹${offerAmount?.toLocaleString('en-IN')}` : null),
        offerAmount: isOffer ? parseInt(offerAmount) : null,
        offerStatus: offerStatus || null,
      },
      include: {
        sender: { select: { id: true, name: true, avatarUrl: true, role: true } },
      },
    });

    // Update Conversation lastSenderRole, lastMessageAt, and status if OFFER
    const conversationUpdate: any = {
      lastSenderRole: user.role,
      lastMessageAt: new Date(),
    };

    if (isOffer) {
      conversationUpdate.status = ConversationStatus.NEGOTIATING;
    }

    await prisma.conversation.update({
      where: { id: conversationId },
      data: conversationUpdate,
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error('Error posting message:', error);
    return NextResponse.json({ error: 'Failed to post message' }, { status: 500 });
  }
}
