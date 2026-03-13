'use client';

import { useEffect, useMemo, useState } from 'react';
import type { AppDictionary } from '@/lib/dictionaries';
import type { DemoTableId, FloorStateFile, FloorTableState } from '@/lib/floor-sync';
import { DEMO_TABLES, getDemoTableLabel } from '@/lib/floor-sync';
import {
    type FloorCategory,
    type FloorDish,
    formatCurrency,
    formatEventTime,
    getCategoryLabel,
    getDishTitle,
} from '@/lib/floor-sync-view';

const UI = {
    en: {
        browsing: 'Browsing',
        ordering: 'Ordering',
        sent: 'Sent',
        completed: 'Completed',
        idle: 'Idle',
        floorBoard: 'Floor Board',
        live: 'Live',
        currentFocus: 'Current Focus',
        activityFeed: 'Activity Feed',
        terminalSummary: 'Terminal Summary',
        viewedDish: 'Viewed dish',
        activeCategory: 'Active category',
        cartTotal: 'Cart total',
        items: 'Items',
        waitingForGuest: 'Waiting for guest interaction',
        watchingLive: 'The terminal reflects browsing, selection, and checkout in real time.',
        actionRequired: 'Action Required',
        browsingActive: 'Browsing / Active',
        clearedPaid: 'Cleared / Paid',
        operatorTerminal: 'Operator Terminal',
        pageTitle: 'Live Floor Sync',
        pageSubtitle:
            "See how a guest's menu activity appears instantly on the restaurant terminal across multiple tables.",
        allCategories: 'All',
        currentSession: 'Current session',
        protectedFeed: 'Protected internal feed',
        noDishViewed: 'No dish viewed yet',
        noCategoryFocused: 'No category focused yet',
        liveSince: 'Live since',
        lastAction: 'Last action',
        sessionLive: 'Session live',
        focusHint: 'Click a table to inspect its live feed.',
    },
    ka: {
        browsing: 'ათვალიერებს',
        ordering: 'უკვეთავს',
        sent: 'გაგზავნილია',
        completed: 'დასრულებულია',
        idle: 'მოლოდინი',
        floorBoard: 'დარბაზის ტერმინალი',
        live: 'ლაივი',
        currentFocus: 'მიმდინარე ფოკუსი',
        activityFeed: 'აქტივობის ჟურნალი',
        terminalSummary: 'ტერმინალის შეჯამება',
        viewedDish: 'გახსნილი კერძი',
        activeCategory: 'აქტიური კატეგორია',
        cartTotal: 'კალათის ჯამი',
        items: 'ერთეული',
        waitingForGuest: 'ველოდებით სტუმრის მოქმედებას',
        watchingLive: 'ტერმინალი რეალურ დროში აჩვენებს დათვალიერებას, არჩევანს და დადასტურებას.',
        actionRequired: 'საჭიროა რეაგირება',
        browsingActive: 'ათვალიერებს / აქტიურია',
        clearedPaid: 'გადახდილია / გასუფთავდა',
        operatorTerminal: 'ოპერატორის ტერმინალი',
        pageTitle: 'ცოცხალი სინქრონი დარბაზზე',
        pageSubtitle:
            'ნახეთ, როგორ ჩნდება სტუმრის მობილურიდან წამოსული აქტივობა დარბაზის ტერმინალზე რამდენიმე მაგიდისთვის.',
        allCategories: 'ყველა',
        currentSession: 'მიმდინარე სესია',
        protectedFeed: 'შიდა დაცული არხი',
        noDishViewed: 'ჯერ არცერთი კერძი არ არის გახსნილი',
        noCategoryFocused: 'ჯერ კატეგორია არ არის არჩეული',
        liveSince: 'აქტიურია',
        lastAction: 'ბოლო ქმედება',
        sessionLive: 'სესია აქტიურია',
        focusHint: 'დააწკაპუნეთ მაგიდაზე, რომ მისი ცოცხალი არხი ნახოთ.',
    },
} as const;

const TABLE_POSITIONS: Record<
    DemoTableId,
    { wrapper: string; panel: string }
