import Link from 'next/link';
import type { AppDictionary } from '@/lib/dictionaries';
import { getFloorSyncBoardPath } from '@/lib/floor-sync';

export default function Transition({ dict, locale }: { dict: AppDictionary; locale: string }) {
    const liveBoardHref = getFloorSyncBoardPath(locale, undefined, 'live');
    const isKa = locale === 'ka';

    return (
        <section className="relative w-full overflow-hidden border-y border-neutral-900 bg-[#050505] pt-24 md:pt-32 lg:pb-0">
            <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30" />

            <h2
                aria-label={`${dict.transition.title_1} ${dict.transition.title_2} ${dict.transition.title_3}`}
                className="pointer-events-none relative z-10 flex flex-col px-4 md:px-12 font-sans! font-bold tracking-tight select-none"
            >
                <span
                    aria-hidden
                    className={`${isKa ? 'text-[15vw]' : 'text-[16vw]'} leading-[0.95] text-transparent`}
                    style={{ WebkitTextStroke: '2px #2a2a2a' }}
                >
                    {dict.transition.title_1}
                </span>
                <span aria-hidden className={`${isKa ? 'text-[12.5vw] pl-[4vw]' : 'text-[13vw] pl-[8vw]'} leading-[0.95] text-white`}>
                    {dict.transition.title_2}
                </span>
                <span
                    aria-hidden
                    className={`${isKa ? 'text-[10.5vw]' : 'text-[12vw]'} text-right leading-[0.95] text-transparent`}
                    style={{ WebkitTextStroke: '2px #333' }}
                >
                    {dict.transition.title_3}
                </span>
            </h2>

            <div className="relative z-20 mt-14 md:mt-20 ml-auto w-full border-t border-neutral-800 bg-[#0a0a0a]/95 p-8 backdrop-blur-xl md:p-12 lg:w-1/2 lg:border-l lg:p-16">
                <span className="eyebrow mb-6 block text-amber-200/80">{dict.transition.chapter}</span>
                <p className="mb-6 text-2xl font-medium leading-snug text-white md:text-3xl font-sans!">
                    {dict.transition.desc1}
                </p>
                <p className="mb-10 text-base leading-relaxed text-neutral-300 font-sans!">
                    {dict.transition.desc2}
                </p>

                <div className="flex flex-col gap-3 sm:flex-row">
                    <Link href={`/${locale}/panel`} className="btn-ghost">
                        {dict.transition.cta1}
                    </Link>
                    <Link href={liveBoardHref} className="btn-primary">
                        {dict.transition.cta2}
                        <span className="material-symbols-outlined text-[18px]" aria-hidden>arrow_outward</span>
                    </Link>
                </div>
            </div>
        </section>
    );
}
