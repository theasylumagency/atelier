import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import localFont from 'next/font/local';
import '../globals.css';
import { getDictionary } from '@/lib/dictionaries';
import Navigation from '@/components/Navigation';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', style: ['normal', 'italic'] });

const bpgClassic = localFont({
    src: '../../../public/fonts/bpg-classic-medium-master/fonts/bpg-classic-medium-webfont.woff2',
    variable: '--font-playfair',
    display: 'swap',
});

export const metadata: Metadata = {
    title: 'The Asylum Agency | Digital Maître D’',
    description: 'Premium digital infrastructure designed for restaurants that refuse to compromise.',
};

export async function generateStaticParams() {
    return [{ locale: 'en' }, { locale: 'ka' }];
}

export default async function RootLayout(props: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const params = await props.params;
    const { locale } = params;

    const dict = await getDictionary(locale as 'en' | 'ka');

    // Select the appropriate serif font class based on the locale
    const serifFontClass = locale === 'ka' ? bpgClassic.variable : playfair.variable;

    return (
        <html lang={locale} className={`${inter.variable} ${serifFontClass}`}>
            <body className="antialiased bg-zinc-950 text-stone-100 selection:bg-stone-100 selection:text-zinc-950 font-inter">
                <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />
                <Navigation dict={dict} locale={locale} />
                {props.children}
            </body>
        </html>
    );
}
