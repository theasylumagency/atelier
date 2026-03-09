'use client';

export default function Features({ dict }: { dict: any }) {
    return (
        <section className="py-32 bg-black overflow-hidden relative" id="arsenal">
            <div className="absolute inset-0 z-0 opacity-20" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBVwn74CvlOfHS7J0vxWuNhb0sYi_y1ZdU9yWW91bnJC8xaPFgn91zOhZlQOXzIFCcv0CwuIPJbdgfQs1bK4NwwHP4S65PbbINtvqgmk9_SbosI1y6YuAxdj18oxSvfEJAEcVD42VXgSBd5bB-nrbWtsRYEyYU_tx6CvsKpshQrqvw3ZNEg1_222pRtm-ZDlEPt-axUU4aZXPqW4ZO1JoF-QjeezjiwKQx0CQRA0EC5D00rTuyMxd0YLf4VV9embk0hYMTf7Et1Fke_')", backgroundSize: 'cover', backgroundPosition: 'center', filter: 'grayscale(100%)' }}></div>
            <div className="max-w-[1600px] mx-auto px-8 md:px-12 relative z-10 text-center">
                <div className="mb-24 flex flex-col items-center">
                    <span className="text-stone-500 text-xs font-bold font-sans tracking-[0.4em] uppercase block mb-6">{dict.features.chapter}</span>
                    <h2 className="text-5xl md:text-7xl font-serif leading-none mb-10 max-w-4xl mx-auto">{dict.features.title}</h2>
                    <p className="text-stone-400 font-sans text-lg leading-relaxed max-w-2xl mx-auto">{dict.features.desc}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-32 max-w-6xl mx-auto">
                    <div className="group glass-panel p-12 text-center border-t-0 border-b-0 border-l border-r border-white/5 hover:bg-white/5 transition-all duration-700">
                        <div className="mb-10 flex justify-center">
                            <span className="material-symbols-outlined text-stone-400 text-6xl font-thin group-hover:text-white transition-colors duration-500">restaurant</span>
                        </div>
                        <h3 className="text-3xl font-serif italic mb-6">{dict.features.f1_title}</h3>
                        <p className="text-stone-400 font-sans text-sm leading-relaxed max-w-xs mx-auto">{dict.features.f1_desc}</p>
                    </div>

                    <div className="group glass-panel p-12 text-center border-t-0 border-b-0 border-l border-r border-white/5 hover:bg-white/5 transition-all duration-700 md:translate-y-16">
                        <div className="mb-10 flex justify-center">
                            <span className="material-symbols-outlined text-stone-400 text-6xl font-thin group-hover:text-white transition-colors duration-500">public</span>
                        </div>
                        <h3 className="text-3xl font-serif italic mb-6">{dict.features.f2_title}</h3>
                        <p className="text-stone-400 font-sans text-sm leading-relaxed max-w-xs mx-auto">{dict.features.f2_desc}</p>
                    </div>

                    <div className="group glass-panel p-12 text-center border-t-0 border-b-0 border-l border-r border-white/5 hover:bg-white/5 transition-all duration-700">
                        <div className="mb-10 flex justify-center">
                            <span className="material-symbols-outlined text-stone-400 text-6xl font-thin group-hover:text-white transition-colors duration-500">shield</span>
                        </div>
                        <h3 className="text-3xl font-serif italic mb-6">{dict.features.f3_title}</h3>
                        <p className="text-stone-400 font-sans text-sm leading-relaxed max-w-xs mx-auto">{dict.features.f3_desc}</p>
                    </div>

                    <div className="group glass-panel p-12 text-center border-t-0 border-b-0 border-l border-r border-white/5 hover:bg-white/5 transition-all duration-700 md:translate-y-16">
                        <div className="mb-10 flex justify-center">
                            <span className="material-symbols-outlined text-stone-400 text-6xl font-thin group-hover:text-white transition-colors duration-500">hub</span>
                        </div>
                        <h3 className="text-3xl font-serif italic mb-6">{dict.features.f4_title}</h3>
                        <p className="text-stone-400 font-sans text-sm leading-relaxed max-w-xs mx-auto">{dict.features.f4_desc}</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
