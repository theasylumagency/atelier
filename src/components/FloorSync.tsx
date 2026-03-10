'use client';

import React, { useState, useEffect, useRef } from 'react';

type OrderStatus = 'browsing' | 'fired' | 'settled';
type ViewState = 'menu' | 'details' | 'cart';
type FloorState = 'browsing' | 'ordering' | 'fired' | 'settled';

interface CartItem {
    dish: any;
    quantity: number;
}
const DISH_FALLBACK_SRC = '/images/fallbacks/dish-placeholder.svg';

const UI = {
    en: {
        emptySelection: 'Your selection is empty.',
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
        tableStarted: 'The menu opened and order started.',
    },
    ka: {
        emptySelection: 'არჩევანი არ არის დამატებული.',
        confirmOrder: 'შეკვეთის დადასტურება',
        clearTable: 'მაგიდის გასუფთავება',
        complete: 'დასრულებულია',
        guestInitiated: 'სტუმარმა დაიწყო შეკვეთა.',
        menu: 'მენიუ',
        cart: 'კალათა',
        browsing: 'ათვალიერებს',
        ordering: 'უკვეთავს',
        sent: 'გაგზავნილია',
        completed: 'დასრულებულია',
        tableStarted: 'მენიუ გახსნა და შეკვეთა დაიწყო.',
    },
} as const;

