import { NextResponse } from 'next/server';
import { logout } from '@/lib/actions/auth';

export async function GET() {
    try {
        await logout();
    } catch (error) {
        console.error('Logout failed:', error);
        return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_APP_URL));
    }
}
