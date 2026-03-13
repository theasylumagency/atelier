import { NextResponse } from 'next/server';
import {
    cleanupExpiredDemoSessions,
    readSessionDishes,
    readSessionMeta,
} from '@/lib/demo-session';
import type { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        await cleanupExpiredDemoSessions();
        const sessionId = req.nextUrl.searchParams.get('session') || undefined;

        const [data, meta] = await Promise.all([
            readSessionDishes(sessionId),
            readSessionMeta(sessionId),
        ]);

        return NextResponse.json(
            {
                items: data.items,
                updatedAt: data.updatedAt ?? null,
                lastPublishedAt: meta.lastPublishedAt ?? null,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('GET /api/demo/dishes failed:', error);
        return NextResponse.json(
            { error: 'Failed to load demo dishes.' },
            { status: 500 }
        );
    }
}
