import { NextRequest, NextResponse } from 'next/server';
import { getAuthTokens } from './lib/session';

export async function middleware(request: NextRequest) {
	try {
		const { pathname } = request.nextUrl;

		const { accessToken, refreshToken } = await getAuthTokens();

		const isAuthRoute = ["/login"].includes(pathname);
		const isPublicRoute = ["/login"].includes(pathname);
		const isProtectedRoute = !isPublicRoute;

		// If user is trying to access auth routes but has tokens, redirect to home
		if (isAuthRoute && (accessToken || refreshToken)) {
			return NextResponse.redirect(new URL('/', request.nextUrl));
		}

		// If user is trying to access protected routes but has no tokens, redirect to login
		if (isProtectedRoute && !accessToken && !refreshToken) {
			return NextResponse.redirect(new URL('/login?expiredsession=true', request.nextUrl));
		}

		return NextResponse.next();
	} catch (error) {
		console.error('Middleware error:', error);
		// Redirect to login on error for security
		return NextResponse.redirect(new URL('/login?expiredsession=true', request.nextUrl));
	}
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
		'/((?!_next/static|_next/image|favicon.ico|public).*)',
	],
};