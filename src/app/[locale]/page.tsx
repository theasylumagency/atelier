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

export default async function Page(props: { params: Promise<{ locale: 'en' | 'ka' }> }) {
    const params = await props.params;
    const dict = await getDictionary(params.locale);
    const [origin, sessionId] = await Promise.all([
        getRequestOrigin(),
        resolveDemoSessionId(),
    ]);

    return (
        <main className="min-h-screen bg-zinc-950 text-stone-100 selection:bg-stone-100 selection:text-zinc-950">
            <Hero dict={dict} />
            <Features dict={dict} />
            <Transition dict={dict} />
            <Process dict={dict} />
            <Architecture dict={dict} />
            <FloorSyncAccessSection
                dict={dict}
                locale={params.locale}
                origin={origin}
                sessionId={sessionId}
                compact
            />
            <Manifesto dict={dict} />
            <Footer dict={dict} />
        </main>
    );
}
