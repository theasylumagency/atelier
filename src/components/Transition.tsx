'use client';
export default function Transition({ dict }: { dict: any }) {
    return (
        <section className="relative flex min-h-[100vh] w-full items-center justify-center overflow-hidden border-y border-neutral-800 bg-[#050505]">

            {/* ფონის ბადე */}
            <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30"></div>

            {/* გიგანტური ასიმეტრიული ტიპოგრაფია (The Anti-Template) */}
            <div className="pointer-events-none absolute flex w-full flex-col justify-center px-4 md:px-12">
                <h2 className="flex flex-col font-bold uppercase tracking-tighter mix-blend-lighten">
                    <span
                        className="text-[14vw] leading-[0.85] text-transparent font-sans!"
                        style={{ WebkitTextStroke: '2px #222' }}
                    >
                        {dict.transition.title_1}
                    </span>
                    <span className="pl-[8vw] text-[12vw] leading-[0.85] text-white opacity-95 font-sans!">
                        {dict.transition.title_2}
                    </span>
                    <span
                        className="text-right text-[12vw] leading-[0.85] text-transparent font-sans!"
                        style={{ WebkitTextStroke: '2px #333' }}
                    >
                        {dict.transition.title_3}
                    </span>
                </h2>
            </div>

            {/* მკაცრი არქიტექტურული მართვის ყუთი (The Control Box) */}
            <div className="absolute bottom-0 right-0 z-20 w-full border-l border-t border-neutral-800 bg-[#0a0a0a]/95 p-8 backdrop-blur-xl md:w-3/4 md:p-12 lg:w-1/2 lg:p-16">
                <span className="mb-6 block font-mono text-xs font-bold uppercase tracking-[0.3em] text-amber-500 font-sans!" >
                    {dict.transition.chapter}
                </span>
                <p className="mb-6 text-xl font-medium leading-tight text-white md:text-3xl font-sans!">
                    {dict.transition.desc1}
                </p>
                <p className="mb-10 text-sm leading-relaxed text-neutral-400 md:text-base font-sans!">
                    {dict.transition.desc2}
                </p>

                {/* ტექნიკური დირექტივები */}
                <div className="flex flex-col gap-4 sm:flex-row">
                    <a
                        href="/ka/panel"
                        className="flex items-center justify-center border border-neutral-700 bg-transparent px-8 py-4 font-mono text-[10px] font-bold uppercase tracking-widest text-neutral-400 transition-colors hover:border-white hover:text-white"
                    >
                        {dict.transition.cta1}
                    </a>
                    <a
                        href="/ka/floor-sync"
                        className="flex items-center justify-center border border-white bg-white px-8 py-4 font-mono text-[10px] font-bold uppercase tracking-widest text-black transition-transform active:scale-95 hover:bg-neutral-200"
                    >
                        {dict.transition.cta2}
                    </a>
                </div>
            </div>

        </section>
    );
}
