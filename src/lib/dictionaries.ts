import 'server-only';
import type { AppLocale } from '@/lib/types';

const dictionaries = {
    en: () => import('@/dictionaries/en.json').then((module) => module.default),
    ka: () => import('@/dictionaries/ka.json').then((module) => module.default),
};

export async function getDictionary(locale: AppLocale) {
    return dictionaries[locale]();
}

export type AppDictionary = Awaited<ReturnType<typeof getDictionary>>;