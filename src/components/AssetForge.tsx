'use client';

import React, { useEffect, useState } from 'react';
import { normalizeDishPhotoRef, resolveDishPhotoSrc } from '@/lib/dish-photo';

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
    ingredients?: string;
    initialImage?: string | null;
    onClose: () => void;
    onSave: (photo: DishPhoto | null) => void;
}

type PreviewType = 'initial' | 'generated';
type ForgeStep = 'idle' | 'processing';

const MAX_REFERENCE_BYTES = 900 * 1024;
const MAX_REFERENCE_DIMENSION = 1600;
const TARGET_REFERENCE_MIME = 'image/jpeg';

function canvasToBlob(canvas: HTMLCanvasElement, quality: number) {
    return new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (blob) {
                resolve(blob);
                return;
            }

            reject(new Error('Failed to optimize the reference photo.'));
        }, TARGET_REFERENCE_MIME, quality);
    });
}

function loadImageElement(file: File) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
        const objectUrl = URL.createObjectURL(file);
        const image = new Image();

        image.onload = () => {
            URL.revokeObjectURL(objectUrl);
            resolve(image);
        };

        image.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error('Failed to read the reference photo.'));
        };

        image.src = objectUrl;
    });
}

async function prepareReferenceImageUpload(file: File) {
    if (!file.type.startsWith('image/')) {
        return file;
    }

    const image = await loadImageElement(file);
    const maxInputDimension = Math.max(image.naturalWidth, image.naturalHeight);
    const initialScale =
        maxInputDimension > MAX_REFERENCE_DIMENSION
            ? MAX_REFERENCE_DIMENSION / maxInputDimension
            : 1;

    let width = Math.max(1, Math.round(image.naturalWidth * initialScale));
    let height = Math.max(1, Math.round(image.naturalHeight * initialScale));
    let quality = 0.82;

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
        throw new Error('The browser could not prepare the reference photo.');
    }

    for (let attempt = 0; attempt < 6; attempt += 1) {
        canvas.width = width;
        canvas.height = height;
        context.clearRect(0, 0, width, height);
        context.drawImage(image, 0, 0, width, height);

        const blob = await canvasToBlob(canvas, quality);

        if (blob.size <= MAX_REFERENCE_BYTES || attempt === 5) {
            const baseName = file.name.replace(/\.[^.]+$/, '') || 'reference';
            return new File([blob], `${baseName}-ref.jpg`, {
                type: TARGET_REFERENCE_MIME,
                lastModified: Date.now(),
            });
        }

        if (attempt >= 2) {
            width = Math.max(480, Math.round(width * 0.85));
            height = Math.max(480, Math.round(height * 0.85));
        }

        quality = Math.max(0.55, quality - 0.08);
    }

    return file;
}

async function readResponsePayload(response: Response) {
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
        return response.json();
    }

    const text = await response.text();
    return { error: text.trim() };
}

function getGenerationErrorMessage(status: number, fallback?: string) {
    if (status === 413) {
        return 'The supporting photo is too large for the production server. Use a smaller crop or lower-resolution image.';
    }

    if (status === 404) {
        return 'The generated image could not be loaded from the server.';
    }

    return fallback || 'Failed to generate photo.';
}

