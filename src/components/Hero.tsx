import type { AppDictionary } from '@/lib/dictionaries';

export default function Hero({ dict }: { dict: AppDictionary }) {
    return (
        <section className="relative min-h-[100svh] flex flex-col justify-center items-center pb-28 px-6 md:px-12 overflow-hidden text-center">
            <div className="absolute inset-0 z-0 scale-105" style={{ filter: 'brightness(0.55) saturate(0.85)' }}>
                <video autoPlay muted loop playsInline preload="metadata" className="absolute inset-0 w-full h-full object-cover hidden md:block">
                    <source src="/videos/hero-wide.webm" type="video/webm" />
                    <source src="/videos/hero-wide.mp4" type="video/mp4" />
                </video>
                <video autoPlay muted loop playsInline preload="metadata" className="absolute inset-0 w-full h-full object-cover block md:hidden">
                    <source src="/videos/hero-tall.webm" type="video/webm" />
                    <source src="/videos/hero-tall.mp4" type="video/mp4" />
                </video>
            </div>

            <div className="absolute inset-0 luxury-gradient z-10" />
            <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-zinc-950 z-10" />

            <div className="relative z-20 max-w-4xl w-full flex flex-col items-center pt-28 animate-fade-in-up">
                <span className="eyebrow text-stone-300 mb-8">{dict.hero.chapter}</span>

                <h1
                    className="text-[2.6rem] leading-[1.08] sm:text-6xl lg:text-7xl font-serif text-white mb-8 text-balance"
                    dangerouslySetInnerHTML={{ __html: dict.hero.title }}
                />

                <p className="text-base md:text-xl font-sans text-stone-200 max-w-2xl font-light leading-relaxed text-pretty">
                    {dict.hero.subtitle}
                </p>

                <p className="text-sm text-stone-400 max-w-xl font-sans leading-relaxed mt-5">
                    {dict.hero.supporting}
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mt-12 w-full sm:w-auto">
                    <a href="#demo" className="btn-primary">
                        <span className="material-symbols-outlined text-[18px]" aria-hidden>qr_code_scanner</span>
                        {dict.hero.primaryCta}
                    </a>
                    <a href="#contact" className="btn-ghost">
                        {dict.hero.secondaryCta}
                    </a>
                </div>
            </div>

            <a
                href="#offer"
                className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center text-stone-300/70 hover:text-white transition-colors animate-fade-in"
            >
                <span className="eyebrow mb-3">{dict.hero.scroll}</span>
                <span className="material-symbols-outlined text-sm" aria-hidden>south</span>
            </a>
        </section>
    );
}
