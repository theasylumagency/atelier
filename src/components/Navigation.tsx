'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { AppDictionary } from '@/lib/dictionaries';
import { getFloorSyncHubPath } from '@/lib/floor-sync';

export default function Navigation({ dict, locale }: { dict: AppDictionary; locale: string }) {
    const [hidden, setHidden] = useState(false);
    const [hovered, setHovered] = useState(false);
    const [guestMode, setGuestMode] = useState(false);
    const pathname = usePathname();

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

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const params = new URLSearchParams(window.location.search);
        setGuestMode(pathname?.endsWith('/floor-sync') && params.get('guest') === '1');
    }, [pathname]);

    const getLocalizedPath = (targetLocale: string) => {
        if (!pathname) return `/${targetLocale}`;
        const segments = pathname.split('/');
        segments[1] = targetLocale;
        return segments.join('/');
    };

    if (guestMode) {
        return null;
    }

    return (
        <header
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className={`fixed top-0 w-full z-50 glass-panel border-b-0 transition-transform duration-500 ease-in-out ${hidden && !hovered ? '-translate-y-full' : 'translate-y-0'}`}
        >
            <div className="max-w-[1600px] mx-auto px-8 md:px-12 h-24 md:h-16 flex items-center justify-between">
                <div className="flex items-center gap-4">

                    <Link href={`/${locale}`}>
                        <div className="flex items-center">
                            <img
                                src="/logo/maitrise-atelier-logo-white-outline-nf.svg"
                                alt="Logo"
                                width={200}
                                height={200}
                                className="hidden md:block"
                            />
                            <img
                                src="/logo/maitrise-atelier-logo-mobile.svg"
                                alt="Mobile Logo"
                                width={40}
                                height={40}
                                className="block md:hidden"
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
                    <div className="flex items-center gap-6 max-sm:hidden">
                        <Link href={getFloorSyncHubPath(locale)}>
                            <button className="text-[10px] tracking-[0.3em] font-sans text-stone-400 border-b border-transparent pb-1 hover:text-white hover:border-white/20 transition-all uppercase">{dict.nav?.floorSync || 'Floor Sync'}</button>
                        </Link>
                        <Link href={`/${locale}/panel`}>
                            <button className="text-[10px] tracking-[0.3em] font-sans text-stone-400 border-b border-transparent pb-1 hover:text-white hover:border-white/20 transition-all uppercase">
                                {dict.nav?.panel || 'Control Panel'}
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
}
