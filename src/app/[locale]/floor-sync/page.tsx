import { getDictionary } from '@/lib/dictionaries';
import FloorSync from '@/components/FloorSync';
import FloorSyncGuest from '@/components/FloorSyncGuest';
import { loadDemoMenuData } from '@/lib/menu-data';
import { readSessionFloorState, resolveDemoSessionId } from '@/lib/demo-session';
import { createEmptyFloorState, getDefaultTableId, isDemoTableId } from '@/lib/floor-sync';
import type { Category, Dish } from '@/lib/types';

export default async function FloorSyncPage(props: {
    params: Promise<{ locale: 'en' | 'ka' }>;
    searchParams: Promise<{
        session?: string;
        table?: string;
        guest?: string;
    }>;
}) {
    const params = await props.params;
    const searchParams = await props.searchParams;
    const dict = await getDictionary(params.locale);
    const sessionId = await resolveDemoSessionId(searchParams.session);
    const requestedTableId = isDemoTableId(searchParams.table)
        ? searchParams.table
        : getDefaultTableId();
    const guestMode = searchParams.guest === '1';

    let dishes: Dish[] = [];
    let categories: Category[] = [];
    let floorState = createEmptyFloorState();

    try {
        const [data, initialFloorState] = await Promise.all([
            loadDemoMenuData(sessionId),
            readSessionFloorState(sessionId),
        ]);
        dishes = data.dishes;
        categories = data.categories;
        floorState = initialFloorState;
    } catch (error) {
        console.error('Failed to load demo menu data for floor sync:', error);
    }

    if (guestMode) {
        return (
            <FloorSyncGuest
                dict={dict}
                initialCategories={categories}
                initialDishes={dishes}
                initialTableState={floorState.tables[requestedTableId]}
                locale={params.locale}
                sessionId={sessionId}
                tableId={requestedTableId}
            />
        );
    }

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white pt-24 font-sans selection:bg-amber-500/30">
            <FloorSync
                dict={dict}
                initialCategories={categories}
                initialDishes={dishes}
                initialFloorState={floorState}
                locale={params.locale}
                sessionId={sessionId}
            />
        </div>
    );
}
