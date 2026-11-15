'use client';

import { useState, useEffect } from 'react';
import type { AppDictionary } from '@/lib/dictionaries';

export default function Process({ dict }: { dict: AppDictionary }) {
    const [activeIndex, setActiveIndex] = useState(0);

    // Auto-cycle the active step
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex((current) => (current + 1) % dict.process.steps.length);
        }, 3000); // Change every 3 seconds
        return () => clearInterval(interval);
    }, [dict.process.steps.length]);

    return (
        <section id="how" className="py-28 md:py-40 bg-black text-center relative overflow-hidden scroll-mt-16">
            {/* SVG Animated Background */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                    <defs>
                        {/* Panning Grid */}
                        <pattern id="brutal-grid" width="100" height="100" patternUnits="userSpaceOnUse">
                            <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                        </pattern>
                        {/* Dot Pattern for crosshairs */}
                        <pattern id="brutal-dots" width="40" height="40" patternUnits="userSpaceOnUse">
                            <circle cx="20" cy="20" r="1" fill="rgba(255,255,255,0.2)" />
                        </pattern>
                    </defs>

                    {/* Styles for Custom Animations */}
                    <style>
                        {`
                        @keyframes panGrid {
                            0% { transform: translate(0, 0); }
                            100% { transform: translate(-100px, -100px); }
                        }
                        @keyframes scanVertical {
                            0% { transform: translateY(-100%); }
                            100% { transform: translateY(200%); }
                        }
                        @keyframes spinSlow {
                            100% { transform: rotate(360deg); }
                        }
                        @keyframes spinSlowReverse {
                            100% { transform: rotate(-360deg); }
                        }
                        .animate-pan { animation: panGrid 10s linear infinite; }
                        .animate-scan-v { animation: scanVertical 8s linear infinite; }
                        .animate-spin-slow { animation: spinSlow 30s linear infinite; transform-origin: center; }
                        .animate-spin-reverse { animation: spinSlowReverse 40s linear infinite; transform-origin: center; }
                        `}
                    </style>

                    {/* Infinite Panning Grid */}
                    <rect width="200%" height="200%" fill="url(#brutal-grid)" className="animate-pan" />
                    <rect width="100%" height="100%" fill="url(#brutal-dots)" />

                    {/* Large Geometric Background Elements */}
                    <g opacity="0.1">
                        <circle cx="50%" cy="50%" r="40%" fill="none" stroke="white" strokeWidth="1" strokeDasharray="10 20" className="animate-spin-slow" />
                        <circle cx="50%" cy="50%" r="60%" fill="none" stroke="white" strokeWidth="2" strokeDasharray="100 150" className="animate-spin-reverse" />

                        {/* Crosshairs & Lines */}
                        <line x1="0" y1="50%" x2="100%" y2="50%" stroke="white" strokeWidth="1" strokeDasharray="4 8" />
                        <line x1="50%" y1="0" x2="50%" y2="100%" stroke="white" strokeWidth="1" strokeDasharray="4 8" />

                        {/* Diagonal structural line */}
                        <line x1="0" y1="0" x2="100%" y2="100%" stroke="white" strokeWidth="1" opacity="0.3" />
                        <line x1="100%" y1="0" x2="0" y2="100%" stroke="white" strokeWidth="1" opacity="0.3" />
                    </g>

                    {/* Scanning Elements */}
                    <rect width="100%" height="2" fill="rgba(255,255,255,0.4)" className="animate-scan-v" />
                </svg>
            </div>

            {/* Content Container */}
            <div className="max-w-[1200px] mx-4 md:mx-auto px-6 py-14 md:p-16 relative z-10 bg-black/50 backdrop-blur-sm border border-white/5">
                <div className="pb-16 mb-16 border-b border-white/10 relative">
                    {/* Decorative node corners */}
                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/40"></div>
                    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/40"></div>

                    <span className="eyebrow text-amber-200/70 block mb-6">{dict.process.chapter}</span>
                    <h2
                        className="text-4xl md:text-6xl font-serif leading-[1.15] text-white"
                        dangerouslySetInnerHTML={{ __html: dict.process.title }}
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-14 md:gap-10 relative">
                    {dict.process.steps.map((step, idx: number) => {
                        const isActive = activeIndex === idx;

                        return (
                            <div
                                key={idx}
                                className="group flex flex-col items-center relative"
                                onMouseEnter={() => setActiveIndex(idx)}
                            >
                                {/* Process connection lines */}
                                {idx < dict.process.steps.length - 1 && (
                                    <div className="hidden md:block absolute top-[4rem] left-[50%] w-full h-[1px] bg-white/10 z-0 overflow-hidden pointer-events-none">
                                        {/* Data packet simulation on line */}
                                        <div className={`w-16 h-full bg-stone-400 absolute left-0 top-0 transition-opacity duration-500 animate-[shimmer_3s_infinite] ${isActive ? 'opacity-80' : 'opacity-20'}`}></div>
                                    </div>
                                )}

                                <div className={`w-32 h-32 rounded-full border flex items-center justify-center mb-10 transition-all duration-700 relative z-10 bg-black ${isActive ? 'bg-white/5 border-stone-500 scale-105 shadow-[0_0_30px_rgba(255,255,255,0.05)]' : 'border-white/10 scale-100 group-hover:bg-white/5 group-hover:border-stone-500'}`}>
                                    <span className={`text-xl font-serif italic transition-colors duration-500 ${isActive ? 'text-white' : 'text-white/30 group-hover:text-white/80'}`}>{step.num}</span>
                                    <div className={`absolute inset-0 border rounded-full transition-all duration-1000 ${isActive ? 'border-white/20 scale-125' : 'border-white/5 scale-110 group-hover:scale-125'}`}></div>
                                </div>
                                <h4 className={`text-2xl font-serif mb-4 transition-colors duration-500 ${isActive ? 'text-white' : 'text-white/50 group-hover:text-white/90'}`}>{step.title}</h4>
                                <p className={`font-sans font-light leading-relaxed text-[15px] max-w-xs text-center transition-colors duration-500 ${isActive ? 'text-stone-200' : 'text-stone-400 group-hover:text-stone-300'}`}>{step.desc}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
