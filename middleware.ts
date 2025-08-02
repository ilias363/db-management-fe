import { NextRequest, NextResponse } from 'next/server';
import { getAuthTokens } from './lib/session';
import { refreshAuthTokens, validateAccessToken } from './lib/actions';

const publicRoutes = ['/login'];
const authRoutes = ['/login'];

export async function middleware(request: NextRequest) {
	try {
		const { pathname } = request.nextUrl;

		const { accessToken, refreshToken } = await getAuthTokens();

		const isPublicRoute = publicRoutes.includes(pathname);
		const isProtectedRoute = !isPublicRoute;
		const isAuthRoute = authRoutes.includes(pathname);

		if (accessToken) {
			// If user has access token, validate it
			const isValid = await validateAccessToken();
			if (isValid) {
				if (isAuthRoute) {
					return NextResponse.redirect(new URL('/', request.nextUrl));
				}
				return NextResponse.next();
			}
		}

		if (refreshToken) {
			// If user has a refresh token but no access token, try to refresh the token
			const refreshed = await refreshAuthTokens();
			if (refreshed) {
				if (isAuthRoute) {
					return NextResponse.redirect(new URL('/', request.nextUrl));
				}
				return NextResponse.next();
			}
			// If refresh fails, redirect to login
			return NextResponse.redirect(new URL('/login', request.nextUrl));
		}

		if (isProtectedRoute) {
			// If user has no tokens and tries to access protected route
			return NextResponse.redirect(new URL('/login', request.nextUrl));
		}

		return NextResponse.next();
	} catch (error) {
		console.error('Middleware error:', error);
		// Redirect to login on error for security
		return NextResponse.redirect(new URL('/login', request.nextUrl));
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
		 * - public folder
		 */
		'/((?!api|_next/static|_next/image|favicon.ico|public).*)',
	],
};