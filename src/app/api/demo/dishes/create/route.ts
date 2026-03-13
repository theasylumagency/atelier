import { NextRequest, NextResponse } from 'next/server';
import type { Dish } from '@/lib/types';
import { createSessionDish } from '@/lib/demo-session';

export async function POST(req: NextRequest) {
    try {
        const sessionId = req.nextUrl.searchParams.get('session') || undefined;
        const body = (await req.json().catch(() => null)) as Dish | null;

        if (!body || typeof body !== 'object' || !body.id) {
            return NextResponse.json(
                { error: 'Invalid new dish payload.' },
                { status: 400 }
            );
        }

        const updated = await createSessionDish(body, sessionId);
        return NextResponse.json(
            { ok: true, dish: body, updatedAt: updated.updatedAt },
            { status: 200 }
        );
    } catch (error) {
        console.error('POST /api/demo/dishes/create failed:', error);
        return NextResponse.json(
            { error: 'Failed to create demo dish.' },
            { status: 500 }
        );
    }
}
