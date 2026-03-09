import { getDictionary } from '@/lib/dictionaries';
import CommandCenter from '@/components/CommandCenter';
import fs from 'fs';
import path from 'path';

export default async function PanelPage(props: { params: Promise<{ locale: 'en' | 'ka' }> }) {
    const params = await props.params;
    const dict = await getDictionary(params.locale);

    // Read the static JSON files
    const dishesPath = path.join(process.cwd(), 'data', 'dishes.json');
    const categoriesPath = path.join(process.cwd(), 'data', 'categories.json');

    let dishes = [];
    let categories = [];

    try {
        const fileContents = fs.readFileSync(dishesPath, 'utf8');
        const data = JSON.parse(fileContents);
        dishes = data.items || [];
    } catch (error) {
        console.error("Failed to parse dishes data:", error);
    }

    try {
        const fileContents = fs.readFileSync(categoriesPath, 'utf8');
        const data = JSON.parse(fileContents);
        categories = data.items || [];
    } catch (error) {
        console.error("Failed to parse categories data:", error);
    }

    return (
        <CommandCenter
            initialCategories={categories}
            initialDishes={dishes}
            dict={dict}
            locale={params.locale}
        />
    );
}
