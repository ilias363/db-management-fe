import { NextResponse } from 'next/server';
import { getIsSystemAdmin } from '@/lib/auth/actions';

export async function GET() {
    try {
        const isAdmin = await getIsSystemAdmin();

        return NextResponse.json({
            success: true,
            data: { isSystemAdmin: isAdmin }
        });
    } catch (error) {
        console.error('Failed to check admin status:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