> = {
    'table-01': {
        wrapper: 'absolute top-[14%] left-[74%]',
        panel: 'left-1/2 -translate-x-1/2 top-[112%] xl:left-auto xl:right-[110%] xl:-translate-x-0 xl:top-1/2 xl:-translate-y-1/2',
    },
    'table-04': {
        wrapper: 'absolute top-[20%] left-[14%]',
        panel: 'left-1/2 -translate-x-1/2 top-[112%] xl:left-[115%] xl:top-1/2 xl:-translate-y-1/2 xl:-translate-x-0',
    },
    'table-08': {
        wrapper: 'absolute top-[68%] left-[30%]',
        panel: 'left-1/2 -translate-x-1/2 bottom-[112%] xl:left-[115%] xl:bottom-auto xl:top-1/2 xl:-translate-y-1/2 xl:-translate-x-0',
    },
};

function getStatusLabel(
    status: FloorTableState['status'],
    ui: (typeof UI)[keyof typeof UI]
) {
    switch (status) {
        case 'browsing':
            return ui.browsing;
        case 'ordering':
            return ui.ordering;
        case 'fired':
            return ui.sent;
        case 'settled':
            return ui.completed;
        default:
            return ui.idle;
    }
}

function getStatusClasses(status: FloorTableState['status']) {
    switch (status) {
        case 'browsing':
            return 'border-white/40 bg-white/[0.04] shadow-[0_0_24px_rgba(255,255,255,0.08)]';
        case 'ordering':
            return 'border-white/70 bg-white/[0.06] shadow-[0_0_28px_rgba(255,255,255,0.14)]';
        case 'fired':
            return 'border-amber-500 bg-amber-500/10 shadow-[0_0_30px_rgba(245,158,11,0.3)]';
        case 'settled':
            return 'border-green-500 bg-green-500/10 shadow-[0_0_30px_rgba(34,197,94,0.2)]';
        default:
            return 'border-white/10 bg-transparent';
    }
}

function pickFocusedTable(state: FloorStateFile): DemoTableId {
    const sorted = DEMO_TABLES
        .map((table) => state.tables[table.id])
        .sort((left, right) => {
            const leftScore = left.status === 'idle' ? 0 : 1;
            const rightScore = right.status === 'idle' ? 0 : 1;

            if (leftScore !== rightScore) {
                return rightScore - leftScore;
            }

            return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
        });

    return sorted[0]?.tableId ?? 'table-04';
}

