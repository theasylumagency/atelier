'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { AppDictionary } from '@/lib/dictionaries';
import type {
    DemoTableId,
    FloorActivityEvent,
    FloorActivityType,
    FloorCartItem,
    FloorTableState,
} from '@/lib/floor-sync';
import { getDemoTableLabel } from '@/lib/floor-sync';
import {
    type FloorCategory,
    type FloorDish,
    formatCurrency,
    getCategoryLabel,
    getDishDescription,
    getDishImageSrc,
    getDishStory,
    getDishTitle,
} from '@/lib/floor-sync-view';

const UI = {
    emptySelection: 'No dishes selected yet.',
    confirmOrder: 'Confirm Order',
    clearTable: 'Clear Table',
    complete: 'Complete',
    menu: 'Menu',
    cart: 'Cart',
    guestBrowsing: 'Guest is browsing the menu.',
    viewingDish: 'Viewing dish',
    browsingCategory: 'Browsing category',
    addedToCart: 'Added to cart',
    removedFromCart: 'Removed from cart',
    quantityUpdated: 'Quantity updated',
    orderConfirmed: 'Order confirmed',
    tableCleared: 'Table cleared',
    allCategories: 'All',
    sessionOpened: 'Menu opened',
    guestOpenedSession: 'Guest opened the menu.',
    addService: 'Add to Service',
    qty: 'Qty',
    theSelection: 'The Selection',
    total: 'Total',
    byContinuing: 'Secured via Spatial Protocol',
} as const;

function makeEvent(type: FloorActivityType, label: string, meta?: string): FloorActivityEvent {
    const now = new Date().toISOString();

    return {
        id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
        type,
        label,
        meta,
        createdAt: now,
    };
}

