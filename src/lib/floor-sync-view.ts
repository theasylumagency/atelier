import type { Category, Dish } from '@/lib/types';

export type FloorDish = Dish & {
    images?: {
        portrait?: string;
        landscape?: string;
        square?: string;
    };
};

export type FloorCategory = Category & {
    slug?: string;
};

export const DISH_FALLBACK_SRC = '/images/fallbacks/dish-placeholder.svg';

export function getDishTitle(dish: FloorDish | null | undefined, locale: string) {
    if (!dish) {
        return '';
    }

    const key = locale as keyof typeof dish.title;
    return dish.title?.[key] || dish.title?.en || 'Dish';
}

export function getDishDescription(dish: FloorDish | null | undefined, locale: string) {
    if (!dish) {
        return '';
    }

    const key = locale as keyof typeof dish.description;
    return dish.description?.[key] || dish.description?.en || '';
}

export function getDishStory(dish: FloorDish | null | undefined, locale: string) {
    if (!dish) {
        return '';
    }

    const storyKey = locale as keyof typeof dish.story;
    const descriptionKey = locale as keyof typeof dish.description;
    return (
        dish.story?.[storyKey] ||
        dish.story?.en ||
        dish.description?.[descriptionKey] ||
        dish.description?.en ||
        '—'
    );
}

export function getDishImageSrc(dish: FloorDish | null | undefined) {
    if (!dish) {
        return DISH_FALLBACK_SRC;
    }

    return (
        dish.images?.portrait ||
        dish.images?.landscape ||
        dish.images?.square ||
        (dish.photo?.small ? `/uploads/dishes/${dish.photo.small}` : DISH_FALLBACK_SRC)
    );
}

export function getCategoryLabel(
    categoryId: string,
    categories: FloorCategory[],
    locale: string,
    allLabel: string,
    emptyLabel: string
) {
    if (categoryId === 'all') {
        return allLabel;
    }

    const category = categories.find((item) => item.id === categoryId);

    if (!category) {
        return emptyLabel;
    }

    const key = locale as keyof typeof category.title;
    return category.title?.[key] || category.title?.en || category.slug || categoryId;
}

export function formatCurrency(amount: number, currency?: string, locale = 'en') {
    const symbol = currency === 'GEL' || locale === 'ka' ? '₾' : '$';
    return `${amount.toFixed(2)} ${symbol}`;
}

export function formatEventTime(value: string | null, locale: string) {
    if (!value) {
        return '—';
    }

    try {
        return new Date(value).toLocaleTimeString(locale === 'ka' ? 'ka-GE' : 'en-GB', {
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return value;
    }
}