export default function FloorSyncBoard({
    dict,
    initialCategories = [],
    initialDishes = [],
    initialFloorState,
    locale = 'en',
    sessionId,
}: {
    dict: AppDictionary;
    initialCategories?: FloorCategory[];
    initialDishes?: FloorDish[];
    initialFloorState: FloorStateFile;
    locale?: string;
    sessionId: string;
}) {
    const ui = locale === 'ka' ? UI.ka : UI.en;
    const floorSyncCopy = dict.floorSync as Partial<Record<string, string>> | undefined;
    const [floorState, setFloorState] = useState(initialFloorState);
    const [focusedTableId, setFocusedTableId] = useState<DemoTableId>(() => pickFocusedTable(initialFloorState));

    const activeDishes = useMemo(
        () =>
            initialDishes
                .filter((dish) => dish.status === 'active' && !dish.soldOut)
                .sort((left, right) => left.order - right.order),
        [initialDishes]
    );
    const activeCategories = useMemo(
        () =>
            initialCategories
                .filter((category) => category.status === 'active')
                .sort((left, right) => left.order - right.order),
        [initialCategories]
    );
    const dishMap = useMemo(
        () => new Map(activeDishes.map((dish) => [dish.id, dish])),
        [activeDishes]
    );

    useEffect(() => {
        let cancelled = false;

        const loadState = async () => {
            try {
                const params = new URLSearchParams({ session: sessionId });
                const response = await fetch(`/api/demo/floor-state?${params.toString()}`, {
                    cache: 'no-store',
                });

                if (!response.ok) {
                    return;
                }

                const payload = (await response.json()) as FloorStateFile;

                if (!cancelled) {
                    setFloorState(payload);
                }
            } catch {
                // keep the last known board state when polling fails
            }
        };

        loadState();
        const interval = window.setInterval(loadState, 1500);

        return () => {
            cancelled = true;
            window.clearInterval(interval);
        };
    }, [sessionId]);

    const resolvedFocusedTableId = floorState.tables[focusedTableId]
        ? focusedTableId
        : pickFocusedTable(floorState);
    const focusedTable = floorState.tables[resolvedFocusedTableId];
    const focusedDish = focusedTable.selectedDishId ? dishMap.get(focusedTable.selectedDishId) ?? null : null;
    const focusedItems = focusedTable.cart.reduce((sum, item) => sum + item.quantity, 0);
    const focusedTotal = focusedTable.cart.reduce((sum, item) => {
        const dish = dishMap.get(item.dishId);
        return sum + (dish ? item.quantity * dish.priceMinor : 0);
    }, 0);
    const latestAction = focusedTable.activityFeed[0];

    return (
        <div className="w-full max-w-[1600px] mx-auto py-10 md:py-12 lg:py-14">
            <div className="flex flex-col items-center justify-center text-center mb-10 md:mb-12 lg:mb-16 px-4 sm:px-6">
                <p className="text-[10px] uppercase tracking-[0.32em] text-stone-500 mb-4">
                    {floorSyncCopy?.eyebrow || ui.currentSession}
                </p>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight mb-4">
                    {floorSyncCopy?.title || ui.pageTitle}
                </h2>
                <p className="text-stone-400 max-w-3xl text-sm md:text-base leading-relaxed px-2 sm:px-0">
                    {floorSyncCopy?.subtitle || ui.pageSubtitle}
                </p>
            </div>

            <section className="flex flex-col w-full min-h-[420px] lg:min-h-0 px-4 sm:px-6 lg:px-8 xl:px-12">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-4 gap-4">
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.28em] text-stone-500 mb-2">
                            {ui.operatorTerminal}
                        </p>
                        <h2 className="text-xl font-light tracking-tight">
                            {floorSyncCopy?.floorBoard || ui.floorBoard}
                        </h2>
                        <p className="text-xs text-stone-500">
                            {floorSyncCopy?.realTime || ui.watchingLive}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-neutral-900 border border-neutral-800 w-fit">
                        <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-[10px] font-sans uppercase tracking-[0.2em]">
                            {floorSyncCopy?.liveFeed || ui.live}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 2xl:grid-cols-[minmax(0,1.2fr)_360px] gap-5 flex-1">
                    <div
                        className="relative border border-neutral-800 bg-[#0A0A0A] overflow-hidden min-h-[420px] sm:min-h-[500px] md:min-h-[580px] lg:min-h-[620px] rounded-3xl"
                        style={{ backgroundSize: '32px 32px', backgroundImage: 'radial-gradient(circle,#333 1px,transparent 1px)' }}
                    >
                        {DEMO_TABLES.map((table) => {
                            const state = floorState.tables[table.id];
                            const label = getStatusLabel(state.status, ui);
                            const selectedDish = state.selectedDishId ? dishMap.get(state.selectedDishId) ?? null : null;
                            const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
                            const latestEvent = state.activityFeed[0];
                            const position = TABLE_POSITIONS[table.id];
                            const isFocused = resolvedFocusedTableId === table.id;

                            return (
                                <button
                                    key={table.id}
                                    type="button"
                                    onClick={() => setFocusedTableId(table.id)}
                                    className={`${position.wrapper} group text-left`}
                                >
                                    <div
                                        className={`w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full border flex items-center justify-center relative transition-all duration-500 ${getStatusClasses(state.status)} ${isFocused ? 'ring-2 ring-white/20' : ''}`}
                                    >
                                        <div className="flex flex-col items-center justify-center gap-1">
                                            <div
                                                className={`text-xs font-bold uppercase ${state.status === 'fired' ? 'text-amber-400' : state.status === 'settled' ? 'text-green-400' : 'text-white/80'}`}
                                            >
                                                {table.label}
                                            </div>
                                            <div
                                                className={`text-[8px] uppercase tracking-[0.24em] ${state.status === 'idle' ? 'text-stone-600' : state.status === 'fired' ? 'text-amber-400' : state.status === 'settled' ? 'text-green-400' : 'text-stone-300'}`}
                                            >
                                                {label}
                                            </div>
                                        </div>

                                        {(state.status === 'browsing' || state.status === 'ordering') && (
                                            <div className="absolute inset-0 rounded-full border border-white/20 animate-pulse opacity-30"></div>
                                        )}
                                        {state.status === 'fired' && (
                                            <div className="absolute inset-0 rounded-full border border-amber-500 animate-ping opacity-20"></div>
                                        )}

                                        {totalItems > 0 && state.status !== 'settled' && (
                                            <div className="absolute -right-2 -top-2 min-w-[24px] h-[24px] px-1 rounded-full bg-amber-500 text-black text-[10px] font-bold flex items-center justify-center border border-black shadow-lg">
                                                {totalItems}
                                            </div>
                                        )}

                                        <div
                                            className={`absolute -top-14 sm:-top-16 left-1/2 -translate-x-1/2 max-w-[180px] sm:max-w-none text-center whitespace-normal sm:whitespace-nowrap bg-black/85 backdrop-blur-md rounded border border-white/10 px-3 py-2 shadow-2xl text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-stone-200 transition-all duration-500 ${state.status !== 'idle' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'}`}
                                        >
                                            {latestEvent?.label || ui.waitingForGuest}
                                        </div>

                                        <div
                                            className={`absolute ${position.panel} w-[220px] sm:w-56 bg-black/85 backdrop-blur-md rounded-2xl border p-3 sm:p-4 shadow-2xl z-30 transition-all duration-500 ${isFocused && state.status !== 'idle' ? 'opacity-100 scale-100 border-white/10' : 'opacity-0 scale-95 border-neutral-800 pointer-events-none'}`}
                                        >
                                            <div className="flex items-start justify-between gap-3 mb-3">
                                                <div>
                                                    <p className="text-[9px] uppercase tracking-[0.22em] text-stone-500 mb-1">
                                                        {ui.currentFocus}
                                                    </p>
                                                    <p className="text-sm text-white">
                                                                {selectedDish
                                                                    ? getDishTitle(selectedDish, locale)
                                                                    : getCategoryLabel(
                                                                        state.selectedCategory,
                                                                        activeCategories,
                                                                        locale,
                                                                        floorSyncCopy?.all || ui.allCategories,
                                                                        ui.noCategoryFocused
                                                                    )}
                                                    </p>
                                                </div>
                                                <span
                                                    className={`text-[9px] uppercase tracking-[0.2em] px-2 py-1 rounded-full border ${state.status === 'fired' ? 'border-amber-500/50 text-amber-400 bg-amber-500/10' : state.status === 'settled' ? 'border-green-500/50 text-green-400 bg-green-500/10' : 'border-white/10 text-stone-300 bg-white/[0.03]'}`}
                                                >
                                                    {label}
                                                </span>
                                            </div>
                                            <div className="space-y-2 text-xs">
                                                <div className="flex items-center justify-between gap-3 text-stone-400">
                                                    <span>{ui.activeCategory}</span>
                                                    <span className="text-stone-200 text-right">
                                                        {getCategoryLabel(
                                                            state.selectedCategory,
                                                            activeCategories,
                                                            locale,
                                                            floorSyncCopy?.all || ui.allCategories,
                                                            ui.noCategoryFocused
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between gap-3 text-stone-400">
                                                    <span>{ui.viewedDish}</span>
                                                    <span className="text-stone-200 text-right line-clamp-1 truncate">
                                                        {selectedDish
                                                            ? getDishTitle(selectedDish, locale)
                                                            : '—'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between gap-3 text-stone-400">
                                                    <span>{ui.items}</span>
                                                    <span className="text-stone-200">{totalItems}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div
                                            className={`absolute -top-12 left-1/2 -translate-x-1/2 bg-green-950 border border-green-500/50 text-green-400 px-3 py-1 text-[10px] font-mono tracking-widest uppercase rounded shadow-2xl transition-all duration-500 ${state.status === 'settled' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
                                        >
                                            PAID / CLEAR
                                        </div>
                                    </div>
                                </button>
                            );
                        })}

                        <div className="hidden sm:flex absolute top-[36%] left-[58%] w-28 md:w-32 h-14 md:h-16 rounded-md border border-neutral-800 bg-neutral-900/50 items-center justify-center">
                            <span className="text-[10px] text-stone-600 font-bold uppercase">T-12</span>
                        </div>
                        <div className="hidden lg:flex absolute top-[65%] left-[70%] w-40 h-20 rounded-full border border-white/20 bg-transparent items-center justify-center">
                            <span className="text-[10px] text-stone-500 font-bold uppercase">Booth B-1</span>
                        </div>

                        <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 flex flex-col gap-2 sm:gap-3 bg-black/60 backdrop-blur-md border border-white/10 p-3 sm:p-4 rounded-2xl max-w-[190px] sm:max-w-none">
                            <div className="flex items-center gap-3">
                                <div className="h-3 w-3 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                                <span className="text-[10px] uppercase tracking-widest text-stone-300">
                                    {ui.actionRequired}
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-3 w-3 rounded-full border-2 border-white/30"></div>
                                <span className="text-[10px] uppercase tracking-widest text-stone-300">
                                    {ui.browsingActive}
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-3 w-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]"></div>
                                <span className="text-[10px] uppercase tracking-widest text-stone-300">
                                    {ui.clearedPaid}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-1 gap-5 h-full">
                        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
                            <div className="flex items-start justify-between gap-3 mb-5">
                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.24em] text-stone-500 mb-2">
                                        {ui.terminalSummary}
                                    </p>
                                    <h3 className="text-lg font-light text-white">
                                        {getDemoTableLabel(focusedTable.tableId)}
                                    </h3>
                                </div>
                                <span
                                    className={`rounded-full border px-3 py-1 text-[9px] uppercase tracking-[0.22em] ${focusedTable.status === 'fired' ? 'border-amber-500/50 bg-amber-500/10 text-amber-400' : focusedTable.status === 'settled' ? 'border-green-500/50 bg-green-500/10 text-green-400' : 'border-white/10 bg-white/[0.03] text-stone-300'}`}
                                >
                                    {getStatusLabel(focusedTable.status, ui)}
                                </span>
                            </div>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-start justify-between gap-3">
                                    <span className="text-stone-500">{ui.activeCategory}</span>
                                    <span className="text-stone-200 text-right">
                                        {getCategoryLabel(
                                            focusedTable.selectedCategory,
                                            activeCategories,
                                            locale,
                                            floorSyncCopy?.all || ui.allCategories,
                                            ui.noCategoryFocused
                                        )}
                                    </span>
                                </div>
                                <div className="flex items-start justify-between gap-3">
                                    <span className="text-stone-500">{ui.viewedDish}</span>
                                    <span className="text-stone-200 text-right">
                                        {focusedDish ? getDishTitle(focusedDish, locale) : ui.noDishViewed}
                                    </span>
                                </div>
                                <div className="flex items-start justify-between gap-3">
                                    <span className="text-stone-500">{ui.cartTotal}</span>
                                    <span className="text-stone-200 text-right">
                                        {formatCurrency(
                                            focusedTotal / 100,
                                            focusedDish?.currency,
                                            locale
                                        )}
                                    </span>
                                </div>
                                <div className="flex items-start justify-between gap-3">
                                    <span className="text-stone-500">{ui.items}</span>
                                    <span className="text-stone-200 text-right">{focusedItems}</span>
                                </div>
                                <div className="flex items-start justify-between gap-3">
                                    <span className="text-stone-500">{ui.liveSince}</span>
                                    <span className="text-stone-200 text-right">
                                        {formatEventTime(focusedTable.sessionStartedAt, locale)}
                                    </span>
                                </div>
                                <div className="flex items-start justify-between gap-3">
                                    <span className="text-stone-500">{ui.lastAction}</span>
                                    <span className="text-stone-200 text-right">
                                        {formatEventTime(latestAction?.createdAt || null, locale)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 sm:p-5 h-[280px] sm:h-[300px] 2xl:h-[400px] 2xl:flex-1 min-h-0 overflow-hidden flex flex-col">
                            <div className="flex items-start justify-between gap-3 mb-5 flex-shrink-0 flex-col">
                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.24em] text-stone-500 mb-2">
                                        {ui.activityFeed}
                                    </p>
                                    <h3 className="text-lg font-light text-white">{ui.protectedFeed}</h3>
                                </div>
                                <span className="text-[9px] uppercase tracking-[0.22em] text-stone-500">
                                    {ui.focusHint}
                                </span>
                            </div>
                            <div className="space-y-3 overflow-y-auto no-scrollbar flex-1">
                                {focusedTable.activityFeed.length > 0 ? (
                                    focusedTable.activityFeed.map((event, index) => (
                                        <div
                                            key={event.id}
                                            className={`rounded-2xl border p-3 ${index === 0 ? 'border-white/15 bg-black/30' : 'border-white/8 bg-black/20'}`}
                                        >
                                            <div className="flex items-start justify-between gap-3 mb-1">
                                                <p className="text-sm text-white">{event.label}</p>
                                                <span className="text-[10px] uppercase tracking-[0.22em] text-stone-500 shrink-0">
                                                    {formatEventTime(event.createdAt, locale)}
                                                </span>
                                            </div>
                                            <p className="text-xs text-stone-400">{event.meta || '—'}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="rounded-2xl border border-white/8 bg-black/20 p-4 text-sm text-stone-500">
                                        {ui.waitingForGuest}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