export default function FloorSyncGuest({
    dict,
    initialCategories = [],
    initialDishes = [],
    initialTableState,
    locale = 'en',
    sessionId,
    tableId,
}: {
    dict: AppDictionary;
    initialCategories?: FloorCategory[];
    initialDishes?: FloorDish[];
    initialTableState: FloorTableState;
    locale?: string;
    sessionId: string;
    tableId: DemoTableId;
}) {
    const skipFirstSync = useRef(true);
    const floorSyncCopy = dict.floorSync as Partial<Record<string, string>> | undefined;
    const [status, setStatus] = useState<FloorTableState['status']>(initialTableState.status);
    const [activeView, setActiveView] = useState(initialTableState.activeView);
    const [selectedCategory, setSelectedCategory] = useState(initialTableState.selectedCategory || 'all');
    const [selectedDishId, setSelectedDishId] = useState<string | null>(initialTableState.selectedDishId);
    const [cart, setCart] = useState<FloorCartItem[]>(initialTableState.cart || []);
    const [sessionStartedAt] = useState<string | null>(
        initialTableState.sessionStartedAt || new Date().toISOString()
    );
    const [activityFeed, setActivityFeed] = useState<FloorActivityEvent[]>(
        initialTableState.activityFeed.length > 0
            ? initialTableState.activityFeed
            : [makeEvent('session_started', UI.sessionOpened, UI.guestOpenedSession)]
    );

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
                .filter(
                    (category) =>
                        category.status === 'active' &&
                        activeDishes.some((dish) => dish.categoryId === category.id)
                )
                .sort((left, right) => left.order - right.order),
        [initialCategories, activeDishes]
    );
    const dishMap = useMemo(() => new Map(activeDishes.map((dish) => [dish.id, dish])), [activeDishes]);
    const displayedDishes = useMemo(
        () =>
            activeDishes.filter(
                (dish) => selectedCategory === 'all' || dish.categoryId === selectedCategory
            ),
        [activeDishes, selectedCategory]
    );
    const selectedDish = selectedDishId ? dishMap.get(selectedDishId) ?? null : null;
    const resolvedActiveView = activeView === 'details' && !selectedDish ? 'menu' : activeView;
    const cartItems = useMemo(
        () =>
            cart
                .map((item) => ({
                    ...item,
                    dish: dishMap.get(item.dishId) ?? null,
                }))
                .filter((item): item is FloorCartItem & { dish: FloorDish } => !!item.dish),
        [cart, dishMap]
    );
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPriceMinor = cart.reduce((sum, item) => {
        const dish = dishMap.get(item.dishId);
        return sum + (dish ? item.quantity * dish.priceMinor : 0);
    }, 0);
    const latestCurrency = cartItems[0]?.dish?.currency || activeDishes[0]?.currency;

    const resolvedStatus =
        status === 'fired' || status === 'settled'
            ? status
            : totalItems > 0
                ? 'ordering'
                : 'browsing';

    useEffect(() => {
        if (skipFirstSync.current) {
            skipFirstSync.current = false;
            return;
        }

        const timeoutId = window.setTimeout(async () => {
            try {
                const params = new URLSearchParams({ session: sessionId });
                await fetch(`/api/demo/floor-state/${tableId}?${params.toString()}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        status: resolvedStatus,
                        activeView: resolvedActiveView,
                        selectedCategory,
                        selectedDishId: selectedDish ? selectedDishId : null,
                        cart,
                        sessionStartedAt,
                        activityFeed,
                    }),
                });
            } catch {
                // ignore transient sync errors
            }
        }, 180);

        return () => window.clearTimeout(timeoutId);
    }, [
        activeView,
        activityFeed,
        cart,
        selectedCategory,
        selectedDish,
        selectedDishId,
        sessionId,
        sessionStartedAt,
        resolvedActiveView,
        resolvedStatus,
        tableId,
    ]);

    const pushActivity = (type: FloorActivityType, label: string, meta?: string) => {
        setActivityFeed((previous) => [makeEvent(type, label, meta), ...previous].slice(0, 12));
    };

    const addToCart = (dish: FloorDish) => {
        const existing = cart.find((item) => item.dishId === dish.id);

        setCart((previous) => {
            const found = previous.find((item) => item.dishId === dish.id);
            if (found) {
                return previous.map((item) =>
                    item.dishId === dish.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...previous, { dishId: dish.id, quantity: 1 }];
        });

        pushActivity(
            existing ? 'quantity_changed' : 'item_added',
            existing ? UI.quantityUpdated : UI.addedToCart,
            `${getDishTitle(dish, locale)} x${existing ? existing.quantity + 1 : 1}`
        );
    };

    const removeFromCart = (dishId: string) => {
        setCart((previous) => previous.filter((item) => item.dishId !== dishId));
        pushActivity('item_removed', UI.removedFromCart, getDishTitle(dishMap.get(dishId), locale));
    };

    const changeQuantity = (dishId: string, delta: number) => {
        const existing = cart.find((item) => item.dishId === dishId);
        if (!existing) {
            return;
        }

        if (existing.quantity + delta <= 0) {
            removeFromCart(dishId);
            return;
        }

        setCart((previous) =>
            previous.map((item) =>
                item.dishId === dishId ? { ...item, quantity: item.quantity + delta } : item
            )
        );
        pushActivity(
            'quantity_changed',
            UI.quantityUpdated,
            `${getDishTitle(dishMap.get(dishId), locale)} x${existing.quantity + delta}`
        );
    };

    const handleAction = () => {
        if (resolvedStatus === 'ordering' || resolvedStatus === 'browsing') {
            if (cart.length === 0) {
                return;
            }

            setStatus('fired');
            pushActivity(
                'order_confirmed',
                UI.orderConfirmed,
                `${totalItems} items · ${formatCurrency(totalPriceMinor / 100, latestCurrency, locale)}`
            );
            return;
        }

        if (resolvedStatus === 'fired') {
            setStatus('settled');
            return;
        }

        setStatus('browsing');
        setCart([]);
        setSelectedDishId(null);
        setSelectedCategory('all');
        setActiveView('menu');
        pushActivity('table_cleared', UI.tableCleared, getDemoTableLabel(tableId));
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white font-sans selection:bg-amber-500/30 pb-24">
            <header className="sticky top-0 z-30 border-b border-white/5 bg-[#0A0A0A]/95 px-5 py-5 backdrop-blur-xl">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.3em] text-stone-500">
                            {floorSyncCopy?.guestInterface || 'Guest Menu'}
                        </p>
                        <h1 className="mt-2 text-2xl font-light leading-tight">
                            {floorSyncCopy?.georgianHeritageFirst || 'Georgian'}{' '}
                            <span className="font-bold">
                                {floorSyncCopy?.georgianHeritageSecond || 'Heritage'}
                            </span>
                        </h1>
                        <p className="mt-3 text-sm text-stone-400">
                            {floorSyncCopy?.winterCollectionDesc || UI.guestBrowsing}
                        </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-right">
                        <div className="text-[10px] uppercase tracking-[0.24em] text-stone-500">
                            {floorSyncCopy?.table || 'Table'}
                        </div>
                        <div className="mt-1 text-sm text-white">{getDemoTableLabel(tableId)}</div>
                    </div>
                </div>
            </header>

            {resolvedActiveView === 'menu' && (
                <main className="px-4 py-5 space-y-4">
                    <div className="categories-mobile flex items-center overflow-x-auto no-scrollbar gap-2 whitespace-nowrap pb-1">
                        <button
                            onClick={() => {
                                setSelectedCategory('all');
                                pushActivity('category_focus', UI.browsingCategory, UI.allCategories);
                            }}
                            className={`text-[10px] uppercase tracking-widest px-4 py-2 rounded-full ${selectedCategory === 'all' ? 'bg-white text-black font-bold' : 'bg-white/5 text-stone-400'}`}
                        >
                            {floorSyncCopy?.all || UI.allCategories}
                        </button>
                        {activeCategories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => {
                                    setSelectedCategory(category.id);
                                    pushActivity(
                                        'category_focus',
                                        UI.browsingCategory,
                                        getCategoryLabel(category.id, activeCategories, locale, UI.allCategories, UI.allCategories)
                                    );
                                }}
                                className={`text-[10px] uppercase tracking-widest px-4 py-2 rounded-full ${selectedCategory === category.id ? 'bg-white text-black font-bold' : 'bg-white/5 text-stone-400'}`}
                            >
                                {category.title?.[locale as keyof typeof category.title] || category.title?.en}
                            </button>
                        ))}
                    </div>

                    {displayedDishes.map((dish) => (
                        <article key={dish.id} className="rounded-3xl border border-white/8 bg-white/[0.03] overflow-hidden">
                            <button
                                type="button"
                                className="flex w-full items-start gap-4 p-4 text-left"
                                onClick={() => {
                                    setSelectedDishId(dish.id);
                                    setActiveView('details');
                                    pushActivity('dish_view', UI.viewingDish, getDishTitle(dish, locale));
                                }}
                            >
                                <img
                                    src={getDishImageSrc(dish)}
                                    alt={getDishTitle(dish, locale)}
                                    className="h-24 w-24 rounded-2xl object-cover bg-neutral-900"
                                />
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <h2 className="text-lg font-light text-white">{getDishTitle(dish, locale)}</h2>
                                            <p className="mt-2 text-sm text-stone-400 line-clamp-3">
                                                {getDishDescription(dish, locale)}
                                            </p>
                                        </div>
                                        <span className="text-sm text-amber-400">
                                            {formatCurrency(dish.priceMinor / 100, dish.currency, locale)}
                                        </span>
                                    </div>
                                </div>
                            </button>
                            <div className="border-t border-white/5 px-4 py-3 flex justify-between items-center">
                                <span className="text-[10px] uppercase tracking-[0.24em] text-stone-500">
                                    {floorSyncCopy?.serviceProtocol || 'Service Protocol Active'}
                                </span>
                                <button
                                    onClick={() => addToCart(dish)}
                                    className="rounded-full bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-[0.24em] text-black"
                                >
                                    {floorSyncCopy?.addService || UI.addService}
                                </button>
                            </div>
                        </article>
                    ))}
                </main>
            )}

            {resolvedActiveView === 'details' && selectedDish && (
                <main className="px-4 py-5 space-y-4">
                    <button
                        onClick={() => setActiveView('menu')}
                        className="text-[10px] uppercase tracking-[0.24em] text-stone-500"
                    >
                        Back
                    </button>
                    <img
                        src={getDishImageSrc(selectedDish)}
                        alt={getDishTitle(selectedDish, locale)}
                        className="w-full aspect-[4/3] rounded-3xl object-cover bg-neutral-900"
                    />
                    <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
                        <div className="flex items-start justify-between gap-4">
                            <h2 className="text-3xl font-light text-white">{getDishTitle(selectedDish, locale)}</h2>
                            <span className="text-lg text-amber-400">
                                {formatCurrency(selectedDish.priceMinor / 100, selectedDish.currency, locale)}
                            </span>
                        </div>
                        <p className="mt-5 text-sm leading-7 text-stone-300">
                            {getDishStory(selectedDish, locale)}
                        </p>
                        <button
                            onClick={() => addToCart(selectedDish)}
                            className="mt-6 w-full rounded-full bg-white px-5 py-4 text-[10px] font-bold uppercase tracking-[0.24em] text-black"
                        >
                            {floorSyncCopy?.addService || UI.addService}
                        </button>
                    </div>
                </main>
            )}

            {resolvedActiveView === 'cart' && (
                <main className="px-4 py-5 space-y-4">
                    <h2 className="text-[10px] uppercase tracking-[0.3em] text-stone-500">
                        {floorSyncCopy?.theSelection || UI.theSelection}
                    </h2>
                    {cartItems.length === 0 ? (
                        <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-8 text-center text-stone-500">
                            {UI.emptySelection}
                        </div>
                    ) : (
                        <>
                            {cartItems.map((item) => (
                                <div key={item.dishId} className="rounded-3xl border border-white/8 bg-white/[0.03] p-4">
                                    <div className="flex items-start gap-4">
                                        <img
                                            src={getDishImageSrc(item.dish)}
                                            alt={getDishTitle(item.dish, locale)}
                                            className="h-20 w-20 rounded-2xl object-cover bg-neutral-900"
                                        />
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-start justify-between gap-3">
                                                <h3 className="text-base font-light text-white">{getDishTitle(item.dish, locale)}</h3>
                                                <span className="text-sm text-amber-400">
                                                    {formatCurrency(item.dish.priceMinor / 100, item.dish.currency, locale)}
                                                </span>
                                            </div>
                                            <div className="mt-4 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => changeQuantity(item.dishId, -1)}
                                                        className="h-8 w-8 rounded-full bg-white/5"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="text-xs uppercase tracking-[0.2em] text-stone-400">
                                                        {UI.qty}: {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => changeQuantity(item.dishId, 1)}
                                                        className="h-8 w-8 rounded-full bg-white/5"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={() => removeFromCart(item.dishId)}
                                                    className="text-[10px] uppercase tracking-[0.24em] text-red-400"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
                                <div className="flex items-center justify-between text-white">
                                    <span className="text-[10px] uppercase tracking-[0.24em] text-stone-400">
                                        {floorSyncCopy?.total || UI.total}
                                    </span>
                                    <span className="text-xl">
                                        {formatCurrency(totalPriceMinor / 100, latestCurrency, locale)}
                                    </span>
                                </div>
                                <button
                                    onClick={handleAction}
                                    className="mt-5 w-full rounded-full bg-white px-5 py-4 text-[10px] font-bold uppercase tracking-[0.24em] text-black"
                                >
                                    {resolvedStatus === 'fired'
                                        ? floorSyncCopy?.clearTable || UI.clearTable
                                        : resolvedStatus === 'settled'
                                            ? floorSyncCopy?.complete || UI.complete
                                            : floorSyncCopy?.confirmOrder || UI.confirmOrder}
                                </button>
                                <p className="mt-4 text-center text-[8px] uppercase tracking-[0.24em] text-stone-600">
                                    {floorSyncCopy?.byContinuing || UI.byContinuing}
                                </p>
                            </div>
                        </>
                    )}
                </main>
            )}

            <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0A0A0A]/95 backdrop-blur-xl border-t border-white/5 px-6 pb-6 pt-4">
                <div className="mx-auto flex max-w-screen-sm justify-around items-center">
                    <button
                        onClick={() => setActiveView('menu')}
                        className={`flex flex-col items-center gap-1 ${resolvedActiveView === 'menu' ? 'text-amber-500' : 'text-stone-500'}`}
                    >
                        <span className="material-symbols-outlined text-[18px]">restaurant_menu</span>
                        <span className="text-[8px] uppercase tracking-widest">{UI.menu}</span>
                    </button>
                    <button
                        onClick={() => setActiveView('cart')}
                        className={`flex flex-col items-center gap-1 relative ${resolvedActiveView === 'cart' ? 'text-amber-500' : 'text-stone-500'}`}
                    >
                        <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
                        <span className="text-[8px] uppercase tracking-widest">{UI.cart}</span>
                        {totalItems > 0 && (
                            <span className="absolute -top-1 -right-2 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-amber-500 text-[8px] font-bold text-black">
                                {totalItems}
                            </span>
                        )}
                    </button>
                </div>
            </nav>
        </div>
    );
}
