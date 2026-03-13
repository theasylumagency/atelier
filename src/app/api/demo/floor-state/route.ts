import { NextRequest, NextResponse } from 'next/server';
import {
    cleanupExpiredDemoSessions,
    readSessionFloorState,
} from '@/lib/demo-session';

export async function GET(req: NextRequest) {
    try {
        await cleanupExpiredDemoSessions();
        const sessionId = req.nextUrl.searchParams.get('session') || undefined;
        const state = await readSessionFloorState(sessionId);

        return NextResponse.json(state, { status: 200 });
    } catch (error) {
        console.error('GET /api/demo/floor-state failed:', error);
        return NextResponse.json(
            { error: 'Failed to load floor sync state.' },
            { status: 500 }
        );
    }
}
