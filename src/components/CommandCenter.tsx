'use client';

import React, { useEffect, useMemo, useState } from 'react';
import DishCard from './DishCard';
import DishEditor from './DishEditor';

interface CommandCenterProps {
    initialCategories: any[];
    initialDishes: any[];
    dict: any;
    locale: string;
}

type PublishState = 'ready' | 'draft' | 'publishing' | 'published';

const STORAGE_KEY = 'maitrise-atelier-panel-demo-v1';

const UI = {
    en: {
        draft: 'Draft',
        published: 'Published',
        publishing: 'Publishing…',
        ready: 'Ready',
        resetDemo: 'Reset demo',
        publishDemo: 'Publish demo',
        localDraft: 'Saved locally for this browser',
        lastPublished: 'Last published',
        noDishes: 'No Dishes Deployed',
        noDishesSub: 'Architecture requires population.',
    },
    ka: {
        draft: 'დრაფტი',
        published: 'გამოქვეყნებული',
        publishing: 'ქვეყნდება…',
        ready: 'მზადაა',
        resetDemo: 'დემო გაასუფთავე',
        publishDemo: 'გამოაქვეყნე დემო',
        localDraft: 'ლოკალურად შენახულია ამ ბრაუზერში',
        lastPublished: 'ბოლოს გამოქვეყნდა',
        noDishes: 'კერძები არ არის დამატებული',
        noDishesSub: 'არქიტექტურას შევსება სჭირდება.',
    },
} as const;

function makeDishId() {
    return `dish_${Date.now()}`;
}

