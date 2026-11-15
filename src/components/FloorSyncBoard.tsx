'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import type { AppDictionary } from '@/lib/dictionaries';
import type {
    DemoTableId,
    FloorActivityEvent,
    FloorStateFile,
    FloorTableState,
} from '@/lib/floor-sync';
import {
    DEMO_TABLES,
    getDemoTableLabel,
    getFloorSyncGuestPath,
} from '@/lib/floor-sync';
import {
    type FloorCategory,
    type FloorDish,
    formatCurrency,
    formatEventTime,
    getCategoryLabel,
    getDishTitle,
} from '@/lib/floor-sync-view';
import TableActions from './TableActions';

const TABLE_POSITIONS: Record<DemoTableId, { wrapper: string; panel: string }> = {
    'table-01': { wrapper: 'absolute top-[14%] left-[74%]', panel: 'left-1/2 -translate-x-1/2 top-[112%] xl:left-auto xl:right-[110%] xl:-translate-x-0 xl:top-1/2 xl:-translate-y-1/2' },
    'table-04': { wrapper: 'absolute top-[20%] left-[14%]', panel: 'left-1/2 -translate-x-1/2 top-[112%] xl:left-[115%] xl:top-1/2 xl:-translate-y-1/2 xl:-translate-x-0' },
    'table-08': { wrapper: 'absolute top-[68%] left-[30%]', panel: 'left-1/2 -translate-x-1/2 bottom-[112%] xl:left-[115%] xl:bottom-auto xl:top-1/2 xl:-translate-y-1/2 xl:-translate-x-0' },
};

type DashboardTabId = 'overview' | 'live' | 'insights' | 'ai' | 'scan';
type InsightTone = 'amber' | 'emerald' | 'sky' | 'rose';
type ShowcasePanel = {
    title: string;
    description: string;
    action: string;
    tab: Exclude<DashboardTabId, 'overview'>;
    badge: string;
};
type ShowcaseMove = { title: string; detail: string };
type ShowcaseInsight = {
    eyebrow: string;
    title: string;
    description: string;
    metric: string;
    action: string;
    tone: InsightTone;
};
type ShowcaseCapability = { title: string; description: string; icon: string };
type ShowcasePrompt = {
    id: string;
    question: string;
    signal: string;
    answer: string;
    actions: string[];
};
type Showcase = {
    panels: ShowcasePanel[];
    notes: string[];
    moves: ShowcaseMove[];
    insights: ShowcaseInsight[];
    aiSummary: string;
    aiCapabilities: ShowcaseCapability[];
    aiPrompts: ShowcasePrompt[];
};
type ShowcaseTemplate = Showcase & {
    fallbacks: {
        primaryDish: string;
        secondaryDish: string;
        dessertDish: string;
        spotlight: string;
        dessert: string;
        mains: string;
    };
};
type DashboardUi = {
    browsing: string;
    ordering: string;
    sent: string;
    completed: string;
    idle: string;
    currentFocus: string;
    activityFeed: string;
    terminalSummary: string;
    viewedDish: string;
    activeCategory: string;
    cartTotal: string;
    items: string;
    waitingForGuest: string;
    actionRequired: string;
    browsingActive: string;
    clearedPaid: string;
    noDishViewed: string;
    noCategoryFocused: string;
    liveSince: string;
    lastAction: string;
    protectedFeed: string;
    focusHint: string;
    allCategories: string;
    none: string;
    paidClear: string;
    sessionStarted: string;
    browsingCategory: string;
    viewingDish: string;
    addedToCart: string;
    removedFromCart: string;
    quantityUpdated: string;
    orderConfirmed: string;
    tableCleared: string;
};
type DashboardCopy = {
    rail: {
        title: string;
        exit: string;
    };
    tabs: Record<
        DashboardTabId,
        {
            label: string;
            badge: string;
        }
    >;
    ui: DashboardUi;
    overview: {
        eyebrow: string;
        title: string;
        description: string;
        snapshotEyebrow: string;
        liveLayerLabel: string;
        liveLayerValue: string;
        modeledLayersLabel: string;
        modeledLayersValue: string;
        lastLiveSyncLabel: string;
        framingEyebrow: string;
        framingBody: string;
        storyEyebrow: string;
        storyTitle: string;
        storyPending: string;
        aiPreviewEyebrow: string;
        aiPreviewTitle: string;
        aiPreviewAction: string;
    };
    live: {
        eyebrow: string;
        liveSessionFeed: string;
        markerLabel: string;
        boothLabel: string;
    };
    insights: {
        eyebrow: string;
        title: string;
        description: string;
        badge: string;
        movesTitle: string;
        suggestedActionTitle: string;
    };
    ai: {
        eyebrow: string;
        title: string;
        description: string;
        badge: string;
        summaryTitle: string;
        capabilitiesTitle: string;
        askTitle: string;
        responseTitle: string;
    };
    scan: {
        eyebrow: string;
        title: string;
        description: string;
        badge: string;
        recommended: string;
        active: string;
        stepsTitle: string;
        steps: string[];
        qrTitle: string;
        qrDescription: string;
        qrAlt: string;
        preparing: string;
        note: string;
        sessionReference: string;
    };
    tableActions: {
        copied: string;
        copyLink: string;
        desktopPreview: string;
    };
    showcase: ShowcaseTemplate;
};
type FloorSyncDictionary = {
    floorBoard?: string;
    all?: string;
    dashboard: DashboardCopy;
};
type DashboardTabConfig = {
    id: DashboardTabId;
    label: string;
    badge: string;
    icon: string;
};

const TAB_ORDER: DashboardTabId[] = ['overview', 'live', 'insights', 'ai', 'scan'];
const TAB_ICONS: Record<DashboardTabId, string> = {
    overview: 'space_dashboard',
    live: 'table_restaurant',
    insights: 'insights',
    ai: 'psychology_alt',
    scan: 'qr_code_scanner',
};

