'use client';

import React, { useState } from 'react';

interface LocalizedText {
    ka: string;
    en: string;
    ru: string;
    [key: string]: string;
}

interface DishData {
    id?: string;
    priceMinor?: number;
    currency?: string;
    vegetarian?: boolean;
    chefsPick?: boolean;
    title?: LocalizedText;
    description?: LocalizedText;
    story?: LocalizedText;
    [key: string]: any;
}

interface DishEditorProps {
    dish: DishData | null;
    dict: any;
    onClose: () => void;
    onSave?: (data: DishData) => void;
}

export default function DishEditor({ dish, dict, onClose, onSave }: DishEditorProps) {
    // 1. Tab State for the Narrative Engine
    const [activeLang, setActiveLang] = useState<'ka' | 'en' | 'ru'>('ka'); // 'ka', 'en', 'ru'
    const [brandVoice, setBrandVoice] = useState('Modern & Minimalist');
    const [isGenerating, setIsGenerating] = useState(false);

    // 2. Form State (Pre-filled if editing, empty if new)
    const [formData, setFormData] = useState<DishData>({
        priceMinor: dish?.priceMinor || 0,
        currency: dish?.currency || 'GEL',
        vegetarian: dish?.vegetarian || false,
        chefsPick: dish?.chefsPick || false,
        title: dish?.title || { ka: '', en: '', ru: '' },
        description: dish?.description || { ka: '', en: '', ru: '' },
        story: dish?.story || { ka: '', en: '', ru: '' },
        ...dish, // Keep other properties like id, status intact
    });

    // Helper to handle the nested language changes
    const handleLangChange = (field: 'title' | 'description' | 'story', value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: { ...prev[field] as LocalizedText, [activeLang]: value },
        }));
    };

    const handleGenerateAI = async () => {
        const currentDishName = formData.title?.[activeLang] || formData.title?.['en'] || formData.title?.['ka'];
        if (!currentDishName) {
            alert(dict.panel?.enterDishName || 'Please enter a dish nomenclature first.');
            return;
        }

        setIsGenerating(true);
        try {
            const response = await fetch('/api/synthesize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    dishName: currentDishName,
                    ingredients: formData.description?.[activeLang] || '',
                    brandVoice,
                }),
            });

            if (!response.ok) throw new Error('API request failed');

            const data = await response.json();

            setFormData(prev => ({
                ...prev,
                title: { ...prev.title, ...data.title },
                description: { ...prev.description, ...data.description },
                story: { ...prev.story, ...data.story }
            }));
        } catch (error) {
            console.error('AI Synthesis Error:', error);
            alert(dict.panel?.aiError || 'Failed to synthesize content.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSave = () => {
        if (onSave) {
            onSave(formData);
        }
        onClose();
    };

    return (
        // THE OVERLAY: Darkens the grid behind it, blur effect for depth
        <div className="fixed inset-0 z-[100] flex justify-end bg-black/80 backdrop-blur-sm sm:items-stretch">

            {/* THE SHEET: Full width on mobile (slides up), fixed 800px on desktop (slides left) */}
            <div className="flex h-full w-full flex-col border-l border-neutral-800 bg-[#0a0a0a] shadow-2xl transition-transform sm:w-[800px] animate-in slide-in-from-bottom sm:slide-in-from-right duration-300">

                {/* HEADER: Brutalist and minimal */}
                <header className="flex items-center justify-between border-b border-neutral-800 p-6">
                    <h2 className="font-mono text-sm tracking-[0.2em] uppercase text-neutral-400">
                        {dish?.id ? dict.panel.editAsset || 'Edit Parameter' : dict.panel.newAsset || 'Initialize New Asset'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-neutral-500 hover:text-white transition-colors text-xl"
                    >
                        ✕
                    </button>
                </header>

                {/* MAIN SPLIT CONTENT */}
                <div className="flex flex-1 flex-col overflow-y-auto sm:flex-row custom-scrollbar">

                    {/* LEFT HEMISPHERE: Operations & Visuals */}
                    <div className="flex flex-col gap-6 border-b border-neutral-800 p-6 sm:w-1/2 sm:border-b-0 sm:border-r">

                        {/* AI Image Studio Dropzone */}
                        <div className="group relative flex h-48 w-full cursor-pointer items-center justify-center border-2 border-dashed border-neutral-800 bg-neutral-900/50 transition-colors hover:border-neutral-500">
                            <span className="font-mono text-xs uppercase tracking-widest text-neutral-500 group-hover:text-white transition-colors text-center px-4">
                                {dict.panel.dropRawAsset || 'Drop Raw Asset'}
                            </span>
                        </div>

                        {/* Financial Input */}
                        <div>
                            <label className="mb-2 block font-mono text-xs uppercase tracking-wider text-neutral-500">
                                {dict.panel.unitPrice || 'Unit Price'} ({formData.currency})
                            </label>
                            <input
                                type="number"
                                value={(formData.priceMinor! / 100).toFixed(2)}
                                onChange={(e) => setFormData({ ...formData, priceMinor: Math.round(parseFloat(e.target.value) * 100) })}
                                className="w-full border border-neutral-800 bg-transparent p-4 font-mono text-xl text-white outline-none focus:border-white transition-colors"
                                step="0.10"
                            />
                        </div>

                        {/* Binary Identifiers (Toggles) */}
                        <div className="flex flex-col gap-4 pt-4">
                            <div className="flex items-center justify-between">
                                <span className="font-mono text-xs uppercase tracking-wider text-neutral-400">{dict.panel.vegetarian || 'Vegetarian'}</span>
                                <button
                                    onClick={() => setFormData({ ...formData, vegetarian: !formData.vegetarian })}
                                    className={`relative h-6 w-12 border transition-colors duration-200 ${formData.vegetarian ? 'border-green-500 bg-green-500/20' : 'border-neutral-700 bg-transparent'}`}
                                >
                                    <div className={`absolute top-0.5 h-4 w-4 transition-transform duration-200 ${formData.vegetarian ? 'translate-x-7 bg-green-400' : 'translate-x-1 bg-neutral-500'}`} />
                                </button>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="font-mono text-xs uppercase tracking-wider text-neutral-400">{dict.panel.signature || "Chef's Pick"}</span>
                                <button
                                    onClick={() => setFormData({ ...formData, chefsPick: !formData.chefsPick })}
                                    className={`relative h-6 w-12 border transition-colors duration-200 ${formData.chefsPick ? 'border-amber-500 bg-amber-500/20' : 'border-neutral-700 bg-transparent'}`}
                                >
                                    <div className={`absolute top-0.5 h-4 w-4 transition-transform duration-200 ${formData.chefsPick ? 'translate-x-7 bg-amber-400' : 'translate-x-1 bg-neutral-500'}`} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT HEMISPHERE: The Narrative Engine */}
                    <div className="flex flex-col sm:w-1/2">

                        {/* Language Tabs */}
                        <div className="flex w-full border-b border-neutral-800">
                            {(['ka', 'en', 'ru'] as const).map((lang) => (
                                <button
                                    key={lang}
                                    onClick={() => setActiveLang(lang)}
                                    className={`flex-1 py-4 font-mono text-xs font-bold uppercase tracking-widest transition-colors ${activeLang === lang ? 'bg-white text-black' : 'text-neutral-500 hover:text-white hover:bg-neutral-900'
                                        }`}
                                >
                                    {lang}
                                </button>
                            ))}
                        </div>

                        {/* Text Inputs */}
                        <div className="flex flex-1 flex-col gap-6 p-6">

                            {/* ✨ AI Style Calibration Studio */}
                            <div className="flex flex-col gap-3 rounded-none border border-amber-900/50 bg-amber-900/10 p-5 mt-[-8px]">
                                <div className="flex items-center justify-between">
                                    <label className="block font-mono text-[10px] uppercase tracking-widest text-amber-500">
                                        {dict.panel?.styleCalibration || 'Style Calibration'}
                                    </label>

                                </div>
                                <select
                                    value={brandVoice}
                                    onChange={(e) => setBrandVoice(e.target.value)}
                                    className="w-full appearance-none border border-amber-900/50 bg-black p-3 font-mono text-xs text-amber-100/90 outline-none focus:border-amber-500 transition-colors cursor-pointer"
                                >
                                    <option value="Traditional & Warm">{dict.panel?.traditional || 'Traditional & Warm (Heritage / Nostalgia)'}</option>
                                    <option value="Modern & Minimalist">{dict.panel?.minimalist || 'Modern & Minimalist (Clean / Technique)'}</option>
                                    <option value="High-End / Fine Dining">{dict.panel?.highEnd || 'High-End / Fine Dining (Exclusive)'}</option>
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block font-mono text-xs uppercase tracking-wider text-neutral-500">
                                    {dict.panel?.nomenclature || 'Nomenclature'} ({activeLang.toUpperCase()})
                                </label>
                                <input
                                    type="text"
                                    value={formData.title?.[activeLang] || ''}
                                    onChange={(e) => handleLangChange('title', e.target.value)}
                                    className="w-full border border-neutral-800 bg-transparent p-3 text-sm text-white outline-none focus:border-white transition-colors"
                                    placeholder={dict.panel?.name || 'Enter Title'}
                                />
                            </div>
                            <button
                                onClick={handleGenerateAI}
                                disabled={isGenerating}
                                className="font-mono text-[10px] uppercase tracking-widest text-amber-400 hover:text-amber-300 transition-colors disabled:opacity-50 flex items-center gap-2"
                                title="Auto-fill missing content across all languages using AI"
                            >
                                {isGenerating ? (
                                    <>
                                        <span className="h-3 w-3 animate-spin rounded-full border-2 border-amber-500 border-t-transparent"></span>
                                        {dict.panel?.synthesizing || 'Synthesizing...'}
                                    </>
                                ) : (
                                    <span className="border-b border-amber-500/30 pb-0.5">✨ {dict.panel?.aiSynthesize || 'AI Synthesize'}</span>
                                )}
                            </button>
                            <div>
                                <label className="mb-2 block font-mono text-xs uppercase tracking-wider text-neutral-500">
                                    {dict.panel.composition || 'Composition'} ({activeLang.toUpperCase()})
                                </label>
                                <textarea
                                    value={formData.description?.[activeLang] || ''}
                                    onChange={(e) => handleLangChange('description', e.target.value)}
                                    className="h-24 w-full resize-none border border-neutral-800 bg-transparent p-3 text-sm text-white outline-none focus:border-white transition-colors"
                                    placeholder={dict.panel?.description || 'Comma separated ingredients'}
                                />
                            </div>

                            <div className="flex-1 flex flex-col">
                                <label className="mb-2 block font-mono text-xs uppercase tracking-wider text-neutral-500">
                                    {dict.panel.heritage || 'The Heritage'} ({activeLang.toUpperCase()})
                                </label>
                                <textarea
                                    value={formData.story?.[activeLang] || ''}
                                    onChange={(e) => handleLangChange('story', e.target.value)}
                                    className="flex-1 min-h-[150px] w-full resize-none border border-neutral-800 bg-transparent p-3 text-sm text-white outline-none focus:border-white transition-colors leading-relaxed"
                                    placeholder={dict.panel?.story || 'The narrative behind the dish...'}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* FOOTER: The Execution */}
                <div className="border-t border-neutral-800 p-6 bg-[#050505] shrink-0">
                    <button
                        onClick={handleSave}
                        className="w-full border border-white bg-white py-4 font-mono text-sm font-bold uppercase tracking-widest text-black transition-transform active:scale-95 hover:bg-stone-200"
                    >
                        {dict.panel.commitToLiveServer || 'Commit to Live Server'}
                    </button>
                </div>

            </div>
        </div>
    );
}
