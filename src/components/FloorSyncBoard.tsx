'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import type { AppDictionary } from '@/lib/dictionaries';
import type { DemoTableId, FloorStateFile, FloorTableState } from '@/lib/floor-sync';
import {
    DEMO_TABLES,
    getDemoTableLabel,
    getFloorSyncGuestPath,
    getFloorSyncHubPath,
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

const UI = {
    en: {
        browsing: 'Browsing',
        ordering: 'Ordering',
        sent: 'Sent',
        completed: 'Completed',
        idle: 'Idle',
        floorBoard: 'Floor Board',
        currentFocus: 'Current Focus',
        activityFeed: 'Activity Feed',
        terminalSummary: 'Terminal Summary',
        viewedDish: 'Viewed dish',
        activeCategory: 'Active category',
        cartTotal: 'Cart total',
        items: 'Items',
        waitingForGuest: 'Waiting for guest interaction',
        actionRequired: 'Action Required',
        browsingActive: 'Browsing / Active',
        clearedPaid: 'Cleared / Paid',
        noDishViewed: 'No dish viewed yet',
        noCategoryFocused: 'No category focused yet',
        liveSince: 'Live since',
        lastAction: 'Last action',
        protectedFeed: 'Protected internal feed',
        focusHint: 'Click a table to inspect its live feed.',
        allCategories: 'All',
    },
    ka: {
        browsing: 'Browsing',
        ordering: 'Ordering',
        sent: 'Sent',
        completed: 'Completed',
        idle: 'Idle',
        floorBoard: 'Floor Board',
        currentFocus: 'Current Focus',
        activityFeed: 'Activity Feed',
        terminalSummary: 'Terminal Summary',
        viewedDish: 'Viewed dish',
        activeCategory: 'Active category',
        cartTotal: 'Cart total',
        items: 'Items',
        waitingForGuest: 'Waiting for guest interaction',
        actionRequired: 'Action Required',
        browsingActive: 'Browsing / Active',
        clearedPaid: 'Cleared / Paid',
        noDishViewed: 'No dish viewed yet',
        noCategoryFocused: 'No category focused yet',
        liveSince: 'Live since',
        lastAction: 'Last action',
        protectedFeed: 'Protected internal feed',
        focusHint: 'Click a table to inspect its live feed.',
        allCategories: 'All',
    },
} as const;

const TABLE_POSITIONS: Record<DemoTableId, { wrapper: string; panel: string }> = {
    'table-01': { wrapper: 'absolute top-[14%] left-[74%]', panel: 'left-1/2 -translate-x-1/2 top-[112%] xl:left-auto xl:right-[110%] xl:-translate-x-0 xl:top-1/2 xl:-translate-y-1/2' },
    'table-04': { wrapper: 'absolute top-[20%] left-[14%]', panel: 'left-1/2 -translate-x-1/2 top-[112%] xl:left-[115%] xl:top-1/2 xl:-translate-y-1/2 xl:-translate-x-0' },
    'table-08': { wrapper: 'absolute top-[68%] left-[30%]', panel: 'left-1/2 -translate-x-1/2 bottom-[112%] xl:left-[115%] xl:bottom-auto xl:top-1/2 xl:-translate-y-1/2 xl:-translate-x-0' },
};

type DashboardTabId = 'overview' | 'live' | 'insights' | 'ai' | 'scan';
type InsightTone = 'amber' | 'emerald' | 'sky' | 'rose';
type Showcase = {
    panels: Array<{ title: string; description: string; action: string; tab: Exclude<DashboardTabId, 'overview'>; badge: string }>;
    notes: string[];
    moves: Array<{ title: string; detail: string }>;
    insights: Array<{ eyebrow: string; title: string; description: string; metric: string; action: string; tone: InsightTone }>;
    aiSummary: string;
    aiCapabilities: Array<{ title: string; description: string; icon: string }>;
    aiPrompts: Array<{ id: string; question: string; signal: string; answer: string; actions: string[] }>;
};

const TABS = [
    { id: 'overview', label: 'Home', description: 'Start here', badge: 'Overview', icon: 'space_dashboard' },
    { id: 'live', label: 'Live', description: 'Real feed', badge: 'Real', icon: 'table_restaurant' },
    { id: 'insights', label: 'Insights', description: 'Modeled', badge: 'Modeled', icon: 'insights' },
    { id: 'ai', label: 'AI', description: 'Modeled', badge: 'Modeled', icon: 'psychology_alt' },
    { id: 'scan', label: 'Scan QR', description: 'Demo only', badge: 'Demo', icon: 'qr_code_scanner' },
] as const;

function statusLabel(status: FloorTableState['status'], ui: (typeof UI)[keyof typeof UI]) {
    if (status === 'browsing') return ui.browsing;
    if (status === 'ordering') return ui.ordering;
    if (status === 'fired') return ui.sent;
    if (status === 'settled') return ui.completed;
    return ui.idle;
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

function buildShowcase(activeDishes: FloorDish[], activeCategories: FloorCategory[], locale: string): Showcase {
    const primaryDish = getDishTitle(activeDishes[0] ?? null, locale) || 'Signature Khachapuri';
    const secondaryDish = getDishTitle(activeDishes[1] ?? null, locale) || 'Chef Grill Plate';
    const dessertDish = getDishTitle(activeDishes[2] ?? null, locale) || 'Honey Cake';
    const categoryName = (keyword: string, fallback: string) => {
        const match = activeCategories.find((category) => [...Object.values(category.title ?? {}), category.slug].join(' ').toLowerCase().includes(keyword));
        return match ? getCategoryLabel(match.id, activeCategories, locale, 'All', fallback) : fallback;
    };
    const spotlight = categoryName('khach', 'Khachapuri');
    const dessert = categoryName('dessert', 'Desserts');
    const mains = categoryName('main', 'Grill & Mains');

    return {
        panels: [
            { title: 'Live operations board', description: 'Keep the current floor visualization intact so stakeholders still see real guest activity.', action: 'Open live board', tab: 'live', badge: 'Real data' },
            { title: 'Action-oriented insights', description: 'Show how behavior patterns become concrete menu and placement decisions.', action: 'Open insights', tab: 'insights', badge: 'Modeled layer' },
            { title: 'AI interpretation', description: 'Demonstrate summaries, anomaly detection, and plain-language recommendations.', action: 'Open AI view', tab: 'ai', badge: 'Modeled layer' },
        ],
        notes: [
            'These intelligence tabs are demonstrational. Their numbers are modeled, not pulled from live sessions.',
            'The goal is to show owners, chefs, and managers what the finished product layer can look like.',
            'Real analytics can later replace every modeled card without changing the interface structure.',
        ],
        moves: [
            { title: `Reframe ${primaryDish}`, detail: 'Treat it as a presentation problem first, not a demand problem.' },
            { title: `Promote ${dessert}`, detail: 'Introduce desserts earlier so guests see them before mentally closing the meal.' },
            { title: `Use ${mains} as a control block`, detail: 'It can anchor A/B tests because it already attracts stable intent.' },
            { title: 'Separate tourist behavior by time', detail: 'Model a dedicated 20:00 to 22:30 visitor path for non-local language users.' },
        ],
        insights: [
            { eyebrow: 'Prime attention', title: `${spotlight} receives the heaviest attention between 19:00 and 21:00.`, description: 'Guests open this section early in dinner service, then return to it after first-round drinks.', metric: '+34% detail opens', action: 'Move this category into the first visible row during peak hours.', tone: 'amber' },
            { eyebrow: 'Low follow-through', title: `${primaryDish} earns many opens but lags behind ${secondaryDish} in follow-through.`, description: 'The item looks interesting enough to inspect, but the current presentation does not close the decision.', metric: '22 opens / 3 add-to-cart signals', action: 'Refresh the photo first, then test a tighter description.', tone: 'rose' },
            { eyebrow: 'Language behavior', title: 'Russian-language visitors stay longer inside menu details than English-language visitors.', description: 'That usually signals stronger evaluation behavior, not necessarily stronger intent to order.', metric: '+41 sec average dwell time', action: 'Use shorter decision cues for English and deeper detail blocks for Russian.', tone: 'sky' },
            { eyebrow: 'Table signal', title: 'Tables 4 and 8 show the highest repeat digital engagement.', description: 'These tables reopen dish details more often and spend longer in comparison behavior.', metric: '2.3x repeat interactions', action: 'Use these tables for placement experiments and higher-margin upsells.', tone: 'emerald' },
            { eyebrow: 'Placement test', title: `${secondaryDish} underperforms despite stronger placement than ${primaryDish}.`, description: 'Visibility alone is not enough when the item story and first image are weaker than the alternative.', metric: '-18% relative attention yield', action: 'Swap copy or photography before allocating more prime placement.', tone: 'amber' },
            { eyebrow: 'Late-session demand', title: `${dessert} receives strong late-session attention but stays too hidden on first entry.`, description: 'Guests discover sweet options deep into the journey, after most primary decisions are already made.', metric: '27% of late-session detail views', action: 'Bring desserts forward earlier in the browsing path or after mains.', tone: 'sky' },
        ],
        aiSummary: `This week, ${mains} gained strong attention from English-language visitors after 20:00. ${dessert} detail views increased late in the journey, but conversion signals stayed flat. Consider surfacing desserts earlier and revising the presentation of ${primaryDish} and ${dessertDish}.`,
        aiCapabilities: [
            { title: 'Weekly summary', description: 'Turn raw behavior into a short operator briefing written in plain language.', icon: 'calendar_view_week' },
            { title: 'Anomaly detection', description: 'Flag unusual drops, spikes, or sudden attention shifts before teams notice manually.', icon: 'warning' },
            { title: 'Underperforming dishes', description: 'Separate weak presentation from weak demand by comparing opens against follow-through.', icon: 'restaurant_menu' },
            { title: 'A/B interpretation', description: 'Explain whether featured slots, copy changes, or new photos actually improved behavior.', icon: 'compare_arrows' },
            { title: 'Seasonality spotting', description: 'Surface cyclical shifts by daypart, week, or visitor type without spreadsheet work.', icon: 'schedule' },
            { title: 'Language behavior', description: 'Compare how different language groups inspect categories, details, and menu depth.', icon: 'translate' },
        ],
        aiPrompts: [
            { id: 'conversion', question: 'Which dishes attract attention but probably fail to convert?', signal: 'High detail views, low follow-through', answer: `${primaryDish} stands out as the clearest presentation issue. Guests inspect it often, but modeled add-to-cart behavior is weak compared with ${secondaryDish}. ${dessertDish} shows a similar pattern later in the session, suggesting curiosity without enough confidence to act.`, actions: [`Replace the lead image for ${primaryDish}.`, 'Shorten the first two lines of the description to make the choice easier.', `Retest ${dessertDish} with an earlier placement and a tighter name card.`] },
            { id: 'categories', question: 'Which categories should we move higher?', signal: 'Strong demand hidden too deep', answer: `${spotlight} and ${dessert} both deserve earlier visibility. The first attracts peak-hour attention quickly, while the second earns late-session interest once guests finally discover it.`, actions: [`Move ${spotlight} into the first visible row at dinner launch.`, `Insert ${dessert} earlier after guests inspect ${mains}.`, 'Use one featured slot for a short high-margin category teaser.'] },
            { id: 'tourists', question: 'When do tourists interact most?', signal: 'Visitor behavior by time window', answer: 'Modeled tourist engagement climbs after 20:00 and stays strongest until roughly 22:30. That period shows the highest concentration of language switching, deep detail inspection, and comparison behavior.', actions: ['Schedule multilingual featured items for the evening window.', 'Show shorter decision cues early and richer stories one tap deeper.', 'Use this period for premium upsell experiments instead of lunch.'] },
            { id: 'tables', question: 'Which tables have the most digital engagement?', signal: 'Repeat interaction concentration', answer: 'Tables 4 and 8 produce the most modeled digital engagement. They reopen items more often, compare alternatives longer, and react more consistently to featured placements than the other demo tables.', actions: ['Prioritize these tables for placement experiments.', 'Watch whether staff service style changes the interaction depth.', 'Use their patterns as a baseline when new promotional logic is introduced.'] },
            { id: 'featured', question: 'Did the new featured items perform better than the previous ones?', signal: 'Modeled A/B comparison', answer: `The new featured slot increases visibility, but the improvement is uneven. ${secondaryDish} gains placement advantage without enough response, while ${primaryDish} still wins on pure attention even from a weaker slot.`, actions: ['Keep the experiment running, but swap the weaker featured creative.', 'Judge the slot by attention-to-action ratio, not by impressions alone.', 'Retain the winning story structure from the better-performing item.'] },
            { id: 'language', question: 'Which language users are more likely to inspect details?', signal: 'Depth of evaluation by language', answer: 'Russian-language visitors show the deepest modeled detail-inspection behavior. English-language visitors decide faster, but they also abandon detail pages sooner when the first image or first sentence is weak.', actions: ['Give Russian flows richer context and pairing suggestions.', 'Keep English flows sharper, faster, and visually decisive.', 'Use language-specific summaries rather than one universal description style.'] },
        ],
    };
}

function DashboardRail({
    activeTab,
    locale,
    onSelectTab,
}: {
    activeTab: DashboardTabId;
    locale: string;
    onSelectTab: (tab: DashboardTabId) => void;
}) {
    return (
        <aside className="shrink-0 border-b border-white/10 bg-[#080b10] lg:h-full lg:w-50 lg:border-b-0 lg:border-r">
            <div className="flex flex-col justify-around p-3 sm:p-4 lg:h-full lg:grid-rows-[auto_auto_auto_1fr_auto] lg:p-5">
                <div>
                    <p className="text-[0.5rem] uppercase tracking-[0.28em] text-stone-500">MAITRISE Atelier</p>
                    <h2 className="mt-2 text-sm font-light tracking-tight text-stone-300">Commercial Control</h2>
                </div>
                {/*
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                        <p className="text-[10px] uppercase tracking-[0.24em] text-stone-500">Live tables</p>
                        <p className="mt-2 text-2xl font-light text-white">{liveTableCount}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                        <p className="text-[10px] uppercase tracking-[0.24em] text-stone-500">Pending</p>
                        <p className="mt-2 text-2xl font-light text-white">{pendingTableCount}</p>
                    </div>
                </div>
                */}
                <nav className="flex flex-col max-sm:flex-row gap-2 sm:grid-cols-4 lg:grid-cols-1">
                    {TABS.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => onSelectTab(tab.id)}
                                className={`rounded-2xl cursor-pointer px-3 py-3 text-left transition-all duration-200 ${
                                    isActive
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

                <Link href={getFloorSyncHubPath(locale)} className="inline-flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-stone-200 transition-colors hover:border-white/20 hover:bg-white/[0.06]">
                    <span className="inline-flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]" aria-hidden="true">logout</span>
                        Exit Dashboard
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
}: {
    liveTableCount: number;
    pendingTableCount: number;
    latestUpdateLabel: string;
    onSelectTab: (tab: DashboardTabId) => void;
    showcase: Showcase;
}) {
    return (
        <section className="h-full overflow-y-auto pr-1">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_360px]">
                <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] p-5 sm:p-6">
                    <p className="text-[10px] uppercase tracking-[0.32em] text-stone-500">Dashboard Home</p>
                    <h2 className="mt-3 text-3xl font-light tracking-tight text-white sm:text-4xl">Commercial control, not just a menu feed.</h2>
                    <p className="mt-3 max-w-3xl text-sm leading-relaxed text-stone-400 sm:text-base">
                        This workspace combines one live operational tab with two modeled intelligence tabs so you can demonstrate what the finished restaurant system will feel like.
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
                        <p className="text-[10px] uppercase tracking-[0.24em] text-stone-500">Workspace snapshot</p>
                        <div className="mt-4 grid gap-3">
                            <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><p className="text-xs uppercase tracking-[0.22em] text-stone-500">Live layer</p><p className="mt-2 text-2xl font-light text-white">{liveTableCount} tables active</p></div>
                            <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><p className="text-xs uppercase tracking-[0.22em] text-stone-500">Modeled layers</p><p className="mt-2 text-2xl font-light text-white">2 intelligence tabs</p></div>
                            <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><p className="text-xs uppercase tracking-[0.22em] text-stone-500">Last live sync</p><p className="mt-2 text-2xl font-light text-white">{latestUpdateLabel}</p></div>
                        </div>
                    </div>
                    <div className="rounded-[28px] border border-amber-500/20 bg-amber-500/10 p-5">
                        <p className="text-[10px] uppercase tracking-[0.24em] text-amber-200">Demo framing</p>
                        <p className="mt-3 text-sm leading-relaxed text-amber-50/90">Keep the live board grounded in the current session. Use the insights and AI tabs to sell the future commercial value.</p>
                    </div>
                </div>
            </div>
            <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
                <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
                    <div className="flex items-end justify-between gap-4">
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.24em] text-stone-500">Stakeholder story</p>
                            <h3 className="mt-2 text-2xl font-light text-white">What this dashboard can communicate in one meeting</h3>
                        </div>
                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-stone-400">{pendingTableCount} pending tables</span>
                    </div>
                    <div className="mt-6 grid gap-3 md:grid-cols-2">
                        {showcase.notes.map((note) => (
                            <div key={note} className="rounded-3xl border border-white/10 bg-black/20 p-4 text-sm leading-relaxed text-stone-300">{note}</div>
                        ))}
                    </div>
                </div>
                <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
                    <p className="text-[10px] uppercase tracking-[0.24em] text-stone-500">AI preview</p>
                    <h3 className="mt-2 text-2xl font-light text-white">Plain-language weekly interpretation</h3>
                    <p className="mt-4 rounded-3xl border border-white/10 bg-black/25 p-4 text-sm leading-relaxed text-stone-300">{showcase.aiSummary}</p>
                    <button type="button" onClick={() => onSelectTab('ai')} className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white transition-colors hover:border-white/20 hover:bg-white/[0.08]">Open AI interpretation</button>
                </div>
            </div>
        </section>
    );
}

function LiveBoardTab({
    floorState,
    floorSyncCopy,
    activeCategories,
    activeDishes,
    dishMap,
    focusedTableId,
    locale,
    onFocusTable,
    ui,
}: {
    floorState: FloorStateFile;
    floorSyncCopy: Partial<Record<string, string>> | undefined;
    activeCategories: FloorCategory[];
    activeDishes: FloorDish[];
    dishMap: Map<string, FloorDish>;
    focusedTableId: DemoTableId;
    locale: string;
    onFocusTable: (tableId: DemoTableId) => void;
    ui: (typeof UI)[keyof typeof UI];
}) {
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
                        <p className="text-[10px] uppercase tracking-[0.24em] text-stone-500">Live Floor</p>
                        <h2 className="mt-2 text-2xl font-light tracking-tight text-white">{floorSyncCopy?.floorBoard || ui.floorBoard}</h2>
                    </div>
                    <div className="flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-4 py-2 text-xs uppercase tracking-[0.24em] text-emerald-200">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        Live session feed
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
                                    <div className={`absolute left-1/2 -top-14 max-w-[180px] -translate-x-1/2 whitespace-normal rounded border border-white/10 bg-black/85 px-3 py-2 text-center text-[9px] uppercase tracking-[0.2em] text-stone-200 shadow-2xl backdrop-blur-md transition-all duration-500 sm:-top-16 sm:max-w-none sm:whitespace-nowrap sm:text-[10px] ${state.status !== 'idle' ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'}`}>{latestEvent?.label || ui.waitingForGuest}</div>
                                    <div className={`absolute z-30 w-[220px] rounded-2xl border bg-black/85 p-3 shadow-2xl backdrop-blur-md transition-all duration-500 sm:w-56 sm:p-4 ${position.panel} ${isFocused && state.status !== 'idle' ? 'scale-100 border-white/10 opacity-100' : 'pointer-events-none scale-95 border-neutral-800 opacity-0'}`}>
                                        <div className="mb-3 flex items-start justify-between gap-3">
                                            <div>
                                                <p className="mb-1 text-[9px] uppercase tracking-[0.22em] text-stone-500">{ui.currentFocus}</p>
                                                <p className="text-sm text-white">{selectedDish ? getDishTitle(selectedDish, locale) : getCategoryLabel(state.selectedCategory, activeCategories, locale, floorSyncCopy?.all || ui.allCategories, ui.noCategoryFocused)}</p>
                                            </div>
                                            <span className={`rounded-full border px-2 py-1 text-[9px] uppercase tracking-[0.2em] ${state.status === 'fired' ? 'border-amber-500/50 bg-amber-500/10 text-amber-400' : state.status === 'settled' ? 'border-green-500/50 bg-green-500/10 text-green-400' : 'border-white/10 bg-white/[0.03] text-stone-300'}`}>{label}</span>
                                        </div>
                                        <div className="space-y-2 text-xs">
                                            <div className="flex items-center justify-between gap-3 text-stone-400"><span>{ui.activeCategory}</span><span className="text-right text-stone-200">{getCategoryLabel(state.selectedCategory, activeCategories, locale, floorSyncCopy?.all || ui.allCategories, ui.noCategoryFocused)}</span></div>
                                            <div className="flex items-center justify-between gap-3 text-stone-400"><span>{ui.viewedDish}</span><span className="line-clamp-1 truncate text-right text-stone-200">{selectedDish ? getDishTitle(selectedDish, locale) : 'None'}</span></div>
                                            <div className="flex items-center justify-between gap-3 text-stone-400"><span>{ui.items}</span><span className="text-stone-200">{totalItems}</span></div>
                                        </div>
                                    </div>
                                    <div className={`absolute -top-12 left-1/2 -translate-x-1/2 rounded border border-green-500/50 bg-green-950 px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-green-400 shadow-2xl transition-all duration-500 ${state.status === 'settled' ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'}`}>PAID / CLEAR</div>
                                </div>
                            </button>
                        );
                    })}
                    <div className="absolute left-[58%] top-[36%] hidden h-14 w-28 items-center justify-center rounded-md border border-neutral-800 bg-neutral-900/50 sm:flex md:h-16 md:w-32"><span className="text-[10px] font-bold uppercase text-stone-600">T-12</span></div>
                    <div className="absolute left-[70%] top-[65%] hidden h-20 w-40 items-center justify-center rounded-full border border-white/20 bg-transparent lg:flex"><span className="text-[10px] font-bold uppercase text-stone-500">Booth B-1</span></div>
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
                            <div className="flex items-start justify-between 2xl:gap-3"><span className="text-stone-500">{ui.activeCategory}</span><span className="text-right text-stone-200">{getCategoryLabel(focusedTable.selectedCategory, activeCategories, locale, floorSyncCopy?.all || ui.allCategories, ui.noCategoryFocused)}</span></div>
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
                                        <p className="text-sm text-white">{event.label}</p>
                                        <span className="shrink-0 text-[10px] uppercase tracking-[0.22em] text-stone-500">{formatEventTime(event.createdAt, locale)}</span>
                                    </div>
                                    <p className="text-xs text-stone-400">{event.meta || 'None'}</p>
                                </div>
                            )) : <div className="rounded-2xl border border-white/8 bg-black/20 p-4 text-sm text-stone-500">{ui.waitingForGuest}</div>}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function InsightsTab({ showcase }: { showcase: Showcase }) {
    return (
        <section className="h-full overflow-y-auto pr-1">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_360px]">
                <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.28em] text-stone-500">Modeled intelligence</p>
                            <h2 className="mt-3 text-3xl font-light tracking-tight text-white">Action-oriented insights</h2>
                            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-stone-400 sm:text-base">This tab shows how the product stops being a menu and becomes a decision tool. Every card below is demonstrational and intentionally modeled.</p>
                        </div>
                        <span className="rounded-full border border-amber-500/25 bg-amber-500/10 px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-amber-200">Demonstrational layer</span>
                    </div>
                </div>
                <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
                    <p className="text-[10px] uppercase tracking-[0.24em] text-stone-500">Recommended moves</p>
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
                                <p className="text-[10px] uppercase tracking-[0.24em] text-stone-500">Suggested action</p>
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
}: {
    showcase: Showcase;
    selectedPromptId: string;
    onSelectPrompt: (promptId: string) => void;
}) {
    const prompt = showcase.aiPrompts.find((item) => item.id === selectedPromptId) || showcase.aiPrompts[0];

    return (
        <section className="h-full overflow-y-auto pr-1">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_360px]">
                <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.28em] text-stone-500">Modeled intelligence</p>
                            <h2 className="mt-3 text-3xl font-light tracking-tight text-white">AI interpretation</h2>
                            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-stone-400 sm:text-base">The AI role here is simple: translate behavioral data into clear recommendations, summaries, and experiments that operators can act on.</p>
                        </div>
                        <span className="rounded-full border border-sky-500/25 bg-sky-500/10 px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-sky-200">Demonstrational layer</span>
                    </div>
                    <div className="mt-6 rounded-[28px] border border-white/10 bg-black/25 p-5">
                        <p className="text-[10px] uppercase tracking-[0.24em] text-stone-500">Weekly summary in plain language</p>
                        <p className="mt-4 text-base leading-relaxed text-stone-200">{showcase.aiSummary}</p>
                    </div>
                </div>
                <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
                    <p className="text-[10px] uppercase tracking-[0.24em] text-stone-500">What AI can do here</p>
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
                    <p className="text-[10px] uppercase tracking-[0.24em] text-stone-500">Ask the system</p>
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
                            <p className="text-[10px] uppercase tracking-[0.24em] text-stone-500">AI response</p>
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
}: {
    floorState: FloorStateFile;
    locale: string;
    sessionId: string;
    selectedTableId: DemoTableId;
    qrSrc: string;
    guestUrl: string;
    guestPath: string;
    onSelectTable: (tableId: DemoTableId) => void;
}) {
    return (
        <section className="h-full overflow-y-auto pr-1">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_380px]">
                <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.28em] text-stone-500">Demo utility</p>
                            <h2 className="mt-3 text-3xl font-light tracking-tight text-white">Scan QR to add another participant</h2>
                            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-stone-400 sm:text-base">
                                This tab is only for the presentation. It is not part of the regular dashboard product. Use it to bring one more phone into the same demo session.
                            </p>
                        </div>
                        <span className="rounded-full border border-amber-500/25 bg-amber-500/10 px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-amber-200">Demo only</span>
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
                                    className={`rounded-3xl border p-4 text-left transition-colors ${
                                        isActive
                                            ? 'border-white/20 bg-white/[0.08]'
                                            : 'border-white/10 bg-black/20 hover:border-white/20 hover:bg-black/30'
                                    }`}
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <h3 className="text-lg font-light text-white">{table.label}</h3>
                                        <span className={`rounded-full border px-2 py-1 text-[9px] uppercase tracking-[0.22em] ${
                                            status === 'idle'
                                                ? 'border-white/10 bg-white/[0.04] text-stone-400'
                                                : status === 'fired'
                                                    ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                                                    : status === 'settled'
                                                        ? 'border-green-500/40 bg-green-500/10 text-green-300'
                                                        : 'border-sky-500/30 bg-sky-500/10 text-sky-200'
                                        }`}>
                                            {status}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-sm text-stone-400">
                                        {status === 'idle'
                                            ? 'Recommended for the next participant.'
                                            : 'Already active in the demo, but still available if you want to reuse it.'}
                                    </p>
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-6 rounded-[28px] border border-white/10 bg-black/25 p-5">
                        <p className="text-[10px] uppercase tracking-[0.24em] text-stone-500">How to use it</p>
                        <div className="mt-4 grid gap-3 md:grid-cols-3">
                            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-relaxed text-stone-300">
                                1. Open this tab during the presentation.
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-relaxed text-stone-300">
                                2. Ask another participant to scan the code on their phone.
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-relaxed text-stone-300">
                                3. Their actions will appear inside the same live demonstration session.
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
                    <p className="text-[10px] uppercase tracking-[0.24em] text-stone-500">Session join QR</p>
                    <h3 className="mt-2 text-2xl font-light text-white">{getDemoTableLabel(selectedTableId)}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-stone-400">
                        Scans into the current dashboard demo session and opens the guest route directly on mobile.
                    </p>

                    <div className="mt-6 rounded-[28px] bg-white p-5">
                        {qrSrc ? (
                            <Image
                                src={qrSrc}
                                alt={`${getDemoTableLabel(selectedTableId)} join QR code`}
                                width={320}
                                height={320}
                                unoptimized
                                className="h-auto w-full rounded-2xl"
                            />
                        ) : (
                            <div className="flex aspect-square items-center justify-center rounded-2xl border border-stone-200 bg-stone-100 text-sm text-stone-500">
                                Preparing QR...
                            </div>
                        )}
                    </div>

                    <div className="mt-5 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm leading-relaxed text-amber-50/90">
                        Not a regular dashboard feature. This exists only so you can add another participant during the demo.
                    </div>

                    {guestUrl ? <TableActions scanUrl={guestUrl} scanPath={guestPath} /> : null}

                    <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                        <p className="text-[10px] uppercase tracking-[0.22em] text-stone-500">Session reference</p>
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
    const ui = locale === 'ka' ? UI.ka : UI.en;
    const floorSyncCopy = dict.floorSync as Partial<Record<string, string>> | undefined;
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
    const showcase = useMemo(() => buildShowcase(activeDishes, activeCategories, locale), [activeCategories, activeDishes, locale]);
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
            <DashboardRail activeTab={activeTab} locale={locale} onSelectTab={setActiveTab} />
            <main className="min-h-0 min-w-0 flex-1 overflow-hidden p-3 sm:p-4 lg:p-6">
                {activeTab === 'overview' && <OverviewTab liveTableCount={liveTableCount} pendingTableCount={pendingTableCount} latestUpdateLabel={latestUpdateLabel} onSelectTab={setActiveTab} showcase={showcase} />}
                {activeTab === 'live' && <LiveBoardTab floorState={floorState} floorSyncCopy={floorSyncCopy} activeCategories={activeCategories} activeDishes={activeDishes} dishMap={dishMap} focusedTableId={focusedTableId} locale={locale} onFocusTable={setFocusedTableId} ui={ui} />}
                {activeTab === 'insights' && <InsightsTab showcase={showcase} />}
                {activeTab === 'ai' && <AiTab showcase={showcase} selectedPromptId={selectedPromptId} onSelectPrompt={setSelectedPromptId} />}
                {activeTab === 'scan' && <ScanQrTab floorState={floorState} locale={locale} sessionId={sessionId} selectedTableId={qrTableId} qrSrc={qrSrc} guestUrl={guestUrl} guestPath={guestPath} onSelectTable={setQrTableId} />}
            </main>
        </div>
    );
}
