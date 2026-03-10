export type AppLocale = 'en' | 'ka';
export type ContentLocale = 'en' | 'ka' | 'ru';

export type EntityStatus = 'active' | 'hidden';

export type LocalizedText = Record<ContentLocale, string>;

export interface Category {
    id: string;
    order: number;
    status: EntityStatus;
    title: LocalizedText;
}

export interface DishPhoto {
    small?: string;
    full?: string;
}

export interface PriceVariant {
    label?: LocalizedText;
    priceMinor: number;
}

export interface Dish {
    id: string;
    categoryId: string;
    order: number;
    status: EntityStatus;

    priceMinor: number;
    currency: string;

    vegetarian: boolean;
    topRated: boolean;
    soldOut: boolean;
    chefsPick: boolean;

    title: LocalizedText;
    description: LocalizedText;
    story: LocalizedText;

    priceLabel?: LocalizedText;
    priceVariants?: PriceVariant[];
    photo?: DishPhoto;
}

export interface CategoryFile {
    schemaVersion?: string;
    updatedAt?: string;
    items: Category[];
}

export interface DishFile {
    updatedAt?: string;
    items: Dish[];
}

export interface DishFormData
    extends Partial<
        Pick<Dish, 'id' | 'categoryId' | 'order' | 'status' | 'photo' | 'priceLabel' | 'priceVariants'>
    > {
    priceMinor: number;
    currency: string;
    vegetarian: boolean;
    topRated: boolean;
    soldOut: boolean;
    chefsPick: boolean;
    title: LocalizedText;
    description: LocalizedText;
    story: LocalizedText;
}