function formatStamp(value: string | null, locale: string) {
    if (!value) return '—';
    try {
        return new Date(value).toLocaleString(locale === 'ka' ? 'ka-GE' : 'en-GB', {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return value;
    }
}

export default function CommandCenter({
    initialCategories,
    initialDishes,
    dict,
    locale,
}: CommandCenterProps) {
    const ui = locale === 'ka' ? UI.ka : UI.en;

    const [categories, setCategories] = useState(initialCategories);
    const [dishes, setDishes] = useState(initialDishes);
    const [editingDish, setEditingDish] = useState<any | null>(null);
    const [activeCategoryId, setActiveCategoryId] = useState<string | null>(
        initialCategories.length > 0 ? initialCategories[0].id : null
    );
    const [publishState, setPublishState] = useState<PublishState>('ready');
    const [lastPublishedAt, setLastPublishedAt] = useState<string | null>(null);

    useEffect(() => {
        try {
            const raw = window.localStorage.getItem(STORAGE_KEY);
            if (!raw) return;

            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed.categories)) setCategories(parsed.categories);
            if (Array.isArray(parsed.dishes)) setDishes(parsed.dishes);
            if (parsed.lastPublishedAt) setLastPublishedAt(parsed.lastPublishedAt);
            if (parsed.hasDraftChanges) setPublishState('draft');
            else if (parsed.lastPublishedAt) setPublishState('published');
        } catch (error) {
            console.error('Failed to load demo panel snapshot:', error);
        }
    }, []);

    useEffect(() => {
        if (!activeCategoryId || !categories.some((c) => c.id === activeCategoryId)) {
            setActiveCategoryId(categories[0]?.id ?? null);
        }
    }, [categories, activeCategoryId]);

    const activeCategory = useMemo(
        () => categories.find((c) => c.id === activeCategoryId),
        [categories, activeCategoryId]
    );

    const activeDishes = useMemo(
        () =>
            dishes
                .filter((dish) => dish.categoryId === activeCategoryId)
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
        [dishes, activeCategoryId]
    );

    const activeCategoryTitle =
        activeCategory?.title?.[locale] || activeCategory?.title?.en || '';

    function persistSnapshot(nextCategories: any[], nextDishes: any[], options?: {
        lastPublishedAt?: string | null;
        hasDraftChanges?: boolean;
    }) {
        const payload = {
            categories: nextCategories,
            dishes: nextDishes,
            lastPublishedAt: options?.lastPublishedAt ?? lastPublishedAt,
            hasDraftChanges: options?.hasDraftChanges ?? publishState === 'draft',
        };

        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    }

    function handleSaveDish(data: any) {
        const categoryId = data.categoryId || activeCategoryId || categories[0]?.id || 'cat_0001';

        const categoryOrders = dishes
            .filter((dish) => dish.categoryId === categoryId)
            .map((dish) => Number(dish.order) || 0);

        const nextOrder =
            categoryOrders.length > 0 ? Math.max(...categoryOrders) + 10 : 10;

        const normalizedDish = {
            ...data,
            id: data.id || makeDishId(),
            categoryId,
            order: typeof data.order === 'number' ? data.order : nextOrder,
            status: data.status || 'active',
            currency: data.currency || 'GEL',
            soldOut: Boolean(data.soldOut),
        };

        const nextDishes = dishes.some((dish) => dish.id === normalizedDish.id)
            ? dishes.map((dish) => (dish.id === normalizedDish.id ? { ...dish, ...normalizedDish } : dish))
            : [...dishes, normalizedDish];

        setDishes(nextDishes);
        setPublishState('draft');
        persistSnapshot(categories, nextDishes, {
            hasDraftChanges: true,
        });
        setEditingDish(null);
    }

    function handlePublish() {
        setPublishState('publishing');

        window.setTimeout(() => {
            const stamp = new Date().toISOString();
            setLastPublishedAt(stamp);
            setPublishState('published');
            persistSnapshot(categories, dishes, {
                lastPublishedAt: stamp,
                hasDraftChanges: false,
            });
        }, 700);
    }

    function handleResetDemo() {
        window.localStorage.removeItem(STORAGE_KEY);
        setCategories(initialCategories);
        setDishes(initialDishes);
        setActiveCategoryId(initialCategories[0]?.id ?? null);
        setLastPublishedAt(null);
        setPublishState('ready');
        setEditingDish(null);
    }

    const statusLabel =
        publishState === 'draft'
            ? ui.draft
            : publishState === 'publishing'
                ? ui.publishing
                : publishState === 'published'
                    ? ui.published
                    : ui.ready;

    return (
        <div className="flex xl:h-screen w-full flex-col bg-zinc-950 font-sans text-stone-100 overflow-hidden md:flex-row pt-24 min-h-screen">
            <aside className="flex w-full flex-col border-b border-white/10 bg-black md:w-80 md:border-r md:border-b-0 shrink-0">
                <div className="hidden border-b border-white/10 p-6 md:block">
                    <h1 className="text-[10px] font-sans font-bold tracking-[0.4em] uppercase text-stone-500">
                        {dict.panel.menuArch}
                    </h1>
                    <div className="mt-4 flex items-center justify-between gap-3">
                        <span
                            className={`inline-flex items-center rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.28em] ${publishState === 'draft'
                                    ? 'border-amber-500/30 text-amber-400 bg-amber-500/10'
                                    : publishState === 'publishing'
                                        ? 'border-white/20 text-white bg-white/10'
                                        : publishState === 'published'
                                            ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                                            : 'border-white/10 text-stone-400 bg-white/5'
                                }`}
                        >
                            {statusLabel}
                        </span>
                    </div>
                    <div className="mt-3 text-[10px] uppercase tracking-[0.25em] text-stone-600">
                        {publishState === 'draft'
                            ? ui.localDraft
                            : `${ui.lastPublished}: ${formatStamp(lastPublishedAt, locale)}`}
                    </div>
                </div>

                <div className="flex w-full overflow-x-auto p-3 md:flex-1 md:overflow-y-auto md:p-4 custom-scrollbar">
                    <ul className="flex flex-row gap-2 md:flex-col">
                        {categories.map((category) => {
                            const isActive = category.id === activeCategoryId;
                            const categoryTitle =
                                category.title?.[locale] || category.title?.en || 'Unnamed Category';

                            return (
                                <li key={category.id} className="shrink-0 md:shrink">
                                    <button
                                        onClick={() => setActiveCategoryId(category.id)}
                                        className={`group flex items-center justify-between border px-4 py-2 transition-all duration-200 md:w-full md:py-3 ${isActive
                                                ? 'border-white/30 bg-white/10 text-white'
                                                : 'border-white/5 bg-transparent text-stone-400 hover:border-white/20 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        <span className="whitespace-nowrap text-[10px] md:text-xs font-sans font-medium uppercase tracking-[0.2em] md:whitespace-normal md:text-left">
                                            {categoryTitle}
                                        </span>

                                        <div className="hidden flex-col gap-[2px] opacity-30 transition-opacity group-hover:opacity-100 md:flex">
                                            <div className={`h-[2px] w-4 ${isActive ? 'bg-white' : 'bg-stone-400'}`} />
                                            <div className={`h-[2px] w-4 ${isActive ? 'bg-white' : 'bg-stone-400'}`} />
                                            <div className={`h-[2px] w-4 ${isActive ? 'bg-white' : 'bg-stone-400'}`} />
                                        </div>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                <div className="hidden border-t border-white/10 bg-black p-4 md:flex md:flex-col md:gap-3">
                    <button
                        onClick={() => setEditingDish({ categoryId: activeCategoryId })}
                        className="w-full border border-white/10 bg-transparent py-4 text-[10px] font-sans font-medium uppercase tracking-[0.3em] text-stone-400 transition-colors hover:border-white/30 hover:text-white hover:bg-white/5"
                    >
                        {dict.panel.deployDish}
                    </button>

                    <button
                        onClick={handlePublish}
                        disabled={publishState === 'publishing'}
                        className="w-full border border-emerald-500/20 bg-emerald-500/10 py-4 text-[10px] font-sans font-medium uppercase tracking-[0.3em] text-emerald-300 transition-colors hover:border-emerald-400/40 hover:bg-emerald-500/15 disabled:opacity-60"
                    >
                        {ui.publishDemo}
                    </button>

                    <button
                        onClick={handleResetDemo}
                        className="w-full border border-white/10 bg-transparent py-4 text-[10px] font-sans font-medium uppercase tracking-[0.3em] text-stone-500 transition-colors hover:border-white/20 hover:text-white hover:bg-white/5"
                    >
                        {ui.resetDemo}
                    </button>
                </div>
            </aside>

            <main className="flex h-full flex-1 flex-col overflow-hidden bg-zinc-950 relative">
                <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none texture-lattice"></div>

                <header className="flex items-center justify-between border-b border-white/10 bg-zinc-950/80 p-4 backdrop-blur-md md:p-6 relative z-10 md:h-20 shrink-0">
                    <div className="min-w-0">
                        <h2 className="text-lg tracking-wide text-white md:text-xl truncate mr-4">
                            {activeCategoryTitle}
                        </h2>
                        <div className="mt-1 text-[10px] uppercase tracking-[0.25em] text-stone-500 md:hidden">
                            {statusLabel}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={handleResetDemo}
                            className="hidden md:inline-flex border border-white/10 bg-transparent px-4 py-2 text-[10px] font-sans font-bold uppercase tracking-[0.3em] text-stone-400 transition-colors hover:border-white/20 hover:text-white hover:bg-white/5"
                        >
                            {ui.resetDemo}
                        </button>

                        <button
                            onClick={handlePublish}
                            disabled={publishState === 'publishing'}
                            className="hidden md:inline-flex border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-[10px] font-sans font-bold uppercase tracking-[0.3em] text-emerald-300 transition-colors hover:bg-emerald-500/15 disabled:opacity-60"
                        >
                            {ui.publishDemo}
                        </button>

                        <button
                            onClick={() => setEditingDish({ categoryId: activeCategoryId })}
                            className="border border-white/20 bg-white/5 px-4 py-2 text-[10px] font-sans font-bold uppercase tracking-[0.3em] text-white transition-transform active:scale-95 md:px-8 md:py-3 hover:bg-white hover:text-black"
                        >
                            {dict.panel.deployDish}
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10 custom-scrollbar">
                    {activeDishes.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 md:gap-6">
                            {activeDishes.map((dish) => (
                                <DishCard
                                    key={dish.id}
                                    dish={dish}
                                    dict={dict}
                                    onEdit={(d: any) => setEditingDish(d)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="glass-panel text-center py-32 border-dashed h-full min-h-[400px] flex flex-col items-center justify-center">
                            <span className="material-symbols-outlined text-4xl text-stone-600 mb-4 block">inventory_2</span>
                            <h2 className="text-xl text-stone-300">{ui.noDishes}</h2>
                            <p className="text-stone-500 text-sm font-sans mt-2 tracking-widest uppercase text-[10px]">
                                {ui.noDishesSub}
                            </p>
                        </div>
                    )}
                </div>
            </main>

            {editingDish !== null && (
                <DishEditor
                    dish={Object.keys(editingDish).length === 0 ? null : editingDish}
                    categories={categories}
                    dict={dict}
                    onClose={() => setEditingDish(null)}
                    onSave={handleSaveDish}
                />
            )}
        </div>
    );
}