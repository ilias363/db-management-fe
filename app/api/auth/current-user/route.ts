import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/actions/auth';

export async function GET() {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'User not found' },
                { status: 401 }
            );
        }

        return NextResponse.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Failed to get current user :', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
