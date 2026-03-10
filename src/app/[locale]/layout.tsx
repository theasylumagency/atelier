import { notFound } from 'next/navigation';
import { getDictionary } from '@/lib/dictionaries';
import Navigation from '@/components/Navigation';

const locales = ['en', 'ka'] as const;
type Locale = (typeof locales)[number];

export async function generateStaticParams() {
    return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout(props: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const params = await props.params;
    const locale = params.locale;

    if (!locales.includes(locale as Locale)) {
        notFound();
    }

    const dict = await getDictionary(locale as Locale);


    const localeClass = locale === 'ka' ? 'locale-ka' : 'locale-latin';

    return (
        <div lang={locale} className={localeClass}>
            <link
                href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
                rel="stylesheet"
            />
            <Navigation dict={dict} locale={locale} />
            {props.children}
        </div>
    );
}