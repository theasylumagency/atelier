import { getDictionary } from '@/lib/dictionaries';
import CommandCenter from '@/components/CommandCenter';
import { loadDemoMenuData } from '@/lib/menu-data';
import { resolveDemoSessionId } from '@/lib/demo-session';
import type { Category, Dish } from '@/lib/types';

export default async function PanelPage(props: { params: Promise<{ locale: 'en' | 'ka' }> }) {
    const params = await props.params;
    const dict = await getDictionary(params.locale);
    const sessionId = await resolveDemoSessionId();

    let dishes: Dish[] = [];
    let categories: Category[] = [];

    try {
        const data = await loadDemoMenuData(sessionId);
        dishes = data.dishes;
        categories = data.categories;
    } catch (error) {
        console.error('Failed to load demo menu data for panel:', error);
    }

    return (
        <CommandCenter
            initialCategories={categories}
            initialDishes={dishes}
            dict={dict}
            locale={params.locale}
            sessionId={sessionId}
        />
    );
}