export default function AssetForge({ dishName, ingredients, initialImage, onClose, onSave }: AssetForgeProps) {
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
    const [referenceFile, setReferenceFile] = useState<File | null>(null);
    const [referencePreview, setReferencePreview] = useState<string | null>(null);
    useEffect(() => {
        setPreviewImage(initialImage || null);
        setPreviewType(initialImage ? 'initial' : 'initial');
        setGeneratedPhoto(null);
        setErrorMessage('');
    }, [initialImage]);

    useEffect(() => {
        return () => {
            if (referencePreview) {
                URL.revokeObjectURL(referencePreview);
            }
        };
    }, [referencePreview]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setReferenceFile(file);
            const nextPreview = URL.createObjectURL(file);
            setReferencePreview((current) => {
                if (current) {
                    URL.revokeObjectURL(current);
                }

                return nextPreview;
            });
        }
    };

    const clearReferenceImage = () => {
        setReferenceFile(null);
        setReferencePreview((current) => {
            if (current) {
                URL.revokeObjectURL(current);
            }

            return null;
        });
    };
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

        // 1. Define the dynamic, realistic sequence of steps
        const simulatedSteps = [
            'ვალიდაცია: პარამეტრების შემოწმება...',
            `სტუდია: მოწყობა (${angle}, ${lighting})...`,
            referenceFile
                ? 'ანალიზი: ობიექტის სტრუქტურის ამოცნობა (Image-to-Image)...'
                : 'კომპოზიცია: ახალი სცენის აგება (Text-to-Image)...',
            'განათება: ჩრდილების და ტექსტურების კალკულაცია...',
            'რენდერი: ულტრა-რეალისტური დეტალების დამატება...',
            'ფინალიზაცია: ფერების კორექცია...',
            'ოპტიმიზაცია: ქსელისთვის მომზადება (WEBP)...',
            'თითქმის მზადაა...'
        ];

        // 2. Start the interval to reveal logs one by one
        let stepIndex = 0;
        appendLog(simulatedSteps[stepIndex]); // Show first step immediately

        const logInterval = setInterval(() => {
            stepIndex++;
            if (stepIndex < simulatedSteps.length) {
                appendLog(simulatedSteps[stepIndex]);
            } else {
                clearInterval(logInterval); // Stop when we run out of simulated steps
            }
        }, 1500); // Reveals a new log every 1.5 seconds

        try {
            const body = new FormData();
            body.append('dishName', currentDishName);
            body.append('angle', angle);
            body.append('lighting', lighting);
            body.append('setting', setting);
            body.append('styling', styling);

            // 3. Append ingredients if they exist
            if (ingredients) {
                body.append('ingredients', ingredients);
            }

            if (referenceFile) {
                const preparedReferenceFile = await prepareReferenceImageUpload(referenceFile);
                body.append('referenceImage', preparedReferenceFile);
            }

            const response = await fetch('/api/photo-forge', {
                method: 'POST',
                body,
            });

            const payload = await readResponsePayload(response);

            if (!response.ok) {
                throw new Error(getGenerationErrorMessage(response.status, payload?.error));
            }

            const photo = payload?.photo as DishPhoto | undefined;

            if (!photo?.full) {
                throw new Error('The server did not return a valid photo.');
            }

            const fullSrc = resolveDishPhotoSrc(photo.full);

            if (!fullSrc) {
                throw new Error('The server did not return a usable photo path.');
            }

            // 4. Clear the interval and set the success state
            clearInterval(logInterval);
            appendLog('მზადაა: ფოტო წარმატებით დაგენერირდა.');

            // Adding a tiny delay here just so the user reads the "success" message before it disappears
            setTimeout(() => {
                setGeneratedPhoto(photo);
                setPreviewImage(fullSrc);
                setPreviewType('generated');
                setStep('idle');
            }, 800);

        } catch (error) {
            clearInterval(logInterval);
            const message = error instanceof Error ? error.message : 'Failed to generate photo.';
            setErrorMessage(message);
            appendLog(`შეცდომა: ${message}`);
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
        if (generatedPhoto) {
            return onSave({
                small: normalizeDishPhotoRef(generatedPhoto.small),
                full: normalizeDishPhotoRef(generatedPhoto.full),
            });
        }

        if (previewImage && previewType === 'initial') {
            const normalized = normalizeDishPhotoRef(previewImage);
            return onSave({ small: normalized, full: normalized });
        }

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
                        {/* REFERENCE IMAGE UPLOAD & CAPTURE (NEW) */}
                        <div className="mb-6 flex flex-col gap-2 border border-neutral-800 bg-black p-4">
                            <label className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                                Reference Photo (Optional)
                            </label>

                            {referencePreview ? (
                                <div className="relative aspect-[1/1] w-full overflow-hidden border border-neutral-700 bg-neutral-900">
                                    <img src={referencePreview} alt="Reference" className="h-full w-full object-cover opacity-70" />
                                    <button
                                        type="button"
                                        onClick={clearReferenceImage}
                                        className="absolute right-2 top-2 bg-black/80 px-2 py-1 font-mono text-[9px] text-red-500 hover:bg-red-500 hover:text-white"
                                    >
                                        REMOVE
                                    </button>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    {/* 1. Standard Upload Button */}
                                    <label className="flex flex-1 cursor-pointer flex-col items-center justify-center border border-dashed border-neutral-700 bg-neutral-900 py-6 transition-colors hover:border-amber-500 hover:bg-neutral-800">
                                        <span className="material-symbols-outlined mb-2 text-xl text-neutral-500">folder_open</span>
                                        <span className="font-mono text-[9px] text-neutral-500">UPLOAD</span>
                                        <input
                                            type="file"
                                            accept="image/jpeg, image/png, image/webp"
                                            className="hidden"
                                            onChange={handleFileChange}
                                        />
                                    </label>

                                    {/* 2. Device Camera Capture Button */}
                                    <label className="flex flex-1 cursor-pointer flex-col items-center justify-center border border-dashed border-neutral-700 bg-neutral-900 py-6 transition-colors hover:border-amber-500 hover:bg-neutral-800">
                                        <span className="material-symbols-outlined mb-2 text-xl text-neutral-500">photo_camera</span>
                                        <span className="font-mono text-[9px] text-neutral-500">CAMERA</span>
                                        <input
                                            type="file"
                                            accept="image/jpeg, image/png, image/webp"
                                            capture="environment" // <-- This is the magic attribute for mobile cameras
                                            className="hidden"
                                            onChange={handleFileChange}
                                        />
                                    </label>
                                </div>
                            )}
                        </div>
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

                        {errorMessage && (
                            <p className="mt-4 border border-red-900/60 bg-red-950/30 px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-red-300">
                                {errorMessage}
                            </p>
                        )}
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
