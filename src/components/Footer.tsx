'use client';

export default function Footer({ dict }: { dict: any }) {
    return (
        <footer className="py-24 bg-black border-t border-white/10">
            <div className="max-w-[1600px] mx-auto px-8 md:px-12 text-center">
                <div className="mb-20">
                    <h2 className="text-4xl font-serif italic text-white mb-6">The Asylum Agency</h2>
                    <p className="text-stone-500 font-sans text-xs leading-loose uppercase tracking-[0.3em]">{dict.footer.tagline}</p>
                </div>

                <div className="flex flex-col md:flex-row justify-center items-center gap-12 mb-20">
                    <nav className="flex gap-8">
                        <a className="text-[10px] font-sans font-bold tracking-[0.4em] uppercase text-stone-500 hover:text-white transition-colors" href="#">{dict.footer.architecture}</a>
                        <a className="text-[10px] font-sans font-bold tracking-[0.4em] uppercase text-stone-500 hover:text-white transition-colors" href="#">{dict.footer.portfolio}</a>
                        <a className="text-[10px] font-sans font-bold tracking-[0.4em] uppercase text-stone-500 hover:text-white transition-colors" href="#">{dict.footer.privacy}</a>
                    </nav>
                    <div className="w-px h-8 bg-white/10 hidden md:block"></div>
                    <nav className="flex gap-8">
                        <a className="text-[10px] font-sans font-bold tracking-[0.4em] uppercase text-stone-500 hover:text-white transition-colors" href="#">{dict.footer.instagram}</a>
                        <a className="text-[10px] font-sans font-bold tracking-[0.4em] uppercase text-stone-500 hover:text-white transition-colors" href="#">{dict.footer.linkedin}</a>
                    </nav>
                </div>

                <div className="pt-12 font-sans border-t border-white/10 flex flex-col md:flex-row justify-center items-center gap-8 text-[9px] font-medium tracking-[0.5em] text-stone-600 uppercase">
                    <span>{dict.footer.bottom1}</span>
                    <span className="hidden md:inline">•</span>
                    <span>{dict.footer.bottom2}</span>
                </div>
            </div>
        </footer>
    );
}
