import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function middleware(request: NextRequest) {
	try {
		const { pathname } = request.nextUrl;

		const session = await getSession();

		const isAuthRoute = ["/login"].includes(pathname);
		const isPublicRoute = ["/login"].includes(pathname);
		const isProtectedRoute = !isPublicRoute;

		// If no session and trying to access protected route, redirect to login
		if (!session && isProtectedRoute) {
			const url = new URL('/login', request.nextUrl);
			if (pathname !== '/') {
				url.searchParams.set('callbackUrl', pathname);
			}
			return NextResponse.redirect(url);
		}

		// If has session and trying to access login, redirect to home
		if (session && isAuthRoute) {
			const callbackUrl = request.nextUrl.searchParams.get('callbackUrl');
			const redirectUrl = callbackUrl && callbackUrl.startsWith('/') ? callbackUrl : '/';
			return NextResponse.redirect(new URL(redirectUrl, request.nextUrl));
		}

		return NextResponse.next();
	} catch (error) {
		console.error('Middleware error:', error);
		// Redirect to login on error for security
		return NextResponse.redirect(new URL('/login?error=session', request.nextUrl));
	}
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 */
		{
			source:
				'/((?!api|_next/static|_next/image|media|fonts|favicon.ico|favicon.png).*)',
			missing: [
				// Exclude Server Actions
				{ type: 'header', key: 'next-action' },
			],
		},
	],
};