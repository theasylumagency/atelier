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
    getDishDescription,
    getDishImageSrc,
    getDishStory,
    getDishTitle,
} from '@/lib/floor-sync-view';

type MenuFilter = 'all' | 'chef' | 'signature' | 'vegetarian';

const UI = {
    emptySelection: 'No dishes selected yet.',
    confirmOrder: 'Confirm Selection',
    clearTable: 'Clear Table',
    complete: 'Complete',
    menu: 'Menu',
    cart: 'Finalise',
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
    addService: 'Add to Selection',
    qty: 'Qty',
    total: 'Total',
    byContinuing: 'Secured via Spatial Protocol',
    enterAtelier: 'Enter the Atelier',
    homeEyebrow: 'The New Renaissance',
    homeSubtitle: 'A collision of 18th-century opulence and celestial modernism.',
    estate: 'EST. 1824 - 2050',
    collectionTitle: 'Carte Gastronomique',
    detailStory: 'The Story',
    detailComposition: 'The Composition',
    investment: 'Investment',
    excludingCharges: 'Excluding service charges',
    reservation: 'Reservation',
    dateTime: 'Date & Time',
    guests: 'Guests',
    orderSummary: "L'Ordre Du Jour",
    paymentMode: 'Payment Method',
    modify: 'Modify',
    subtotal: 'Sous-total',
    serviceCharge: 'Service Du Chateau',
    totalInvestment: 'Investissement Total',
    confirmInvestment: 'Confirm The Investment',
    details: 'Details of the creation',
    noMatches: 'No dishes match this filter.',
    home: "L'Atelier",
    atelier: "L'Atelier",
    tableLabel: 'Table',
    houseCard: 'House Selection',
    reserve: 'Reserve',
    profile: 'Profile',
    chefChoice: "Chef's Choice",
    signature: 'Signature',
    vegetarian: 'Vegetarian',
    bestseller: 'Bestseller',
    sustainable: 'Sustainable',
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

function getShortDateTime(value: string | null, locale: string) {
    const date = value ? new Date(value) : new Date();

    try {
        return new Intl.DateTimeFormat(locale === 'ka' ? 'ka-GE' : 'en-GB', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    } catch {
        return date.toISOString();
    }
}

function getDishBadges(dish: FloorDish) {
    const badges: Array<{ key: string; label: string; tone: string; icon: string }> = [];

    if (dish.topRated) {
        badges.push({
            key: 'bestseller',
            label: UI.bestseller,
            tone: 'border-[#c5b38d]/35 bg-[#c5b38d]/12 text-[#dbc9a0]',
            icon: 'star',
        });
    }

    if (dish.vegetarian) {
        badges.push({
            key: 'sustainable',
            label: UI.sustainable,
            tone: 'border-emerald-400/25 bg-emerald-400/8 text-emerald-300',
            icon: 'eco',
        });
    }

    if (dish.chefsPick) {
        badges.push({
            key: 'chef',
            label: UI.chefChoice,
            tone: 'border-[#c5b38d]/25 bg-black/35 text-[#dbc9a0]',
            icon: 'workspace_premium',
        });
    }

    return badges.slice(0, 2);
}

function getIngredientCards(dish: FloorDish, locale: string) {
    const raw = getDishDescription(dish, locale)
        .split(/[,.]/)
        .map((item) => item.trim())
        .filter(Boolean);

    const unique = Array.from(new Set(raw));

    if (unique.length === 0) {
        return [
            { title: UI.houseCard, note: UI.signature, icon: 'restaurant' },
            { title: UI.chefChoice, note: UI.investment, icon: 'diamond' },
        ];
    }

    return unique.slice(0, 4).map((item, index) => {
        const icons = ['restaurant', 'mystery', 'water_drop', 'stars'];
        return {
            title: item,
            note: index % 2 === 0 ? UI.signature : UI.chefChoice,
            icon: icons[index] || 'restaurant',
        };
    });
}

function getSecondaryDishLine(dish: FloorDish, locale: string) {
    if (locale === 'ka') {
        return dish.title.en || dish.title.ka || '';
    }

    return dish.title.ka || dish.title.en || '';
}

function getCategoryTitle(category: FloorCategory, locale: string) {
    return category.title?.[locale as keyof typeof category.title] || category.title?.en || category.id;
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
    const [menuFilter, setMenuFilter] = useState<MenuFilter>('all');
    const [showLanding, setShowLanding] = useState(
        initialTableState.activeView === 'menu' &&
            !initialTableState.selectedDishId &&
            initialTableState.cart.length === 0
    );
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
    const categoryFilteredDishes = useMemo(
        () =>
            activeDishes.filter(
                (dish) => selectedCategory === 'all' || dish.categoryId === selectedCategory
            ),
        [activeDishes, selectedCategory]
    );
    const displayedDishes = useMemo(() => {
        return categoryFilteredDishes.filter((dish) => {
            if (menuFilter === 'all') return true;
            if (menuFilter === 'chef') return dish.chefsPick;
            if (menuFilter === 'signature') return dish.topRated || dish.chefsPick;
            return dish.vegetarian;
        });
    }, [categoryFilteredDishes, menuFilter]);

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
    const serviceChargeMinor = Math.round(totalPriceMinor * 0.15);
    const grandTotalMinor = totalPriceMinor + serviceChargeMinor;
    const latestCurrency = cartItems[0]?.dish?.currency || activeDishes[0]?.currency;
    const tableLabel = getDemoTableLabel(tableId);
    const reservationDateTime = getShortDateTime(sessionStartedAt, locale);
    const guestCountLabel = String(Math.max(totalItems, 2)).padStart(2, '0');
    const serifClass = locale === 'ka' ? 'font-serif-ka' : 'font-serif-latin';

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

    const openMenu = () => {
        setShowLanding(false);
        setActiveView('menu');
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

        setShowLanding(false);
        pushActivity(
            existing ? 'quantity_changed' : 'item_added',
            existing ? UI.quantityUpdated : UI.addedToCart,
            `${getDishTitle(dish, locale)} x${existing ? existing.quantity + 1 : 1}`
        );
    };

    const openDish = (dish: FloorDish) => {
        setShowLanding(false);
        setSelectedDishId(dish.id);
        setActiveView('details');
        pushActivity('dish_view', UI.viewingDish, getDishTitle(dish, locale));
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
                `${totalItems} items | ${formatCurrency(grandTotalMinor / 100, latestCurrency, locale)}`
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
        setMenuFilter('all');
        setActiveView('menu');
        setShowLanding(true);
        pushActivity('table_cleared', UI.tableCleared, tableLabel);
    };

    const actionLabel =
        resolvedStatus === 'fired'
            ? floorSyncCopy?.complete || UI.complete
            : resolvedStatus === 'settled'
                ? floorSyncCopy?.clearTable || UI.clearTable
                : floorSyncCopy?.checkout || UI.confirmInvestment;

    const renderBottomNav = !showLanding;

    return (
        <div className="min-h-screen bg-[#070604] text-[#f7f1e8] selection:bg-[#c5b38d]/30">
            <div className="mx-auto min-h-screen w-full max-w-md overflow-hidden bg-[#090704] shadow-[0_0_0_1px_rgba(197,179,141,0.08)]">
                {resolvedActiveView === 'menu' && showLanding && (
                    <section className="relative min-h-screen overflow-hidden">
                        <img
                            src="/menu/menu-home-2.webp"
                            alt="L'Atelier entry scene"
                            className="absolute inset-0 h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(197,179,141,0.16),transparent_42%),linear-gradient(180deg,rgba(3,3,2,0.3)_0%,rgba(3,3,2,0.7)_45%,rgba(3,3,2,0.94)_100%)]" />
                        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(197,179,141,0.06)_48%,transparent_100%)] opacity-40" />

                        <div className="relative z-10 flex min-h-screen flex-col px-6 pb-10 pt-14">
                            <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.35em] text-[#bfae86]/72">
                                <span>{UI.estate}</span>
                                <button
                                    type="button"
                                    onClick={openMenu}
                                    className="flex h-11 w-11 items-center justify-center rounded-full border border-[#c5b38d]/20 bg-black/25 backdrop-blur-sm"
                                    aria-label="Open menu"
                                >
                                    <span className="material-symbols-outlined text-[24px] text-[#c8b892]">
                                        menu
                                    </span>
                                </button>
                            </div>

                            <div className="flex flex-1 flex-col items-center justify-center text-center">
                                <div className="rounded-full border border-[#c5b38d]/18 bg-[#3b2f1b]/35 px-7 py-3 backdrop-blur-md">
                                    <span className="text-[11px] uppercase tracking-[0.42em] text-[#d5c399]">
                                        {UI.homeEyebrow}
                                    </span>
                                </div>

                                <h1 className={`mt-10 text-[clamp(4.5rem,18vw,6.6rem)] leading-[0.92] text-white ${serifClass}`}>
                                    {UI.home}
                                </h1>
                                <div className="mt-5 h-px w-24 bg-[#c5b38d]/35" />
                                <p className="mt-8 max-w-xs text-[1.05rem] leading-9 text-[#c7c0b0]/82 italic">
                                    {UI.homeSubtitle}
                                </p>

                                <button
                                    type="button"
                                    onClick={openMenu}
                                    className="mt-14 inline-flex min-w-[16.5rem] items-center justify-center rounded-full border border-[#c5b38d]/24 bg-black/30 px-8 py-5 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#d7c59c] backdrop-blur-md transition hover:border-[#c5b38d]/45 hover:text-white"
                                >
                                    {UI.enterAtelier}
                                </button>
                            </div>

                            <div className="mt-10 flex flex-col items-center gap-6">
                                <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.32em] text-[#a9966b]/68">
                                    <span>Paris</span>
                                    <span className="h-[3px] w-[3px] rounded-full bg-[#a9966b]/50" />
                                    <span>Mars Colony One</span>
                                    <span className="h-[3px] w-[3px] rounded-full bg-[#a9966b]/50" />
                                    <span>Neo Tokyo</span>
                                </div>

                                <div className="inline-flex items-center gap-3 rounded-full border border-[#c5b38d]/14 bg-black/28 px-4 py-2 text-[10px] uppercase tracking-[0.28em] text-[#c3b08a] backdrop-blur-md">
                                    <span>{floorSyncCopy?.table || UI.tableLabel}</span>
                                    <span className="h-3 w-px bg-[#c5b38d]/24" />
                                    <span>{tableLabel}</span>
                                </div>
                            </div>
                        </div>
                    </section>
                )}
                {resolvedActiveView === 'menu' && !showLanding && (
                    <>
                        <header className="sticky top-0 z-30 border-b border-[#2e2416]/70 bg-[#090704]/88 backdrop-blur-xl">
                            <div className="px-4 pb-3 pt-4">
                                <div className="flex items-center justify-between">
                                    <button
                                        type="button"
                                        onClick={() => setShowLanding(true)}
                                        className="flex h-10 w-10 items-center justify-center rounded-full border border-[#3a2f1f] bg-[#120f09] text-[#c9b88f]"
                                        aria-label="Back"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">arrow_back_ios_new</span>
                                    </button>

                                    <div className="text-center">
                                        <p className="text-[10px] uppercase tracking-[0.34em] text-[#c3b084]">
                                            {UI.home}
                                        </p>
                                        <h1 className="mt-1 text-sm font-semibold text-white">
                                            {UI.collectionTitle}
                                        </h1>
                                    </div>

                                    <button
                                        type="button"
                                        className="flex h-10 w-10 items-center justify-center rounded-full border border-[#3a2f1f] bg-[#120f09] text-[#c9b88f]"
                                        aria-label="Search"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">search</span>
                                    </button>
                                </div>

                                <div className="mt-4 flex gap-8 overflow-x-auto pb-1 text-[11px] font-medium tracking-[0.18em] text-[#8f8467] no-scrollbar">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedCategory('all');
                                            pushActivity('category_focus', UI.browsingCategory, UI.allCategories);
                                        }}
                                        className={`whitespace-nowrap border-b pb-3 uppercase transition ${
                                            selectedCategory === 'all'
                                                ? 'border-[#cfbc90] text-[#d6c49a]'
                                                : 'border-transparent'
                                        }`}
                                    >
                                        {floorSyncCopy?.all || UI.allCategories}
                                    </button>

                                    {activeCategories.map((category) => (
                                        <button
                                            key={category.id}
                                            type="button"
                                            onClick={() => {
                                                setSelectedCategory(category.id);
                                                pushActivity(
                                                    'category_focus',
                                                    UI.browsingCategory,
                                                    getCategoryTitle(category, locale)
                                                );
                                            }}
                                            className={`whitespace-nowrap border-b pb-3 uppercase transition ${
                                                selectedCategory === category.id
                                                    ? 'border-[#cfbc90] text-[#d6c49a]'
                                                    : 'border-transparent'
                                            }`}
                                        >
                                            {getCategoryTitle(category, locale)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </header>

                        <main className="px-4 pb-32 pt-5">
                            <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
                                {(
                                    [
                                        { id: 'all', label: floorSyncCopy?.all || UI.allCategories },
                                        { id: 'chef', label: UI.chefChoice },
                                        { id: 'signature', label: UI.signature },
                                        { id: 'vegetarian', label: UI.vegetarian },
                                    ] satisfies Array<{ id: MenuFilter; label: string }>
                                ).map((filter) => (
                                    <button
                                        key={filter.id}
                                        type="button"
                                        onClick={() => setMenuFilter(filter.id)}
                                        className={`rounded-full border px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.26em] ${
                                            menuFilter === filter.id
                                                ? 'border-[#cfbc90] bg-[#c5b38d] text-black'
                                                : 'border-[#3a2f1f] bg-[#15110b] text-[#b09e79]'
                                        }`}
                                    >
                                        {filter.label}
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-10">
                                {displayedDishes.length === 0 && (
                                    <div className="rounded-[2rem] border border-[#2b2215] bg-[#110d08] px-6 py-12 text-center text-sm text-[#9e9073]">
                                        {UI.noMatches}
                                    </div>
                                )}

                                {displayedDishes.map((dish) => (
                                    <article key={dish.id} className="group">
                                        <button
                                            type="button"
                                            onClick={() => openDish(dish)}
                                            className="w-full text-left"
                                        >
                                            <div className="relative overflow-hidden rounded-[1.8rem] border border-[#342917] bg-[#0f0b07] shadow-[0_24px_60px_rgba(0,0,0,0.32)]">
                                                <img
                                                    src={getDishImageSrc(dish)}
                                                    alt={getDishTitle(dish, locale)}
                                                    className="aspect-[4/5] w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-[#070604] via-transparent to-transparent" />
                                                <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                                                    {getDishBadges(dish).map((badge) => (
                                                        <span
                                                            key={badge.key}
                                                            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[9px] uppercase tracking-[0.22em] ${badge.tone}`}
                                                        >
                                                            <span className="material-symbols-outlined text-[12px]">
                                                                {badge.icon}
                                                            </span>
                                                            {badge.label}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="px-1 pt-5">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="min-w-0">
                                                        <h2 className={`text-[2rem] leading-none text-white ${serifClass}`}>
                                                            {getDishTitle(dish, locale)}
                                                        </h2>
                                                        <p className="mt-2 text-sm uppercase tracking-[0.28em] text-[#938566]">
                                                            {getSecondaryDishLine(dish, locale)}
                                                        </p>
                                                    </div>

                                                    <span className="pt-2 text-xl text-[#d4c196]">
                                                        {formatCurrency(dish.priceMinor / 100, dish.currency, locale)}
                                                    </span>
                                                </div>

                                                <p className="mt-4 max-w-[24rem] text-[0.97rem] leading-7 text-[#b5aa95]">
                                                    {getDishDescription(dish, locale)}
                                                </p>

                                                <div className="mt-5 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#cfbc90]">
                                                    <span>{UI.details}</span>
                                                    <span className="material-symbols-outlined text-[14px]">east</span>
                                                </div>
                                            </div>
                                        </button>
                                    </article>
                                ))}
                            </div>
                        </main>
                    </>
                )}
                {resolvedActiveView === 'details' && selectedDish && (
                    <>
                        <header className="fixed inset-x-0 top-0 z-30 mx-auto flex w-full max-w-md items-center justify-between bg-[#090704]/80 px-4 py-4 backdrop-blur-xl">
                            <button
                                type="button"
                                onClick={() => setActiveView('menu')}
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-black/28 text-[#d4c196]"
                                aria-label="Back"
                            >
                                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                            </button>
                            <p className="text-[12px] font-semibold uppercase tracking-[0.34em] text-[#d4c196]">
                                {UI.home}
                            </p>
                            <button
                                type="button"
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-black/28 text-[#d4c196]"
                                aria-label="Share"
                            >
                                <span className="material-symbols-outlined text-[20px]">share</span>
                            </button>
                        </header>

                        <main className="pb-32">
                            <section className="relative">
                                <img
                                    src={getDishImageSrc(selectedDish)}
                                    alt={getDishTitle(selectedDish, locale)}
                                    className="aspect-[4/5] w-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#090704] via-transparent to-transparent" />
                                <div className="absolute inset-x-0 bottom-0 px-6 pb-8">
                                    <div className="flex flex-wrap gap-2">
                                        {getDishBadges(selectedDish).map((badge) => (
                                            <span
                                                key={badge.key}
                                                className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[9px] uppercase tracking-[0.22em] ${badge.tone}`}
                                            >
                                                <span className="material-symbols-outlined text-[12px]">
                                                    {badge.icon}
                                                </span>
                                                {badge.label}
                                            </span>
                                        ))}
                                    </div>

                                    <h1 className={`mt-5 text-[3.3rem] leading-[0.9] text-white ${serifClass}`}>
                                        {getDishTitle(selectedDish, locale)}
                                    </h1>
                                    <p className="mt-3 text-[1.05rem] italic text-[#d1be97]">
                                        {getSecondaryDishLine(selectedDish, locale)}
                                    </p>
                                </div>
                            </section>

                            <div className="space-y-12 px-6 pt-8">
                                <section>
                                    <div className="flex items-center gap-4">
                                        <div className="h-px flex-1 bg-[#2f2618]" />
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.36em] text-[#cfbc90]">
                                            {UI.detailStory}
                                        </p>
                                        <div className="h-px flex-1 bg-[#2f2618]" />
                                    </div>

                                    <div className="mt-5 rounded-[1.8rem] border border-[#2c2316] bg-[radial-gradient(circle_at_top,rgba(197,179,141,0.08),transparent_55%),#0e0b07] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.3)]">
                                        <p className="text-[1.08rem] leading-9 text-[#eee1cb]">
                                            {getDishStory(selectedDish, locale)}
                                        </p>
                                    </div>
                                </section>

                                <section>
                                    <div className="flex items-center gap-4">
                                        <div className="h-px flex-1 bg-[#2f2618]" />
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.36em] text-[#cfbc90]">
                                            {UI.detailComposition}
                                        </p>
                                        <div className="h-px flex-1 bg-[#2f2618]" />
                                    </div>

                                    <div className="mt-5 grid grid-cols-2 gap-4">
                                        {getIngredientCards(selectedDish, locale).map((item) => (
                                            <div
                                                key={`${selectedDish.id}-${item.title}`}
                                                className="rounded-[1.35rem] border border-[#2a2114] bg-[#0f0b07] px-4 py-5 text-center shadow-[0_14px_32px_rgba(0,0,0,0.24)]"
                                            >
                                                <span className="material-symbols-outlined text-[28px] text-[#cdbb90]">
                                                    {item.icon}
                                                </span>
                                                <h3 className="mt-3 text-base text-white">{item.title}</h3>
                                                <p className="mt-2 text-[10px] uppercase tracking-[0.24em] text-[#8e8163]">
                                                    {item.note}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <section className="rounded-[2rem] border border-[#2a2215] bg-[radial-gradient(circle_at_top,rgba(197,179,141,0.09),transparent_55%),#0c0906] px-6 py-8 text-center shadow-[0_18px_40px_rgba(0,0,0,0.32)]">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-[#cfbc90]">
                                        {UI.investment}
                                    </p>
                                    <p className="mt-4 text-5xl font-semibold tracking-tight text-white">
                                        {formatCurrency(selectedDish.priceMinor / 100, selectedDish.currency, locale)}
                                    </p>
                                    <p className="mt-3 text-sm italic text-[#91856d]">{UI.excludingCharges}</p>

                                    <button
                                        type="button"
                                        onClick={() => addToCart(selectedDish)}
                                        className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-[#d0bc91] px-6 py-5 text-[12px] font-semibold uppercase tracking-[0.28em] text-black transition hover:bg-[#dac89f]"
                                    >
                                        {floorSyncCopy?.addCart || floorSyncCopy?.addService || UI.addService}
                                    </button>
                                </section>
                            </div>
                        </main>
                    </>
                )}
                {resolvedActiveView === 'cart' && (
                    <>
                        <header className="sticky top-0 z-30 border-b border-[#2b2215] bg-[#090704]/92 px-6 py-5 backdrop-blur-xl">
                            <div className="flex items-center justify-between">
                                <button
                                    type="button"
                                    onClick={() => setActiveView('menu')}
                                    className="flex h-10 w-10 items-center justify-center rounded-full text-white"
                                    aria-label="Back"
                                >
                                    <span className="material-symbols-outlined text-[24px]">arrow_back</span>
                                </button>

                                <div className="text-center">
                                    <p className="text-[10px] uppercase tracking-[0.4em] text-[#cbb98f]">
                                        {UI.confirmOrder}
                                    </p>
                                    <h2 className="mt-1 text-[2rem] font-semibold text-white">{UI.home}</h2>
                                </div>

                                <button
                                    type="button"
                                    className="flex h-10 w-10 items-center justify-center rounded-full text-white"
                                    aria-label="More"
                                >
                                    <span className="material-symbols-outlined text-[24px]">more_vert</span>
                                </button>
                            </div>
                        </header>

                        <main className="space-y-10 px-6 pb-32 pt-8">
                            <section className="rounded-[1.8rem] border border-[#3a3020] bg-[radial-gradient(circle_at_top,rgba(197,179,141,0.1),transparent_55%),#12100c] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.26)]">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#c9b88f]">
                                            {UI.reservation}
                                        </p>
                                        <h3 className="mt-2 text-2xl text-white">{tableLabel}</h3>
                                    </div>
                                    <span className="material-symbols-outlined text-[28px] text-[#d0bc91]">
                                        calendar_today
                                    </span>
                                </div>

                                <div className="mt-6 grid grid-cols-2 gap-5 text-sm">
                                    <div>
                                        <p className="text-[#8d8267]">{UI.dateTime}</p>
                                        <p className="mt-1 text-xl text-white">{reservationDateTime}</p>
                                    </div>
                                    <div>
                                        <p className="text-[#8d8267]">{UI.guests}</p>
                                        <p className="mt-1 text-xl text-white">{guestCountLabel} personnes</p>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <div className="flex items-center justify-between">
                                    <h3 className="text-[10px] font-semibold uppercase tracking-[0.34em] text-[#cfbc90]">
                                        {UI.orderSummary}
                                    </h3>
                                </div>

                                <div className="mt-6 space-y-5">
                                    {cartItems.length === 0 ? (
                                        <div className="rounded-[1.6rem] border border-[#2b2215] bg-[#100d09] px-6 py-12 text-center text-sm text-[#9e9073]">
                                            {UI.emptySelection}
                                        </div>
                                    ) : (
                                        cartItems.map((item) => (
                                            <div key={item.dishId} className="flex items-center gap-4">
                                                <div className="h-[5.5rem] w-[5.5rem] overflow-hidden rounded-[1.1rem] border border-[#2f2618] bg-black">
                                                    <img
                                                        src={getDishImageSrc(item.dish)}
                                                        alt={getDishTitle(item.dish, locale)}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="min-w-0">
                                                            <h4 className="truncate text-[1.45rem] text-white">
                                                                {getDishTitle(item.dish, locale)}
                                                            </h4>
                                                            <p className="mt-1 text-sm text-[#9c9178]">
                                                                {item.quantity} unit | {getSecondaryDishLine(item.dish, locale)}
                                                            </p>
                                                        </div>
                                                        <p className="text-[1.85rem] text-[#d0bc91]">
                                                            {formatCurrency(
                                                                (item.dish.priceMinor * item.quantity) / 100,
                                                                item.dish.currency,
                                                                locale
                                                            )}
                                                        </p>
                                                    </div>

                                                    <div className="mt-4 flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => changeQuantity(item.dishId, -1)}
                                                            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#3a3020] bg-[#12100c] text-[#cfbc90]"
                                                        >
                                                            -
                                                        </button>
                                                        <span className="min-w-14 text-center text-[11px] uppercase tracking-[0.24em] text-[#91856d]">
                                                            {UI.qty}: {item.quantity}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => changeQuantity(item.dishId, 1)}
                                                            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#3a3020] bg-[#12100c] text-[#cfbc90]"
                                                        >
                                                            +
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeFromCart(item.dishId)}
                                                            className="ml-auto text-[10px] uppercase tracking-[0.28em] text-[#bc6e6e]"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </section>

                            <section>
                                <div className="mb-5 flex items-center justify-between">
                                    <h3 className="text-[10px] font-semibold uppercase tracking-[0.34em] text-[#cfbc90]">
                                        {UI.paymentMode}
                                    </h3>
                                    <button
                                        type="button"
                                        className="text-[10px] uppercase tracking-[0.28em] text-[#988a6e]"
                                    >
                                        {UI.modify}
                                    </button>
                                </div>

                                <div className="relative overflow-hidden rounded-[1.9rem] border border-[#332918] bg-[radial-gradient(circle_at_top_left,rgba(197,179,141,0.12),transparent_48%),linear-gradient(135deg,#15120d,#0d0a07)] px-6 py-7 shadow-[0_18px_40px_rgba(0,0,0,0.28)]">
                                    <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#c5b38d]/6 blur-3xl" />
                                    <div className="relative flex items-start justify-between">
                                        <span className="material-symbols-outlined text-[30px] text-[#d0bc91]">token</span>
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#efe2c8]">
                                            Carte D&apos;Or
                                        </p>
                                    </div>
                                    <div className="relative mt-12">
                                        <p className="text-[11px] uppercase tracking-[0.38em] text-[#a6946d]">
                                            Membre Privilege
                                        </p>
                                        <p
                                            aria-label="Card ending in 8842"
                                            className="mt-3 text-[2rem] italic tracking-[0.18em] text-white"
                                        >
                                            **** **** **** 8842
                                        </p>
                                        <p className="sr-only">
                                            •••• •••• •••• 8842
                                        </p>
                                    </div>
                                </div>
                            </section>

                            <section className="border-t border-[#241c11] pt-8">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-[1.05rem] text-[#b8ac96]">
                                        <span>{UI.subtotal}</span>
                                        <span className="text-white">
                                            {formatCurrency(totalPriceMinor / 100, latestCurrency, locale)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-[1.05rem] text-[#b8ac96]">
                                        <span>{UI.serviceCharge}</span>
                                        <span className="text-white">
                                            {formatCurrency(serviceChargeMinor / 100, latestCurrency, locale)}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-8 flex items-end justify-between border-t border-[#241c11] pt-6">
                                    <div>
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-[#cfbc90]">
                                            {UI.totalInvestment}
                                        </p>
                                    </div>
                                    <p className="text-[3rem] font-semibold leading-none tracking-tight text-white">
                                        {formatCurrency(grandTotalMinor / 100, latestCurrency, locale)}
                                    </p>
                                </div>
                            </section>

                            <section className="pt-2">
                                <button
                                    type="button"
                                    onClick={handleAction}
                                    disabled={cartItems.length === 0 && resolvedStatus !== 'fired' && resolvedStatus !== 'settled'}
                                    className="flex w-full items-center justify-center gap-3 rounded-full bg-[#d0bc91] px-6 py-5 text-[12px] font-semibold uppercase tracking-[0.28em] text-black transition hover:bg-[#dac89f] disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <span>{actionLabel}</span>
                                    <span className="material-symbols-outlined text-[18px]">east</span>
                                </button>
                                <p className="mt-5 text-center text-[10px] uppercase tracking-[0.3em] text-[#81745d] italic">
                                    {floorSyncCopy?.byContinuing || UI.byContinuing}
                                </p>
                            </section>
                        </main>
                    </>
                )}
            </div>

            {renderBottomNav && (
                <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-md border-t border-[#2b2215] bg-[#090704]/94 px-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-4 backdrop-blur-xl">
                    <div className="flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => {
                                setShowLanding(false);
                                setActiveView('menu');
                            }}
                            className={`flex flex-col items-center gap-1 ${
                                resolvedActiveView === 'menu' ? 'text-[#cfbc90]' : 'text-[#7f725a]'
                            }`}
                        >
                            <span className="material-symbols-outlined text-[20px]">restaurant_menu</span>
                            <span className="text-[9px] uppercase tracking-[0.26em]">{UI.menu}</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveView('cart')}
                            className={`relative flex flex-col items-center gap-1 ${
                                resolvedActiveView === 'cart' ? 'text-[#cfbc90]' : 'text-[#7f725a]'
                            }`}
                        >
                            <span className="material-symbols-outlined text-[20px]">event_available</span>
                            <span className="text-[9px] uppercase tracking-[0.26em]">{UI.reserve}</span>
                            {totalItems > 0 && (
                                <span className="absolute -right-3 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#d0bc91] px-1 text-[9px] font-bold text-black">
                                    {totalItems}
                                </span>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setActiveView('menu');
                                setShowLanding(true);
                            }}
                            className={`flex flex-col items-center gap-1 ${
                                showLanding ? 'text-[#cfbc90]' : 'text-[#7f725a]'
                            }`}
                        >
                            <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
                            <span className="text-[9px] uppercase tracking-[0.26em]">{UI.atelier}</span>
                        </button>

                        <div className="flex flex-col items-center gap-1 text-[#7f725a]">
                            <span className="material-symbols-outlined text-[20px]">person</span>
                            <span className="text-[9px] uppercase tracking-[0.26em]">{UI.profile}</span>
                        </div>
                    </div>
                </nav>
            )}
        </div>
    );
}
