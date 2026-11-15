'use client';

import React, { useState } from 'react';
import AssetForge from '@/components/AssetForge';
import { normalizeDishPhotoRef, resolveDishPhotoSrc } from '@/lib/dish-photo';

interface LocalizedText {
    ka: string;
    en: string;
    ru: string;
    [key: string]: string;
}

interface DishPhoto {
    small?: string;
    full?: string;
}

interface DishData {
    id?: string;
    categoryId?: string;
    priceMinor?: number;
    currency?: string;
    vegetarian?: boolean;
    chefsPick?: boolean;
    title?: LocalizedText;
    description?: LocalizedText;
    story?: LocalizedText;
    photo?: DishPhoto;
    [key: string]: unknown;
}

interface CategoryOption {
    id: string;
    title?: LocalizedText;
}

interface PanelDictionary {
    [key: string]: string | undefined;
}

interface EditorDictionary {
    panel: PanelDictionary;
}

interface DishEditorProps {
    dish: DishData | null;
    categories?: CategoryOption[];
    dict: EditorDictionary;
    onClose: () => void;
    onSave?: (data: DishData) => void;
}

export default function DishEditor({ dish, categories = [], dict, onClose, onSave }: DishEditorProps) {
    // 1. Tab State for the Narrative Engine
    const [activeLang, setActiveLang] = useState<'ka' | 'en' | 'ru'>('ka'); // 'ka', 'en', 'ru'
    const [brandVoice, setBrandVoice] = useState('Modern & Minimalist');
    const [isGenerating, setIsGenerating] = useState(false);
    const [showAssetForge, setShowAssetForge] = useState(false);

    // 2. Form State (Pre-filled if editing, empty if new)
    const [formData, setFormData] = useState<DishData>({
        priceMinor: dish?.priceMinor || 0,
        currency: dish?.currency || 'GEL',
        vegetarian: dish?.vegetarian || false,
        chefsPick: dish?.chefsPick || false,
        title: dish?.title || { ka: '', en: '', ru: '' },
        description: dish?.description || { ka: '', en: '', ru: '' },
        story: dish?.story || { ka: '', en: '', ru: '' },
        photo: dish?.photo || { small: '', full: '' },
        ...dish,
    });

    // Helper to handle the nested language changes
    const handleLangChange = (field: 'title' | 'description' | 'story', value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: { ...prev[field] as LocalizedText, [activeLang]: value },
        }));
    };
    const getPreviewImageSrc = () => {
        return resolveDishPhotoSrc(formData.photo?.full) || resolveDishPhotoSrc(formData.photo?.small);
    };
    const previewImageSrc = getPreviewImageSrc();
    const handleGenerateAI = async () => {
        const currentDishName = formData.title?.[activeLang] || formData.title?.['en'] || formData.title?.['ka'];

        if (!currentDishName) {
            alert(dict.panel?.enterDishName || 'Please enter a dish nomenclature first.');
            return;
        }

        if (currentDishName.length > 80) {
            alert('Dish name is too long.');
            return;
        }
        const ingredientsValue = formData.description?.[activeLang] || '';

        if (ingredientsValue.length > 240) {
            alert('Ingredient line is too long.');
            return;
        }
        setIsGenerating(true);
        try {
            const response = await fetch('/api/synthesize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    dishName: currentDishName,
                    ingredients: ingredientsValue,
                    brandVoice,
                }),
            });

            const payload = await response.json();

            if (!response.ok) {
                throw new Error(payload?.error || 'API request failed');
            }

            const data = payload;

            setFormData(prev => ({
                ...prev,
                title: { ...prev.title, ...data.title },
                description: { ...prev.description, ...data.description },
                story: { ...prev.story, ...data.story }
            }));
        } catch (error) {
            console.error('AI Synthesis Error:', error);
            alert(
                error instanceof Error
                    ? error.message
                    : dict.panel?.aiError || 'Failed to synthesize content.'
            );
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

    const handleSaveImage = (photo: { small?: string; full?: string } | null) => {
        setFormData((prev) => ({
            ...prev,
            photo: photo
                ? {
                    small: normalizeDishPhotoRef(photo.small),
                    full: normalizeDishPhotoRef(photo.full),
                }
                : { small: '', full: '' },
        }));
        setShowAssetForge(false);
    };

    return (
        <>
            {showAssetForge && (
                <AssetForge
                    dishName={formData.title?.['en'] || formData.title?.['ka'] || 'Unnamed Dish'}
                    ingredients={formData.description?.['en']} // <-- Add this new prop!
                    initialImage={previewImageSrc}
                    onClose={() => setShowAssetForge(false)}
                    onSave={handleSaveImage}
                />
            )}

            {/* THE OVERLAY: Darkens the grid behind it, blur effect for depth */}
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

                        <div className="flex flex-col sm:w-1/2 border-b border-neutral-800  sm:border-b-0 sm:border-r">

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

                                {/* Category Assignment Dropdown */}
                                {categories && categories.length > 0 && (
                                    <div>
                                        <label className="mb-2 block font-mono text-xs uppercase tracking-wider text-neutral-500">
                                            {dict.panel?.category || 'Category'}
                                        </label>
                                        <select
                                            value={formData.categoryId || categories[0]?.id || ''}
                                            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                            className="w-full appearance-none border border-neutral-800 bg-black p-3 font-mono text-sm text-white outline-none focus:border-white transition-colors cursor-pointer"
                                        >
                                            {categories.map((cat) => (
                                                <option key={cat.id} value={cat.id} className="bg-[#050505] text-white">
                                                    {cat.title?.[activeLang] || cat.title?.['en'] || cat.title?.['ka'] || 'Unnamed Category'}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

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
                        {/* RIGHT HEMISPHERE: The Narrative Engine */}
                        <div className="flex flex-col gap-6 p-6 sm:w-1/2">

                            {/* Visual Asset Section (Replacing old AI tool) */}
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <label className="block font-mono text-[10px] uppercase tracking-widest text-[#a855f7]">
                                        {dict.panel?.visualAsset || 'Visual Asset'}
                                    </label>
                                </div>

                                {/* Final Photo Display or Placeholder */}
                                <div className="relative aspect-video w-full border border-neutral-800 bg-black flex flex-col items-center justify-center p-2 group overflow-hidden">
                                    {previewImageSrc ? (
                                        <>
                                            {/* If it's a real URL, show it, else show a placeholder text for testing */}
                                            <img
                                                src={previewImageSrc}
                                                alt="Dish Asset"
                                                className="absolute inset-0 h-full w-full object-cover opacity-90 transition-opacity group-hover:opacity-100"
                                            />

                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                                <button
                                                    onClick={() => setShowAssetForge(true)}
                                                    className="border border-[#a855f7] bg-[#a855f7]/20 px-6 py-2 font-mono text-[10px] uppercase tracking-widest text-white hover:bg-[#a855f7]/40 transition-colors"
                                                >
                                                    {dict.panel?.editInForge || 'Edit in AI Forge'}
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex h-32 w-full flex-col items-center justify-center gap-4 py-4 px-2 text-center text-neutral-500">
                                            <span className="material-symbols-outlined text-4xl mb-2 opacity-50">hide_image</span>
                                            <span className="font-mono text-[10px] uppercase tracking-widest">{dict.panel?.noAsset || 'No Asset Provided'}</span>
                                            <button
                                                onClick={() => setShowAssetForge(true)}
                                                className="mt-2 border border-[#a855f7]/50 bg-[#a855f7]/10 px-6 py-2 font-mono text-[10px] uppercase tracking-widest text-[#a855f7] hover:bg-[#a855f7]/20 hover:border-[#a855f7] transition-colors flex items-center gap-2"
                                            >
                                                <span className="material-symbols-outlined text-sm">auto_awesome</span> {dict.panel?.openForge || 'Open AI Forge'}
                                            </button>
                                        </div>
                                    )}
                                </div>
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
        </>
    );
}