function interpolate(template: string, values: Record<string, string | number>) {
    return template.replace(/\{(\w+)\}/g, (_, key: string) => `${values[key] ?? ''}`);
}

function buildTabs(copy: DashboardCopy): DashboardTabConfig[] {
    return TAB_ORDER.map((id) => ({
        id,
        label: copy.tabs[id].label,
        badge: copy.tabs[id].badge,
        icon: TAB_ICONS[id],
    }));
}

function statusLabel(status: FloorTableState['status'], ui: DashboardUi) {
    if (status === 'browsing') return ui.browsing;
    if (status === 'ordering') return ui.ordering;
    if (status === 'fired') return ui.sent;
    if (status === 'settled') return ui.completed;
    return ui.idle;
}

function localizeActivityLabel(event: FloorActivityEvent, ui: DashboardUi) {
    if (event.type === 'session_started') return ui.sessionStarted;
    if (event.type === 'category_focus') return ui.browsingCategory;
    if (event.type === 'dish_view') return ui.viewingDish;
    if (event.type === 'item_added') return ui.addedToCart;
    if (event.type === 'item_removed') return ui.removedFromCart;
    if (event.type === 'quantity_changed') return ui.quantityUpdated;
    if (event.type === 'order_confirmed') return ui.orderConfirmed;
    if (event.type === 'table_cleared') return ui.tableCleared;
    return event.label;
}

function statusClasses(status: FloorTableState['status']) {
    if (status === 'browsing') return 'border-white/40 bg-white/[0.04] shadow-[0_0_24px_rgba(255,255,255,0.08)]';
    if (status === 'ordering') return 'border-white/70 bg-white/[0.06] shadow-[0_0_28px_rgba(255,255,255,0.14)]';
    if (status === 'fired') return 'border-amber-500 bg-amber-500/10 shadow-[0_0_30px_rgba(245,158,11,0.3)]';
    if (status === 'settled') return 'border-green-500 bg-green-500/10 shadow-[0_0_30px_rgba(34,197,94,0.2)]';
    return 'border-white/10 bg-transparent';
}

function pickFocusedTable(state: FloorStateFile): DemoTableId {
    const sorted = DEMO_TABLES.map((table) => state.tables[table.id]).sort((left, right) => {
        const leftScore = left.status === 'idle' ? 0 : 1;
        const rightScore = right.status === 'idle' ? 0 : 1;
        if (leftScore !== rightScore) return rightScore - leftScore;
        return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
    });
    return sorted[0]?.tableId ?? 'table-04';
}

function pickQrTable(state: FloorStateFile): DemoTableId {
    const idleTable = DEMO_TABLES.find((table) => state.tables[table.id].status === 'idle');
    return idleTable?.id ?? 'table-08';
}

function toneClasses(tone: InsightTone) {
    if (tone === 'amber') return { panel: 'border-amber-500/25 bg-amber-500/10', badge: 'border-amber-400/30 bg-amber-500/15 text-amber-200', accent: 'text-amber-300' };
    if (tone === 'emerald') return { panel: 'border-emerald-500/25 bg-emerald-500/10', badge: 'border-emerald-400/30 bg-emerald-500/15 text-emerald-200', accent: 'text-emerald-300' };
    if (tone === 'sky') return { panel: 'border-sky-500/25 bg-sky-500/10', badge: 'border-sky-400/30 bg-sky-500/15 text-sky-200', accent: 'text-sky-300' };
    return { panel: 'border-rose-500/25 bg-rose-500/10', badge: 'border-rose-400/30 bg-rose-500/15 text-rose-200', accent: 'text-rose-300' };
}

function buildShowcase(
    template: ShowcaseTemplate,
    activeDishes: FloorDish[],
    activeCategories: FloorCategory[],
    locale: string,
    allCategoriesLabel: string
): Showcase {
    const primaryDish = getDishTitle(activeDishes[0] ?? null, locale) || template.fallbacks.primaryDish;
    const secondaryDish = getDishTitle(activeDishes[1] ?? null, locale) || template.fallbacks.secondaryDish;
    const dessertDish = getDishTitle(activeDishes[2] ?? null, locale) || template.fallbacks.dessertDish;
    const categoryName = (keyword: string, fallback: string) => {
        const match = activeCategories.find((category) => [...Object.values(category.title ?? {}), category.slug].join(' ').toLowerCase().includes(keyword));
        return match ? getCategoryLabel(match.id, activeCategories, locale, allCategoriesLabel, fallback) : fallback;
    };
    const spotlight = categoryName('khach', template.fallbacks.spotlight);
    const dessert = categoryName('dessert', template.fallbacks.dessert);
    const mains = categoryName('main', template.fallbacks.mains);
    const values = { primaryDish, secondaryDish, dessertDish, spotlight, dessert, mains };

    return {
        panels: template.panels.map((panel) => ({
            ...panel,
            title: interpolate(panel.title, values),
            description: interpolate(panel.description, values),
            action: interpolate(panel.action, values),
            badge: interpolate(panel.badge, values),
        })),
        notes: template.notes.map((note) => interpolate(note, values)),
        moves: template.moves.map((move) => ({
            title: interpolate(move.title, values),
            detail: interpolate(move.detail, values),
        })),
        insights: template.insights.map((insight) => ({
            ...insight,
            eyebrow: interpolate(insight.eyebrow, values),
            title: interpolate(insight.title, values),
            description: interpolate(insight.description, values),
            metric: interpolate(insight.metric, values),
            action: interpolate(insight.action, values),
        })),
        aiSummary: interpolate(template.aiSummary, values),
        aiCapabilities: template.aiCapabilities.map((capability) => ({
            ...capability,
            title: interpolate(capability.title, values),
            description: interpolate(capability.description, values),
        })),
        aiPrompts: template.aiPrompts.map((prompt) => ({
            ...prompt,
            question: interpolate(prompt.question, values),
            signal: interpolate(prompt.signal, values),
            answer: interpolate(prompt.answer, values),
            actions: prompt.actions.map((action) => interpolate(action, values)),
        })),
    };
}

