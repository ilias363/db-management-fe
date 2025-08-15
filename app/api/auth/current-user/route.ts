import { logoutAction } from '@/lib/auth/actions';
import { NextResponse } from 'next/server';

export async function POST() {
    try {
        await logoutAction();
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Logout failed:', error);
        return NextResponse.json(
            { success: false, message: 'Logout failed' },
            { status: 500 }
        );
    }
}
