'use client';

import React, { useEffect, useState } from 'react';

// Modular Studio Options for the B2B Demo
const OPTIONS = {
    angle: [
        { id: '45-deg', label: 'Diner POV (45°)' },
        { id: 'overhead', label: 'Overhead / Flatlay' },
        { id: 'macro', label: 'Hero / Macro Level' }
    ],
    lighting: [
        { id: 'harsh', label: 'Harsh & Brutalist' },
        { id: 'moody', label: 'Moody & Cinematic' },
        { id: 'soft', label: 'Soft & Natural' }
    ],
    setting: [
        { id: 'concrete', label: 'Stark Concrete' },
        { id: 'dark-slate', label: 'Matte Dark Slate' },
        { id: 'white-linen', label: 'White Porcelain' }
    ],
    styling: [
        { id: 'minimalist', label: 'Ultra-Minimalist' },
        { id: 'michelin', label: 'Michelin Precision' },
        { id: 'messy', label: 'Lived-In / Organic' }
    ]
};

interface DishPhoto {
    small?: string;
    full?: string;
}

interface AssetForgeProps {
    dishName: string;
    initialImage?: string | null;
    onClose: () => void;
    onSave: (photo: DishPhoto | null) => void;
}

type PreviewType = 'initial' | 'generated';
type ForgeStep = 'idle' | 'processing';

