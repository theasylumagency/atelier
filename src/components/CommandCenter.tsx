'use client';

import React, { useState } from 'react';
import DishCard from './DishCard';
import DishEditor from './DishEditor';

interface CommandCenterProps {
    initialCategories: any[];
    initialDishes: any[];
    dict: any;
    locale: string;
}

export default function CommandCenter({ initialCategories, initialDishes, dict, locale }: CommandCenterProps) {
    const [categories] = useState(initialCategories);
    const [dishes] = useState(initialDishes);

    // Editor state
    const [editingDish, setEditingDish] = useState<any | null>(null);

    // Default to the first category if available
    const [activeCategoryId, setActiveCategoryId] = useState(categories.length > 0 ? categories[0].id : null);

    // Filter dishes based on the selected category in the sidebar
    const activeDishes = dishes.filter(dish => dish.categoryId === activeCategoryId);
    const activeCategory = categories.find(c => c.id === activeCategoryId);

    // Safely retrieve the localized title
    const activeCategoryTitle = activeCategory?.title?.[locale] || activeCategory?.title?.en || '';

    return (
        // 1. THE MAIN CONTAINER: Column on mobile, Row on desktop
        <div className="flex xl:h-screen w-full flex-col bg-zinc-950 font-sans text-stone-100 overflow-hidden md:flex-row pt-24 min-h-screen">

            {/* 2. THE NAVIGATION: Horizontal scroll on mobile, fixed sidebar on desktop */}
            <aside className="flex w-full flex-col border-b border-white/10 bg-black md:w-80 md:border-r md:border-b-0 shrink-0">

                {/* Brand/Title Header - Hidden on mobile to save vertical space */}
                <div className="hidden border-b border-white/10 p-6 md:block">
                    <h1 className="text-[10px] font-sans font-bold tracking-[0.4em] uppercase text-stone-500">
                        {dict.panel.menuArch}
                    </h1>
                </div>

                {/* The Category List: Horizontal Flex on Mobile, Vertical on Desktop */}
                <div className="flex w-full overflow-x-auto p-3 md:flex-1 md:overflow-y-auto md:p-4 custom-scrollbar">
                    <ul className="flex flex-row gap-2 md:flex-col">
                        {categories.map((category) => {
                            const isActive = category.id === activeCategoryId;
                            const categoryTitle = category.title?.[locale] || category.title?.en || 'Unnamed Category';
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

                                        {/* Drag Handle - Only visible on Desktop */}
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

                {/* Quick Action Footer - Hidden on mobile, they use the main header button instead */}
                <div className="hidden border-t border-white/10 bg-black p-4 md:block">
                    <button className="w-full border border-white/10 bg-transparent py-4 text-[10px] font-sans font-medium uppercase tracking-[0.3em] text-stone-400 transition-colors hover:border-white/30 hover:text-white hover:bg-white/5">
                        {dict.panel.newCategory}
                    </button>
                </div>
            </aside>

            {/* 3. THE SERVICE GRID (Main Content) */}
            <main className="flex h-full flex-1 flex-col overflow-hidden bg-zinc-950 relative">

                {/* Background Subtle Pattern */}
                <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBVwn74CvlOfHS7J0vxWuNhb0sYi_y1ZdU9yWW91bnJC8xaPFgn91zOhZlQOXzIFCcv0CwuIPJbdgfQs1bK4NwwHP4S65PbbINtvqgmk9_SbosI1y6YuAxdj18oxSvfEJAEcVD42VXgSBd5bB-nrbWtsRYEyYU_tx6CvsKpshQrqvw3ZNEg1_222pRtm-ZDlEPt-axUU4aZXPqW4ZO1JoF-QjeezjiwKQx0CQRA0EC5D00rTuyMxd0YLf4VV9embk0hYMTf7Et1Fke_')", backgroundSize: 'cover', backgroundPosition: 'center', filter: 'grayscale(100%)' }}></div>

                {/* Top Control Bar: Mobile optimized padding */}
                <header className="flex items-center justify-between border-b border-white/10 bg-zinc-950/80 p-4 backdrop-blur-md md:p-6 relative z-10 md:h-20 shrink-0">
                    <h2 className="text-lg font-serif italic tracking-wide text-white md:text-xl truncate mr-4">
                        {activeCategoryTitle}
                    </h2>
                    <button
                        onClick={() => setEditingDish({})}
                        className="border border-white/20 bg-white/5 px-4 py-2 text-[10px] font-sans font-bold uppercase tracking-[0.3em] text-white transition-transform active:scale-95 md:px-8 md:py-3 hover:bg-white hover:text-black shrink-0"
                    >
                        {dict.panel.deployDish}
                    </button>
                </header>

                {/* The Grid: 1 col mobile, multi-col desktop */}
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
                            <h2 className="text-xl font-serif text-stone-300 italic">No Dishes Deployed</h2>
                            <p className="text-stone-500 text-sm font-sans mt-2 tracking-widest uppercase text-[10px]">Architecture requires population.</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Editor Overlay */}
            {editingDish !== null && (
                <DishEditor
                    dish={Object.keys(editingDish).length === 0 ? null : editingDish}
                    dict={dict}
                    onClose={() => setEditingDish(null)}
                    onSave={(data) => {
                        console.log('Saved dish:', data);
                        setEditingDish(null);
                    }}
                />
            )}

        </div>
    );
}
