import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: params.id },
      include: {
        property: true,
        tenant: { select: { id: true, name: true, email: true, avatarUrl: true } },
        owner: { select: { id: true, name: true, email: true, avatarUrl: true } },
        messages: {
          include: {
            sender: { select: { id: true, name: true, avatarUrl: true, role: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Ensure only tenant or owner of conversation can view
    if (conversation.tenantId !== user.id && conversation.ownerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(conversation);
  } catch (error) {
    console.error('Error fetching conversation detail:', error);
    return NextResponse.json({ error: 'Failed to fetch conversation details' }, { status: 500 });
  }
}
