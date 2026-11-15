import type { AppLocale } from '@/lib/types';

export const DEMO_TABLES = [
    { id: 'table-01', label: 'T-01', shortLabel: '01' },
    { id: 'table-04', label: 'T-04', shortLabel: '04' },
    { id: 'table-08', label: 'T-08', shortLabel: '08' },
] as const;

export type DemoTableId = (typeof DEMO_TABLES)[number]['id'];
export type GuestViewState = 'menu' | 'details' | 'cart';
export type FloorTableStatus = 'idle' | 'browsing' | 'ordering' | 'fired' | 'settled';
export type FloorActivityType =
    | 'session_started'
    | 'category_focus'
    | 'dish_view'
    | 'item_added'
    | 'item_removed'
    | 'quantity_changed'
    | 'order_confirmed'
    | 'table_cleared';

export interface FloorCartItem {
    dishId: string;
    quantity: number;
}

export interface FloorActivityEvent {
    id: string;
    type: FloorActivityType;
    label: string;
    meta?: string;
    createdAt: string;
}

export interface FloorTableState {
    tableId: DemoTableId;
    status: FloorTableStatus;
    activeView: GuestViewState;
    selectedCategory: string;
    selectedDishId: string | null;
    cart: FloorCartItem[];
    sessionStartedAt: string | null;
    updatedAt: string;
    activityFeed: FloorActivityEvent[];
}

export interface FloorStateFile {
    updatedAt: string;
    tables: Record<DemoTableId, FloorTableState>;
}

const SESSION_ID_PATTERN = /^[a-f0-9]{32}$/i;

export function isValidDemoSessionId(value: string | undefined | null): value is string {
    return typeof value === 'string' && SESSION_ID_PATTERN.test(value);
}

export function isDemoTableId(value: string | undefined | null): value is DemoTableId {
    return DEMO_TABLES.some((table) => table.id === value);
}

export function getDemoTable(tableId: DemoTableId) {
    return DEMO_TABLES.find((table) => table.id === tableId) ?? DEMO_TABLES[0];
}

export function getDemoTableLabel(tableId: DemoTableId) {
    return getDemoTable(tableId).label;
}

export function getDefaultTableId(): DemoTableId {
    return 'table-04';
}

export function createEmptyFloorTableState(tableId: DemoTableId, now = new Date().toISOString()): FloorTableState {
    return {
        tableId,
        status: 'idle',
        activeView: 'menu',
        selectedCategory: 'all',
        selectedDishId: null,
        cart: [],
        sessionStartedAt: null,
        updatedAt: now,
        activityFeed: [],
    };
}

export function createEmptyFloorState(now = new Date().toISOString()): FloorStateFile {
    return {
        updatedAt: now,
        tables: {
            'table-01': createEmptyFloorTableState('table-01', now),
            'table-04': createEmptyFloorTableState('table-04', now),
            'table-08': createEmptyFloorTableState('table-08', now),
        },
    };
}

export function normalizeFloorTableState(
    tableId: DemoTableId,
    table: Partial<FloorTableState> | undefined,
    now = new Date().toISOString()
): FloorTableState {
    const base = createEmptyFloorTableState(tableId, now);

    return {
        ...base,
        ...table,
        tableId,
        activeView:
            table?.activeView === 'details' || table?.activeView === 'cart'
                ? table.activeView
                : 'menu',
        status:
            table?.status === 'browsing' ||
            table?.status === 'ordering' ||
            table?.status === 'fired' ||
            table?.status === 'settled'
                ? table.status
                : 'idle',
        selectedCategory: table?.selectedCategory || 'all',
        selectedDishId: typeof table?.selectedDishId === 'string' ? table.selectedDishId : null,
        cart: Array.isArray(table?.cart)
            ? table.cart
                .filter((item): item is FloorCartItem => !!item && typeof item.dishId === 'string')
                .map((item) => ({
                    dishId: item.dishId,
                    quantity: Math.max(1, Number(item.quantity) || 1),
                }))
            : [],
        sessionStartedAt:
            typeof table?.sessionStartedAt === 'string' ? table.sessionStartedAt : null,
        updatedAt: typeof table?.updatedAt === 'string' ? table.updatedAt : now,
        activityFeed: Array.isArray(table?.activityFeed)
            ? table.activityFeed
                .filter((event): event is FloorActivityEvent => {
                    return !!event && typeof event.id === 'string' && typeof event.label === 'string';
                })
                .slice(0, 12)
            : [],
    };
}

export function normalizeFloorStateFile(file: Partial<FloorStateFile> | undefined): FloorStateFile {
    const now = new Date().toISOString();

    return {
        updatedAt: typeof file?.updatedAt === 'string' ? file.updatedAt : now,
        tables: {
            'table-01': normalizeFloorTableState('table-01', file?.tables?.['table-01'], now),
            'table-04': normalizeFloorTableState('table-04', file?.tables?.['table-04'], now),
            'table-08': normalizeFloorTableState('table-08', file?.tables?.['table-08'], now),
        },
    };
}

export function getFloorSyncHubPath(locale: AppLocale | string) {
    return `/${locale}/floor-sync/access`;
}

export function getFloorSyncBoardPath(
    locale: AppLocale | string,
    sessionId?: string,
    tab?: 'overview' | 'live' | 'insights' | 'ai' | 'scan'
) {
    const params = new URLSearchParams();

    if (sessionId) {
        params.set('session', sessionId);
    }

    if (tab) {
        params.set('tab', tab);
    }

    const query = params.toString();
    return query ? `/${locale}/floor-sync?${query}` : `/${locale}/floor-sync`;
}

export function getFloorSyncGuestPath(
    locale: AppLocale | string,
    sessionId: string,
    tableId: DemoTableId
) {
    const params = new URLSearchParams({
        session: sessionId,
        table: tableId,
        guest: '1',
    });

    return `/${locale}/floor-sync?${params.toString()}`;
}
