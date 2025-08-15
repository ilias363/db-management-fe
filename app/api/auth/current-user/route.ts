import { getCurrentUser } from '@/lib/auth/actions';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const currentUser = await getCurrentUser();

        return NextResponse.json({
            success: true,
            data: currentUser
        });
    } catch (error) {
        console.error('Failed to check admin status:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
