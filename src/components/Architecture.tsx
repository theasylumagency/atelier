import type { AppDictionary } from '@/lib/dictionaries';

const STEP_ICONS = ['travel_explore', 'design_services', 'rocket_launch'] as const;

export default function Architecture({ dict }: { dict: AppDictionary }) {
    const a = dict.architecture;
    const steps = [
        { title: a.tech1_title, desc: a.tech1_desc },
        { title: a.tech2_title, desc: a.tech2_desc },
        { title: a.tech3_title, desc: a.tech3_desc },
    ];

    return (
        <section className="relative py-28 md:py-40 bg-zinc-950 px-6 md:px-12">
            <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 glowing-line z-0 hidden lg:block" />
            <div className="max-w-[1280px] w-full mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-32">

                {/* Philosophy */}
                <div className="flex flex-col justify-center lg:pr-16 lg:text-right">
                    <span className="eyebrow text-amber-200/70 block mb-8">{a.phil_chapter}</span>
                    <h2
                        className="text-4xl md:text-6xl font-serif leading-[1.12] text-stone-100 mb-10"
                        dangerouslySetInnerHTML={{ __html: a.phil_title }}
                    />
                    <p className="text-lg md:text-xl font-sans text-stone-300 font-light leading-relaxed max-w-lg lg:ml-auto mb-12">
                        {a.phil_desc}
                    </p>

                    <div className="flex flex-col gap-8 lg:ml-auto max-w-md">
                        {[
                            [a.box1_title, a.box1_desc],
                            [a.box2_title, a.box2_desc],
                        ].map(([title, desc]) => (
                            <div key={title}>
                                <h3 className="text-base font-sans font-medium text-stone-100 mb-2 border-b border-white/10 pb-2 inline-block">{title}</h3>
                                <p className="text-stone-400 font-sans text-[15px] font-light leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* How we start */}
                <div className="flex flex-col justify-center lg:pl-16">
                    <span className="eyebrow text-amber-200/70 block mb-8">{a.tech_chapter}</span>
                    <ol className="grid gap-5">
                        {steps.map((step, i) => (
                            <li key={step.title} className="border border-stone-800/80 bg-zinc-950 p-8 md:p-10">
                                <div className="flex flex-col sm:flex-row items-start gap-6">
                                    <div className="w-12 h-12 flex-shrink-0 border border-stone-800 flex items-center justify-center bg-black/50">
                                        <span className="material-symbols-outlined text-amber-200/80 font-thin" aria-hidden>{STEP_ICONS[i]}</span>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-sans font-medium text-stone-100 mb-3">{step.title}</h3>
                                        <p className="text-stone-300 font-sans text-[15px] font-light leading-relaxed">{step.desc}</p>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ol>
                </div>
            </div>
        </section>
    );
}
