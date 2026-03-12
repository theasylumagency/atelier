import { NextResponse } from 'next/server';
import { markSessionPublished } from '@/lib/demo-session';

export async function POST() {
    try {
        const meta = await markSessionPublished();

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