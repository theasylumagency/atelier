import { getDictionary } from '@/lib/dictionaries';
import FloorSync from '@/components/FloorSync';
import { loadDemoMenuData } from '@/lib/menu-data';
import type { Category, Dish } from '@/lib/types';

export default async function FloorSyncPage(props: { params: Promise<{ locale: 'en' | 'ka' }> }) {
    const params = await props.params;
    const dict = await getDictionary(params.locale);

    let dishes: Dish[] = [];
    let categories: Category[] = [];

    try {
        const data = await loadDemoMenuData();
        dishes = data.dishes;
        categories = data.categories;
    } catch (error) {
        console.error('Failed to load demo menu data for floor sync:', error);
    }

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white pt-24 font-sans selection:bg-amber-500/30">
            <FloorSync
                dict={dict}
                initialCategories={categories}
                initialDishes={dishes}
                locale={params.locale}
            />
        </div>
    );
}