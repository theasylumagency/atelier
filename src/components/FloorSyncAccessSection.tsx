import Link from 'next/link';
import QRCode from 'qrcode';
import type { AppDictionary } from '@/lib/dictionaries';
import { DEMO_TABLES, getFloorSyncBoardPath } from '@/lib/floor-sync';
import { getFloorSyncScanPath } from '@/lib/floor-sync-server';
import TableActions from './TableActions';

async function makeQrDataUrl(value: string) {
    return QRCode.toDataURL(value, {
        margin: 1,
        width: 256,
        color: {
            dark: '#0a0a0a',
            light: '#ffffff',
        },
    });
}

export default async function FloorSyncAccessSection({
    dict,
    locale,
    origin,
    sessionId,
    compact = false,
}: {
    dict: AppDictionary;
    locale: string;
    origin: string;
    sessionId: string;
    compact?: boolean;
}) {
    const tableCards = await Promise.all(
        DEMO_TABLES.map(async (table) => {
            const scanPath = getFloorSyncScanPath(locale, sessionId, table.id);
            const scanUrl = new URL(scanPath, origin).toString();

            return {
                ...table,
                scanPath,
                scanUrl,
                qrSrc: await makeQrDataUrl(scanUrl),
            };
        })
    );

    const boardHref = getFloorSyncBoardPath(locale, sessionId);

    return (
        <section className={`${compact ? 'py-24' : 'min-h-screen pt-32 pb-24'} bg-black text-white`}>
            <div className="max-w-[1400px] mx-auto px-8 md:px-12">
                <div className="max-w-4xl">
                    <p className="text-[10px] uppercase tracking-[0.32em] text-stone-500 mb-4">
                        {dict.floorSync?.qrEyebrow || 'Session-specific QR launch'}
                    </p>
                    <h2 className="text-4xl md:text-6xl font-light tracking-tight mb-5">
                        {dict.floorSync?.qrTitle || 'Open the live floor demo on real phones'}
                    </h2>
                    <p className="max-w-3xl text-sm md:text-base text-stone-400 leading-relaxed">
                        {dict.floorSync?.qrSubtitle ||
                            'These QR codes point to this computer session. If you already changed the menu in Control Panel, guests will open that local version. Otherwise the standard menu is used for this session.'}
                    </p>
                </div>

                <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="rounded-3xl border border-white/10 bg-white/[0.03] px-5 py-4 text-sm text-stone-300 max-w-2xl">
                        {dict.floorSync?.qrNote ||
                            'Scan on mobile. The scan route immediately redirects into /floor-sync with the correct table and shared session.'}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Link
                            href={boardHref}
                            className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white px-6 py-3 text-[10px] font-bold uppercase tracking-[0.28em] text-black transition-colors hover:bg-stone-200"
                        >
                            {dict.floorSync?.openBoard || 'Open live floor board'}
                        </Link>
                        <Link
                            href={`/${locale}/panel`}
                            className="inline-flex items-center justify-center rounded-full border border-white/10 px-6 py-3 text-[10px] font-bold uppercase tracking-[0.28em] text-stone-300 transition-colors hover:border-white/20 hover:text-white"
                        >
                            {dict.floorSync?.openPanel || dict.nav?.panel || 'Control Panel'}
                        </Link>
                    </div>
                </div>

                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {tableCards.map((table) => (
                        <article
                            key={table.id}
                            className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 md:p-6 shadow-[0_20px_80px_rgba(0,0,0,0.35)]"
                        >
                            <div className="flex items-center justify-between gap-4 mb-5">
                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.24em] text-stone-500">
                                        {dict.floorSync?.table || 'Table'}
                                    </p>
                                    <h3 className="mt-2 text-2xl font-light text-white">{table.label}</h3>
                                </div>
                                <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-stone-400">
                                    {dict.floorSync?.liveFeed || 'Live'}
                                </span>
                            </div>

                            <div className="rounded-[1.5rem] bg-white p-4">
                                <img
                                    src={table.qrSrc}
                                    alt={`${table.label} QR code`}
                                    className="w-full h-auto rounded-xl"
                                />
                            </div>

                            <div className="mt-5 space-y-3">

                                {/* Replace the old raw URL and preview button with this component */}
                                <TableActions
                                    scanUrl={table.scanUrl}
                                    scanPath={table.scanPath}
                                />
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
