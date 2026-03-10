import { getDictionary } from '@/lib/dictionaries';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import Transition from '@/components/Transition';
import Process from '@/components/Process';
import FloorSync from '@/components/FloorSync';
import Architecture from '@/components/Architecture';
import Manifesto from '@/components/Manifesto';
import Footer from '@/components/Footer';
import fs from 'fs';
import path from 'path';

export default async function Page(props: { params: Promise<{ locale: 'en' | 'ka' }> }) {
    const params = await props.params;
    const dict = await getDictionary(params.locale);

    // Read the static JSON files for Floor Sync
    const dishesPath = path.join(process.cwd(), 'data', 'dishes.json');
    const categoriesPath = path.join(process.cwd(), 'data', 'categories.json');

    let dishes = [];
    let categories = [];

    try {
        const fileContents = fs.readFileSync(dishesPath, 'utf8');
        const data = JSON.parse(fileContents);
        dishes = data.items || [];
    } catch (error) {
        console.error("Failed to parse dishes data:", error);
    }

    try {
        const fileContents = fs.readFileSync(categoriesPath, 'utf8');
        const data = JSON.parse(fileContents);
        categories = data.items || [];
    } catch (error) {
        console.error("Failed to parse categories data:", error);
    }

    return (
        <main className="min-h-screen bg-zinc-950 text-stone-100 selection:bg-stone-100 selection:text-zinc-950">
            <Hero dict={dict} />
            <Features dict={dict} />
            <Transition dict={dict} />
            <Process dict={dict} />

            {/* The Aha! Moment Embed */}
            <div className="border-t border-b border-white/5 bg-black">
                <FloorSync dict={dict} initialCategories={categories} initialDishes={dishes} locale={params.locale} />
            </div>

            <Architecture dict={dict} />
            <Manifesto dict={dict} />
            <Footer dict={dict} />
        </main>
    );
}
