'use client';

import React, { useState } from 'react';

// Using a flexible any type for the dish to match the data structure read from the JSON without over-engineering types for the simulation
export default function DishCard({ dish, dict, onEdit }: { dish: any, dict: any, onEdit?: (dish: any) => void }) {
    // Local state for the brutalist toggles to simulate instant execution
    const [isActive, setIsActive] = useState(dish.status === 'active');
    const [isSoldOut, setIsSoldOut] = useState(dish.soldOut);

    // Convert minor units back to standard decimal
    const formattedPrice = (dish.priceMinor / 100).toFixed(2);

    return (
        <div className="group relative flex flex-col border border-white/10 glass-card bg-black/40 text-stone-100 transition-all hover:border-white/30 h-full">

            {/* Clickable Top Module */}
            <div
                className={`flex flex-col flex-1 ${onEdit ? 'cursor-pointer' : ''}`}
                onClick={() => onEdit && onEdit(dish)}
            >
                {/* Visual Studio (Image Section) */}
                <div className="relative h-56 w-full overflow-hidden border-b border-white/10 bg-zinc-900/50 flex-shrink-0">
                    {dish.photo?.full ? (
                        <img
                            src={`/uploads/dishes/${dish.photo.full}`}
                            alt={dish.title.en}
                            className="h-full w-full object-cover transition-all duration-700 grayscale group-hover:grayscale-0 opacity-80"
                        />
                    ) : (
                        // Brutalist geometric placeholder for dishes missing photography
                        <div className="flex h-full w-full items-center justify-center bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.02)_10px,rgba(255,255,255,0.02)_20px)]">
                            <span className="bg-black px-3 py-1 text-[10px] uppercase font-sans tracking-[0.3em] text-stone-500 border border-white/5">
                                {dict.panel.awaitingAsset}
                            </span>
                        </div>
                    )}

                    {/* Geometric Badge System overlay */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {dish.vegetarian && (
                            <span className="border border-green-900/50 bg-green-950/80 px-2 py-1 text-[9px] uppercase font-sans tracking-[0.3em] text-green-400 backdrop-blur-sm">
                                {dict.panel.vegan}
                            </span>
                        )}
                        {dish.chefsPick && (
                            <span className="border border-amber-900/50 bg-amber-950/80 px-2 py-1 text-[9px] uppercase font-sans tracking-[0.3em] text-amber-400 backdrop-blur-sm">
                                {dict.panel.signature}
                            </span>
                        )}
                    </div>

                </div>

                {/* The Data Module - Top Text */}
                <div className="flex flex-col p-6 pb-0">
                    <div className="mb-3 flex items-start justify-between gap-4">
                        <h3 className="text-xl font-serif italic text-white leading-tight">
                            {dish.title.ka}
                        </h3>
                        <span className="font-sans text-xs tracking-widest text-stone-400 mt-1">
                            {formattedPrice} {dish.currency}
                        </span>
                    </div>
                    <p className="text-[10px] font-sans text-stone-500 uppercase tracking-[0.2em] mb-4">
                        {dish.title.en}
                    </p>

                </div>
            </div>

            {/* The Action Floor (Toggles) */}
            <div className="flex flex-col justify-end p-6 pt-5 mt-auto">
                <div className="flex flex-col gap-4 border-t border-white/10 pt-5">

                    {/* Main Visibility Toggle */}
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-sans uppercase text-stone-500 tracking-[0.3em]">
                            {dict.panel.live}
                        </span>
                        <button
                            onClick={() => setIsActive(!isActive)}
                            className={`relative h-10 w-16 md:h-6 md:w-12 border transition-colors duration-200 ${isActive ? 'border-white bg-white/10' : 'border-white/20 bg-transparent'
                                }`}
                        >
                            <div
                                className={`absolute top-0.5 md:top-0.5 h-8 w-8 md:h-4 md:w-4 transition-transform duration-200 ${isActive ? 'translate-x-[1.8rem] md:translate-x-[1.6rem] bg-white' : 'translate-x-1 bg-white/20'
                                    }`}
                            />
                        </button>
                    </div>

                    {/* Emergency 86 Toggle */}
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-sans uppercase text-stone-500 tracking-[0.3em]">
                            {dict.panel.soldOut}
                        </span>
                        <button
                            onClick={() => setIsSoldOut(!isSoldOut)}
                            className={`relative h-10 w-16 md:h-6 md:w-12 border transition-colors duration-200 ${isSoldOut ? 'border-red-500/50 bg-red-950/50' : 'border-white/20 bg-transparent'
                                }`}
                        >
                            <div
                                className={`absolute top-0.5 md:top-0.5 h-8 w-8 md:h-4 md:w-4 transition-transform duration-200 ${isSoldOut ? 'translate-x-[1.8rem] md:translate-x-[1.6rem] bg-red-500' : 'translate-x-1 bg-white/20'
                                    }`}
                            />
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
