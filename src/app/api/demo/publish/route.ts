import { NextRequest, NextResponse } from 'next/server';
import { markSessionPublished } from '@/lib/demo-session';

export async function POST(req: NextRequest) {
    try {
        const sessionId = req.nextUrl.searchParams.get('session') || undefined;
        const meta = await markSessionPublished(sessionId);

        return NextResponse.json(
            {
                ok: true,
                lastPublishedAt: meta.lastPublishedAt,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('POST /api/demo/publish failed:', error);
        return NextResponse.json(
            { error: 'Failed to publish demo session.' },
            { status: 500 }
        );
    }
}
