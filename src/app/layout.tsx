import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import localFont from 'next/font/local';
import './globals.css';

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
});

const playfair = Playfair_Display({
    subsets: ['latin'],
    variable: '--font-playfair-latin',
    style: ['normal', 'italic'],
});

const bpgClassic = localFont({
    src: '../../public/fonts/bpg-classic-medium-master/fonts/bpg-classic-medium-webfont.woff2',
    variable: '--font-playfair-ka',
    display: 'swap',
});

const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    'http://localhost:3000';

export const metadata: Metadata = {
    metadataBase: new URL(siteUrl),
    title: 'MAITRISE Atelier',
    description: 'Elegant digital atelier for hospitality experiences.',
    icons: {
        icon: [
            { url: '/brand/favicon.ico', sizes: 'any' },
            { url: '/brand/favicon.svg', type: 'image/svg+xml' },
        ],
        apple: [{ url: '/brand/apple-touch-icon.png', sizes: '180x180' }],
        shortcut: ['/brand/favicon.ico'],
    },
    openGraph: {
        title: 'MAITRISE Atelier',
        description: 'Elegant digital atelier for hospitality experiences.',
        url: siteUrl,
        siteName: 'MAITRISE Atelier',
        images: [
            {
                url: '/og/maitrise-atelier-og-1200x630.jpg',
                width: 1200,
                height: 630,
                alt: 'MAITRISE Atelier',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'MAITRISE Atelier',
        description: 'Elegant digital atelier for hospitality experiences.',
        images: ['/og/maitrise-atelier-og-1200x630.jpg'],
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html
            lang="ka"
            className={`${inter.variable} ${playfair.variable} ${bpgClassic.variable}`}
        >
            <body className="antialiased bg-zinc-950 text-stone-100 selection:bg-stone-100 selection:text-zinc-950 font-inter">
                {children}
            </body>
        </html>
    );
}
