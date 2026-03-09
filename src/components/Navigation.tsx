'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation({ dict, locale }: { dict: any; locale: string }) {
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const getLocalizedPath = (targetLocale: string) => {
        if (!pathname) return `/${targetLocale}`;
        const segments = pathname.split('/');
        segments[1] = targetLocale;
        return segments.join('/');
    };

    return (
        <header className={`fixed top-0 w-full z-50 transition-all duration-500 hover:bg-black/60 glass-panel border-b-0 ${scrolled ? 'bg-black/80' : ''}`}>
            <div className="max-w-[1600px] mx-auto px-8 md:px-12 h-24 flex items-center justify-between">
                <div className="flex items-center gap-4">

                    <Link href={`/${locale}`}>
                        <div>
                            <img
                                src="/logo/maitrise-atelier-logo-white-outline-nf.svg"
                                alt="Logo"
                                width={200}
                                height={200}
                            />
                        </div>
                    </Link>
                </div>
                <div className="flex items-center gap-10">
                    <div className="flex gap-2 text-[10px] tracking-[0.3em] font-sans text-stone-400 uppercase">
                        <Link href={getLocalizedPath('ka')} className={`hover:text-white transition-colors ${locale === 'ka' ? 'text-white font-bold' : ''}`}>GE</Link>
                        <span>/</span>
                        <Link href={getLocalizedPath('en')} className={`hover:text-white transition-colors ${locale === 'en' ? 'text-white font-bold' : ''}`}>EN</Link>
                    </div>
                    <div className="flex items-center gap-6">
                        <Link href={`/${locale}/panel`}>
                            <button className="text-[10px] tracking-[0.3em] font-sans text-stone-400 border-b border-transparent pb-1 hover:text-white hover:border-white/20 transition-all uppercase">{dict.nav.panel}</button>
                        </Link>
                        <Link href={`/${locale}/login`}>
                            <button className="text-[10px] tracking-[0.3em] font-sans text-white border-b border-white/20 pb-1 hover:border-white transition-all uppercase">{dict.nav.login}</button>
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
}
