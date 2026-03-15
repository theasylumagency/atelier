'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function Features({ dict }: { dict: any }) {
    const params = useParams();
    const locale = params.locale || 'en';

    const panelHref = `/${locale}/panel`;

    return (
        <section className="bg-white py-20 relative font-sans text-slate-900" id="arsenal">
            <div className="max-w-7xl mx-auto px-6 relative z-10 transition-transform duration-500">

                {/* Section Header: The Digital Blueprint */}
                <div className="grid grid-cols-12 gap-8 mb-32">
                    <div className="col-span-12 lg:col-span-7 pt-12">
                            <span className="text-orange-600 text-[0.6rem] font-mono font-bold uppercase tracking-[0.4em] mb-6 px-1 pr-10 inline-block">
                                {dict.features.chapter}
                            </span>
                            <h2 className="font-serif text-4xl max-sm:text-2xl font-light leading-[0.9] tracking-tighter mb-8 text-slate-900 group-hover:opacity-80 transition-opacity">
                                {dict.features.title_prefix} 
                                <span className="font-bold text-orange-600 italic">{dict.features.title_highlight}</span>
                            </h2>
                            <div className="h-px w-32 bg-orange-600 mb-8 transition-all duration-500 group-hover:w-48"></div>
                            <p className="text-lg text-slate-600 font-light leading-relaxed max-w-xl group-hover:text-slate-800 transition-colors">
                                {dict.features.desc}
                            </p>
                    </div>
                    <div className="col-span-12 lg:col-span-5 flex items-end justify-end">
                            <div className="border-l border-slate-300 pl-8 py-4 bg-slate-50/50 pr-12 group-hover:bg-slate-100 transition-colors">
                                <p className="font-mono text-[10px] uppercase tracking-widest text-slate-400 mb-2 font-bold group-hover:text-slate-500 transition-colors">{dict.features.status_label}</p>
                                <p className="font-mono text-xl font-medium tracking-tight text-slate-900">{dict.features.status_value}</p>
                            </div>
                    </div>
                </div>

                {/* Asymmetric Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-24 mb-40">
                    {/* Left Column: Focus on Negative Space */}
                    <div className="md:col-span-4 space-y-16">
                        <Link href={panelHref} className="group block cursor-pointer">
                            <span className="material-symbols-outlined text-4xl text-orange-600/40 group-hover:text-orange-600 transition-colors mb-6 block">
                                grid_view
                            </span>
                            <h3 className="font-mono text-lg font-bold uppercase tracking-widest mb-4 text-slate-900">
                                {dict.features.arch_title}
                            </h3>
                            <p className="text-sm leading-relaxed text-slate-500 group-hover:text-slate-700 transition-colors">
                                {dict.features.arch_desc}
                            </p>
                        </Link>

                        <div className="pt-12 border-t border-slate-200">
                            <span className="font-mono text-[10px] text-orange-600 uppercase font-bold tracking-[0.3em]">
                                {dict.features.specs_title}
                            </span>
                            <ul className="mt-8 space-y-4 font-mono text-xs uppercase tracking-widest">
                                <div className="block group">
                                    <li className="flex justify-between border-b border-slate-100 pb-3 group-hover:border-slate-300 transition-colors">
                                        <span className="text-slate-400 group-hover:text-slate-600 transition-colors">{dict.features.spec1_name}</span>
                                        <span className="text-slate-800 bg-slate-100 px-2 py-0.5 group-hover:bg-slate-200 transition-colors">{dict.features.spec1_val}</span>
                                    </li>
                                </div>
                                <div className="block group">
                                    <li className="flex justify-between border-b border-slate-100 pb-3 mt-4 group-hover:border-slate-300 transition-colors">
                                        <span className="text-slate-400 group-hover:text-slate-600 transition-colors">{dict.features.spec2_name}</span>
                                        <span className="text-slate-800 bg-slate-100 px-2 py-0.5 group-hover:bg-slate-200 transition-colors">{dict.features.spec2_val}</span>
                                    </li>
                                </div>
                                <div className="block group">
                                    <li className="flex justify-between border-b border-slate-100 pb-3 mt-4 group-hover:border-slate-300 transition-colors">
                                        <span className="text-slate-400 group-hover:text-slate-600 transition-colors">{dict.features.spec3_name}</span>
                                        <span className="text-slate-800 bg-slate-100 px-2 py-0.5 group-hover:bg-slate-200 transition-colors">{dict.features.spec3_val}</span>
                                    </li>
                                </div>

                            </ul>
                        </div>
                    </div>

                    {/* Right Column: Visual Showcase */}
                    <div className="md:col-span-8 grid grid-cols-2 gap-4">
                        <div className="col-span-2 md:col-span-2 aspect-21/6 bg-slate-100 relative overflow-hidden group border border-slate-200/50 block">
                            <div className="absolute inset-0 bg-linear-to-tr from-orange-600/10 to-transparent z-10 transition-opacity duration-700 group-hover:opacity-50"></div>
                            <div className="absolute inset-0 flex items-center justify-center border border-slate-200/50 m-4 z-20 transition-all duration-700 group-hover:m-2">
                                <div className="text-center">
                                    <span className="material-symbols-outlined text-6xl text-slate-300 group-hover:text-slate-400 transition-colors duration-700">settings_input_component</span>
                                    <p className="font-mono text-[10px] uppercase tracking-[0.5em] mt-6 opacity-40 text-slate-900 group-hover:opacity-60 transition-opacity">
                                        {dict.features.core_engine}
                                    </p>
                                </div>
                            </div>
                            <div className="absolute bottom-10 left-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-30">
                                <h4 className="font-mono font-bold text-sm uppercase tracking-widest text-slate-900 bg-white/80 backdrop-blur-md px-3 py-1 border border-slate-200 shadow-sm">
                                    {dict.features.blueprint}
                                </h4>
                            </div>
                            <img
                                src="/images/backgrounds/blueprint1.webp"
                                alt="Minimalist architectural skyscraper showing geometric glass patterns"
                                className="w-full h-full object-cover opacity-20 mix-blend-overlay grayscale absolute inset-0 transition-transform duration-1000 group-hover:scale-[1.03] group-hover:opacity-30"
                            />
                        </div>
                        {/* core_engine */}
                        <Link href={panelHref} className="col-span-2 md:col-span-1 aspect-square bg-slate-200 relative overflow-hidden group border border-slate-200 cursor-pointer block">
                            <img
                                src="/images/backgrounds/core_engine.webp"
                                alt="Abstract structural grid with glowing lines"
                                className="w-full h-full object-cover opacity-30 grayscale transition-transform duration-1000 group-hover:scale-110 absolute inset-0 group-hover:opacity-40"
                            />
                            <div className="absolute inset-0 p-8 flex flex-col justify-between z-10 bg-gradient-to-t from-white/20 to-transparent group-hover:from-white/40 transition-colors duration-700">
                                <span className="material-symbols-outlined text-orange-600 group-hover:scale-110 transition-transform duration-500 origin-left">hub</span>
                                <div>
                                    <h4 className="font-mono font-bold text-sm uppercase tracking-widest mb-2 text-slate-900">
                                        {dict.features.integrity_title}
                                    </h4>
                                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-600 font-bold opacity-60 group-hover:opacity-90 transition-opacity">
                                        {dict.features.integrity_desc}
                                    </p>
                                </div>
                            </div>
                        </Link>
                        {/* neural_engine */}
                        <Link href={panelHref} className="col-span-2 md:col-span-1 aspect-square bg-orange-600 relative overflow-hidden group cursor-pointer block">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-white/20 to-transparent opacity-50 z-0 group-hover:opacity-75 transition-all duration-1000 group-hover:scale-110"></div>
                            <div className="absolute inset-0 p-8 flex flex-col justify-between text-white z-10">
                                <span className="material-symbols-outlined text-white/80 group-hover:text-white transition-all duration-1000 group-hover:scale-110 origin-left">analytics</span>
                                <div>
                                    <h4 className="font-mono font-bold text-sm uppercase tracking-widest mb-2 text-white">
                                        {dict.features.neural_title}
                                    </h4>
                                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/80 group-hover:text-white transition-opacity duration-1000">
                                        {dict.features.neural_desc}
                                    </p>
                                </div>
                            </div>
                            {/* Wireframe pattern overlay */}
                            <div
                                className="absolute inset-0 opacity-[0.15] group-hover:opacity-[0.3] transition-all duration-1000 group-hover:scale-105 pointer-events-none z-0"
                                style={{
                                    backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
                                    backgroundSize: "20px 20px"
                                }}
                            ></div>
                        </Link>
                    </div>
                </div>

                {/* Strategic Deployment Banner */}
                <div className="border-y border-slate-200 py-16 grid grid-cols-1 md:grid-cols-3 gap-12 relative overflow-hidden">
                    <div className="relative z-10 group block transform transition-all duration-300 hover:-translate-y-1 hover:bg-slate-50 p-4 -m-4 rounded-xl">
                        <h5 className="font-mono font-bold text-[10px] uppercase tracking-[0.3em] mb-4 text-orange-600">
                            {dict.features.step1_title}
                        </h5>
                        <p className="text-sm text-slate-500 leading-relaxed font-sans group-hover:text-slate-800 transition-colors">
                            {dict.features.step1_desc}
                        </p>
                    </div>
                    <div className="relative z-10 group block transform transition-all duration-300 hover:-translate-y-1 hover:bg-slate-50 p-4 -m-4 rounded-xl">
                        <h5 className="font-mono font-bold text-[10px] uppercase tracking-[0.3em] mb-4 text-orange-600">
                            {dict.features.step2_title}
                        </h5>
                        <p className="text-sm text-slate-500 leading-relaxed font-sans group-hover:text-slate-800 transition-colors">
                            {dict.features.step2_desc}
                        </p>
                    </div>
                    <div className="relative z-10 group block transform transition-all duration-300 hover:-translate-y-1 hover:bg-slate-50 p-4 -m-4 rounded-xl">
                        <h5 className="font-mono font-bold text-[10px] uppercase tracking-[0.3em] mb-4 text-orange-600">
                            {dict.features.step3_title}
                        </h5>
                        <p className="text-sm text-slate-500 leading-relaxed font-sans group-hover:text-slate-800 transition-colors">
                            {dict.features.step3_desc}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
