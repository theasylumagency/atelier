'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { FloorStateFile, FloorActivityEvent, DemoTableId } from '@/lib/floor-sync';
import { DEMO_TABLES, getDemoTableLabel } from '@/lib/floor-sync';
import { formatEventTime } from '@/lib/floor-sync-view';

interface FloorSyncNotificationModalProps {
    sessionId: string;
    locale: string;
    panelHref: string;
    boardHref: string;
}

interface UnifiedEvent extends FloorActivityEvent {
    tableId: DemoTableId;
    tableLabel: string;
}

const UI = {
    en: {
        title: 'Live Activity',
        openPanel: 'Open Admin Panel',
        openBoard: 'Open Floor Board',
        noActivity: 'Waiting for guest activity…',
        close: 'Close',
    },
    ka: {
        title: 'ცოცხალი აქტივობა',
        openPanel: 'ადმინ პანელის გახსნა',
        openBoard: 'დარბაზის ტერმინალის გახსნა',
        noActivity: 'ველოდებით სტუმრის მოქმედებას…',
        close: 'დახურვა',
    },
} as const;

function collectEvents(state: FloorStateFile): UnifiedEvent[] {
    const events: UnifiedEvent[] = [];

    for (const table of DEMO_TABLES) {
        const tableState = state.tables[table.id];
        if (!tableState) continue;

        for (const event of tableState.activityFeed) {
            events.push({
                ...event,
                tableId: table.id,
                tableLabel: table.label,
            });
        }
    }

    events.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return events.slice(0, 20);
}

export default function FloorSyncNotificationModal({
    sessionId,
    locale,
    panelHref,
    boardHref,
}: FloorSyncNotificationModalProps) {
    const ui = locale === 'ka' ? UI.ka : UI.en;
    const [events, setEvents] = useState<UnifiedEvent[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);
    const lastSeenEventIdRef = useRef<string | null>(null);
    const hasEverOpened = useRef(false);

    const handleClose = useCallback(() => {
        setIsOpen(false);
        setIsDismissed(true);
    }, []);

    useEffect(() => {
        let cancelled = false;

        const poll = async () => {
            try {
                const params = new URLSearchParams({ session: sessionId });
                const response = await fetch(`/api/demo/floor-state?${params.toString()}`, {
                    cache: 'no-store',
                });

                if (!response.ok || cancelled) return;

                const state = (await response.json()) as FloorStateFile;
                const unified = collectEvents(state);

                if (cancelled) return;

                setEvents(unified);

                if (unified.length > 0) {
                    const latestId = unified[0].id;

                    if (latestId !== lastSeenEventIdRef.current) {
                        lastSeenEventIdRef.current = latestId;

                        // Auto-open: first time, or re-open if dismissed and new activity arrived
                        if (!hasEverOpened.current || isDismissed) {
                            hasEverOpened.current = true;
                            setIsOpen(true);
                            setIsDismissed(false);
                        }
                    }
                }
            } catch {
                // Silently ignore polling errors
            }
        };

        poll();
        const interval = window.setInterval(poll, 2000);

        return () => {
            cancelled = true;
            window.clearInterval(interval);
        };
    }, [sessionId, isDismissed]);

    // Don't render anything if there are no events yet
    if (events.length === 0) {
        return null;
    }

    return (
        <div
            className={`fixed top-24 right-6 z-[9999] w-[340px] max-w-[calc(100vw-2rem)] transition-all duration-500 ease-out ${isOpen
                    ? 'opacity-100 translate-x-0 scale-100'
                    : 'opacity-0 translate-x-8 scale-95 pointer-events-none'
                }`}
        >
            <div className="rounded-2xl border border-white/10 bg-[#0e0e0e]/95 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.05)]">
                {/* Header */}
                <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-3 border-b border-white/[0.06]">
                    <div className="flex items-center gap-2.5">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-50" />
                            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
                        </span>
                        <h3 className="text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-200">
                            {ui.title}
                        </h3>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-stone-400 transition-colors hover:bg-white/[0.08] hover:text-white"
                        aria-label={ui.close}
                    >
                        <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                </div>

                {/* Event Feed */}
                <div className="max-h-[260px] overflow-y-auto px-4 py-3 space-y-2 no-scrollbar">
                    {events.map((event, index) => (
                        <div
                            key={event.id}
                            className={`rounded-xl px-3.5 py-2.5 transition-all duration-300 ${index === 0
                                    ? 'border border-white/10 bg-white/[0.04] shadow-[0_4px_16px_rgba(0,0,0,0.2)]'
                                    : 'border border-transparent bg-white/[0.02]'
                                }`}
                            style={{
                                animationDelay: `${index * 40}ms`,
                            }}
                        >
                            <div className="flex items-start justify-between gap-2 mb-0.5">
                                <p className={`text-[13px] leading-snug ${index === 0 ? 'text-white' : 'text-stone-300'}`}>
                                    {event.label}
                                </p>
                                <span className="shrink-0 rounded-full border border-white/8 bg-white/[0.03] px-2 py-0.5 text-[9px] uppercase tracking-[0.18em] text-stone-500">
                                    {event.tableLabel}
                                </span>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                                {event.meta && (
                                    <p className="text-[11px] text-stone-500 truncate">{event.meta}</p>
                                )}
                                <span className="shrink-0 text-[10px] text-stone-600">
                                    {formatEventTime(event.createdAt, locale)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Action Buttons */}
                <div className="px-4 pb-4 pt-2 flex flex-col gap-2 border-t border-white/[0.06]">
                    <Link
                        href={boardHref}
                        className="flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.24em] text-black transition-colors hover:bg-stone-200"
                    >
                        <span className="material-symbols-outlined text-[16px]">dashboard</span>
                        {ui.openBoard}
                    </Link>
                </div>
            </div>
        </div>
    );
}