export default function AssetForge({ dishName, initialImage, onClose, onSave }: AssetForgeProps) {
    const [step, setStep] = useState<ForgeStep>('idle');
    const [progressLog, setProgressLog] = useState<string[]>([]);
    const [previewImage, setPreviewImage] = useState<string | null>(initialImage || null);
    const [previewType, setPreviewType] = useState<PreviewType>(initialImage ? 'initial' : 'initial');
    const [generatedPhoto, setGeneratedPhoto] = useState<DishPhoto | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>('');

    // New Modular State
    const [angle, setAngle] = useState(OPTIONS.angle[0].id);
    const [lighting, setLighting] = useState(OPTIONS.lighting[0].id);
    const [setting, setSetting] = useState(OPTIONS.setting[0].id);
    const [styling, setStyling] = useState(OPTIONS.styling[0].id);

    useEffect(() => {
        setPreviewImage(initialImage || null);
        setPreviewType(initialImage ? 'initial' : 'initial');
        setGeneratedPhoto(null);
        setErrorMessage('');
    }, [initialImage]);

    const appendLog = (message: string) => {
        setProgressLog((prev) => [...prev, message]);
    };

    async function handleGenerate() {
        const currentDishName = dishName.trim();

        if (!currentDishName || currentDishName.length < 2) {
            alert('Dish name is too short.');
            return;
        }

        setStep('processing');
        setProgressLog([]);
        setErrorMessage('');
        setGeneratedPhoto(null);

        appendLog('ვალიდაცია: პარამეტრების შემოწმება...');
        appendLog(`სტუდია: ${angle} | ${lighting} | ${setting} | ${styling}`);
        appendLog('გენერაცია: Google Gemini 3 Flash Image...');

        try {
            const body = new FormData();
            body.append('dishName', currentDishName);
            // Sending modular options instead of a single template ID
            body.append('angle', angle);
            body.append('lighting', lighting);
            body.append('setting', setting);
            body.append('styling', styling);

            const response = await fetch('/api/photo-forge', {
                method: 'POST',
                body,
            });

            appendLog('ოპტიმიზაცია: WEBP ვერსიების მომზადება...');

            const payload = await response.json();

            if (!response.ok) {
                throw new Error(payload?.error || 'Failed to generate photo.');
            }

            const photo = payload?.photo as DishPhoto | undefined;

            if (!photo?.full) {
                throw new Error('The server did not return a valid photo.');
            }

            const fullSrc = photo.full.startsWith('/') ? photo.full : `/uploads/dishes/${photo.full}`;

            setGeneratedPhoto(photo);
            setPreviewImage(fullSrc);
            setPreviewType('generated');
            appendLog('მზადაა: ფოტო შენახულია.');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to generate photo.';
            setErrorMessage(message);
        } finally {
            setStep('idle');
        }
    }

    const handleDelete = () => { /* ... existing logic ... */
        setPreviewImage(initialImage || null);
        setPreviewType(initialImage ? 'initial' : 'initial');
        setGeneratedPhoto(null);
        setErrorMessage('');
    };

    const handleUseImage = () => { /* ... existing logic ... */
        if (generatedPhoto) return onSave(generatedPhoto);
        if (previewImage && previewType === 'initial') return onSave({ small: previewImage, full: previewImage });
        onSave(null);
    };

    const canUseImage = Boolean(generatedPhoto || (previewImage && previewType === 'initial'));

    return (
        <div className="fixed inset-y-0 right-0 z-[110] flex w-full flex-col border-l border-neutral-800 bg-[#050505] text-[#f5f5f5] shadow-2xl animate-in slide-in-from-right duration-300 sm:w-[800px]">
            <header className="shrink-0 border-b border-neutral-800 bg-black p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <span className="block font-mono text-[10px] uppercase tracking-[0.3em] text-amber-500">
                            Digital Studio Engine
                        </span>
                        <h2 className="mt-1 text-sm font-bold uppercase tracking-widest text-white">
                            {dishName || 'Unnamed Asset'}
                        </h2>
                    </div>
                    <button onClick={onClose} className="text-xl text-neutral-500 transition-colors hover:text-white">✕</button>
                </div>
            </header>

            <div className="flex flex-1 flex-col overflow-hidden sm:flex-row">
                {/* LEFT SIDEBAR: MODULAR CONTROLS */}
                <div className="shrink-0 border-b border-neutral-800 bg-[#0a0a0a] sm:w-[320px] sm:border-b-0 sm:border-r">
                    <div className="custom-scrollbar flex h-full flex-col overflow-y-auto p-6 md:p-8">
                        <h3 className="mb-6 font-mono text-[10px] uppercase tracking-widest text-neutral-500">
                            სტუდიის პარამეტრები (Parameters)
                        </h3>

                        <div className="flex flex-col gap-5">
                            {/* Camera Angle */}
                            <div className="flex flex-col gap-2">
                                <label className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">Camera Angle</label>
                                <select
                                    value={angle}
                                    onChange={(e) => setAngle(e.target.value)}
                                    disabled={step === 'processing'}
                                    className="w-full appearance-none border border-neutral-800 bg-black p-3 font-mono text-[10px] uppercase tracking-widest text-amber-500 focus:border-amber-500 focus:outline-none disabled:opacity-50"
                                >
                                    {OPTIONS.angle.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
                                </select>
                            </div>

                            {/* Lighting */}
                            <div className="flex flex-col gap-2">
                                <label className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">Lighting Model</label>
                                <select
                                    value={lighting}
                                    onChange={(e) => setLighting(e.target.value)}
                                    disabled={step === 'processing'}
                                    className="w-full appearance-none border border-neutral-800 bg-black p-3 font-mono text-[10px] uppercase tracking-widest text-amber-500 focus:border-amber-500 focus:outline-none disabled:opacity-50"
                                >
                                    {OPTIONS.lighting.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
                                </select>
                            </div>

                            {/* Setting */}
                            <div className="flex flex-col gap-2">
                                <label className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">Plating & Background</label>
                                <select
                                    value={setting}
                                    onChange={(e) => setSetting(e.target.value)}
                                    disabled={step === 'processing'}
                                    className="w-full appearance-none border border-neutral-800 bg-black p-3 font-mono text-[10px] uppercase tracking-widest text-amber-500 focus:border-amber-500 focus:outline-none disabled:opacity-50"
                                >
                                    {OPTIONS.setting.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
                                </select>
                            </div>

                            {/* Styling */}
                            <div className="flex flex-col gap-2">
                                <label className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">Styling & Garnish</label>
                                <select
                                    value={styling}
                                    onChange={(e) => setStyling(e.target.value)}
                                    disabled={step === 'processing'}
                                    className="w-full appearance-none border border-neutral-800 bg-black p-3 font-mono text-[10px] uppercase tracking-widest text-amber-500 focus:border-amber-500 focus:outline-none disabled:opacity-50"
                                >
                                    {OPTIONS.styling.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
                                </select>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleGenerate}
                            disabled={step === 'processing'}
                            className="mt-8 w-full border border-amber-500 bg-amber-500/10 py-4 font-mono text-[10px] font-bold uppercase tracking-widest text-amber-500 transition-colors hover:bg-amber-500 hover:text-black disabled:pointer-events-none disabled:opacity-50"
                        >
                            ფოტოს გენერაცია
                        </button>

                        <button
                            type="button"
                            onClick={handleUseImage}
                            disabled={!canUseImage || step === 'processing'}
                            className="mt-3 w-full border border-white/20 bg-white/5 py-4 font-mono text-[10px] font-bold uppercase tracking-widest text-white transition-colors hover:border-white hover:bg-white hover:text-black disabled:pointer-events-none disabled:opacity-40"
                        >
                            გამოიყენე ეს ფოტო
                        </button>
                    </div>
                </div>

                {/* RIGHT PANEL: PREVIEW */}
                <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-[#111] bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:2rem_2rem] p-8">
                    {step === 'processing' ? (
                        <div className="flex w-full max-w-lg flex-col border border-neutral-800 bg-black/80 p-8 shadow-2xl backdrop-blur-md">
                            <div className="mb-8 flex items-center gap-3 border-b border-neutral-800 pb-4">
                                <div className="h-2 w-2 animate-pulse rounded-full bg-amber-500"></div>
                                <span className="font-mono text-xs uppercase tracking-widest text-amber-500">
                                    სისტემა მუშაობს / RENDERING ASSET
                                </span>
                            </div>
                            <div className="flex h-[240px] flex-col gap-4 overflow-hidden font-mono text-[10px] uppercase tracking-widest text-neutral-500">
                                {progressLog.map((log, i) => (
                                    <div key={i} className="animate-in fade-in flex items-start gap-3">
                                        <span className="shrink-0 text-green-500">✓</span>
                                        <span className="text-white">{log}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="animate-in fade-in zoom-in-95 flex w-full max-w-[360px] flex-col items-center justify-center duration-500">
                            <div className="group relative flex aspect-[4/5] w-full flex-col items-center border border-white bg-black p-4 shadow-2xl">
                                {previewImage && (
                                    <button onClick={handleDelete} className="absolute right-6 top-6 z-10 flex h-8 w-8 items-center justify-center border border-neutral-700 bg-black/80 text-neutral-400 opacity-0 transition-colors hover:border-red-500 hover:text-red-500 group-hover:opacity-100">✕</button>
                                )}
                                <div className="relative flex flex-1 items-center justify-center overflow-hidden border border-neutral-900 bg-[#0d0d0d] w-full">
                                    {previewImage ? (
                                        <img src={previewImage} alt="Asset preview" className="h-full w-full object-cover" />
                                    ) : (
                                        <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-600">No preview available</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}