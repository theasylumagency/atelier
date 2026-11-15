import Link from 'next/link';
import QRCode from 'qrcode';
import type { AppDictionary } from '@/lib/dictionaries';
import { DEMO_TABLES, getFloorSyncBoardPath } from '@/lib/floor-sync';
import { getFloorSyncScanPath } from '@/lib/floor-sync-server';
import TableActions from './TableActions';
import FloorSyncNotificationModal from './FloorSyncNotificationModal';

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

    const boardHref = getFloorSyncBoardPath(String(locale), undefined, 'live');

    return (
        <section id="demo" className={`${compact ? 'py-28 md:py-36' : 'min-h-screen pt-32 pb-24'} bg-black text-white scroll-mt-16`}>
            <div className="max-w-[1280px] mx-auto px-6 md:px-12">
                <div className="max-w-4xl">
                    <p className="mb-6 flex items-center gap-3">
                        <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-60" /><span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" /></span>
                        <span className="eyebrow text-amber-200/70">
                        {dict.floorSync?.qrEyebrow || 'Session-specific QR launch'}
                        </span>
                    </p>
                    <h2 className="text-4xl md:text-6xl font-serif leading-[1.12] mb-6">
                        {dict.floorSync?.qrTitle || 'Open the live floor demo on real phones'}
                    </h2>
                    <p className="max-w-3xl text-base md:text-lg text-stone-300 font-light leading-relaxed">
                        {dict.floorSync?.qrSubtitle ||
                            'These QR codes point to this computer session. If you already changed the menu in Control Panel, guests will open that local version. Otherwise the standard menu is used for this session.'}
                    </p>
                </div>

                <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-sm text-stone-300 leading-relaxed max-w-2xl">
                        <span className="material-symbols-outlined text-[18px] text-stone-400 mt-0.5" aria-hidden>lock</span>
                        <span>
                        {dict.floorSync?.qrNote ||
                            'Scan on mobile. The scan route immediately redirects into /floor-sync with the correct table and shared session.'}
                        </span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Link
                            href={boardHref}
                            className="btn-primary"
                        >
                            {dict.floorSync?.openBoard || 'Open live floor board'}
                        </Link>
                        <Link
                            href={`/${locale}/panel`}
                            className="btn-ghost"
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
                                    <p className="eyebrow text-stone-400">
                                        {dict.floorSync?.table || 'Table'}
                                    </p>
                                    <h3 className="mt-2 text-2xl font-light text-white">{table.label}</h3>
                                </div>
                                <span className="flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/5 px-3 py-1 text-xs text-green-300">
                                    <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
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
                                    labels={{
                                        copied:
                                            ((dict.floorSync as {
                                                dashboard?: {
                                                    tableActions?: {
                                                        copied?: string;
                                                    };
                                                };
                                            })?.dashboard?.tableActions?.copied ?? 'Copied'),
                                        copyLink:
                                            ((dict.floorSync as {
                                                dashboard?: {
                                                    tableActions?: {
                                                        copyLink?: string;
                                                    };
                                                };
                                            })?.dashboard?.tableActions?.copyLink ??
                                                'Copy Link'),
                                        desktopPreview:
                                            ((dict.floorSync as {
                                                dashboard?: {
                                                    tableActions?: {
                                                        desktopPreview?: string;
                                                    };
                                                };
                                            })?.dashboard?.tableActions?.desktopPreview ??
                                                'Desktop Preview'),
                                    }}
                                />
                            </div>
                        </article>
                    ))}
                </div>

                <FloorSyncNotificationModal
                    sessionId={sessionId}
                    locale={locale}
                    panelHref={`/${locale}/panel`}
                    boardHref={boardHref}
                />
            </div>
        </section>
    );
}
