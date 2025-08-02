import { logout } from '@/lib/actions/auth';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        await logout();
    } catch (error) {
        console.error('Logout failed:', error);
    }
    return NextResponse.json({ redirectTo: '/login' }, { status: 200 });
}
