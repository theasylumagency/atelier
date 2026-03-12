'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

type OrderStatus = 'browsing' | 'fired' | 'settled';
type ViewState = 'menu' | 'details' | 'cart';
type FloorState = 'idle' | 'browsing' | 'ordering' | 'fired' | 'settled';
type ActivityType =
    | 'session_started'
    | 'category_focus'
    | 'dish_view'
    | 'item_added'
    | 'item_removed'
    | 'quantity_changed'
    | 'order_confirmed'
    | 'table_cleared';

interface CartItem {
    dish: any;
    quantity: number;
}

interface ActivityEvent {
    id: string;
    type: ActivityType;
    label: string;
    meta?: string;
    at: string;
}

const DISH_FALLBACK_SRC = '/images/fallbacks/dish-placeholder.svg';

const UI = {
    en: {
        emptySelection: 'No dishes selected yet.',
        confirmOrder: 'Confirm Order',
        clearTable: 'Clear Table',
        complete: 'Complete',
        guestInitiated: 'Guest initiated order.',
        menu: 'Menu',
        cart: 'Cart',
        browsing: 'Browsing',
        ordering: 'Ordering',
        sent: 'Sent',
        completed: 'Completed',
        idle: 'Idle',
        sessionLive: 'Session live',
        floorBoard: 'Floor Board',
        live: 'Live',
        currentFocus: 'Current Focus',
        activityFeed: 'Activity Feed',
        terminalSummary: 'Terminal Summary',
        viewedDish: 'Viewed dish',
        activeCategory: 'Active category',
        tableStatus: 'Table status',
        cartTotal: 'Cart total',
        items: 'Items',
        sessionOpened: 'Menu opened',
        guestBrowsing: 'Guest is browsing the menu.',
        viewingDish: 'Viewing dish',
        browsingCategory: 'Browsing category',
        addedToCart: 'Added to cart',
        removedFromCart: 'Removed from cart',
        quantityUpdated: 'Quantity updated',
        orderConfirmed: 'Order confirmed',
        tableCleared: 'Table cleared',
        waitingForGuest: 'Waiting for guest interaction',
        watchingLive: 'The terminal reflects browsing, selection, and checkout in real time.',
        actionRequired: 'Action Required',
        browsingActive: 'Browsing / Active',
        clearedPaid: 'Cleared / Paid',
        guestDevice: 'Guest Device',
        operatorTerminal: 'Operator Terminal',
        pageTitle: 'Live Floor Sync',
        pageSubtitle:
            "See how a guest’s menu activity appears instantly on the restaurant terminal — from browsing and dish views to cart changes and order confirmation.",
        allCategories: 'All',
        menuLabel: 'Menu',
        selectionLabel: 'Selection',
        currentSession: 'Current session',
        t04Hint: 'Table T-04 is the live simulated guest.',
        protectedFeed: 'Protected internal feed',
        noDishViewed: 'No dish viewed yet',
        noCategoryFocused: 'No category focused yet',
        liveSince: 'Live since',
        lastAction: 'Last action',
        guestOpenedSession: 'Guest opened the menu.',
        addService: 'Add to Service',
        theSelection: 'The Selection',
        total: 'Total',
        byContinuing: 'Secured via Spatial Protocol',
    },
    ka: {
        emptySelection: 'ჯერ არცერთი კერძი არ არის დამატებული.',
        confirmOrder: 'შეკვეთის დადასტურება',
        clearTable: 'მაგიდის გასუფთავება',
        complete: 'დასრულებულია',
        guestInitiated: 'შეკვეთა სტუმარმა დაიწყო.',
        menu: 'მენიუ',
        cart: 'კალათა',
        browsing: 'ათვალიერებს',
        ordering: 'უკვეთავს',
        sent: 'გაგზავნილია',
        completed: 'დასრულებულია',
        idle: 'მოლოდინი',
        sessionLive: 'სესია აქტიურია',
        floorBoard: 'დარბაზის ტერმინალი',
        live: 'ლაივი',
        currentFocus: 'მიმდინარე ფოკუსი',
        activityFeed: 'აქტივობის ჟურნალი',
        terminalSummary: 'ტერმინალის შეჯამება',
        viewedDish: 'გახსნილი კერძი',
        activeCategory: 'აქტიური კატეგორია',
        tableStatus: 'მაგიდის სტატუსი',
        cartTotal: 'კალათის ჯამი',
        items: 'ერთეული',
        sessionOpened: 'მენიუ გაიხსნა',
        guestBrowsing: 'სტუმარი მენიუს ათვალიერებს.',
        viewingDish: 'კერძის ნახვა',
        browsingCategory: 'კატეგორიის დათვალიერება',
        addedToCart: 'დაემატა კალათაში',
        removedFromCart: 'წაიშალა კალათიდან',
        quantityUpdated: 'რაოდენობა შეიცვალა',
        orderConfirmed: 'შეკვეთა დადასტურდა',
        tableCleared: 'მაგიდა გასუფთავდა',
        waitingForGuest: 'ველოდებით სტუმრის მოქმედებას',
        watchingLive: 'ტერმინალი რეალურ დროში აჩვენებს დათვალიერებას, არჩევანს და დადასტურებას.',
        actionRequired: 'საჭიროა რეაგირება',
        browsingActive: 'ათვალიერებს / აქტიურია',
        clearedPaid: 'გადახდილია / გასუფთავდა',
        guestDevice: 'სტუმრის მოწყობილობა',
        operatorTerminal: 'ოპერატორის ტერმინალი',
        pageTitle: 'ცოცხალი სინქრონი დარბაზზე',
        pageSubtitle:
            'ნახეთ, როგორ ჩნდება სტუმრის მენიუში მოქმედება მყისიერად ტერმინალზე — დათვალიერებიდან და კერძის გახსნიდან კალათისა და შეკვეთის დადასტურებამდე.',
        allCategories: 'ყველა',
        menuLabel: 'მენიუ',
        selectionLabel: 'არჩევანი',
        currentSession: 'მიმდინარე სესია',
        t04Hint: 'T-04 არის ცოცხალი სიმულაციური სტუმარი.',
        protectedFeed: 'შიდა დაცული არხი',
        noDishViewed: 'ჯერ არცერთი კერძი არ არის გახსნილი',
        noCategoryFocused: 'ჯერ კატეგორია არ არის არჩეული',
        liveSince: 'აქტიურია',
        lastAction: 'ბოლო ქმედება',
        guestOpenedSession: 'სტუმარმა მენიუ გახსნა.',
        addService: 'სერვისზე დამატება',
        theSelection: 'არჩევანი',
        total: 'ჯამი',
        byContinuing: 'დაცულია Spatial Protocol-ით',
    },
} as const;

