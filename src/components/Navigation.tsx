'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { AppDictionary } from '@/lib/dictionaries';
import { getFloorSyncBoardPath } from '@/lib/floor-sync';

export default function Navigation({ dict, locale }: { dict: AppDictionary; locale: string }) {
    const [hidden, setHidden] = useState(false);
    const [hovered, setHovered] = useState(false);
    const pathname = usePathname();
    const isFloorSyncBoardRoute = pathname?.endsWith('/floor-sync');

    useEffect(() => {
        let lastScrollY = window.scrollY;
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > lastScrollY && currentScrollY > 20) {
                setHidden(true);
            } else {
                setHidden(false);
            }
            lastScrollY = currentScrollY;
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const getLocalizedPath = (targetLocale: string) => {
        if (!pathname) return `/${targetLocale}`;
        const segments = pathname.split('/');
        segments[1] = targetLocale;
        return segments.join('/');
    };

    if (isFloorSyncBoardRoute) {
        return null;
    }

    return (
        <header
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className={`fixed top-0 w-full z-50 glass-panel border-b-0 transition-transform duration-500 ease-in-out ${hidden && !hovered ? '-translate-y-full' : 'translate-y-0'}`}
        >
            <div className="max-w-[1600px] mx-auto px-5 md:px-12 h-16 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href={`/${locale}`} aria-label="Maitrise Atelier home" className="flex items-center">
                        <Image
                            src="/logo/maitrise-atelier-logo-white-outline-nf.svg"
                            alt="Logo"
                            width={200}
                            height={53}
                            className="hidden md:block"
                        />
                        <Image
                            src="/logo/maitrise-atelier-logo-mobile.svg"
                            alt="Mobile Logo"
                            width={40}
                            height={48}
                            className="block md:hidden"
                        />
                    </Link>
                </div>
                <div className="flex items-center gap-5 md:gap-8">
                    <nav className="hidden lg:flex items-center gap-7">
                        <a href={`/${locale}#how`} className="nav-link">{dict.nav.how}</a>
                        <a href={`/${locale}#demo`} className="nav-link">{dict.nav.demo}</a>
                        <Link href={getFloorSyncBoardPath(locale, undefined, 'live')} className="nav-link">{dict.nav.floorSync}</Link>
                        <Link href={`/${locale}/panel`} className="nav-link">{dict.nav.panel}</Link>
                    </nav>
                    <div className="flex gap-2 text-[11px] tracking-[0.2em] font-sans text-stone-400">
                        <Link href={getLocalizedPath('ka')} hrefLang="ka" className={`hover:text-white transition-colors ${locale === 'ka' ? 'text-white font-bold' : ''}`}>GE</Link>
                        <span aria-hidden>/</span>
                        <Link href={getLocalizedPath('en')} hrefLang="en" className={`hover:text-white transition-colors ${locale === 'en' ? 'text-white font-bold' : ''}`}>EN</Link>
                    </div>
                    <a href={`/${locale}#contact`} className="btn-nav">
                        {dict.nav.contact}
                    </a>
                </div>
            </div>
        </header>
    );
}
