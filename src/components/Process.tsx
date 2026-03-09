'use client';

export default function Process({ dict }: { dict: any }) {
    return (
        <section className="py-40 bg-black text-center">
            <div className="max-w-[1200px] mx-auto px-8 md:px-12">
                <div className="pb-16 mb-16 border-b border-white/10">
                    <span className="text-xs font-sans font-bold tracking-[0.4em] text-stone-500 uppercase block mb-6">{dict.process.chapter}</span>
                    <h2
                        className="text-5xl md:text-7xl font-serif uppercase tracking-tight"
                        dangerouslySetInnerHTML={{ __html: dict.process.title }}
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                    {dict.process.steps.map((step: any, idx: number) => (
                        <div key={idx} className="group flex flex-col items-center">
                            <div className="w-32 h-32 rounded-full border border-white/10 flex items-center justify-center mb-10 group-hover:bg-white/5 transition-colors duration-700">
                                <span className="text-xl font-serif italic text-white">{step.num}</span>
                            </div>
                            <h4 className="text-xl font-serif mb-6 uppercase tracking-widest text-white">{step.title}</h4>
                            <p className="text-stone-500 font-sans font-light leading-relaxed text-sm max-w-xs text-center">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