export default function FloorSync({ dict, initialCategories = [], initialDishes = [], locale = 'en' }: { dict: any; initialCategories?: any[]; initialDishes?: any[]; locale?: string }) {
    const ui = locale === 'ka' ? UI.ka : UI.en;

    const [status, setStatus] = useState<OrderStatus>('browsing');
    const [activeView, setActiveView] = useState<ViewState>('menu');
    const [selectedDish, setSelectedDish] = useState<any | null>(null);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [time, setTime] = useState<string>('');
    const [activityFeed, setActivityFeed] = useState<ActivityEvent[]>([]);
    const [sessionStartedAt, setSessionStartedAt] = useState<string>('');
    const scrollRef = useRef<HTMLDivElement>(null);

    const activeDishes = useMemo(
        () => initialDishes.filter((d) => d.status === 'active' && !d.soldOut).sort((a, b) => a.order - b.order),
        [initialDishes]
    );
    const activeCategories = useMemo(
        () =>
            initialCategories
                .filter((c) => c.status === 'active' && activeDishes.some((d) => d.categoryId === c.id))
                .sort((a, b) => a.order - b.order),
        [initialCategories, activeDishes]
    );
    const displayedDishes = useMemo(
        () => activeDishes.filter((d) => selectedCategory === 'all' || d.categoryId === selectedCategory),
        [activeDishes, selectedCategory]
    );

    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
    const totalPrice = cart.reduce((acc, item) => acc + item.quantity * (item.dish.priceMinor / 100), 0);

    const dishTitle = (dish: any | null) => {
        if (!dish) return '';
        return dish.title?.[locale as keyof typeof dish.title] || dish.title?.en || 'Dish';
    };

    const categoryLabel = (categoryId: string) => {
        if (categoryId === 'all') {
            return dict.floorSync?.all || ui.allCategories;
        }
        const category = activeCategories.find((item) => item.id === categoryId);
        if (!category) return ui.noCategoryFocused;
        return category.title?.[locale as keyof typeof category.title] || category.title?.en || category.slug || categoryId;
    };

    const pushActivity = (type: ActivityType, label: string, meta?: string) => {
        const now = new Date();
        const stamp = now.toLocaleTimeString(locale === 'ka' ? 'ka-GE' : 'en-GB', {
            hour: '2-digit',
            minute: '2-digit',
        });

        const event: ActivityEvent = {
            id: `${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
            type,
            label,
            meta,
            at: stamp,
        };

        setActivityFeed((prev) => [event, ...prev].slice(0, 6));
    };

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [selectedCategory]);

    useEffect(() => {
        const now = new Date();
        const started = now.toLocaleTimeString(locale === 'ka' ? 'ka-GE' : 'en-GB', {
            hour: '2-digit',
            minute: '2-digit',
        });
        setSessionStartedAt(started);
        setActivityFeed([
            {
                id: `init-${now.getTime()}`,
                type: 'session_started',
                label: ui.sessionOpened,
                meta: ui.guestOpenedSession,
                at: started,
            },
        ]);
    }, [ui.sessionOpened, ui.guestOpenedSession, locale]);

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const hours = now.getHours().toString().padStart(2, '0');
            const minutes = now.getMinutes().toString().padStart(2, '0');
            setTime(`${hours}:${minutes}`);
        };
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (selectedCategory !== 'all' && !activeCategories.some((category) => category.id === selectedCategory)) {
            setSelectedCategory('all');
        }
    }, [activeCategories, selectedCategory]);

    const floorState: FloorState =
        status === 'settled'
            ? 'settled'
            : status === 'fired'
                ? 'fired'
                : totalItems > 0
                    ? 'ordering'
                    : selectedDish || selectedCategory !== 'all' || activityFeed.length > 0
                        ? 'browsing'
                        : 'idle';

    const floorStateLabel =
        floorState === 'settled'
            ? ui.completed
            : floorState === 'fired'
                ? ui.sent
                : floorState === 'ordering'
                    ? ui.ordering
                    : floorState === 'browsing'
                        ? ui.browsing
                        : ui.idle;

    const handleSelectCategory = (categoryId: string) => {
        setSelectedCategory(categoryId);
        pushActivity('category_focus', ui.browsingCategory, categoryLabel(categoryId));
    };

    const handleOpenDish = (dish: any) => {
        setSelectedDish(dish);
        setActiveView('details');
        if (status === 'settled') {
            setStatus('browsing');
        }
        pushActivity('dish_view', ui.viewingDish, dishTitle(dish));
    };

    const addToCart = (dish: any) => {
        const existing = cart.find((item) => item.dish.id === dish.id);
        setCart((prev) => {
            const found = prev.find((item) => item.dish.id === dish.id);
            if (found) {
                return prev.map((item) =>
                    item.dish.id === dish.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, { dish, quantity: 1 }];
        });
        setStatus('browsing');
        pushActivity(existing ? 'quantity_changed' : 'item_added', existing ? ui.quantityUpdated : ui.addedToCart, `${dishTitle(dish)} ×${existing ? existing.quantity + 1 : 1}`);
    };


    const decreaseQty = (dishId: string) => {
        const existing = cart.find((item) => item.dish.id === dishId);
        if (!existing) return;

        if (existing.quantity === 1) {
            removeFromCart(dishId);
            return;
        }

        setCart((prev) =>
            prev
                .map((item) => (item.dish.id === dishId ? { ...item, quantity: item.quantity - 1 } : item))
                .filter((item) => item.quantity > 0)
        );
        setStatus('browsing');
        pushActivity('quantity_changed', ui.quantityUpdated, `${dishTitle(existing.dish)} ×${existing.quantity - 1}`);
    };

    const removeFromCart = (dishId: string) => {
        const existing = cart.find((item) => item.dish.id === dishId);
        setCart((prev) => prev.filter((item) => item.dish.id !== dishId));
        setStatus('browsing');
        if (existing) {
            pushActivity('item_removed', ui.removedFromCart, dishTitle(existing.dish));
        }
    };

    const handleAction = () => {
        if (status === 'browsing') {
            if (cart.length === 0) return;
            setStatus('fired');
            pushActivity('order_confirmed', ui.orderConfirmed, `${totalItems} ${ui.items.toLowerCase()} · ${totalPrice.toFixed(2)} ₾`);
            return;
        }

        if (status === 'fired') {
            setStatus('settled');
            return;
        }

        setStatus('browsing');
        setCart([]);
        setSelectedDish(null);
        setSelectedCategory('all');
        setActiveView('menu');
        pushActivity('table_cleared', ui.tableCleared, 'T-04');
    };

    const latestAction = activityFeed[0];

    return (
        <div className="w-full max-w-[1600px] mx-auto py-12 lg:py-24">
            {/* Header Text */}
            <div className="flex flex-col items-center justify-center text-center mb-16 px-6">
                <p className="text-[10px] uppercase tracking-[0.32em] text-stone-500 mb-4">
                    {dict.floorSync?.eyebrow || ui.currentSession}
                </p>
                <h2 className="text-3xl md:text-5xl font-light tracking-tight mb-4">
                    {dict.floorSync?.title || ui.pageTitle}
                </h2>
                <p className="text-stone-400 max-w-3xl text-sm md:text-base leading-relaxed">
                    {dict.floorSync?.subtitle || ui.pageSubtitle}
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 px-6 lg:px-12 items-center lg:items-stretch">

                {/* -------------------------------------------------------------------------------- */}
                {/* LEFT HEMISPHERE: The Digital Maître D' (Mobile Mockup) */}
                {/* -------------------------------------------------------------------------------- */}
                <section className="w-full lg:w-[400px] flex flex-col items-center flex-shrink-0">
                    <div className="w-full max-w-[360px] flex items-center justify-between mb-4 px-2">
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.28em] text-stone-500">{ui.guestDevice}</p>
                            <p className="text-sm text-stone-300">{ui.sessionLive}</p>
                        </div>
                        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-stone-300">
                            T-04
                        </div>
                    </div>

                    <div className="relative w-full max-w-[360px] h-[780px] bg-black rounded-[3.5rem] border-[12px] border-[#1a1a1a] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.6)] overflow-hidden ring-2 ring-neutral-700/50">
                        {/* iPhone Air Status Bar */}
                        <div className="absolute top-0 left-0 right-0 h-14 z-50 flex items-center justify-between px-7 pt-3 pointer-events-none text-white w-full">
                            {/* left side: Time */}
                            <div className="flex-1 flex justify-start">
                                <span className="text-[14px] font-semibold tracking-wide pr-1">{time || '9:41'}</span>
                            </div>
                            {/* Center: Dynamic Island */}
                            <div className="absolute left-1/2 -translate-x-1/2 top-4 w-[115px] h-[32px] bg-black rounded-full shadow-[inset_0_0_3px_rgba(255,255,255,0.08)] before:absolute before:right-3 before:top-1/2 before:-translate-y-1/2 before:w-3 before:h-3 before:rounded-full before:bg-[#080808] before:shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)] after:absolute after:right-4 after:top-1/2 after:-translate-y-1/2 after:w-1 after:h-1 after:rounded-full after:bg-blue-600/30"></div>
                            {/* right side: Icons */}
                            <div className="flex-1 flex justify-end gap-1.5 items-center">
                                <span className="material-symbols-outlined text-[15px]">android_cell_4_bar</span>
                                <span className="material-symbols-outlined text-[15px]">wifi</span>
                                <div className="relative flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[15px]">battery_android_frame_6</span>
                                </div>
                            </div>
                        </div>

                        {/* Mobile Content */}
                        <div className="h-full w-full bg-[#0F0F0F] overflow-hidden relative font-sans text-white pt-10">

                            {/* Sliding Track for the 3 Screens */}
                            <div
                                className="flex h-full w-[300%] transition-transform duration-500 ease-in-out"
                                style={{ transform: `translateX(-${activeView === 'menu' ? 0 : activeView === 'details' ? 33.33 : 66.66}%)` }}
                            >
                                {/* --------------------------------- */}
                                {/* SCREEN 1: THE MENU */}
                                {/* --------------------------------- */}
                                <div ref={scrollRef} className="overflow-y-auto w-1/3 h-full flex flex-col relative custom-scrollbar">
                                    <div className="flex-1 bg-[#0F0F0F]/75 flex p-4 sticky top-0 z-10 justify-between gap-1.5 items-center">
                                        <span className="material-symbols-outlined text-[15px]">menu</span>
                                        <span className="text-[15px]">L'Atelier</span>
                                        <div className="relative flex items-center justify-center">
                                            <div className="rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-[8px] uppercase tracking-widest text-stone-400 flex items-center gap-1.5">
                                                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                                Table 04
                                            </div>

                                        </div>
                                    </div>
                                    <div className="px-6 flex-shrink-0">
                                        <p className="text-[10px] uppercase tracking-[0.3em] text-stone-500 mb-2">{dict.floorSync?.guestInterface || 'Winter Collection'}</p>
                                        <h1 className="text-3xl font-light leading-none">{dict.floorSync?.georgianHeritageFirst || 'Georgian'} <br /><span className="font-bold">{dict.floorSync?.georgianHeritageSecond || 'Heritage'}</span></h1>
                                        <p className="text-[10px] tracking-normal text-stone-500 mb-2 pt-4">{dict.floorSync?.winterCollectionDesc || ui.guestBrowsing}</p>
                                    </div>

                                    {/* Horizontal Categories */}
                                    <div className="categories-mobile border-t border-white/5 bg-[#0F0F0F] pt-2 mt-2 flex sticky top-[56px] z-[9] items-center overflow-x-auto no-scrollbar flex-shrink-0 px-6 gap-3 whitespace-nowrap border-b border-white/5 pb-3">
                                        <button
                                            onClick={() => handleSelectCategory('all')}
                                            className={`text-[10px] uppercase tracking-widest px-4 py-2 rounded-full transition-all duration-300 ${selectedCategory === 'all' ? 'bg-white text-black font-bold' : 'text-stone-400 hover:text-white bg-white/5 hover:bg-white/10'}`}
                                        >
                                            {dict.floorSync?.all || ui.allCategories}
                                        </button>
                                        {activeCategories.map((c) => (
                                            <button
                                                key={c.id}
                                                onClick={() => handleSelectCategory(c.id)}
                                                className={`text-[10px] uppercase tracking-widest px-4 py-2 rounded-full transition-all duration-300 ${selectedCategory === c.id ? 'bg-white text-black font-bold' : 'text-stone-400 hover:text-white bg-white/5 hover:bg-white/10'}`}
                                            >
                                                {c.title[locale as keyof typeof c.title] || c.title.en}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Scrollable Dishes */}
                                    <div className="flex-1 px-4 py-6 pb-24 space-y-6 bg-[#0A0A0A]">
                                        {displayedDishes.map(dish => (
                                            <article key={dish.id} className="group relative w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl transition-transform duration-500 hover:scale-[1.02]">
                                                {/* Background Image */}
                                                <div className="absolute inset-0 bg-neutral-900 border border-white/5 rounded-2xl">
                                                    {(dish.images?.portrait || dish.images?.landscape || dish.photo?.small) ? (
                                                        <img
                                                            src={dish.images?.portrait || dish.images?.landscape || `/uploads/dishes/${dish.photo.small}`}
                                                            alt={dishTitle(dish)}
                                                            className="h-full w-full object-cover transition-all duration-700 opacity-60 group-hover:opacity-80 group-hover:scale-105"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.02)_10px,rgba(255,255,255,0.02)_20px)]">
                                                            <span className="bg-black/50 backdrop-blur-sm px-3 py-1 text-[10px] uppercase font-sans tracking-[0.3em] text-stone-500 border border-white/10 rounded-full">
                                                                {dict.panel?.awaitingAsset || 'No Image'}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Gradient Overlay */}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10 pointer-events-none"></div>

                                                {/* Content Overlay */}
                                                <div className="absolute inset-0 p-5 flex flex-col justify-between z-8">
                                                    <div className="flex justify-between items-start w-full">
                                                        <div className="flex flex-wrap gap-2">
                                                            {dish.chefsPick && <span className="px-2 py-1 bg-amber-500/20 text-amber-500 backdrop-blur-md border border-amber-500/30 text-[9px] uppercase tracking-widest rounded-full shadow-lg">Signature</span>}
                                                        </div>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                addToCart(dish);
                                                            }}
                                                            className="h-8 w-8 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-amber-500 hover:text-black hover:border-amber-500 transition-all duration-300 transform group-hover:scale-110"
                                                        >
                                                            <span className="material-symbols-outlined text-[18px]">add</span>
                                                        </button>
                                                    </div>

                                                    <div className="flex flex-col gap-1 cursor-pointer" onClick={() => handleOpenDish(dish)}>
                                                        <div className="flex justify-between items-end gap-2">
                                                            <h3 className="text-xl md:text-2xl font-light tracking-tight text-white leading-tight drop-shadow-md pb-1">{dishTitle(dish)}</h3>
                                                            <span className="text-lg font-light text-amber-400 drop-shadow-md flex-shrink-0 mb-1">{(dish.priceMinor / 100).toFixed(2)} {dish.currency === 'GEL' ? '₾' : '$'}</span>
                                                        </div>
                                                        <p className="text-[11px] text-stone-300 line-clamp-2 leading-relaxed drop-shadow-sm font-light">
                                                            {dish.description[locale as keyof typeof dish.description] || dish.description.en}
                                                        </p>
                                                    </div>
                                                </div>
                                            </article>
                                        ))}
                                    </div>
                                </div>

                                {/* --------------------------------- */}
                                {/* SCREEN 2: DISH DETAILS */}
                                {/* --------------------------------- */}
                                <div className="w-1/3 h-full flex flex-col relative bg-black overflow-hidden">
                                    {selectedDish && (
                                        <>
                                            {/* Hero Image Background */}
                                            <div className="absolute inset-0 w-full h-[60%] bg-cover bg-center bg-neutral-900 border-b border-white/10" style={{ backgroundImage: `url(${selectedDish.images?.portrait || selectedDish.images?.landscape || (selectedDish.photo?.small ? `/uploads/dishes/${selectedDish.photo.small}` : DISH_FALLBACK_SRC)})` }}>
                                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                                            </div>

                                            {/* Header */}
                                            <header className="flex items-center justify-between px-6 py-4 sticky top-0 z-20 flex-shrink-0">
                                                <button onClick={() => setActiveView('menu')} className="h-8 w-8 bg-black/40 backdrop-blur-md border border-white/10 rounded-full transition-colors flex items-center justify-center hover:bg-white/20">
                                                    <span className="material-symbols-outlined text-sm text-white">arrow_back</span>
                                                </button>
                                                <div className="w-8"></div>
                                            </header>

                                            {/* Content Area - Scrollable */}
                                            <div className="flex-1 overflow-y-auto z-10 pb-24 pt-[40%] px-4 no-scrollbar">
                                                <div className="bg-[#0F0F0F]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] min-h-full">
                                                    <div className="border-b border-white/5 pb-6">
                                                        <div className="flex justify-between items-center mb-3">
                                                            <p className="text-[9px] uppercase tracking-[0.3em] px-2 py-1 bg-white/5 rounded-full text-stone-400">Ref: {selectedDish.id.split('_')[1] || selectedDish.id}</p>
                                                            {selectedDish.chefsPick && <span className="text-[9px] text-amber-500 uppercase tracking-widest font-bold">Signature</span>}
                                                        </div>
                                                        <h1 className="text-3xl font-light leading-tight mb-2 tracking-tight">{dishTitle(selectedDish)}</h1>
                                                        <p className="text-2xl font-light text-amber-500">{(selectedDish.priceMinor / 100).toFixed(2)} <span className="text-lg text-amber-500/70">{selectedDish.currency === 'GEL' ? '₾' : '$'}</span></p>
                                                    </div>

                                                    {/* Narrative */}
                                                    <div className="pt-6">
                                                        <h3 className="text-[10px] uppercase tracking-[0.4em] font-medium mb-4 text-stone-400">The Narrative</h3>
                                                        <p className="text-[13px] leading-relaxed font-light text-stone-300">
                                                            {selectedDish.story?.[locale as keyof typeof selectedDish.story] || selectedDish.story?.en || selectedDish.description?.[locale as keyof typeof selectedDish.description] || selectedDish.description?.en || '—'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Bar */}
                                            <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black via-black/90 to-transparent p-6 pt-12 flex-shrink-0 pb-20">
                                                <button
                                                    onClick={() => addToCart(selectedDish)}
                                                    className="w-full bg-white text-black h-14 text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-stone-200 transition-all duration-300 flex items-center justify-center gap-3 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transform hover:-translate-y-1"
                                                >
                                                    <span className="material-symbols-outlined text-[16px]">add</span>
                                                    {dict.floorSync?.addService || ui.addService}
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* --------------------------------- */}
                                {/* SCREEN 3: THE SILENT CART */}
                                {/* --------------------------------- */}
                                <div className="w-1/3 h-full flex flex-col relative bg-[#0A0A0A] overflow-y-auto custom-scrollbar">
                                    {/* Header */}
                                    <header className="flex items-center justify-between px-6 py-4 sticky top-0 z-10 bg-[#0F0F0F]/90 backdrop-blur-xl border-b border-white/5 flex-shrink-0 shadow-sm">
                                        <button onClick={() => setActiveView('menu')} className="p-2 -ml-2 hover:bg-white/5 rounded-full transition-colors flex items-center justify-center">
                                            <span className="material-symbols-outlined text-sm">arrow_back</span>
                                        </button>
                                        <h1 className="text-[10px] font-bold tracking-[0.3em] uppercase">{dict.floorSync?.theSelection || ui.theSelection}</h1>
                                        <div className="w-8"></div>
                                    </header>

                                    <div className="flex-1 p-6 pb-32">
                                        {cart.length === 0 ? (
                                            <div className="h-full flex flex-col items-center justify-center text-stone-500 text-xs uppercase tracking-widest p-6 text-center opacity-50">
                                                <span className="material-symbols-outlined text-4xl mb-4 font-light">receipt_long</span>
                                                {ui.emptySelection}
                                            </div>
                                        ) : (
                                            <div className="space-y-6">
                                                {cart.map((item) => (
                                                    <div key={item.dish.id} className="flex gap-4 items-center p-3 rounded-2xl bg-[#111] border border-white/5 shadow-lg group hover:border-white/10 transition-colors">
                                                        <div className="h-16 w-16 flex-shrink-0 bg-neutral-900 rounded-xl bg-cover bg-center shadow-inner" style={{ backgroundImage: `url(${item.dish.images?.square || item.dish.images?.landscape || (item.dish.photo?.small ? `/uploads/dishes/${item.dish.photo.small}` : DISH_FALLBACK_SRC)})` }}></div>
                                                        <div className="flex-1 flex flex-col justify-center h-full min-w-0">
                                                            <div className="flex justify-between items-start gap-2">
                                                                <h3 className="text-sm font-light tracking-tight pr-2 leading-tight line-clamp-2 truncate">{dishTitle(item.dish)}</h3>
                                                                <span className="text-xs font-medium text-amber-500 whitespace-nowrap">{(item.dish.priceMinor / 100).toFixed(2)} {item.dish.currency === 'GEL' ? '₾' : '$'}</span>
                                                            </div>
                                                            <div className="flex justify-between items-end mt-2 gap-3">
                                                                <div className="flex items-center gap-2">
                                                                    <button
                                                                        onClick={() => decreaseQty(item.dish.id)}
                                                                        className="h-6 w-6 rounded-full bg-white/5 text-stone-300 hover:bg-white/10 flex items-center justify-center transition-all duration-300"
                                                                    >
                                                                        <span className="material-symbols-outlined text-[12px]">remove</span>
                                                                    </button>

                                                                    <span className="text-[9px] uppercase tracking-widest text-stone-400 bg-white/5 px-2 py-0.5 rounded-md">
                                                                        Qty: {item.quantity}
                                                                    </span>

                                                                    <button
                                                                        onClick={() => addToCart(item.dish)}
                                                                        className="h-6 w-6 rounded-full bg-white/5 text-stone-300 hover:bg-white/10 flex items-center justify-center transition-all duration-300"
                                                                    >
                                                                        <span className="material-symbols-outlined text-[12px]">add</span>
                                                                    </button>
                                                                </div>

                                                                <button
                                                                    onClick={() => removeFromCart(item.dish.id)}
                                                                    className="h-6 w-6 rounded-full bg-red-500/10 text-red-500/70 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all duration-300"
                                                                >
                                                                    <span className="material-symbols-outlined text-[12px]">close</span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}

                                                {/* Total */}
                                                <div className="mt-8 bg-[#111] border border-white/5 p-5 rounded-2xl shadow-xl">
                                                    <div className="flex justify-between items-center text-white mb-2">
                                                        <span className="text-[10px] uppercase font-medium tracking-[0.2em] text-stone-400">{dict.floorSync?.total || ui.total}</span>
                                                        <span className="text-xl font-light tracking-tight text-white">
                                                            {totalPrice.toFixed(2)} <span className="text-sm text-stone-400">{locale === 'ka' ? '₾' : '$'}</span>
                                                        </span>
                                                    </div>

                                                    <button
                                                        onClick={handleAction}
                                                        className={`w-full py-4 mt-5 text-[10px] font-bold uppercase tracking-[0.3em] rounded-full transition-all duration-500 flex items-center justify-center gap-2 relative overflow-hidden ${status === 'browsing' ? 'bg-white text-black hover:bg-stone-200 shadow-[0_5px_15px_rgba(255,255,255,0.1)]' :
                                                            status === 'fired' ? 'bg-amber-600/20 text-amber-500 border border-amber-500/50 hover:bg-amber-600/30 shadow-[0_0_20px_rgba(245,158,11,0.2)]' :
                                                                'bg-green-600/20 text-green-500 border border-green-500/50 hover:bg-green-600/30 shadow-[0_0_20px_rgba(34,197,94,0.2)]'
                                                            }`}
                                                    >
                                                        {status === 'browsing' ? (
                                                            <> {dict.floorSync?.confirmOrder || ui.confirmOrder} <span className="material-symbols-outlined text-[14px]">arrow_forward</span></>
                                                        ) : status === 'fired' ? (
                                                            <> {dict.floorSync?.clearTable || ui.clearTable}</>
                                                        ) : (
                                                            <> {dict.floorSync?.complete || ui.complete}</>
                                                        )}
                                                    </button>
                                                </div>

                                                <p className="text-center text-[8px] text-stone-600 uppercase tracking-widest mt-4">
                                                    {dict.floorSync?.byContinuing || ui.byContinuing}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Bottom Navigation */}
                            <nav className="absolute bottom-0 left-0 right-0 z-50 bg-[#0A0A0A]/95 backdrop-blur-xl border-t border-white/5 px-6 pb-6 pt-4">
                                <div className="flex justify-around items-center max-w-lg mx-auto">
                                    <button onClick={() => setActiveView('menu')} className={`flex flex-col items-center gap-1 group transition-colors ${activeView === 'menu' ? 'text-amber-500' : 'text-stone-500'}`}>
                                        <span className={`material-symbols-outlined text-[18px] ${activeView === 'menu' ? 'fill-current' : ''}`}>restaurant_menu</span>
                                        <span className="text-[8px] uppercase tracking-widest">{ui.menu}</span>
                                    </button>
                                    <button onClick={() => setActiveView('cart')} className={`flex flex-col items-center gap-1 relative transition-colors ${activeView === 'cart' ? 'text-amber-500' : 'text-stone-500'}`}>
                                        <span className={`material-symbols-outlined text-[18px] ${activeView === 'cart' ? 'fill-current' : ''}`}>shopping_bag</span>
                                        <span className="text-[8px] uppercase tracking-widest">{ui.cart}</span>
                                        {totalItems > 0 && (
                                            <span className="absolute -top-1 -right-2 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-amber-500 text-[8px] font-bold text-black border border-[#0A0A0A]">{totalItems}</span>
                                        )}
                                    </button>
                                </div>
                            </nav>
                        </div>
                    </div>
                </section>

                {/* -------------------------------------------------------------------------------- */}
                {/* RIGHT HEMISPHERE: The Floor Board (Preserved from "desired") */}
                {/* -------------------------------------------------------------------------------- */}
                <section className="flex-1 flex flex-col w-full min-h-[500px] lg:min-h-0">
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-4 gap-4">
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.28em] text-stone-500 mb-2">{ui.operatorTerminal}</p>
                            <h2 className="text-xl font-light tracking-tight">{dict.floorSync?.floorBoard || ui.floorBoard}</h2>
                            <p className="text-xs text-stone-500">{dict.floorSync?.realTime || ui.watchingLive}</p>
                        </div>

                        <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-neutral-900 border border-neutral-800 w-fit">
                            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-[10px] font-sans uppercase tracking-[0.2em]">{dict.floorSync?.liveFeed || ui.live}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.25fr)_360px] gap-5 flex-1">
                        <div className="relative border border-neutral-800 bg-[#0A0A0A] overflow-hidden min-h-[560px] bg-[radial-gradient(circle,#333_1px,transparent_1px)]" style={{ backgroundSize: '40px 40px' }}>
                            {/* Table T-04 */}
                            <div className="absolute top-[18%] left-[16%] group">
                                <div
                                    className={`w-32 h-32 rounded-full border flex items-center justify-center relative transition-all duration-500 ${floorState === 'idle' ? 'border-white/10 bg-transparent' : floorState === 'browsing' ? 'border-white/40 bg-white/[0.04] shadow-[0_0_24px_rgba(255,255,255,0.08)]' : floorState === 'ordering' ? 'border-white/70 bg-white/[0.06] shadow-[0_0_28px_rgba(255,255,255,0.14)]' : floorState === 'fired' ? 'border-amber-500 bg-amber-500/10 shadow-[0_0_30px_rgba(245,158,11,0.3)]' : 'border-green-500 bg-green-500/10 shadow-[0_0_30px_rgba(34,197,94,0.2)]'}`}
                                >
                                    <div className="flex flex-col items-center justify-center gap-1">
                                        <div className={`text-xs font-bold uppercase ${floorState === 'fired' ? 'text-amber-400' : floorState === 'settled' ? 'text-green-400' : 'text-white/80'}`}>T-04</div>
                                        <div className={`text-[8px] uppercase tracking-[0.24em] ${floorState === 'idle' ? 'text-stone-600' : floorState === 'fired' ? 'text-amber-400' : floorState === 'settled' ? 'text-green-400' : 'text-stone-300'}`}>{floorStateLabel}</div>
                                    </div>

                                    {(floorState === 'browsing' || floorState === 'ordering') && (
                                        <div className="absolute inset-0 rounded-full border border-white/20 animate-pulse opacity-30"></div>
                                    )}
                                    {floorState === 'fired' && <div className="absolute inset-0 rounded-full border border-amber-500 animate-ping opacity-20"></div>}

                                    {totalItems > 0 && floorState !== 'settled' && (
                                        <div className="absolute -right-2 -top-2 min-w-[24px] h-[24px] px-1 rounded-full bg-amber-500 text-black text-[10px] font-bold flex items-center justify-center border border-black shadow-lg">
                                            {totalItems}
                                        </div>
                                    )}

                                    <div className={`absolute -top-16 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/85 backdrop-blur-md rounded border border-white/10 px-3 py-2 shadow-2xl text-[10px] uppercase tracking-[0.2em] text-stone-200 transition-all duration-500 ${floorState === 'browsing' || floorState === 'ordering' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'}`}>
                                        {latestAction?.label || ui.waitingForGuest}
                                    </div>

                                    <div className={`absolute -right-64 top-1/2 -translate-y-1/2 w-56 bg-black/85 backdrop-blur-md rounded-2xl border p-4 shadow-2xl z-30 transition-all duration-500 ${floorState !== 'idle' ? 'opacity-100 translate-x-0 border-white/10' : 'opacity-0 translate-x-5 border-neutral-800 pointer-events-none'}`}>
                                        <div className="flex items-start justify-between gap-3 mb-3">
                                            <div>
                                                <p className="text-[9px] uppercase tracking-[0.22em] text-stone-500 mb-1">{ui.currentFocus}</p>
                                                <p className="text-sm text-white">{selectedDish ? dishTitle(selectedDish) : categoryLabel(selectedCategory)}</p>
                                            </div>
                                            <span className={`text-[9px] uppercase tracking-[0.2em] px-2 py-1 rounded-full border ${floorState === 'fired' ? 'border-amber-500/50 text-amber-400 bg-amber-500/10' : floorState === 'settled' ? 'border-green-500/50 text-green-400 bg-green-500/10' : 'border-white/10 text-stone-300 bg-white/[0.03]'}`}>
                                                {floorStateLabel}
                                            </span>
                                        </div>
                                        <div className="space-y-2 text-xs">
                                            <div className="flex items-center justify-between gap-3 text-stone-400">
                                                <span>{ui.activeCategory}</span>
                                                <span className="text-stone-200 text-right">{categoryLabel(selectedCategory)}</span>
                                            </div>
                                            <div className="flex items-center justify-between gap-3 text-stone-400">
                                                <span>{ui.viewedDish}</span>
                                                <span className="text-stone-200 text-right line-clamp-1 truncate">{selectedDish ? dishTitle(selectedDish) : '—'}</span>
                                            </div>
                                            <div className="flex items-center justify-between gap-3 text-stone-400">
                                                <span>{ui.items}</span>
                                                <span className="text-stone-200">{totalItems}</span>
                                            </div>
                                            <div className="flex items-center justify-between gap-3 text-stone-400">
                                                <span>{ui.cartTotal}</span>
                                                <span className="text-stone-200">{totalPrice.toFixed(2)} {locale === 'ka' ? '₾' : '$'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={`absolute -bottom-16 left-1/2 -translate-x-1/2 bg-green-950 border border-green-500/50 text-green-400 px-3 py-1 text-[10px] font-mono tracking-widest uppercase rounded shadow-2xl transition-all duration-500 ${floorState === 'settled' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                                        PAID / CLEAR
                                    </div>
                                </div>
                            </div>

                            {/* Static Background Tables */}
                            <div className="absolute top-[34%] left-[62%] w-32 h-16 rounded-md border border-neutral-800 bg-neutral-900/50 flex items-center justify-center">
                                <span className="text-[10px] text-stone-600 font-bold uppercase">T-12</span>
                            </div>
                            <div className="absolute top-[70%] left-[30%] w-20 h-20 rounded-md border border-green-500 bg-green-500/10 shadow-[0_0_20px_rgba(34,197,94,0.2)] flex items-center justify-center">
                                <div className="flex flex-col items-center justify-center gap-1">
                                    <span className="text-[10px] text-green-500 font-bold uppercase">T-08</span>
                                    <span className="text-[7px] uppercase tracking-[0.2em] text-green-400">{ui.completed}</span>
                                </div>
                            </div>
                            <div className="absolute top-[14%] left-[76%] w-24 h-24 rounded-full border border-neutral-800 bg-neutral-900/50 flex items-center justify-center">
                                <span className="text-[10px] text-stone-600 font-bold uppercase">T-01</span>
                            </div>
                            <div className="absolute top-[65%] left-[70%] w-40 h-20 rounded-full border border-white/20 bg-transparent flex items-center justify-center">
                                <span className="text-[10px] text-stone-500 font-bold uppercase">Booth B-1</span>
                            </div>

                            {/* Status Legend */}
                            <div className="absolute bottom-6 left-6 flex flex-col gap-3 bg-black/60 backdrop-blur-md border border-white/10 p-4 rounded-2xl">
                                <div className="flex items-center gap-3">
                                    <div className="h-3 w-3 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                                    <span className="text-[10px] uppercase tracking-widest text-stone-300">{ui.actionRequired}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-3 w-3 rounded-full border-2 border-white/30"></div>
                                    <span className="text-[10px] uppercase tracking-widest text-stone-300">{ui.browsingActive}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-3 w-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]"></div>
                                    <span className="text-[10px] uppercase tracking-widest text-stone-300">{ui.clearedPaid}</span>
                                </div>
                            </div>
                        </div>

                        {/* Summary Sidebar */}
                        <div className="flex flex-col gap-5 h-full">
                            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                                <div className="flex items-start justify-between gap-3 mb-5">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-[0.24em] text-stone-500 mb-2">{ui.terminalSummary}</p>
                                        <h3 className="text-lg font-light text-white">T-04</h3>
                                    </div>
                                    <span className={`rounded-full border px-3 py-1 text-[9px] uppercase tracking-[0.22em] ${floorState === 'fired' ? 'border-amber-500/50 bg-amber-500/10 text-amber-400' : floorState === 'settled' ? 'border-green-500/50 bg-green-500/10 text-green-400' : 'border-white/10 bg-white/[0.03] text-stone-300'}`}>
                                        {floorStateLabel}
                                    </span>
                                </div>
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-start justify-between gap-3">
                                        <span className="text-stone-500">{ui.activeCategory}</span>
                                        <span className="text-stone-200 text-right">{categoryLabel(selectedCategory)}</span>
                                    </div>
                                    <div className="flex items-start justify-between gap-3">
                                        <span className="text-stone-500">{ui.viewedDish}</span>
                                        <span className="text-stone-200 text-right">{selectedDish ? dishTitle(selectedDish) : ui.noDishViewed}</span>
                                    </div>
                                    <div className="flex items-start justify-between gap-3">
                                        <span className="text-stone-500">{ui.cartTotal}</span>
                                        <span className="text-stone-200 text-right">{totalPrice.toFixed(2)} {locale === 'ka' ? '₾' : '$'}</span>
                                    </div>
                                    <div className="flex items-start justify-between gap-3">
                                        <span className="text-stone-500">{ui.items}</span>
                                        <span className="text-stone-200 text-right">{totalItems}</span>
                                    </div>
                                    <div className="flex items-start justify-between gap-3">
                                        <span className="text-stone-500">{ui.liveSince}</span>
                                        <span className="text-stone-200 text-right">{sessionStartedAt || '—'}</span>
                                    </div>
                                    <div className="flex items-start justify-between gap-3">
                                        <span className="text-stone-500">{ui.lastAction}</span>
                                        <span className="text-stone-200 text-right">{latestAction?.at || '—'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 flex-1 min-h-0 overflow-hidden flex flex-col">
                                <div className="flex items-start justify-between gap-3 mb-5 flex-shrink-0">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-[0.24em] text-stone-500 mb-2">{ui.activityFeed}</p>
                                        <h3 className="text-lg font-light text-white">{ui.protectedFeed}</h3>
                                    </div>
                                    <span className="text-[9px] uppercase tracking-[0.22em] text-stone-500">{ui.t04Hint}</span>
                                </div>
                                <div className="space-y-3 overflow-y-auto no-scrollbar flex-1">
                                    {activityFeed.map((event, index) => (
                                        <div key={event.id} className={`rounded-2xl border p-3 ${index === 0 ? 'border-white/15 bg-black/30' : 'border-white/8 bg-black/20'}`}>
                                            <div className="flex items-start justify-between gap-3 mb-1">
                                                <p className="text-sm text-white">{event.label}</p>
                                                <span className="text-[10px] uppercase tracking-[0.22em] text-stone-500 shrink-0">{event.at}</span>
                                            </div>
                                            <p className="text-xs text-stone-400">{event.meta || '—'}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
