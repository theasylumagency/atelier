import fs from 'fs';
import path from 'path';
import type { Category, CategoryFile, Dish, DishFile } from '@/lib/types';

function readJsonFile<T>(absolutePath: string, fallback: T): T {
    try {
        const fileContents = fs.readFileSync(absolutePath, 'utf8');
        return JSON.parse(fileContents) as T;
    } catch (error) {
        console.error(`Failed to parse JSON file: ${absolutePath}`, error);
        return fallback;
    }
}

export function loadMenuData(): { categories: Category[]; dishes: Dish[] } {
    const categoriesPath = path.join(process.cwd(), 'data', 'categories.json');
    const dishesPath = path.join(process.cwd(), 'data', 'dishes.json');

    const categoriesFile = readJsonFile<CategoryFile>(categoriesPath, { items: [] });
    const dishesFile = readJsonFile<DishFile>(dishesPath, { items: [] });

    return {
        categories: categoriesFile.items ?? [],
        dishes: dishesFile.items ?? [],
    };
}