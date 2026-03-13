import { getDictionary } from '@/lib/dictionaries';
import Footer from '@/components/Footer';
import FloorSyncAccessSection from '@/components/FloorSyncAccessSection';
import { getRequestOrigin } from '@/lib/floor-sync-server';
import { resolveDemoSessionId } from '@/lib/demo-session';

export default async function FloorSyncAccessPage(props: {
    params: Promise<{ locale: 'en' | 'ka' }>;
}) {
    const params = await props.params;
    const dict = await getDictionary(params.locale);
    const [origin, sessionId] = await Promise.all([
        getRequestOrigin(),
        resolveDemoSessionId(),
    ]);

    return (
        <main className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
            <FloorSyncAccessSection
                dict={dict}
                locale={params.locale}
                origin={origin}
                sessionId={sessionId}
            />
            <Footer dict={dict} />
        </main>
    );
}
