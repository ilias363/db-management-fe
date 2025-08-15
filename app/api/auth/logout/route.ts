import { logoutAction } from '@/lib/auth/actions';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        await logoutAction();
    } catch (error) {
        console.error('Logout failed:', error);
    }
    return NextResponse.json({ redirectTo: '/login' }, { status: 200 });
}
