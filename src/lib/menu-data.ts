import fs from 'fs';
import path from 'path';
import type { Category, CategoryFile, Dish, DishFile } from '@/lib/types';
import { readSessionDishes } from '@/lib/demo-session';

function readJsonFile<T>(absolutePath: string, fallback: T): T {
    try {
        const fileContents = fs.readFileSync(absolutePath, 'utf8');
        return JSON.parse(fileContents) as T;
    } catch (error) {
        console.error(`Failed to parse JSON file: ${absolutePath}`, error);
        return fallback;
    }
}

export function loadStaticMenuData(): { categories: Category[]; dishes: Dish[] } {
    const categoriesPath = path.join(process.cwd(), 'data', 'categories.json');
    const dishesPath = path.join(process.cwd(), 'data', 'dishes.json');

    const categoriesFile = readJsonFile<CategoryFile>(categoriesPath, { items: [] });
    const dishesFile = readJsonFile<DishFile>(dishesPath, { items: [] });

    return {
        categories: categoriesFile.items ?? [],
        dishes: dishesFile.items ?? [],
    };
}

export async function loadDemoMenuData(): Promise<{ categories: Category[]; dishes: Dish[] }> {
    const categoriesPath = path.join(process.cwd(), 'data', 'categories.json');

    const categoriesFile = readJsonFile<CategoryFile>(categoriesPath, { items: [] });
    const dishesFile = await readSessionDishes();

    return {
        categories: categoriesFile.items ?? [],
        dishes: dishesFile.items ?? [],
    };
}