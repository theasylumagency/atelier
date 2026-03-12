import { NextResponse } from 'next/server';
import { resetSessionDishes } from '@/lib/demo-session';

export async function POST() {
    try {
        const data = await resetSessionDishes();
        return NextResponse.json(
            { ok: true, items: data.items, updatedAt: data.updatedAt },
            { status: 200 }
        );
    } catch (error) {
        console.error('POST /api/demo/reset failed:', error);
        return NextResponse.json(
            { error: 'Failed to reset demo session.' },
            { status: 500 }
        );
    }
}