import type { AppDictionary } from '@/lib/dictionaries';

export default function Footer({ dict }: { dict: AppDictionary }) {
    const f = dict.footer;
    const link = 'text-sm font-sans text-stone-400 hover:text-white transition-colors';

    return (
        <footer className="py-20 bg-black border-t border-white/10">
            <div className="max-w-[1280px] mx-auto px-6 md:px-12 text-center">
                <div className="mb-14">
                    <p className="text-4xl font-serif-latin italic text-white mb-4">MAÎTRISE Atelier</p>
                    <p className="text-stone-400 font-sans text-sm leading-relaxed">{f.tagline}</p>
                </div>

                <nav className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-x-10 gap-y-4 mb-14">
                    <a className={link} href="#how">{f.architecture}</a>
                    <a className={link} href={f.caseUrl} target="_blank" rel="noopener">{f.portfolio}</a>
                    <a className={link} href={f.agencyUrl} target="_blank" rel="noopener">{f.agency}</a>
                    <a className={link} href={`mailto:${f.email}`}>{f.email}</a>
                </nav>

                <div className="pt-10 border-t border-white/10 text-xs font-sans text-stone-500">
                    {f.bottom1}
                </div>
            </div>
        </footer>
    );
}
