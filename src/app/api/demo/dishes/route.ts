import { NextResponse } from 'next/server';
import {
    cleanupExpiredDemoSessions,
    readSessionDishes,
    readSessionMeta,
} from '@/lib/demo-session';

export async function GET() {
    try {
        await cleanupExpiredDemoSessions();

        const [data, meta] = await Promise.all([
            readSessionDishes(),
            readSessionMeta(),
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