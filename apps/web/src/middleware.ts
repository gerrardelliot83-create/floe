import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Protected routes
  const protectedRoutes = ['/app', '/dashboard', '/settings'];
  const authRoutes = ['/auth/signin', '/auth/signup', '/auth/onboarding'];
  const isProtectedRoute = protectedRoutes.some(route => req.nextUrl.pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => req.nextUrl.pathname.startsWith(route));

  // Redirect to sign in if trying to access protected route without session
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/auth/signin', req.url));
  }

  // Redirect to app if trying to access auth pages with active session
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/app', req.url));
  }

  // Check onboarding status for app routes
  if (session && req.nextUrl.pathname.startsWith('/app')) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', session.user.id)
        .single();

      if (profile && !profile.onboarding_completed) {
        return NextResponse.redirect(new URL('/auth/onboarding', req.url));
      }
    } catch (error) {
      // If profile doesn't exist or error, let the app handle it
      console.error('Middleware profile check error:', error);
    }
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
};