'use client';

import { useState, type FormEvent } from 'react';
import type { AppDictionary } from '@/lib/dictionaries';

export default function Manifesto({ dict }: { dict: AppDictionary }) {
    const m = dict.manifesto;
    const form = m.form;
    const [values, setValues] = useState({ name: '', restaurant: '', contact: '', message: '' });

    const update = (key: keyof typeof values) => (e: { target: { value: string } }) =>
        setValues((v) => ({ ...v, [key]: e.target.value }));

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();
        const subject = values.restaurant ? `${form.subject} · ${values.restaurant}` : form.subject;
        const body = [
            form.bodyIntro,
            '',
            `${form.name}: ${values.name}`,
            `${form.restaurant}: ${values.restaurant}`,
            `${form.contact}: ${values.contact}`,
            values.message ? `\n${values.message}` : '',
        ].join('\n');
        window.location.href = `mailto:${form.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };

    const field =
        'w-full bg-transparent border-b border-white/15 py-3 text-base text-white placeholder:text-stone-500 focus:border-amber-200/70 focus:outline-none transition-colors';

    return (
        <section id="contact" className="py-28 md:py-40 bg-stone-900 text-white relative scroll-mt-16">
            <div className="absolute inset-0 bg-black/85" />
            <div className="max-w-5xl mx-auto px-6 md:px-12 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
                <div className="text-center lg:text-left">
                    <span className="eyebrow text-amber-200/70 block mb-8">{m.chapter}</span>
                    <h2
                        className="text-5xl md:text-6xl font-serif-latin leading-[1.05] text-white mb-10"
                        dangerouslySetInnerHTML={{ __html: m.title }}
                    />
                    <p className="text-2xl md:text-3xl leading-snug text-stone-100 font-serif mb-6">{m.desc1}</p>
                    <p className="text-stone-300 font-sans text-base md:text-lg leading-relaxed font-light">{m.desc2}</p>
                </div>

                <form onSubmit={onSubmit} className="glass-panel p-8 md:p-10 space-y-6">
                    <input required className={field} placeholder={form.name} value={values.name} onChange={update('name')} autoComplete="name" />
                    <input required className={field} placeholder={form.restaurant} value={values.restaurant} onChange={update('restaurant')} autoComplete="organization" />
                    <input required className={field} placeholder={form.contact} value={values.contact} onChange={update('contact')} />
                    <textarea rows={3} className={`${field} resize-none`} placeholder={form.message} value={values.message} onChange={update('message')} />
                    <button type="submit" className="btn-primary w-full mt-4">
                        {m.cta}
                        <span className="material-symbols-outlined text-[18px]" aria-hidden>mail</span>
                    </button>
                    <p className="text-sm text-stone-400 leading-relaxed text-center">
                        {form.note}{' '}
                        <a href={`mailto:${form.email}`} className="text-stone-100 underline decoration-white/30 underline-offset-4 hover:decoration-white">
                            {form.email}
                        </a>
                    </p>
                </form>
            </div>
        </section>
    );
}
