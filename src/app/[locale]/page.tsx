import type { Metadata } from 'next';
import { getDictionary } from '@/lib/dictionaries';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import Transition from '@/components/Transition';
import Process from '@/components/Process';
import Architecture from '@/components/Architecture';
import FloorSyncAccessSection from '@/components/FloorSyncAccessSection';
import Manifesto from '@/components/Manifesto';
import Footer from '@/components/Footer';
import { getRequestOrigin } from '@/lib/floor-sync-server';
import { resolveDemoSessionId } from '@/lib/demo-session';

type Locale = 'en' | 'ka';

export async function generateMetadata(props: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
    const { locale } = await props.params;
    const dict = await getDictionary(locale);

    return {
        title: dict.meta.title,
        description: dict.meta.description,
        alternates: {
            canonical: `/${locale}`,
            languages: { ka: '/ka', en: '/en' },
        },
        openGraph: {
            title: dict.meta.title,
            description: dict.meta.description,
            url: `/${locale}`,
            siteName: 'MAÎTRISE Atelier',
            locale: locale === 'ka' ? 'ka_GE' : 'en_US',
            type: 'website',
            images: [{ url: '/og/maitrise-atelier-og-1200x630.jpg', width: 1200, height: 630, alt: 'MAÎTRISE Atelier' }],
        },
        twitter: {
            card: 'summary_large_image',
            title: dict.meta.title,
            description: dict.meta.description,
            images: ['/og/maitrise-atelier-og-1200x630.jpg'],
        },
    };
}

export default async function Page(props: { params: Promise<{ locale: Locale }> }) {
    const params = await props.params;
    const dict = await getDictionary(params.locale);
    const [origin, sessionId] = await Promise.all([
        getRequestOrigin(),
        resolveDemoSessionId(),
    ]);

    return (
        <main className="min-h-screen bg-zinc-950 text-stone-100 selection:bg-stone-100 selection:text-zinc-950">
            {/* 1. What it is */}
            <Hero dict={dict} />
            {/* 2. What you get — the three screens */}
            <Features dict={dict} locale={params.locale} />
            {/* 3. How it works — three steps */}
            <Process dict={dict} />
            {/* 4. Try it yourself */}
            <FloorSyncAccessSection
                dict={dict}
                locale={params.locale}
                origin={origin}
                sessionId={sessionId}
                compact
            />
            {/* 5. Made for one restaurant */}
            <Transition dict={dict} locale={params.locale} />
            {/* 6. Philosophy + how we start */}
            <Architecture dict={dict} />
            {/* 7. Contact */}
            <Manifesto dict={dict} />
            <Footer dict={dict} />
        </main>
    );
}
