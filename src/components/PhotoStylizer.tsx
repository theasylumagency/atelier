'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { PHOTO_TEMPLATES, type PhotoTemplateId } from '@/lib/photo-templates';
import { isValidDishName } from '@/lib/photo-ai';
import { compressToWebP } from '@/lib/image-utils';

interface PhotoStylizerProps {
    dishName: string;
    ingredients?: string;
    locale?: 'en' | 'ka';
}

const UI = {
    en: {
        title: 'AI Photo Studio',
        instruction: 'Upload a photo to restyle it, or leave it empty to generate purely from the name. AI aims to preserve uploaded photo identity.',
        uploadLabel: 'Upload',
        cameraLabel: 'Camera',
        remove: 'Clear',
        noPreview: 'No image provided. Will generate from name.',
        pickDirection: 'Visual Direction',
        nameRequired: 'Dish name is required.',
        generating: 'Synthesizing…',
        generateBtn: '✨ AI Synthesize',
    },
    ka: {
        title: 'AI ფოტო სტუდია',
        instruction: 'ატვირთეთ ფოტო მის გადასაკეთებლად, ან დატოვეთ ცარიელი სახელით გენერაციისთვის. AI შეეცდება ფოტოს იდენტობის შენარჩუნებას.',
        uploadLabel: 'ატვირთვა',
        cameraLabel: 'კამერა',
        remove: 'წაშლა',
        noPreview: 'ფოტო არ არის. დაგენერირდება სახელით.',
        pickDirection: 'ვიზუალური მიმართულება',
        nameRequired: 'კერძის სახელი აუცილებელია.',
        generating: 'სინთეზირდება…',
        generateBtn: '✨ AI სინთეზი',
    },
} as const;

