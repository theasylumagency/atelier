'use client';
export default function Transition({ dict }: { dict: any }) {
    return (
        <section className="relative flex min-h-[100vh] w-full flex-col justify-between overflow-hidden border-y border-neutral-800 bg-[#050505] p-6 md:min-h-[100vh] max-sm:pt-28 md:p-28 lg:p-30">

            {/* ფონის ბადე (აბსოლუტური სიღრმისთვის) */}
            <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30"></div>

            {/* ზედა მარჯვენა კუთხე: სათაური და ჰედლაინი */}
            <div className="relative z-10 flex w-full flex-col items-end text-right font-[default-font-family]!">

                <span className="mb-4 font-mono text-xs font-bold uppercase tracking-[0.3em] text-neutral-500 md:text-sm font-sans">
                    {dict.transition.chapter}
                </span>
                <h2
                    className="text-[7vw] font-bold uppercase leading-none tracking-tighter text-transparent sm:text-[6vw] md:text-[4.5vw] font-sans!"
                    style={{ WebkitTextStroke: '2px #404040' }}
                >
                    {dict.transition.title}
                </h2>
            </div>

            {/* Right Bottom/Center */}
            <div className="relative z-10 mt-auto mb-auto flex w-full flex-1 flex-col items-end justify-center text-right">
                <div className="max-w-2xl pl-12">
                    <p className="mb-6 text-xl font-medium font-sans leading-relaxed text-white md:text-2xl lg:text-3xl">
                        {dict.transition.desc1}
                    </p>
                    <p className="text-sm leading-relaxed font-sans text-neutral-400 md:text-base lg:text-lg">
                        {dict.transition.desc2}
                    </p>
                </div>
            </div>

            {/* ქვედა მარჯვენა ნაწილი: სტაფილოსფერი ჰორიზონტალური ზოლი */}
            <div className="relative z-10 flex w-full justify-end">
                {/* ხაზი, რომელიც ნელ-ნელა ქრება მარცხნივ, რათა სივრცეს შეერწყას */}
                <div className="h-[3px] w-2/3 max-w-2xl bg-gradient-to-l from-amber-500 to-transparent md:w-1/2"></div>
            </div>




        </section >
    );
}