function DashboardRail({
    activeTab,
    locale,
    onSelectTab,
    copy,
    tabs,
}: {
    activeTab: DashboardTabId;
    locale: string;
    onSelectTab: (tab: DashboardTabId) => void;
    copy: DashboardCopy;
    tabs: DashboardTabConfig[];
}) {
    return (
        <aside className="shrink-0 border-b border-white/10 bg-[#080b10] lg:h-full lg:w-50 lg:border-b-0 lg:border-r">
            <div className="flex flex-col justify-around p-3 sm:p-4 lg:h-full lg:grid-rows-[auto_auto_auto_1fr_auto] lg:p-5">
                <div>
                    <p className="text-[0.5rem] uppercase tracking-[0.28em] text-stone-500">MAITRISE Atelier</p>
                    <h2 className="mt-2 text-sm font-light tracking-tight text-stone-300">{copy.rail.title}</h2>
                </div>
                <nav className="flex flex-col max-sm:flex-row gap-2 sm:grid-cols-4 lg:grid-cols-1">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => onSelectTab(tab.id)}
                                className={`rounded-2xl cursor-pointer px-3 py-3 text-left transition-all duration-200 ${isActive
                                        ? 'bg-white/[0.08] text-white shadow-[0_18px_45px_rgba(0,0,0,0.28)]'
                                        : 'bg-white/[0.03] text-stone-300 hover:bg-white/[0.05]'
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <span className="material-symbols-outlined text-[18px]" aria-hidden="true">{tab.icon}</span>
                                    <p className="text-sm font-medium max-sm:text-sm">{tab.label}</p>

                                </div>
                                <span className={`rounded-full max-sm:hidden border px-2 py-0.5 text-[9px] uppercase tracking-[0.22em] ${isActive ? 'border-white/15 bg-white/[0.08] text-white' : 'border-white/10 bg-white/[0.04] text-stone-500'}`}>{tab.badge}</span>

                            </button>
                        );
                    })}
                </nav>
                <div></div>

                <Link href={`/${locale}`} className="inline-flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-stone-200 transition-colors hover:border-white/20 hover:bg-white/[0.06]">
                    <span className="inline-flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]" aria-hidden="true">logout</span>
                        {copy.rail.exit}
                    </span>
                    <span className="material-symbols-outlined text-[18px]" aria-hidden="true">arrow_forward</span>
                </Link>
            </div>
        </aside>
    );
}

function OverviewTab({
    liveTableCount,
    pendingTableCount,
    latestUpdateLabel,
    onSelectTab,
    showcase,
    copy,
}: {
    liveTableCount: number;
    pendingTableCount: number;
    latestUpdateLabel: string;
    onSelectTab: (tab: DashboardTabId) => void;
    showcase: Showcase;
    copy: DashboardCopy;
}) {
    return (
        <section className="h-full overflow-y-auto pr-1">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_360px]">
                <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] p-5 sm:p-6">
                    <p className="text-[10px] uppercase tracking-[0.32em] text-stone-500">{copy.overview.eyebrow}</p>
                    <h2 className="mt-3 text-3xl font-light tracking-tight text-white sm:text-4xl">{copy.overview.title}</h2>
                    <p className="mt-3 max-w-3xl text-sm leading-relaxed text-stone-400 sm:text-base">
                        {copy.overview.description}
                    </p>
                    <div className="mt-6 grid gap-3 md:grid-cols-3">
                        {showcase.panels.map((panel) => (
                            <button key={panel.title} type="button" onClick={() => onSelectTab(panel.tab)} className="rounded-3xl border border-white/10 bg-black/25 p-4 text-left transition-all hover:border-white/20 hover:bg-black/35">
                                <div className="flex items-center justify-between gap-3">
                                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[9px] uppercase tracking-[0.22em] text-stone-400">{panel.badge}</span>
                                    <span className="material-symbols-outlined text-[18px] text-stone-500" aria-hidden="true">arrow_outward</span>
                                </div>
                                <h3 className="mt-4 text-lg font-light text-white">{panel.title}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-stone-400">{panel.description}</p>
                                <span className="mt-4 inline-flex items-center gap-2 text-sm text-amber-300">{panel.action}</span>
                            </button>
                        ))}
                    </div>
                </div>
                <div className="grid gap-4">
                    <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
                        <p className="text-[10px] uppercase tracking-[0.24em] text-stone-500">{copy.overview.snapshotEyebrow}</p>
                        <div className="mt-4 grid gap-3">
                            <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><p className="text-xs uppercase tracking-[0.22em] text-stone-500">{copy.overview.liveLayerLabel}</p><p className="mt-2 text-2xl font-light text-white">{interpolate(copy.overview.liveLayerValue, { count: liveTableCount })}</p></div>
                            <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><p className="text-xs uppercase tracking-[0.22em] text-stone-500">{copy.overview.modeledLayersLabel}</p><p className="mt-2 text-2xl font-light text-white">{copy.overview.modeledLayersValue}</p></div>
                            <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><p className="text-xs uppercase tracking-[0.22em] text-stone-500">{copy.overview.lastLiveSyncLabel}</p><p className="mt-2 text-2xl font-light text-white">{latestUpdateLabel}</p></div>
                        </div>
                    </div>
                    <div className="rounded-[28px] border border-amber-500/20 bg-amber-500/10 p-5">
                        <p className="text-[10px] uppercase tracking-[0.24em] text-amber-200">{copy.overview.framingEyebrow}</p>
                        <p className="mt-3 text-sm leading-relaxed text-amber-50/90">{copy.overview.framingBody}</p>
                    </div>
                </div>
            </div>
            <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
                <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
                    <div className="flex items-end justify-between gap-4">
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.24em] text-stone-500">{copy.overview.storyEyebrow}</p>
                            <h3 className="mt-2 text-2xl font-light text-white">{copy.overview.storyTitle}</h3>
                        </div>
                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-stone-400">{interpolate(copy.overview.storyPending, { count: pendingTableCount })}</span>
                    </div>
                    <div className="mt-6 grid gap-3 md:grid-cols-2">
                        {showcase.notes.map((note) => (
                            <div key={note} className="rounded-3xl border border-white/10 bg-black/20 p-4 text-sm leading-relaxed text-stone-300">{note}</div>
                        ))}
                    </div>
                </div>
                <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
                    <p className="text-[10px] uppercase tracking-[0.24em] text-stone-500">{copy.overview.aiPreviewEyebrow}</p>
                    <h3 className="mt-2 text-2xl font-light text-white">{copy.overview.aiPreviewTitle}</h3>
                    <p className="mt-4 rounded-3xl border border-white/10 bg-black/25 p-4 text-sm leading-relaxed text-stone-300">{showcase.aiSummary}</p>
                    <button type="button" onClick={() => onSelectTab('ai')} className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white transition-colors hover:border-white/20 hover:bg-white/[0.08]">{copy.overview.aiPreviewAction}</button>
                </div>
            </div>
        </section>
    );
}

function LiveBoardTab({
    floorState,
    activeCategories,
    activeDishes,
    dishMap,
    focusedTableId,
    locale,
    onFocusTable,
    copy,
    floorBoardTitle,
    allCategoriesLabel,
}: {
    floorState: FloorStateFile;
    activeCategories: FloorCategory[];
    activeDishes: FloorDish[];
    dishMap: Map<string, FloorDish>;
    focusedTableId: DemoTableId;
    locale: string;
    onFocusTable: (tableId: DemoTableId) => void;
    copy: DashboardCopy;
    floorBoardTitle: string;
    allCategoriesLabel: string;
}) {
    const ui = copy.ui;
    const resolvedFocusedTableId = floorState.tables[focusedTableId] ? focusedTableId : pickFocusedTable(floorState);
    const focusedTable = floorState.tables[resolvedFocusedTableId];
    const focusedDish = focusedTable.selectedDishId ? dishMap.get(focusedTable.selectedDishId) ?? null : null;
    const focusedItems = focusedTable.cart.reduce((sum, item) => sum + item.quantity, 0);
    const focusedTotal = focusedTable.cart.reduce((sum, item) => {
        const dish = dishMap.get(item.dishId);
        return sum + (dish ? item.quantity * dish.priceMinor : 0);
    }, 0);
    const latestAction = focusedTable.activityFeed[0];
    const defaultCurrency = focusedDish?.currency || activeDishes[0]?.currency;

    return (
        <section className="flex h-full min-h-0 flex-col gap-4 overflow-y-auto pr-1">

            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                    <p className="text-[10px] uppercase tracking-[0.24em] text-stone-500">{copy.live.eyebrow}</p>
                    <h2 className="mt-2 text-2xl font-light tracking-tight text-white">{floorBoardTitle}</h2>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-4 py-2 text-xs uppercase tracking-[0.24em] text-emerald-200">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    {copy.live.liveSessionFeed}
                </div>
            </div>

            <div className="grid flex-1 min-h-0 gap-4 xl:grid-cols-[minmax(0,1.72fr)_360px]">
                <div className="relative min-h-115 overflow-hidden rounded-[30px] border border-neutral-800 bg-[#0A0A0A] xl:min-h-0" style={{ backgroundSize: '32px 32px', backgroundImage: 'radial-gradient(circle,#333 1px,transparent 1px)' }}>
                    {DEMO_TABLES.map((table) => {
                        const state = floorState.tables[table.id];
                        const label = statusLabel(state.status, ui);
                        const selectedDish = state.selectedDishId ? dishMap.get(state.selectedDishId) ?? null : null;
                        const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
                        const latestEvent = state.activityFeed[0];
                        const position = TABLE_POSITIONS[table.id];
                        const isFocused = resolvedFocusedTableId === table.id;

                        return (
                            <button key={table.id} type="button" onClick={() => onFocusTable(table.id)} className={`${position.wrapper} group text-left`}>
                                <div className={`relative flex h-24 w-24 items-center justify-center rounded-full border transition-all duration-500 sm:h-28 sm:w-28 md:h-32 md:w-32 ${statusClasses(state.status)} ${isFocused ? 'ring-2 ring-white/20' : ''}`}>
                                    <div className="flex flex-col items-center justify-center gap-1">
                                        <div className={`text-xs font-bold uppercase ${state.status === 'fired' ? 'text-amber-400' : state.status === 'settled' ? 'text-green-400' : 'text-white/80'}`}>{table.label}</div>
                                        <div className={`text-[8px] uppercase tracking-[0.24em] ${state.status === 'idle' ? 'text-stone-600' : state.status === 'fired' ? 'text-amber-400' : state.status === 'settled' ? 'text-green-400' : 'text-stone-300'}`}>{label}</div>
                                    </div>
                                    {(state.status === 'browsing' || state.status === 'ordering') && <div className="absolute inset-0 rounded-full border border-white/20 opacity-30 animate-pulse"></div>}
                                    {state.status === 'fired' && <div className="absolute inset-0 rounded-full border border-amber-500 opacity-20 animate-ping"></div>}
                                    {totalItems > 0 && state.status !== 'settled' && <div className="absolute -right-2 -top-2 flex h-[24px] min-w-[24px] items-center justify-center rounded-full border border-black bg-amber-500 px-1 text-[10px] font-bold text-black shadow-lg">{totalItems}</div>}
                                    <div className={`absolute left-1/2 -top-14 max-w-[180px] -translate-x-1/2 whitespace-normal rounded border border-white/10 bg-black/85 px-3 py-2 text-center text-[9px] uppercase tracking-[0.2em] text-stone-200 shadow-2xl backdrop-blur-md transition-all duration-500 sm:-top-16 sm:max-w-none sm:whitespace-nowrap sm:text-[10px] ${state.status !== 'idle' ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'}`}>{latestEvent ? localizeActivityLabel(latestEvent, ui) : ui.waitingForGuest}</div>
                                    <div className={`absolute z-30 w-[220px] rounded-2xl border bg-black/85 p-3 shadow-2xl backdrop-blur-md transition-all duration-500 sm:w-56 sm:p-4 ${position.panel} ${isFocused && state.status !== 'idle' ? 'scale-100 border-white/10 opacity-100' : 'pointer-events-none scale-95 border-neutral-800 opacity-0'}`}>
                                        <div className="mb-3 flex items-start justify-between gap-3">
                                            <div>
                                                <p className="mb-1 text-[9px] uppercase tracking-[0.22em] text-stone-500">{ui.currentFocus}</p>
                                                <p className="text-sm text-white">{selectedDish ? getDishTitle(selectedDish, locale) : getCategoryLabel(state.selectedCategory, activeCategories, locale, allCategoriesLabel, ui.noCategoryFocused)}</p>
                                            </div>
                                            <span className={`rounded-full border px-2 py-1 text-[9px] uppercase tracking-[0.2em] ${state.status === 'fired' ? 'border-amber-500/50 bg-amber-500/10 text-amber-400' : state.status === 'settled' ? 'border-green-500/50 bg-green-500/10 text-green-400' : 'border-white/10 bg-white/[0.03] text-stone-300'}`}>{label}</span>
                                        </div>
                                        <div className="space-y-2 text-xs">
                                            <div className="flex items-center justify-between gap-3 text-stone-400"><span>{ui.activeCategory}</span><span className="text-right text-stone-200">{getCategoryLabel(state.selectedCategory, activeCategories, locale, allCategoriesLabel, ui.noCategoryFocused)}</span></div>
                                            <div className="flex items-center justify-between gap-3 text-stone-400"><span>{ui.viewedDish}</span><span className="line-clamp-1 truncate text-right text-stone-200">{selectedDish ? getDishTitle(selectedDish, locale) : ui.none}</span></div>
                                            <div className="flex items-center justify-between gap-3 text-stone-400"><span>{ui.items}</span><span className="text-stone-200">{totalItems}</span></div>
                                        </div>
                                    </div>
                                    <div className={`absolute -top-12 left-1/2 -translate-x-1/2 rounded border border-green-500/50 bg-green-950 px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-green-400 shadow-2xl transition-all duration-500 ${state.status === 'settled' ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'}`}>{ui.paidClear}</div>
                                </div>
                            </button>
                        );
                    })}
                    <div className="absolute left-[58%] top-[36%] hidden h-14 w-28 items-center justify-center rounded-md border border-neutral-800 bg-neutral-900/50 sm:flex md:h-16 md:w-32"><span className="text-[10px] font-bold uppercase text-stone-600">{copy.live.markerLabel}</span></div>
                    <div className="absolute left-[70%] top-[65%] hidden h-20 w-40 items-center justify-center rounded-full border border-white/20 bg-transparent lg:flex"><span className="text-[10px] font-bold uppercase text-stone-500">{copy.live.boothLabel}</span></div>
                    <div className="absolute bottom-4 left-4 flex max-w-[190px] flex-col gap-2 rounded-2xl border border-white/10 bg-black/60 p-3 backdrop-blur-md sm:bottom-6 sm:left-6 sm:max-w-none sm:gap-3 sm:p-4">
                        <div className="flex items-center gap-3"><div className="h-3 w-3 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div><span className="text-[10px] uppercase tracking-widest text-stone-300">{ui.actionRequired}</span></div>
                        <div className="flex items-center gap-3"><div className="h-3 w-3 rounded-full border-2 border-white/30"></div><span className="text-[10px] uppercase tracking-widest text-stone-300">{ui.browsingActive}</span></div>
                        <div className="flex items-center gap-3"><div className="h-3 w-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]"></div><span className="text-[10px] uppercase tracking-widest text-stone-300">{ui.clearedPaid}</span></div>
                    </div>
                </div>
                <div className="grid min-h-[320px] gap-4 xl:min-h-0 xl:grid-rows-[auto_minmax(0,1fr)]">
                    <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
                        <div className="2xl:mb-5 flex items-start justify-between gap-3">
                            <div>
                                <p className="mb-2 text-[10px] uppercase tracking-[0.24em] text-stone-500">{ui.terminalSummary}</p>
                                <h3 className="text-lg font-light text-white">{getDemoTableLabel(focusedTable.tableId)}</h3>
                            </div>
                            <span className={`rounded-full border px-3 py-1 text-[9px] uppercase tracking-[0.22em] ${focusedTable.status === 'fired' ? 'border-amber-500/50 bg-amber-500/10 text-amber-400' : focusedTable.status === 'settled' ? 'border-green-500/50 bg-green-500/10 text-green-400' : 'border-white/10 bg-white/[0.03] text-stone-300'}`}>{statusLabel(focusedTable.status, ui)}</span>
                        </div>
                        <div className="space-y-1 2xl:space-y-3 text-[0.75rem] 2xl:text-sm">
                            <div className="flex items-start justify-between 2xl:gap-3"><span className="text-stone-500">{ui.activeCategory}</span><span className="text-right text-stone-200">{getCategoryLabel(focusedTable.selectedCategory, activeCategories, locale, allCategoriesLabel, ui.noCategoryFocused)}</span></div>
                            <div className="flex items-start justify-between gap-3"><span className="text-stone-500">{ui.viewedDish}</span><span className="text-right text-stone-200">{focusedDish ? getDishTitle(focusedDish, locale) : ui.noDishViewed}</span></div>
                            <div className="flex items-start justify-between gap-3"><span className="text-stone-500">{ui.cartTotal}</span><span className="text-right text-stone-200">{formatCurrency(focusedTotal / 100, defaultCurrency, locale)}</span></div>
                            <div className="flex items-start justify-between gap-3"><span className="text-stone-500">{ui.items}</span><span className="text-right text-stone-200">{focusedItems}</span></div>
                            <div className="flex items-start justify-between gap-3"><span className="text-stone-500">{ui.liveSince}</span><span className="text-right text-stone-200">{formatEventTime(focusedTable.sessionStartedAt, locale)}</span></div>
                            <div className="flex items-start justify-between gap-3"><span className="text-stone-500">{ui.lastAction}</span><span className="text-right text-stone-200">{formatEventTime(latestAction?.createdAt || null, locale)}</span></div>
                        </div>
                    </div>
                    <div className="flex min-h-75 flex-col overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.03] py-3 px-5 xl:min-h-0">
                        <div className="mb-3 2xl:mb-5 flex shrink-0 flex-col items-start justify-between gap-3">
                            <div>
                                <p className="mb-2 text-[10px] uppercase tracking-[0.24em] text-stone-500">{ui.activityFeed}</p>
                                <h3 className="text-base font-light text-white">{ui.protectedFeed}</h3>
                            </div>
                            <span className="text-[9px] uppercase tracking-[0.22em] text-stone-500">{ui.focusHint}</span>
                        </div>
                        <div className="flex-1 space-y-3 overflow-y-auto">
                            {focusedTable.activityFeed.length > 0 ? focusedTable.activityFeed.map((event, index) => (
                                <div key={event.id} className={`rounded-2xl border p-3 ${index === 0 ? 'border-white/15 bg-black/30' : 'border-white/8 bg-black/20'}`}>
                                    <div className="mb-1 flex items-start justify-between gap-3">
                                        <p className="text-sm text-white">{localizeActivityLabel(event, ui)}</p>
                                        <span className="shrink-0 text-[10px] uppercase tracking-[0.22em] text-stone-500">{formatEventTime(event.createdAt, locale)}</span>
                                    </div>
                                    <p className="text-xs text-stone-400">{event.meta || ui.none}</p>
                                </div>
                            )) : <div className="rounded-2xl border border-white/8 bg-black/20 p-4 text-sm text-stone-500">{ui.waitingForGuest}</div>}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function InsightsTab({
    showcase,
    copy,
}: {
    showcase: Showcase;
    copy: DashboardCopy;
}) {
    return (
        <section className="h-full overflow-y-auto pr-1">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_360px]">
                <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.28em] text-stone-500">{copy.insights.eyebrow}</p>
                            <h2 className="mt-3 text-3xl font-light tracking-tight text-white">{copy.insights.title}</h2>
                            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-stone-400 sm:text-base">{copy.insights.description}</p>
                        </div>
                        <span className="rounded-full border border-amber-500/25 bg-amber-500/10 px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-amber-200">{copy.insights.badge}</span>
                    </div>
                </div>
                <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
                    <p className="text-[10px] uppercase tracking-[0.24em] text-stone-500">{copy.insights.movesTitle}</p>
                    <div className="mt-4 space-y-3">
                        {showcase.moves.map((move) => (
                            <div key={move.title} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                                <p className="text-sm text-white">{move.title}</p>
                                <p className="mt-2 text-sm leading-relaxed text-stone-400">{move.detail}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="mt-4 grid gap-4 xl:grid-cols-2">
                {showcase.insights.map((insight) => {
                    const tone = toneClasses(insight.tone);
                    return (
                        <article key={insight.title} className={`rounded-[28px] border p-5 sm:p-6 ${tone.panel}`}>
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-[10px] uppercase tracking-[0.28em] text-stone-300/80">{insight.eyebrow}</span>
                                <span className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.22em] ${tone.badge}`}>{insight.metric}</span>
                            </div>
                            <h3 className="mt-4 text-2xl font-light leading-tight text-white">{insight.title}</h3>
                            <p className="mt-3 text-sm leading-relaxed text-stone-300">{insight.description}</p>
                            <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
                                <p className="text-[10px] uppercase tracking-[0.24em] text-stone-500">{copy.insights.suggestedActionTitle}</p>
                                <p className={`mt-2 text-sm ${tone.accent}`}>{insight.action}</p>
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}

function AiTab({
    showcase,
    selectedPromptId,
    onSelectPrompt,
    copy,
}: {
    showcase: Showcase;
    selectedPromptId: string;
    onSelectPrompt: (promptId: string) => void;
    copy: DashboardCopy;
}) {
    const prompt = showcase.aiPrompts.find((item) => item.id === selectedPromptId) || showcase.aiPrompts[0];

    return (
        <section className="h-full overflow-y-auto pr-1">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_360px]">
                <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.28em] text-stone-500">{copy.ai.eyebrow}</p>
                            <h2 className="mt-3 text-3xl font-light tracking-tight text-white">{copy.ai.title}</h2>
                            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-stone-400 sm:text-base">{copy.ai.description}</p>
                        </div>
                        <span className="rounded-full border border-sky-500/25 bg-sky-500/10 px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-sky-200">{copy.ai.badge}</span>
                    </div>
                    <div className="mt-6 rounded-[28px] border border-white/10 bg-black/25 p-5">
                        <p className="text-[10px] uppercase tracking-[0.24em] text-stone-500">{copy.ai.summaryTitle}</p>
                        <p className="mt-4 text-base leading-relaxed text-stone-200">{showcase.aiSummary}</p>
                    </div>
                </div>
                <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
                    <p className="text-[10px] uppercase tracking-[0.24em] text-stone-500">{copy.ai.capabilitiesTitle}</p>
                    <div className="mt-4 space-y-3">
                        {showcase.aiCapabilities.map((capability) => (
                            <div key={capability.title} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                                <div className="flex items-start gap-3">
                                    <span className="material-symbols-outlined text-[18px] text-sky-300" aria-hidden="true">{capability.icon}</span>
                                    <div>
                                        <p className="text-sm text-white">{capability.title}</p>
                                        <p className="mt-1 text-sm leading-relaxed text-stone-400">{capability.description}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="mt-4 grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
                <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-[10px] uppercase tracking-[0.24em] text-stone-500">{copy.ai.askTitle}</p>
                    <div className="mt-4 space-y-2">
                        {showcase.aiPrompts.map((item) => {
                            const isActive = item.id === prompt.id;
                            return (
                                <button key={item.id} type="button" onClick={() => onSelectPrompt(item.id)} className={`w-full rounded-2xl border p-4 text-left transition-colors ${isActive ? 'border-white/20 bg-white/[0.08] text-white' : 'border-white/10 bg-black/20 text-stone-300 hover:border-white/20 hover:bg-black/30'}`}>
                                    <p className="text-sm leading-relaxed">{item.question}</p>
                                    <p className="mt-2 text-[10px] uppercase tracking-[0.22em] text-stone-500">{item.signal}</p>
                                </button>
                            );
                        })}
                    </div>
                </div>
                <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.24em] text-stone-500">{copy.ai.responseTitle}</p>
                            <h3 className="mt-2 text-2xl font-light text-white">{prompt.question}</h3>
                        </div>
                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-stone-400">{prompt.signal}</span>
                    </div>
                    <div className="mt-6 rounded-[28px] border border-sky-500/20 bg-sky-500/10 p-5">
                        <p className="text-sm leading-relaxed text-sky-50">{prompt.answer}</p>
                    </div>
                    <div className="mt-5 grid gap-3 md:grid-cols-3">
                        {prompt.actions.map((action) => (
                            <div key={action} className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-relaxed text-stone-300">{action}</div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

function ScanQrTab({
    floorState,
    locale,
    sessionId,
    selectedTableId,
    qrSrc,
    guestUrl,
    guestPath,
    onSelectTable,
    copy,
}: {
    floorState: FloorStateFile;
    locale: string;
    sessionId: string;
    selectedTableId: DemoTableId;
    qrSrc: string;
    guestUrl: string;
    guestPath: string;
    onSelectTable: (tableId: DemoTableId) => void;
    copy: DashboardCopy;
}) {
    const ui = copy.ui;

    return (
        <section className="h-full overflow-y-auto pr-1">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_380px]">
                <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.28em] text-stone-500">{copy.scan.eyebrow}</p>
                            <h2 className="mt-3 text-3xl font-light tracking-tight text-white">{copy.scan.title}</h2>
                            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-stone-400 sm:text-base">
                                {copy.scan.description}
                            </p>
                        </div>
                        <span className="rounded-full border border-amber-500/25 bg-amber-500/10 px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-amber-200">{copy.scan.badge}</span>
                    </div>

                    <div className="mt-6 grid gap-3 md:grid-cols-3">
                        {DEMO_TABLES.map((table) => {
                            const status = floorState.tables[table.id].status;
                            const isActive = selectedTableId === table.id;
                            return (
                                <button
                                    key={table.id}
                                    type="button"
                                    onClick={() => onSelectTable(table.id)}
                                    className={`rounded-3xl border p-4 text-left transition-colors ${isActive
                                            ? 'border-white/20 bg-white/[0.08]'
                                            : 'border-white/10 bg-black/20 hover:border-white/20 hover:bg-black/30'
                                        }`}
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <h3 className="text-lg font-light text-white">{table.label}</h3>
                                        <span className={`rounded-full border px-2 py-1 text-[9px] uppercase tracking-[0.22em] ${status === 'idle'
                                                ? 'border-white/10 bg-white/[0.04] text-stone-400'
                                                : status === 'fired'
                                                    ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                                                    : status === 'settled'
                                                        ? 'border-green-500/40 bg-green-500/10 text-green-300'
                                                        : 'border-sky-500/30 bg-sky-500/10 text-sky-200'
                                            }`}>
                                            {statusLabel(status, ui)}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-sm text-stone-400">
                                        {status === 'idle'
                                            ? copy.scan.recommended
                                            : copy.scan.active}
                                    </p>
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-6 rounded-[28px] border border-white/10 bg-black/25 p-5">
                        <p className="text-[10px] uppercase tracking-[0.24em] text-stone-500">{copy.scan.stepsTitle}</p>
                        <div className="mt-4 grid gap-3 md:grid-cols-3">
                            {copy.scan.steps.map((step) => (
                                <div key={step} className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-relaxed text-stone-300">
                                    {step}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
                    <p className="text-[10px] uppercase tracking-[0.24em] text-stone-500">{copy.scan.qrTitle}</p>
                    <h3 className="mt-2 text-2xl font-light text-white">{getDemoTableLabel(selectedTableId)}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-stone-400">
                        {copy.scan.qrDescription}
                    </p>

                    <div className="mt-6 rounded-[28px] bg-white p-5">
                        {qrSrc ? (
                            <Image
                                src={qrSrc}
                                alt={interpolate(copy.scan.qrAlt, { table: getDemoTableLabel(selectedTableId) })}
                                width={320}
                                height={320}
                                unoptimized
                                className="h-auto w-full rounded-2xl"
                            />
                        ) : (
                            <div className="flex aspect-square items-center justify-center rounded-2xl border border-stone-200 bg-stone-100 text-sm text-stone-500">
                                {copy.scan.preparing}
                            </div>
                        )}
                    </div>

                    <div className="mt-5 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm leading-relaxed text-amber-50/90">
                        {copy.scan.note}
                    </div>

                    {guestUrl ? <TableActions scanUrl={guestUrl} scanPath={guestPath} labels={copy.tableActions} /> : null}

                    <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                        <p className="text-[10px] uppercase tracking-[0.22em] text-stone-500">{copy.scan.sessionReference}</p>
                        <p className="mt-2 font-mono text-sm text-stone-200">{sessionId}</p>
                        <p className="mt-3 text-sm text-stone-400">{`/${locale}/floor-sync`}</p>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default function FloorSyncBoard({
    dict,
    initialCategories = [],
    initialDishes = [],
    initialFloorState,
    initialTab = 'overview',
    locale = 'en',
    sessionId,
}: {
    dict: AppDictionary;
    initialCategories?: FloorCategory[];
    initialDishes?: FloorDish[];
    initialFloorState: FloorStateFile;
    initialTab?: DashboardTabId;
    locale?: string;
    sessionId: string;
}) {
    const floorSyncCopy = dict.floorSync as FloorSyncDictionary;
    const dashboardCopy = floorSyncCopy.dashboard as DashboardCopy;
    const floorBoardTitle = floorSyncCopy.floorBoard || dashboardCopy.live.eyebrow;
    const allCategoriesLabel = floorSyncCopy.all || dashboardCopy.ui.allCategories;
    const [floorState, setFloorState] = useState(initialFloorState);
    const [focusedTableId, setFocusedTableId] = useState<DemoTableId>(() => pickFocusedTable(initialFloorState));
    const [qrTableId, setQrTableId] = useState<DemoTableId>(() => pickQrTable(initialFloorState));
    const [activeTab, setActiveTab] = useState<DashboardTabId>(initialTab);
    const [selectedPromptId, setSelectedPromptId] = useState('conversion');
    const [browserOrigin, setBrowserOrigin] = useState('');
    const [qrSrc, setQrSrc] = useState('');
    const activeDishes = useMemo(() => initialDishes.filter((dish) => dish.status === 'active' && !dish.soldOut).sort((left, right) => left.order - right.order), [initialDishes]);
    const activeCategories = useMemo(() => initialCategories.filter((category) => category.status === 'active').sort((left, right) => left.order - right.order), [initialCategories]);
    const dishMap = useMemo(() => new Map(activeDishes.map((dish) => [dish.id, dish])), [activeDishes]);
    const tabs = useMemo(() => buildTabs(dashboardCopy), [dashboardCopy]);
    const showcase = useMemo(() => buildShowcase(dashboardCopy.showcase, activeDishes, activeCategories, locale, allCategoriesLabel), [activeCategories, activeDishes, allCategoriesLabel, dashboardCopy.showcase, locale]);
    const liveTableCount = useMemo(() => DEMO_TABLES.filter((table) => floorState.tables[table.id].status !== 'idle').length, [floorState]);
    const pendingTableCount = useMemo(() => DEMO_TABLES.filter((table) => {
        const status = floorState.tables[table.id].status;
        return status === 'ordering' || status === 'fired';
    }).length, [floorState]);
    const latestUpdateLabel = useMemo(() => formatEventTime(floorState.updatedAt, locale), [floorState.updatedAt, locale]);
    const guestPath = useMemo(() => getFloorSyncGuestPath(locale, sessionId, qrTableId), [locale, qrTableId, sessionId]);
    const guestUrl = useMemo(() => {
        if (!browserOrigin) return '';
        return new URL(guestPath, browserOrigin).toString();
    }, [browserOrigin, guestPath]);

    useEffect(() => {
        let cancelled = false;
        const loadState = async () => {
            try {
                const params = new URLSearchParams({ session: sessionId });
                const response = await fetch(`/api/demo/floor-state?${params.toString()}`, { cache: 'no-store' });
                if (!response.ok) return;
                const payload = (await response.json()) as FloorStateFile;
                if (!cancelled) setFloorState(payload);
            } catch {
                // keep last known state
            }
        };
        loadState();
        const interval = window.setInterval(loadState, 1500);
        return () => {
            cancelled = true;
            window.clearInterval(interval);
        };
    }, [sessionId]);

    useEffect(() => {
        setActiveTab(initialTab);
    }, [initialTab]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setBrowserOrigin(window.location.origin);
        }
    }, []);

    useEffect(() => {
        let cancelled = false;

        const buildQr = async () => {
            if (!guestUrl) {
                setQrSrc('');
                return;
            }

            const { default: QRCode } = await import('qrcode');
            const value = await QRCode.toDataURL(guestUrl, {
                margin: 1,
                width: 320,
                color: {
                    dark: '#0a0a0a',
                    light: '#ffffff',
                },
            });

            if (!cancelled) {
                setQrSrc(value);
            }
        };

        buildQr().catch(() => {
            if (!cancelled) {
                setQrSrc('');
            }
        });

        return () => {
            cancelled = true;
        };
    }, [guestUrl]);

    return (
        <div className="flex h-full w-full flex-col overflow-hidden bg-[#05070a] text-white lg:flex-row">
            <DashboardRail activeTab={activeTab} locale={locale} onSelectTab={setActiveTab} copy={dashboardCopy} tabs={tabs} />
            <main className="min-h-0 min-w-0 flex-1 overflow-hidden p-3 sm:p-4 lg:p-6">
                {activeTab === 'overview' && <OverviewTab liveTableCount={liveTableCount} pendingTableCount={pendingTableCount} latestUpdateLabel={latestUpdateLabel} onSelectTab={setActiveTab} showcase={showcase} copy={dashboardCopy} />}
                {activeTab === 'live' && <LiveBoardTab floorState={floorState} activeCategories={activeCategories} activeDishes={activeDishes} dishMap={dishMap} focusedTableId={focusedTableId} locale={locale} onFocusTable={setFocusedTableId} copy={dashboardCopy} floorBoardTitle={floorBoardTitle} allCategoriesLabel={allCategoriesLabel} />}
                {activeTab === 'insights' && <InsightsTab showcase={showcase} copy={dashboardCopy} />}
                {activeTab === 'ai' && <AiTab showcase={showcase} selectedPromptId={selectedPromptId} onSelectPrompt={setSelectedPromptId} copy={dashboardCopy} />}
                {activeTab === 'scan' && <ScanQrTab floorState={floorState} locale={locale} sessionId={sessionId} selectedTableId={qrTableId} qrSrc={qrSrc} guestUrl={guestUrl} guestPath={guestPath} onSelectTable={setQrTableId} copy={dashboardCopy} />}
            </main>
        </div>
    );
}