export default function PhotoStylizer({
    dishName,
    ingredients = '',
    locale = 'en',
}: PhotoStylizerProps) {
    const ui = locale === 'ka' ? UI.ka : UI.en;

    const uploadInputRef = useRef<HTMLInputElement | null>(null);
    const cameraInputRef = useRef<HTMLInputElement | null>(null);

    const [selectedTemplate, setSelectedTemplate] =
        useState<PhotoTemplateId>('neutral-editorial');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [isGenerating, setIsGenerating] = useState(false);

    const trimmedDishName = dishName.trim();
    const trimmedIngredients = ingredients.trim();

    const isRestyle = !!imageFile;

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    const canGenerate = useMemo(() => {
        return isValidDishName(trimmedDishName) && !isGenerating;
    }, [trimmedDishName, isGenerating]);

    function setFile(file: File | null) {
        if (!file) return;

        setImageFile(file);

        const nextUrl = URL.createObjectURL(file);
        setPreviewUrl((oldUrl) => {
            if (oldUrl) URL.revokeObjectURL(oldUrl);
            return nextUrl;
        });
    }

    async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0] || null;
        if (!file) {
            setFile(null);
            return;
        }

        try {
            // Show a brief loading state if desired here
            const compressedWebP = await compressToWebP(file);
            setFile(compressedWebP);
        } catch (error) {
            console.error('Failed to compress image:', error);
            // Fallback to original file if canvas fails
            setFile(file); 
        }
    }


    function handleRemoveImage() {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl('');
        setImageFile(null);

        if (uploadInputRef.current) uploadInputRef.current.value = '';
        if (cameraInputRef.current) cameraInputRef.current.value = '';
    }

    async function handleGenerate() {
        if (!canGenerate) return;

        setIsGenerating(true);

        try {
            const payload = {
                mode: isRestyle ? 'restyle' : 'text-only',
                dishName: trimmedDishName,
                ingredients: trimmedIngredients,
                templateId: selectedTemplate,
                mimeType: imageFile?.type || null,
                fileName: imageFile?.name || null,
            };

            console.log('Photo AI request prepared:', payload);

            alert(
                locale === 'ka'
                    ? isRestyle
                        ? 'შემდეგ ეტაპზე ეს ღილაკი რეალურ ფოტოს გენერაციაზე დაკავშირდება.'
                        : 'შემდეგ ეტაპზე ეს ღილაკი კერძის სახელით რეალურ გენერაციაზე დაკავშირდება.'
                    : isRestyle
                        ? 'In the next step, this button will connect to real photo restyling.'
                        : 'In the next step, this button will connect to real name-based generation.'
            );
        } finally {
            setIsGenerating(false);
        }
    }

    return (
        <div className="flex flex-col gap-4 rounded-none border border-neutral-800 bg-[#050505] p-5">
            <div className="flex items-center justify-between">
                <label className="block font-mono text-[10px] uppercase tracking-widest text-[#a855f7]">
                    {ui.title}
                </label>
            </div>

            <p className="text-[10px] uppercase tracking-wider text-neutral-500 leading-relaxed font-mono">
                {ui.instruction}
            </p>

            {/* Dropdown for styling */}
            <div className="w-full">
                <label className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-neutral-500">
                    {ui.pickDirection}
                </label>
                <select
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value as PhotoTemplateId)}
                    className="w-full appearance-none border border-neutral-800 bg-black p-3 font-mono text-xs text-white outline-none focus:border-white transition-colors cursor-pointer"
                >
                    {PHOTO_TEMPLATES.map((t) => (
                        <option key={t.id} value={t.id}>
                            {t.name} — {t.description}
                        </option>
                    ))}
                </select>
            </div>

            {/* Upload Area */}
            <div className="relative flex flex-col border border-dashed border-neutral-800 bg-neutral-900/10 transition-colors">
                {previewUrl ? (
                    <div className="relative aspect-video w-full bg-black group flex items-center justify-center p-2">
                        <img
                            src={previewUrl}
                            alt="Uploaded dish preview"
                            className="h-full w-auto object-contain"
                        />
                        {/* Remove button overlays the image */}
                        <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="absolute top-2 right-2 flex items-center justify-center h-8 w-8 bg-black/60 border border-neutral-700 text-neutral-300 hover:text-white hover:bg-black transition-colors rounded-full"
                            title={ui.remove}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                    </div>
                ) : (
                    <div className="flex h-32 w-full flex-col items-center justify-center gap-4 py-4 px-2 text-center text-neutral-500">
                        <div className="flex gap-4">
                            {/* Upload Button */}
                            <button
                                type="button"
                                onClick={() => uploadInputRef.current?.click()}
                                className="flex h-12 w-12 items-center justify-center border border-neutral-800 bg-black text-neutral-400 hover:text-white hover:border-neutral-500 transition-colors rounded-full"
                                title={ui.uploadLabel}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0V19a2 2 0 01-2 2H5a2 2 0 01-2-2v-5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 9h.01M9 13h.01M20 9V7a2 2 0 00-2-2H6a2 2 0 00-2 2v2" /></svg>
                            </button>

                            {/* Camera Button */}
                            <button
                                type="button"
                                onClick={() => cameraInputRef.current?.click()}
                                className="flex h-12 w-12 items-center justify-center border border-neutral-800 bg-black text-neutral-400 hover:text-white hover:border-neutral-500 transition-colors rounded-full"
                                title={ui.cameraLabel}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            </button>
                        </div>
                        <span className="font-mono text-[10px] uppercase tracking-widest mt-2">{ui.noPreview}</span>
                    </div>
                )}

                <input
                    ref={uploadInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={handleFileChange}
                />
                <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleFileChange}
                />
            </div>

            {!isValidDishName(trimmedDishName) && (
                <p className="text-[10px] text-amber-500 font-mono tracking-widest uppercase">{ui.nameRequired}</p>
            )}

            <button
                type="button"
                onClick={handleGenerate}
                disabled={!canGenerate}
                className="font-mono text-[10px] uppercase tracking-widest text-[#a855f7] hover:text-[#c084fc] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 border border-[#a855f7]/30 bg-[#a855f7]/10 p-3 w-full"
            >
                {isGenerating ? (
                    <>
                        <span className="h-3 w-3 animate-spin rounded-full border-2 border-[#a855f7] border-t-transparent"></span>
                        {ui.generating}
                    </>
                ) : (
                    <span className="border-b border-[#a855f7]/30 pb-0.5">{ui.generateBtn}</span>
                )}
            </button>
        </div>
    );
}