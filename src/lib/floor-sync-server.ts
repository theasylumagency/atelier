import 'server-only';

import { headers } from 'next/headers';
import type { AppLocale } from '@/lib/types';
import { isDemoTableId, isValidDemoSessionId, type DemoTableId } from '@/lib/floor-sync';

interface FloorScanTokenPayload {
    sessionId: string;
    tableId: DemoTableId;
}

export function encodeFloorScanToken(sessionId: string, tableId: DemoTableId) {
    const payload: FloorScanTokenPayload = { sessionId, tableId };
    return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
}

export function decodeFloorScanToken(token: string): FloorScanTokenPayload | null {
    try {
        const payload = JSON.parse(Buffer.from(token, 'base64url').toString('utf8')) as FloorScanTokenPayload;

        if (!isValidDemoSessionId(payload.sessionId) || !isDemoTableId(payload.tableId)) {
            return null;
        }

        return payload;
    } catch {
        return null;
    }
}

export function getFloorSyncScanPath(
    locale: AppLocale | string,
    sessionId: string,
    tableId: DemoTableId
) {
    return `/${locale}/s/${encodeFloorScanToken(sessionId, tableId)}`;
}

export async function getRequestOrigin() {
    const requestHeaders = await headers();
    const forwardedProto = requestHeaders.get('x-forwarded-proto');
    const forwardedHost = requestHeaders.get('x-forwarded-host');
    const host = forwardedHost || requestHeaders.get('host') || 'localhost:3000';
    const protocol = forwardedProto || (host.includes('localhost') ? 'http' : 'https');

    return `${protocol}://${host}`;
}
