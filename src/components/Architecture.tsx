'use client';

export default function Architecture({ dict }: { dict: any }) {
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

                        <div className="glass-card p-8 md:p-10 rounded-sm">
                            <div className="flex items-start gap-6">
                                <div className="w-12 h-12 flex-shrink-0 border border-white/20 flex items-center justify-center rounded-sm bg-black/50">
                                    <span className="material-symbols-outlined text-stone-300 font-thin">qr_code_scanner</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-serif text-stone-100 mb-3">{dict.architecture.tech1_title}</h3>
                                    <p className="text-stone-400 font-sans text-sm font-light leading-relaxed">
                                        {dict.architecture.tech1_desc}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="glass-card p-8 md:p-10 rounded-sm">
                            <div className="flex items-start gap-6">
                                <div className="w-12 h-12 flex-shrink-0 border border-white/20 flex items-center justify-center rounded-sm bg-black/50">
                                    <span className="material-symbols-outlined text-stone-300 font-thin">analytics</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-serif text-stone-100 mb-3">{dict.architecture.tech2_title}</h3>
                                    <p className="text-stone-400 font-sans text-sm font-light leading-relaxed">
                                        {dict.architecture.tech2_desc}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="glass-card p-8 md:p-10 rounded-sm">
                            <div className="flex items-start gap-6">
                                <div className="w-12 h-12 flex-shrink-0 border border-white/20 flex items-center justify-center rounded-sm bg-black/50">
                                    <span className="material-symbols-outlined text-stone-300 font-thin">all_inclusive</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-serif text-stone-100 mb-3">{dict.architecture.tech3_title}</h3>
                                    <p className="text-stone-400 font-sans text-sm font-light leading-relaxed">
                                        {dict.architecture.tech3_desc}
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </main>
    );
}
