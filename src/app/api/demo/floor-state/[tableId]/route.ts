import { NextRequest, NextResponse } from 'next/server';
import { readSessionFloorState, updateSessionFloorTable } from '@/lib/demo-session';
import { isDemoTableId } from '@/lib/floor-sync';

interface RouteContext {
    params: Promise<{ tableId: string }>;
}

export async function GET(req: NextRequest, context: RouteContext) {
    try {
        const sessionId = req.nextUrl.searchParams.get('session') || undefined;
        const { tableId } = await context.params;

        if (!isDemoTableId(tableId)) {
            return NextResponse.json({ error: 'Unknown table id.' }, { status: 404 });
        }

        const state = await readSessionFloorState(sessionId);

        return NextResponse.json(state.tables[tableId], { status: 200 });
    } catch (error) {
        console.error('GET /api/demo/floor-state/[tableId] failed:', error);
        return NextResponse.json(
            { error: 'Failed to load table state.' },
            { status: 500 }
        );
    }
}

export async function PUT(req: NextRequest, context: RouteContext) {
    try {
        const sessionId = req.nextUrl.searchParams.get('session') || undefined;
        const { tableId } = await context.params;

        if (!isDemoTableId(tableId)) {
            return NextResponse.json({ error: 'Unknown table id.' }, { status: 404 });
        }

        const body = await req.json().catch(() => null);

        if (!body || typeof body !== 'object') {
            return NextResponse.json({ error: 'Invalid table state payload.' }, { status: 400 });
        }

        const updated = await updateSessionFloorTable(tableId, body, sessionId);

        return NextResponse.json(updated, { status: 200 });
    } catch (error) {
        console.error('PUT /api/demo/floor-state/[tableId] failed:', error);
        return NextResponse.json(
            { error: 'Failed to update table state.' },
            { status: 500 }
        );
    }
}
