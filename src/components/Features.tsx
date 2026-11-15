import Image from 'next/image';
import Link from 'next/link';
import type { AppDictionary } from '@/lib/dictionaries';
import { getFloorSyncBoardPath } from '@/lib/floor-sync';

type ShowcaseItem = AppDictionary['features']['items'][number];

function hrefFor(item: ShowcaseItem, locale: string) {
    if (item.href === 'board') return getFloorSyncBoardPath(locale, undefined, 'live');
    if (item.href === 'panel') return `/${locale}/panel`;
    return '#demo';
}

function PhoneFrame({ src, alt }: { src: string; alt: string }) {
    return (
        <div className="relative mx-auto w-[260px] sm:w-[300px] rounded-[2.75rem] border border-white/15 bg-black p-2.5 shadow-[0_40px_120px_rgba(0,0,0,0.7)]">
            <div className="absolute left-1/2 top-4 z-10 h-5 w-20 -translate-x-1/2 rounded-full bg-black" />
            <div className="overflow-hidden rounded-[2.2rem]">
                <Image src={src} alt={alt} width={780} height={1688} className="h-auto w-full" sizes="300px" />
            </div>
        </div>
    );
}

function BrowserFrame({ src, alt, height }: { src: string; alt: string; height: number }) {
    return (
        <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0b0b0b] shadow-[0_40px_120px_rgba(0,0,0,0.7)]">
            <div className="flex items-center gap-1.5 border-b border-white/5 px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
            </div>
            <Image src={src} alt={alt} width={1600} height={height} className="h-auto w-full" sizes="(min-width: 1024px) 720px, 100vw" />
        </div>
    );
}

export default function Features({ dict, locale }: { dict: AppDictionary; locale: string }) {
    const f = dict.features;

    return (
        <section id="offer" className="relative bg-zinc-950 py-28 md:py-40 scroll-mt-16">
            <div className="mx-auto max-w-[1280px] px-6 md:px-12">
                <div className="max-w-3xl">
                    <span className="eyebrow text-amber-200/70 mb-6 block">{f.chapter}</span>
                    <h2
                        className="text-4xl md:text-6xl font-serif leading-[1.1] text-white mb-8"
                        dangerouslySetInnerHTML={{ __html: f.title }}
                    />
                    <p className="text-lg text-stone-300 font-light leading-relaxed max-w-2xl">{f.desc}</p>
                </div>

                <div className="mt-24 md:mt-32 space-y-28 md:space-y-40">
                    {f.items.map((item, idx) => {
                        const reversed = idx % 2 === 1;
                        const src = `/landing/${item.image}-${locale}.webp`;
                        const href = hrefFor(item, locale);

                        return (
                            <article
                                key={item.title}
                                className={`grid grid-cols-1 items-center gap-12 lg:gap-20 ${item.image === 'guest' ? 'lg:grid-cols-[1fr_1fr]' : 'lg:grid-cols-[5fr_7fr]'}`}
                            >
                                <div className={reversed ? 'lg:order-2' : ''}>
                                    <div className="flex items-baseline gap-4 mb-6">
                                        <span className="font-serif italic text-stone-500 text-lg">0{idx + 1}</span>
                                        <span className="eyebrow text-stone-400">{item.label}</span>
                                    </div>
                                    <h3 className="text-3xl md:text-5xl font-serif leading-[1.15] text-white mb-6">{item.title}</h3>
                                    <p className="text-base md:text-lg text-stone-300 font-light leading-relaxed mb-8 max-w-xl">{item.desc}</p>
                                    <ul className="space-y-3 mb-10 border-t border-white/10 pt-6">
                                        {item.bullets.map((b) => (
                                            <li key={b} className="flex items-start gap-3 text-stone-200">
                                                <span className="mt-[0.6em] h-px w-5 shrink-0 bg-amber-200/60" />
                                                <span className="text-[15px] leading-relaxed">{b}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    {href.startsWith('#') ? (
                                        <a href={href} className="link-arrow">
                                            {dict.hero.primaryCta}
                                            <span className="material-symbols-outlined text-[18px]" aria-hidden>arrow_forward</span>
                                        </a>
                                    ) : (
                                        <Link href={href} className="link-arrow">
                                            {f.open}: {item.image === 'board' ? dict.nav.floorSync : dict.nav.panel}
                                            <span className="material-symbols-outlined text-[18px]" aria-hidden>arrow_outward</span>
                                        </Link>
                                    )}
                                </div>

                                <div className={reversed ? 'lg:order-1' : ''}>
                                    {item.image === 'guest' ? (
                                        <PhoneFrame src={src} alt={item.title} />
                                    ) : (
                                        <BrowserFrame src={src} alt={item.title} height={item.image === 'panel' ? 934 : 1000} />
                                    )}
                                </div>
                            </article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
