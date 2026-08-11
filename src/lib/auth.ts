import { currentUser } from '@clerk/nextjs/server';
import { prisma } from './prisma';
import { Role } from '@prisma/client';

export interface SyncedUser {
  id: string;
  clerkId: string;
  role: Role;
  name: string;
  email: string;
  avatarUrl: string | null;
}

export async function getCurrentUser(): Promise<SyncedUser | null> {
  try {
    const user = await currentUser();
    if (!user) return getDevFallbackUser();

    const clerkId = user.id;
    const email = user.emailAddresses[0]?.emailAddress || `${clerkId}@example.com`;
    const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'User';
    const avatarUrl = user.imageUrl || null;
    const clerkRole = (user.publicMetadata?.role as string)?.toUpperCase();
    const role: Role = clerkRole === 'OWNER' ? Role.OWNER : Role.TENANT;

    // Sync user into DB
    let dbUser = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          clerkId,
          email,
          name,
          role,
          avatarUrl,
        },
      });
    } else if (dbUser.role !== role || dbUser.name !== name || dbUser.email !== email) {
      dbUser = await prisma.user.update({
        where: { id: dbUser.id },
        data: { role, name, email, avatarUrl },
      });
    }

    return dbUser;
  } catch (err) {
    console.warn('Clerk auth error, using demo synced user:', err);
    return getDevFallbackUser();
  }
}

// Fallback user helper for development/testing when demo keys are present
export async function getDevFallbackUser(overrideRole?: Role): Promise<SyncedUser | null> {
  try {
    const targetRole = overrideRole || Role.OWNER;
    const existing = await prisma.user.findFirst({
      where: { role: targetRole },
    });

    if (existing) return existing;

    // Create default fallback user if seed hasn't run yet
    return await prisma.user.create({
      data: {
        clerkId: `demo_${targetRole.toLowerCase()}_1`,
        email: `${targetRole.toLowerCase()}@homehub.demo`,
        name: targetRole === Role.OWNER ? 'Rajesh Sharma (Owner)' : 'Aarav Patel (Tenant)',
        role: targetRole,
        avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80`,
      },
    });
  } catch (err) {
    console.error('Error fetching fallback user:', err);
    return null;
  }
}
