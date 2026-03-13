'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { AppDictionary } from '@/lib/dictionaries';
import { getFloorSyncHubPath } from '@/lib/floor-sync';

export default function Architecture({ dict }: { dict: AppDictionary }) {
    const params = useParams();
    const locale = params.locale || 'en';
    const floorSyncHref = getFloorSyncHubPath(String(locale));
    return (
        <main className="relative min-h-screen pt-32 pb-24 bg-zinc-950 px-8 md:px-12 flex items-center justify-center">
            <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 glowing-line z-0 hidden md:block"></div>
            <div className="max-w-[1400px] w-full mx-auto relative z-10 grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-32">

                {/* Left side: Philosophy */}
                <div className="flex flex-col justify-center pr-0 md:pr-16 text-center md:text-right">
                    <span className="text-[10px] font-sans font-medium tracking-[0.4em] text-stone-500 uppercase block mb-8">{dict.architecture.phil_chapter}</span>
                    <h1
                        className="text-5xl md:text-7xl font-serif leading-[1.1] text-stone-100 mb-10"
                        dangerouslySetInnerHTML={{ __html: dict.architecture.phil_title }}
                    />
                    <p className="text-lg md:text-xl font-sans text-stone-400 font-light leading-relaxed max-w-lg ml-auto mb-12">
                        {dict.architecture.phil_desc}
                    </p>

                    <div className="flex flex-col gap-8 ml-auto max-w-md">
                        <div className="text-right">
                            <h3 className="text-sm font-sans tracking-[0.2em] uppercase text-stone-300 mb-3 border-b border-white/10 pb-2 inline-block">{dict.architecture.box1_title}</h3>
                            <p className="text-stone-500 font-sans text-sm font-light">{dict.architecture.box1_desc}</p>
                        </div>
                        <div className="text-right">
                            <h3 className="text-sm font-sans tracking-[0.2em] uppercase text-stone-300 mb-3 border-b border-white/10 pb-2 inline-block">{dict.architecture.box2_title}</h3>
                            <p className="text-stone-500 font-sans text-sm font-light">{dict.architecture.box2_desc}</p>
                        </div>
                    </div>
                </div>

                {/* Right side: Technology */}
                <div className="flex flex-col justify-center pl-0 md:pl-16 mt-16 md:mt-0">
                    <span className="text-[10px] font-sans font-medium tracking-[0.4em] text-stone-500 uppercase block mb-8 text-center md:text-left">{dict.architecture.tech_chapter}</span>
                    <div className="grid gap-6">

                        <Link href={floorSyncHref} className="group block">
                            <div className="border border-stone-800/80 bg-zinc-950 p-8 md:p-10 transition-all duration-300 relative group-hover:bg-zinc-900 group-hover:-translate-y-1 group-hover:-translate-x-1 group-hover:shadow-[4px_4px_0_0_#ea580c] group-active:translate-y-0 group-active:translate-x-0 group-active:shadow-none">
                                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="material-symbols-outlined text-orange-600 font-light text-sm">arrow_forward_ios</span>
                                </div>
                                <div className="flex flex-col md:flex-row items-start gap-6">
                                    <div className="w-12 h-12 flex-shrink-0 border border-stone-800 flex items-center justify-center bg-black/50 group-hover:border-orange-600/50 transition-colors">
                                        <span className="material-symbols-outlined text-stone-300 font-thin group-hover:text-orange-500 transition-colors">qr_code_scanner</span>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-mono uppercase tracking-widest text-stone-100 mb-3 group-hover:text-white transition-colors">{dict.architecture.tech1_title}</h3>
                                        <p className="text-stone-400 font-sans text-sm font-light leading-relaxed group-hover:text-stone-300 transition-colors">
                                            {dict.architecture.tech1_desc}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Link>

                        <Link href={floorSyncHref} className="group block">
                            <div className="border border-stone-800/80 bg-zinc-950 p-8 md:p-10 transition-all duration-300 relative group-hover:bg-zinc-900 group-hover:-translate-y-1 group-hover:-translate-x-1 group-hover:shadow-[4px_4px_0_0_#ea580c] group-active:translate-y-0 group-active:translate-x-0 group-active:shadow-none">
                                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="material-symbols-outlined text-orange-600 font-light text-sm">arrow_forward_ios</span>
                                </div>
                                <div className="flex flex-col md:flex-row items-start gap-6">
                                    <div className="w-12 h-12 flex-shrink-0 border border-stone-800 flex items-center justify-center bg-black/50 group-hover:border-orange-600/50 transition-colors">
                                        <span className="material-symbols-outlined text-stone-300 font-thin group-hover:text-orange-500 transition-colors">analytics</span>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-mono uppercase tracking-widest text-stone-100 mb-3 group-hover:text-white transition-colors">{dict.architecture.tech2_title}</h3>
                                        <p className="text-stone-400 font-sans text-sm font-light leading-relaxed group-hover:text-stone-300 transition-colors">
                                            {dict.architecture.tech2_desc}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Link>

                        <Link href={floorSyncHref} className="group block">
                            <div className="border border-stone-800/80 bg-zinc-950 p-8 md:p-10 transition-all duration-300 relative group-hover:bg-zinc-900 group-hover:-translate-y-1 group-hover:-translate-x-1 group-hover:shadow-[4px_4px_0_0_#ea580c] group-active:translate-y-0 group-active:translate-x-0 group-active:shadow-none">
                                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="material-symbols-outlined text-orange-600 font-light text-sm">arrow_forward_ios</span>
                                </div>
                                <div className="flex flex-col md:flex-row items-start gap-6">
                                    <div className="w-12 h-12 flex-shrink-0 border border-stone-800 flex items-center justify-center bg-black/50 group-hover:border-orange-600/50 transition-colors">
                                        <span className="material-symbols-outlined text-stone-300 font-thin group-hover:text-orange-500 transition-colors">all_inclusive</span>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-mono uppercase tracking-widest text-stone-100 mb-3 group-hover:text-white transition-colors">{dict.architecture.tech3_title}</h3>
                                        <p className="text-stone-400 font-sans text-sm font-light leading-relaxed group-hover:text-stone-300 transition-colors">
                                            {dict.architecture.tech3_desc}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Link>

                    </div>
                </div>
            </div>
        </main>
    );
}
