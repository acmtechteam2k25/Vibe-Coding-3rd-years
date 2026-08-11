import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isOwnerRoute = createRouteMatcher(['/owner(.*)']);
const isTenantRoute = createRouteMatcher(['/tenant(.*)']);

export default clerkMiddleware(async (auth, req) => {
  const session = await auth();
  const role = (session.sessionClaims?.metadata as { role?: string })?.role;

  if (isOwnerRoute(req)) {
    if (!session.userId) {
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }
    if (role && role !== 'owner') {
      return NextResponse.redirect(new URL('/tenant/dashboard', req.url));
    }
  }

  if (isTenantRoute(req)) {
    if (!session.userId) {
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }
    if (role && role !== 'tenant') {
      return NextResponse.redirect(new URL('/owner/dashboard', req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
