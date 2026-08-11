import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { OfferStatus, ConversationStatus, PropertyStatus, MessageType } from '@prisma/client';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, counterAmount } = body; // action: "accept" | "reject" | "counter"

    if (!['accept', 'reject', 'counter'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const message = await prisma.message.findUnique({
      where: { id: params.id },
      include: {
        conversation: {
          include: { property: true },
        },
      },
    });

    if (!message || message.type !== MessageType.OFFER) {
      return NextResponse.json({ error: 'Offer message not found' }, { status: 404 });
    }

    const conversation = message.conversation;

    // Verify user is in conversation
    if (conversation.tenantId !== user.id && conversation.ownerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const offerAmt = message.offerAmount || 0;
    const formattedAmount = `₹${offerAmt.toLocaleString('en-IN')}`;

    if (action === 'accept') {
      // Update original offer message status
      await prisma.message.update({
        where: { id: params.id },
        data: { offerStatus: OfferStatus.ACCEPTED },
      });

      // Update Conversation status to ACCEPTED
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          status: ConversationStatus.ACCEPTED,
          lastSenderRole: user.role,
          lastMessageAt: new Date(),
        },
      });

      // Flip property status to RENTED
      await prisma.property.update({
        where: { id: conversation.propertyId },
        data: { status: PropertyStatus.RENTED },
      });

      // Insert SYSTEM message
      const systemMessage = await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: user.id,
          type: MessageType.SYSTEM,
          text: `Offer of ${formattedAmount} accepted! Property marked as RENTED.`,
        },
        include: { sender: { select: { id: true, name: true, avatarUrl: true, role: true } } },
      });

      return NextResponse.json({ success: true, message: systemMessage, status: OfferStatus.ACCEPTED });
    }

    if (action === 'reject') {
      await prisma.message.update({
        where: { id: params.id },
        data: { offerStatus: OfferStatus.REJECTED },
      });

      await prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          status: ConversationStatus.DECLINED,
          lastSenderRole: user.role,
          lastMessageAt: new Date(),
        },
      });

      const systemMessage = await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: user.id,
          type: MessageType.SYSTEM,
          text: `Offer of ${formattedAmount} was declined.`,
        },
        include: { sender: { select: { id: true, name: true, avatarUrl: true, role: true } } },
      });

      return NextResponse.json({ success: true, message: systemMessage, status: OfferStatus.REJECTED });
    }

    if (action === 'counter') {
      if (!counterAmount || parseInt(counterAmount) <= 0) {
        return NextResponse.json({ error: 'Valid counter amount required' }, { status: 400 });
      }

      // Mark existing offer as COUNTERED
      await prisma.message.update({
        where: { id: params.id },
        data: { offerStatus: OfferStatus.COUNTERED },
      });

      // Create new counter OFFER message
      const counterValue = parseInt(counterAmount);
      const newOfferMessage = await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: user.id,
          type: MessageType.OFFER,
          text: `Submitted counter-offer of ₹${counterValue.toLocaleString('en-IN')}`,
          offerAmount: counterValue,
          offerStatus: OfferStatus.PENDING,
        },
        include: { sender: { select: { id: true, name: true, avatarUrl: true, role: true } } },
      });

      await prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          status: ConversationStatus.NEGOTIATING,
          lastSenderRole: user.role,
          lastMessageAt: new Date(),
        },
      });

      return NextResponse.json({ success: true, message: newOfferMessage, status: OfferStatus.COUNTERED });
    }

    return NextResponse.json({ error: 'Unhandled action' }, { status: 400 });
  } catch (error) {
    console.error('Error updating offer status:', error);
    return NextResponse.json({ error: 'Failed to update offer' }, { status: 500 });
  }
}