export default function FloorSync({ dict, initialCategories = [], initialDishes = [], locale = 'en' }: { dict: any, initialCategories?: any[], initialDishes?: any[], locale?: string }) {
    const [status, setStatus] = useState<OrderStatus>('browsing');
    const [activeView, setActiveView] = useState<ViewState>('menu');
    const [selectedDish, setSelectedDish] = useState<any | null>(null);
    const [cart, setCart] = useState<CartItem[]>([]);

    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [time, setTime] = useState<string>('');
    const scrollRef = useRef<HTMLDivElement>(null);
    const seededRef = useRef(false);
    const ui = locale === 'ka' ? UI.ka : UI.en;

    const addToCart = (dish: any) => {
        setCart((prev) => {
            const existing = prev.find((item) => item.dish.id === dish.id);
            if (existing) {
                return prev.map((item) =>
                    item.dish.id === dish.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { dish, quantity: 1 }];
        });
    };

    const decreaseQty = (dishId: string) => {
        setCart((prev) =>
            prev
                .map((item) =>
                    item.dish.id === dishId
                        ? { ...item, quantity: item.quantity - 1 }
                        : item
                )
                .filter((item) => item.quantity > 0)
        );
    };

    const removeFromCart = (dishId: string) => {
        setCart((prev) => prev.filter((item) => item.dish.id !== dishId));
    };

    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
    const totalPrice = cart.reduce(
        (acc, item) => acc + item.quantity * (item.dish.priceMinor / 100),
        0
    );
    const floorState: FloorState =
        status === 'settled'
            ? 'settled'
            : status === 'fired'
                ? 'fired'
                : cart.length > 0
                    ? 'ordering'
                    : 'browsing';

    const floorStateLabel =
        floorState === 'settled'
            ? ui.completed
            : floorState === 'fired'
                ? ui.sent
                : floorState === 'ordering'
                    ? ui.ordering
                    : ui.browsing;
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ top: 300, behavior: 'smooth' });
        }
    }, [selectedCategory]);

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
    // Filter active items
    const activeDishes = initialDishes.filter(d => d.status === 'active' && !d.soldOut).sort((a, b) => a.order - b.order);
    const activeCategories = initialCategories.filter(c =>
        c.status === 'active' && activeDishes.some(d => d.categoryId === c.id)
    ).sort((a, b) => a.order - b.order);

    const displayedDishes = activeDishes.filter(d => selectedCategory === 'all' || d.categoryId === selectedCategory);
    useEffect(() => {
        if (seededRef.current) return;
        if (!activeDishes.length) return;

        const featured = activeDishes[0];

        setCart([{ dish: featured, quantity: 1 }]);
        setSelectedCategory(featured.categoryId);
        setStatus('browsing');
        setActiveView('menu');

        seededRef.current = true;
    }, [activeDishes]);
    useEffect(() => {
        if (
            selectedCategory !== 'all' &&
            !activeCategories.some((category) => category.id === selectedCategory)
        ) {
            setSelectedCategory('all');
        }
    }, [activeCategories, selectedCategory]);
    const handleAction = () => {
        if (status === 'browsing') {
            if (cart.length === 0) return;
            setStatus('fired');
            return;
        }

        if (status === 'fired') {
            setStatus('settled');
            return;
        }

        setStatus('browsing');
        setCart([]);
        setActiveView('menu');
    };

    return (
        <div className="w-full max-w-[1600px] mx-auto py-12 lg:py-24">

            {/* Header Text */}
            <div className="flex flex-col items-center justify-center text-center mb-16 px-6">
                <h2 className="text-3xl md:text-5xl font-light tracking-tight mb-4">
                    {dict.floorSync?.title || "The Spatial Protocol"}
                </h2>
                <p className="text-stone-400 max-w-2xl text-sm md:text-base leading-relaxed">
                    {dict.floorSync?.subtitle || "Experience the frictionless connection between the guest's mobile device and the kitchen's real-time floor board. No waiters, no delays. Just absolute command."}
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 px-6 lg:px-12 items-center lg:items-stretch">

                {/* -------------------------------------------------------------------------------- */}
                {/* LEFT HEMISPHERE: The Digital Maître D' (Mobile Mockup) */}
                {/* -------------------------------------------------------------------------------- */}
                <section className="w-full lg:w-[400px] flex flex-col items-center flex-shrink-0">
                    <div className="relative w-full max-w-[360px] h-[780px] bg-black rounded-[3.5rem] border-[12px] border-[#1a1a1a] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.6)] overflow-hidden ring-2 ring-neutral-700/50">
                        {/* iPhone Air Status Bar */}
                        <div className="absolute top-0 left-0 right-0 h-14 z-50 flex items-center justify-between px-7 pt-3 pointer-events-none text-white w-full">


                            {/* left side: Time (User requested Clock on the right) */}
                            <div className="flex-1 flex justify-start">
                                <span className="text-[14px] font-semibold tracking-wide pr-1">{time || '9:41'}</span>
                            </div>
                            {/* Center: Dynamic Island (Pill Cutout) */}
                            <div className="absolute left-1/2 -translate-x-1/2 top-4 w-[115px] h-[32px] bg-black rounded-full shadow-[inset_0_0_3px_rgba(255,255,255,0.08)] before:absolute before:right-3 before:top-1/2 before:-translate-y-1/2 before:w-3 before:h-3 before:rounded-full before:bg-[#080808] before:shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)] after:absolute after:right-4 after:top-1/2 after:-translate-y-1/2 after:w-1 after:h-1 after:rounded-full after:bg-blue-600/30"></div>
                            {/* right side: Icons (User requested Network, WiFi, Battery on left) */}
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
                                <div ref={scrollRef} className="overflow-y-auto w-1/3 h-full flex flex-col relative">
                                    <div className="flex-1 bg-[#0F0F0F]/75 flex p-4 sticky top-0 z-10 justify-between gap-1.5 items-center">
                                        <span className="material-symbols-outlined text-[15px]">menu</span>
                                        <span className="text-[15px]">L'Atelier</span>
                                        <div className="relative flex items-center justify-center">
                                            <span className="material-symbols-outlined text-[15px]"></span>
                                        </div>
                                    </div>
                                    <div className="px-6 flex-shrink-0">
                                        <p className="text-[10px] uppercase tracking-[0.3em] text-stone-500 mb-2">{dict.floorSync?.guestInterface || 'Winter Collection'}</p>
                                        <h1 className="text-3xl font-light leading-none">{dict.floorSync?.georgianHeritageFirst || 'Georgian'} <br /><span className="font-bold">{dict.floorSync?.georgianHeritageSecond || 'Heritage'}</span></h1>
                                        <p className="text-[10px] tracking-normal text-stone-500 mb-2 pt-4">{dict.floorSync?.winterCollectionDesc || 'Winter Collection'}</p>
                                    </div>
                                    {/* Horizontal Categories */}
                                    <div className="categories-mobile border-t border-white/5 bg-[#0F0F0F] pt-2 mt-2 flex sticky top-[56px] z-[9] items-center overflow-x-auto custom-scrollbar flex-shrink-0 px-6 gap-3 whitespace-nowrap border-b border-white/5 pb-3">
                                        <button
                                            onClick={() => setSelectedCategory('all')}
                                            className={`text-[10px] uppercase tracking-widest px-4 py-2 rounded-full transition-all duration-300 ${selectedCategory === 'all' ? 'bg-white text-black font-bold' : 'text-stone-400 hover:text-white bg-white/5 hover:bg-white/10'}`}
                                        >
                                            {dict.floorSync?.all || 'All Collections'}
                                        </button>
                                        {activeCategories.map((c, i) => (
                                            <button
                                                key={c.id}
                                                onClick={() => setSelectedCategory(c.id)}
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
                                                    {dish.photo?.small ? (
                                                        <img
                                                            src={`/uploads/dishes/${dish.photo.small}`}
                                                            alt={dish.title.en}
                                                            className="h-full w-full object-cover transition-all duration-700 opacity-60 group-hover:opacity-80 group-hover:scale-105"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.02)_10px,rgba(255,255,255,0.02)_20px)]">
                                                            <span className="bg-black/50 backdrop-blur-sm px-3 py-1 text-[10px] uppercase font-sans tracking-[0.3em] text-stone-500 border border-white/10 rounded-full">
                                                                {dict.panel.awaitingAsset}
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

                                                    <div className="flex flex-col gap-1 cursor-pointer" onClick={() => { setSelectedDish(dish); setActiveView('details'); }}>
                                                        <div className="flex justify-between items-end gap-2">
                                                            <h3 className="text-xl md:text-2xl font-light tracking-tight text-white leading-tight drop-shadow-md pb-1">{dish.title[locale as keyof typeof dish.title] || dish.title.en}</h3>
                                                            <span className="text-lg font-light text-amber-400 drop-shadow-md flex-shrink-0 mb-1">{dish.priceMinor / 100} {dish.currency === 'GEL' ? '₾' : '$'}</span>
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
                                            <div className="absolute inset-0 w-full h-[60%] bg-cover bg-center bg-neutral-900 border-b border-white/10" style={{ backgroundImage: `url(${selectedDish.photo?.small ? `/uploads/dishes/${selectedDish.photo.small}` : DISH_FALLBACK_SRC})` }}>
                                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                                            </div>

                                            {/* Header */}
                                            <header className="flex items-center justify-between px-6 py-4 sticky top-0 z-20 flex-shrink-0">
                                                <button onClick={() => setActiveView('menu')} className="h-8 w-8 bg-black/40 backdrop-blur-md border border-white/10 rounded-full transition-colors flex items-center justify-center hover:bg-white/20">
                                                    <span className="material-symbols-outlined text-sm text-white">arrow_back</span>
                                                </button>
                                                <div className="w-8"></div> {/* Spacer */}
                                            </header>

                                            {/* Content Area - Scrollable */}
                                            <div className="flex-1 overflow-y-auto z-10 pb-24 pt-[40%] px-4 custom-scrollbar">
                                                <div className="bg-[#0F0F0F]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] min-h-full">
                                                    <div className="border-b border-white/5 pb-6">
                                                        <div className="flex justify-between items-center mb-3">
                                                            <p className="text-[9px] uppercase tracking-[0.3em] px-2 py-1 bg-white/5 rounded-full text-stone-400">Ref: {selectedDish.id.split('_')[1] || selectedDish.id}</p>
                                                            {selectedDish.chefsPick && <span className="text-[9px] text-amber-500 uppercase tracking-widest font-bold">Signature</span>}
                                                        </div>
                                                        <h1 className="text-3xl font-light leading-tight mb-2 tracking-tight">{selectedDish.title[locale as keyof typeof selectedDish.title] || selectedDish.title.en}</h1>
                                                        <p className="text-2xl font-light text-amber-500">{selectedDish.priceMinor / 100} <span className="text-lg text-amber-500/70">{selectedDish.currency === 'GEL' ? '₾' : '$'}</span></p>
                                                    </div>

                                                    {/* Narrative */}
                                                    <div className="pt-6">
                                                        <h3 className="text-[10px] uppercase tracking-[0.4em] font-medium mb-4 text-stone-400">The Narrative</h3>
                                                        <p className="text-[13px] leading-relaxed font-light text-stone-300">
                                                            {selectedDish.story[locale as keyof typeof selectedDish.story] || selectedDish.story.en || selectedDish.description.en}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Bar */}
                                            <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black via-black/90 to-transparent p-6 pt-12 flex-shrink-0 pb-20">
                                                <button
                                                    onClick={() => {
                                                        addToCart(selectedDish);
                                                        setActiveView('menu');
                                                    }}
                                                    className="w-full bg-white text-black h-14 text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-stone-200 transition-all duration-300 flex items-center justify-center gap-3 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transform hover:-translate-y-1"
                                                >
                                                    <span className="material-symbols-outlined text-[16px]">add</span>
                                                    {dict.floorSync?.addService || 'Add to Service'}
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* --------------------------------- */}
                                {/* SCREEN 3: THE SILENT CART */}
                                {/* --------------------------------- */}
                                <div className="w-1/3 h-full flex flex-col relative bg-[#0A0A0A] overflow-y-auto">
                                    {/* Header */}
                                    <header className="flex items-center justify-between px-6 py-4 sticky top-0 z-10 bg-[#0F0F0F]/90 backdrop-blur-xl border-b border-white/5 flex-shrink-0 shadow-sm">
                                        <button onClick={() => setActiveView('menu')} className="p-2 -ml-2 hover:bg-white/5 rounded-full transition-colors flex items-center justify-center">
                                            <span className="material-symbols-outlined text-sm">arrow_back</span>
                                        </button>
                                        <h1 className="text-[10px] font-bold tracking-[0.3em] uppercase">{dict.floorSync?.theSelection || 'The Selection'}</h1>
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
                                                        <div className="h-16 w-16 flex-shrink-0 bg-neutral-900 rounded-xl bg-cover bg-center shadow-inner" style={{ backgroundImage: `url(${item.dish.photo?.small ? `/uploads/dishes/${item.dish.photo.small}` : DISH_FALLBACK_SRC})` }}></div>
                                                        <div className="flex-1 flex flex-col justify-center h-full">
                                                            <div className="flex justify-between items-start">
                                                                <h3 className="text-sm font-light tracking-tight pr-2 leading-tight line-clamp-2">{item.dish.title[locale as keyof typeof item.dish.title] || item.dish.title.en}</h3>
                                                                <span className="text-xs font-medium text-amber-500 whitespace-nowrap">{item.dish.priceMinor / 100} {item.dish.currency === 'GEL' ? '₾' : '$'}</span>
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
                                                        <span className="text-[10px] uppercase font-medium tracking-[0.2em] text-stone-400">{dict.floorSync?.total || 'Total'}</span>
                                                        <span className="text-xl font-light tracking-tight text-white">
                                                            {totalPrice.toFixed(2)} <span className="text-sm text-stone-400">₾</span>
                                                        </span>
                                                    </div>

                                                    <button
                                                        onClick={handleAction}
                                                        className={`w-full py-4 mt-5 text-[10px] font-bold uppercase tracking-[0.3em] rounded-full transition-all duration-500 flex items-center justify-center gap-2 relative overflow-hidden ${status === 'browsing' ? 'bg-white text-black hover:bg-stone-200 shadow-[0_5px_15px_rgba(255,255,255,0.1)]' :
                                                            status === 'fired' ? 'bg-amber-600/20 text-amber-500 border border-amber-500/50 hover:bg-amber-600/30 shadow-[0_0_20px_rgba(245,158,11,0.2)]' :
                                                                'bg-green-600/20 text-green-500 border border-green-500/50 cursor-not-allowed shadow-[0_0_20px_rgba(34,197,94,0.2)]'
                                                            }`}
                                                    >
                                                        {status === 'browsing' ? (
                                                            <> {dict.floorSync?.settleSelection || 'Confirm Order'} <span className="material-symbols-outlined text-[14px]">arrow_forward</span></>
                                                        ) : status === 'fired' ? (
                                                            <> {dict.floorSync?.clearTable || 'Clear Table'}</>
                                                        ) : (
                                                            <> {dict.floorSync?.complete || 'Complete'}</>
                                                        )}
                                                    </button>
                                                </div>

                                                <p className="text-center text-[8px] text-stone-600 uppercase tracking-widest mt-4">
                                                    {dict.floorSync?.byContinuing || 'Secured via Spatial Protocol'}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Bottom Navigation (Always visible over slider) */}
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
                                            <span className="absolute -top-1 -right-2 flex h-3 w-3 items-center justify-center rounded-full bg-amber-500 text-[8px] font-bold text-black border border-[#0A0A0A]">{totalItems}</span>
                                        )}
                                    </button>
                                </div>
                            </nav>
                        </div>
                    </div>
                </section>

                {/* -------------------------------------------------------------------------------- */}
                {/* RIGHT HEMISPHERE: The Floor Board */}
                {/* -------------------------------------------------------------------------------- */}
                <section className="flex-1 flex flex-col w-full min-h-[500px] lg:min-h-0">
                    <div className="flex justify-between items-end mb-4 gap-4">
                        <div>
                            <h2 className="text-xl font-light tracking-tight">
                                {dict.floorSync?.floorBoard || 'Floor Board'}
                            </h2>
                            <p className="text-xs text-stone-500">
                                {dict.floorSync?.realTime || 'Real-time spatial sync'}
                            </p>

                        </div>

                        <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-neutral-900 border border-neutral-800">
                            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-[10px] font-sans uppercase tracking-[0.2em]">
                                {dict.floorSync?.liveFeed || 'Live'}
                            </span>
                        </div>
                    </div>

                    {/* Brutalist Map Grid Area */}
                    <div className="flex-1 relative border border-neutral-800 bg-[#0A0A0A] overflow-hidden min-h-[500px] lg:min-h-0 bg-[radial-gradient(circle,#333_1px,transparent_1px)]" style={{ backgroundSize: '40px 40px' }}>

                        {/* Table 04 - THE DYNAMIC TABLE */}
                        <div className="absolute top-[20%] left-[20%] group">
                            <div
                                className={`w-28 h-28 rounded-full border flex items-center justify-center relative transition-all duration-500 ${floorState === 'browsing'
                                    ? 'border-white/20 bg-transparent'
                                    : floorState === 'ordering'
                                        ? 'border-white/60 bg-white/5 shadow-[0_0_24px_rgba(255,255,255,0.12)]'
                                        : floorState === 'fired'
                                            ? 'border-amber-500 bg-amber-500/10 shadow-[0_0_30px_rgba(245,158,11,0.3)]'
                                            : 'border-green-500 bg-green-500/10 shadow-[0_0_30px_rgba(34,197,94,0.2)]'
                                    }`}
                            >
                                <div className="flex flex-col items-center justify-center gap-1">
                                    <div
                                        className={`text-xs font-bold uppercase transition-colors duration-500 ${floorState === 'browsing'
                                            ? 'text-white/50'
                                            : floorState === 'ordering'
                                                ? 'text-white'
                                                : floorState === 'fired'
                                                    ? 'text-amber-500'
                                                    : 'text-green-500'
                                            }`}
                                    >
                                        T-04
                                    </div>

                                    <div
                                        className={`text-[8px] uppercase tracking-[0.24em] ${floorState === 'browsing'
                                            ? 'text-stone-500'
                                            : floorState === 'ordering'
                                                ? 'text-white/75'
                                                : floorState === 'fired'
                                                    ? 'text-amber-400'
                                                    : 'text-green-400'
                                            }`}
                                    >
                                        {floorStateLabel}
                                    </div>
                                </div>

                                {/* Ordering pulse */}
                                {floorState === 'ordering' && (
                                    <div className="absolute inset-0 rounded-full border border-white/30 animate-pulse opacity-40"></div>
                                )}

                                {/* Fired pulse */}
                                {floorState === 'fired' && (
                                    <div className="absolute inset-0 rounded-full border border-amber-500 animate-ping opacity-20"></div>
                                )}

                                {/* Cart count badge */}
                                {cart.length > 0 && floorState !== 'settled' && (
                                    <div className="absolute -right-2 -top-2 min-w-[22px] h-[22px] px-1 rounded-full bg-amber-500 text-black text-[10px] font-bold flex items-center justify-center border border-black shadow-lg">
                                        {totalItems}
                                    </div>
                                )}

                                {/* Ordering started notification */}
                                <div
                                    className={`absolute -top-20 left-1/2 -translate-x-1/2 w-52 bg-black/80 backdrop-blur-md rounded border border-white/10 px-3 py-2 shadow-2xl z-20 transition-all duration-500 pointer-events-none ${floorState === 'ordering'
                                        ? 'opacity-100 translate-y-0'
                                        : 'opacity-0 translate-y-3'
                                        }`}
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse shrink-0"></span>
                                            <span className="text-[10px] uppercase tracking-[0.2em] text-stone-200 truncate">
                                                {ui.tableStarted}
                                            </span>
                                        </div>

                                        {totalItems > 0 && (
                                            <span className="text-[10px] text-amber-400 border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 rounded-sm shrink-0">
                                                {totalItems}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Digital Ticket */}
                                <div
                                    className={`absolute -top-28 left-1/2 -translate-x-1/2 w-48 bg-black/80 backdrop-blur-md rounded border p-3 shadow-2xl z-30 transition-all duration-500 pointer-events-none ${floorState === 'fired'
                                        ? 'opacity-100 translate-y-0 border-amber-500/50'
                                        : 'opacity-0 translate-y-4 border-neutral-800'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[9px] bg-amber-500 text-black px-1.5 py-0.5 font-bold uppercase rounded-sm">
                                            {ui.sent}
                                        </span>
                                        <span className="text-[9px] text-stone-400">Live</span>
                                    </div>

                                    <div className="space-y-1">
                                        {cart.length > 0 ? (
                                            cart.map((item) => (
                                                <div key={item.dish.id} className="flex justify-between items-start">
                                                    <h5 className="text-xs font-bold text-white leading-tight line-clamp-1 flex-1 pr-2">
                                                        {item.dish.title[locale as keyof typeof item.dish.title] || item.dish.title.en}
                                                    </h5>
                                                    <span className="text-[10px] text-stone-400 border border-stone-700 px-1 rounded-sm">
                                                        x{item.quantity}
                                                    </span>
                                                </div>
                                            ))
                                        ) : (
                                            <h5 className="text-xs font-bold text-white leading-tight mb-1">
                                                —
                                            </h5>
                                        )}
                                    </div>

                                    <p className="text-[9px] text-stone-400 border-t border-white/10 pt-1 mt-2">
                                        {ui.guestInitiated}
                                    </p>
                                </div>

                                {/* Paid indicator */}
                                <div
                                    className={`absolute -top-10 left-1/2 -translate-x-1/2 bg-green-950 border border-green-500/50 text-green-400 px-3 py-1 text-[10px] font-mono tracking-widest uppercase rounded shadow-2xl transition-all duration-500 ${floorState === 'settled' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                                        }`}
                                >
                                    PAID / CLEAR
                                </div>
                            </div>
                        </div>

                        {/* Other Static Tables Context */}
                        <div className="absolute top-[35%] left-[60%] w-32 h-16 rounded-md border border-neutral-800 bg-neutral-900/50 flex items-center justify-center">
                            <span className="text-[10px] text-stone-600 font-bold uppercase">T-12</span>
                        </div>
                        <div className="absolute top-[70%] left-[30%] w-20 h-20 rounded-md border border-green-500 bg-green-500/10 shadow-[0_0_20px_rgba(34,197,94,0.2)] flex items-center justify-center">
                            <div className="flex flex-col items-center justify-center gap-1">
                                <span className="text-[10px] text-green-500 font-bold uppercase">T-08</span>
                                <span className="text-[7px] uppercase tracking-[0.2em] text-green-400">{ui.completed}</span>
                            </div>
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-green-950 border border-green-500/50 text-green-400 px-2 py-1 text-[8px] font-mono tracking-widest uppercase rounded shadow-2xl whitespace-nowrap">
                                PAID / CLEAR
                            </div>
                        </div>
                        <div className="absolute top-[15%] left-[75%] w-24 h-24 rounded-full border border-neutral-800 bg-neutral-900/50 flex items-center justify-center">
                            <span className="text-[10px] text-stone-600 font-bold uppercase">T-01</span>
                        </div>
                        <div className="absolute top-[65%] left-[70%] w-40 h-20 rounded-full border border-white/20 bg-transparent flex items-center justify-center">
                            <span className="text-[10px] text-stone-500 font-bold uppercase">Booth B-1</span>
                        </div>

                        {/* Legend */}
                        <div className="absolute bottom-6 left-6 flex flex-col gap-3 bg-black/60 backdrop-blur-md border border-white/10 p-4">
                            <div className="flex items-center gap-3">
                                <div className="h-3 w-3 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                                <span className="text-[10px] uppercase tracking-widest text-stone-300">Action Required</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-3 w-3 rounded-full border-2 border-white/30"></div>
                                <span className="text-[10px] uppercase tracking-widest text-stone-300">Browsing / Active</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-3 w-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]"></div>
                                <span className="text-[10px] uppercase tracking-widest text-stone-300">Cleared / Paid</span>
                            </div>
                        </div>

                    </div>
                </section>
            </div>
        </div>
    );
}
