import 'server-only';

const dictionaries = {
    en: () => import('@/dictionaries/en.json').then((module) => module.default),
    ka: () => import('@/dictionaries/ka.json').then((module) => module.default),
};

export const getDictionary = async (locale: 'en' | 'ka') => dictionaries[locale]();
