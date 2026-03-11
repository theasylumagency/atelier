'use client';

export default function Manifesto({ dict }: { dict: any }) {
    return (
        <section className="py-48 bg-stone-900 text-white relative">
            <div className="absolute inset-0 bg-black/80"></div>
            <div className="max-w-4xl mx-auto px-8 md:px-12 text-center relative z-10">
                <span className="text-xs font-sans font-bold tracking-[0.4em] text-stone-500 uppercase block mb-12">{dict.manifesto.chapter}</span>
                <h2
                    className="text-5xl md:text-7xl font-[Playfair_Display]! leading-none text-white mb-16"
                    dangerouslySetInnerHTML={{ __html: dict.manifesto.title }}
                />
                <div className="space-y-12">
                    <p className="text-2xl md:text-3xl leading-relaxed text-stone-300 italic">
                        {dict.manifesto.desc1}
                    </p>
                    <p className="text-stone-400 font-sans text-lg leading-relaxed max-w-2xl mx-auto font-light">
                        {dict.manifesto.desc2}
                    </p>
                    <div className="pt-16">
                        <button className="glass-panel font-sans text-white px-14 py-6 font-medium tracking-[0.3em] uppercase text-xs hover:bg-white hover:text-black transition-all duration-500 border border-white/20 inline-flex items-center gap-4">
                            {dict.manifesto.cta}
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
