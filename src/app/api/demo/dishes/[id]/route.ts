import { NextRequest, NextResponse } from 'next/server';
import { updateSessionDish } from '@/lib/demo-session';

interface RouteContext {
    params: Promise<{ id: string }>;
}

export async function PUT(req: NextRequest, context: RouteContext) {
    try {
        const sessionId = req.nextUrl.searchParams.get('session') || undefined;
        const { id } = await context.params;
        const body = await req.json().catch(() => null);

        if (!body || typeof body !== 'object') {
            return NextResponse.json(
                { error: 'Invalid dish payload.' },
                { status: 400 }
            );
        }

        const updated = await updateSessionDish(id, body, sessionId);
        const savedDish = updated.items.find((dish) => dish.id === id);

        return NextResponse.json(
            { ok: true, dish: savedDish, updatedAt: updated.updatedAt },
            { status: 200 }
        );
    } catch (error) {
        console.error('PUT /api/demo/dishes/[id] failed:', error);
        return NextResponse.json(
            { error: 'Failed to save demo dish.' },
            { status: 500 }
        );
    }
}
