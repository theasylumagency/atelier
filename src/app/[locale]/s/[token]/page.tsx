import { notFound, redirect } from 'next/navigation';
import { getFloorSyncGuestPath } from '@/lib/floor-sync';
import { decodeFloorScanToken } from '@/lib/floor-sync-server';

export default async function FloorSyncScanPage(props: {
    params: Promise<{ locale: 'en' | 'ka'; token: string }>;
}) {
    const params = await props.params;
    const payload = decodeFloorScanToken(params.token);

    if (!payload) {
        notFound();
    }

    redirect(getFloorSyncGuestPath(params.locale, payload.sessionId, payload.tableId));
}
