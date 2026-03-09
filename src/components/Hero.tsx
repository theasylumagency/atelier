'use client';
export default function Hero({ dict }: { dict: any }) {
    return (
        <section className="relative min-h-screen flex flex-col justify-center items-center pb-24 px-8 md:px-12 overflow-hidden text-center">
            {/* Background Videos wrapped with Stitch styling */}
            <div className="absolute inset-0 z-0 scale-105" style={{ filter: 'brightness(0.6) saturate(0.8)' }}>
                <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover hidden md:block">
                    <source src="/videos/hero-wide.webm" type="video/webm" />
                    <source src="/videos/hero-wide.mp4" type="video/mp4" />
                </video>
                <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover block md:hidden">
                    <source src="/videos/hero-tall.webm" type="video/webm" />
                    <source src="/videos/hero-tall.mp4" type="video/mp4" />
                </video>
            </div>

            <div className="absolute inset-0 luxury-gradient z-10"></div>

            <div className="relative z-20 max-w-5xl w-full flex flex-col items-center pt-24 animate-fade-in-up">
                <span className="text-xs font-medium font-sans tracking-[0.5em] text-stone-400 uppercase block mb-8">{dict.hero.chapter}</span>
                <h1
                    className="text-6xl md:text-[8rem] font-serif leading-[0.9] text-white mb-12"
                    dangerouslySetInnerHTML={{ __html: dict.hero.title }}
                />
                <p className="text-xl md:text-3xl text-stone-300 max-w-3xl font-light leading-relaxed serif-title italic py-8 border-y border-white/10 my-8">
                    {dict.hero.subtitle}
                </p>
                <div className="flex flex-col md:flex-row items-center gap-8 mt-12">
                    <button className="glass-panel font-sans text-white px-12 py-5 font-medium tracking-[0.2em] uppercase text-xs hover:bg-white hover:text-black transition-all duration-500 border border-white/20">
                        {dict.hero.cta}
                    </button>
                </div>
            </div>

            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center opacity-50 animate-fade-in">
                <span className="text-[9px] font-sans tracking-[0.4em] uppercase mb-4">{dict.hero.scroll}</span>
                <span className="material-symbols-outlined text-sm">south</span>
            </div>
        </section>
    );
}
