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

export const metadata: Metadata = {
    title: {
        default: 'MAÎTRISE Atelier',
        template: '%s | MAÎTRISE Atelier',
    },
    description: 'Premium restaurant websites, menu control, QR table flow, and digital service infrastructure.',
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