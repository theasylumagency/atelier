'use client';

import React, { useState } from 'react';

interface AssetForgeProps {
    dishName: string;
    initialImage?: string | null;
    onClose: () => void;
    onSave: (imageUrl: string | null) => void;
}

export default function AssetForge({ dishName, initialImage, onClose, onSave }: AssetForgeProps) {
    const [step, setStep] = useState<'idle' | 'processing'>('idle');
    const [activeTemplate, setActiveTemplate] = useState('dark_slate');
    const [progressLog, setProgressLog] = useState<string[]>([]);
    
    // We use one main state for the visible image in the preview box
    const [previewImage, setPreviewImage] = useState<string | null>(initialImage || null);
    // Track if what we are seeing is a raw upload vs generated result vs initial provided
    const [previewType, setPreviewType] = useState<'initial' | 'raw' | 'generated'>(initialImage ? 'initial' : 'initial');

    const templates = [
        { id: 'dark_slate', name: 'Dark Brutalism', desc: 'შავი ფიქალი, დრამატული განათება' },
        { id: 'heritage', name: 'Heritage Wood', desc: 'ძველი მუხა, თბილი შუქი' },
        { id: 'clean_marble', name: 'Clean Marble', desc: 'თეთრი მარმარილო, ნათელი' }
    ];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const tempUrl = URL.createObjectURL(file);
            setPreviewImage(tempUrl);
            setPreviewType('raw');
            setStep('idle');
        }
    };

    const handleDelete = () => {
        setPreviewImage(null);
        setPreviewType('initial');
        setStep('idle');
    };

    const simulateAIPipeline = () => {
        setStep('processing');
        setProgressLog([]);
        const logs = [
            previewType === 'raw' 
                ? "ინიციალიზაცია: ნედლი ფაილის კომპრესია..." 
                : "ინიციალიზაცია: ტექსტური პრომპტის გენერაცია...",
            previewType === 'raw' 
                ? "AI სეგმენტაცია: ობიექტის ამოჭრა ფონიდან..." 
                : "AI გენერაცია: ბაზისური მოდელის სინთეზი...",
            `გარემოს სინთეზი: [${activeTemplate.toUpperCase()}] შაბლონის მორგება...`,
            "ფერთა კორექცია: ჩრდილების და კონტრასტის დაბალანსება...",
            "ექსპორტი: ოპტიმიზაცია .WEBP ფორმატში..."
        ];

        let currentLog = 0;
        const processLog = () => {
            setProgressLog(prev => [...prev, logs[currentLog]]);
            currentLog++;
            if (currentLog >= logs.length) {
                setTimeout(() => {
                    setStep('idle');
                    // In a real scenario, this would be the URL returned from the AI.
                    setPreviewImage('/placeholder-generated.webp'); 
                    setPreviewType('generated');
                }, 800);
            } else {
                setTimeout(processLog, 1200);
            }
        };

        // Start the progress simulation
        setTimeout(processLog, 800);
    };

    return (
        // The container perfectly overlaps DishEditor. Fixed right side, 800px max width.
        <div className="fixed inset-y-0 right-0 z-[110] w-full sm:w-[800px] flex flex-col border-l border-neutral-800 bg-[#050505] text-[#f5f5f5] animate-in slide-in-from-right duration-300 shadow-2xl">
            {/* Header */}
            <header className="flex items-center justify-between border-b border-neutral-800 p-6 bg-black shrink-0">
                <div>
                    <span className="block font-mono text-[10px] uppercase tracking-[0.3em] text-amber-500">Asset Forge</span>
                    <h2 className="mt-1 text-sm font-bold uppercase tracking-widest text-white">{dishName || 'Unnamed Asset'}</h2>
                </div>
                <button onClick={onClose} className="text-neutral-500 hover:text-white font-mono text-xl transition-colors">✕</button>
            </header>

            <div className="flex flex-1 flex-col sm:flex-row overflow-hidden">
                {/* Control Panel (Left/Top) */}
                <div className="flex flex-col border-b border-neutral-800 bg-[#0a0a0a] sm:w-[320px] sm:border-b-0 sm:border-r shrink-0">
                    <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                        <h3 className="mb-6 font-mono text-[10px] uppercase tracking-widest text-neutral-500">ვიზუალური შაბლონი (Template)</h3>
                        <div className="flex flex-col gap-3">
                            {templates.map(tmpl => (
                                <button
                                    key={tmpl.id}
                                    onClick={() => setActiveTemplate(tmpl.id)}
                                    disabled={step === 'processing'}
                                    className={`flex flex-col items-start border p-4 text-left transition-all ${activeTemplate === tmpl.id ? 'border-amber-500 bg-amber-500/10 text-white' : 'border-neutral-800 bg-transparent text-neutral-400 hover:border-neutral-500'
                                        } disabled:opacity-50`}
                                >
                                    <span className={`font-bold uppercase tracking-wider text-xs ${activeTemplate === tmpl.id ? 'text-amber-500' : ''}`}>{tmpl.name}</span>
                                    <span className={`mt-1 font-mono text-[9px] uppercase tracking-widest ${activeTemplate === tmpl.id ? 'text-amber-200/80' : 'text-neutral-600'}`}>
                                        {tmpl.desc}
                                    </span>
                                </button>
                            ))}
                        </div>

                        <label className={`mt-8 flex h-16 w-full cursor-pointer items-center justify-center border border-dashed border-neutral-700 bg-[#050505] transition-colors hover:border-amber-500 hover:bg-neutral-900/50 ${step === 'processing' ? 'opacity-50 pointer-events-none' : ''}`}>
                            <span className="material-symbols-outlined text-neutral-600 mr-2 text-sm">add_photo_alternate</span>
                            <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">ნედლი ფოტოს ატვირთვა</span>
                            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={step === 'processing'} />
                        </label>

                        <button 
                            onClick={simulateAIPipeline} 
                            disabled={step === 'processing'} 
                            className="mt-4 w-full border border-amber-500 bg-amber-500/10 py-4 font-mono text-[10px] font-bold uppercase tracking-widest text-amber-500 transition-colors hover:bg-amber-500 hover:text-black disabled:opacity-50 disabled:pointer-events-none"
                        >
                            AI სინთეზის დაწყება
                        </button>
                    </div>
                </div>

                {/* Visual Preview (Right/Bottom) */}
                <div className="relative flex flex-1 flex-col items-center justify-center bg-[#111] bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:2rem_2rem] p-8 overflow-hidden">
                    {step === 'processing' ? (
                        <div className="w-full max-w-lg flex flex-col p-8 bg-black/80 border border-neutral-800 shadow-2xl backdrop-blur-md">
                            <div className="flex items-center gap-3 mb-8 border-b border-neutral-800 pb-4">
                                <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></div>
                                <span className="font-mono text-xs uppercase text-amber-500 tracking-widest">სისტემა მუშაობს / SYSTEM WORKING</span>
                            </div>
                            <div className="flex flex-col gap-4 font-mono text-[10px] uppercase tracking-widest text-neutral-500 h-[240px] overflow-hidden">
                                {progressLog.map((log, i) => (
                                    <div key={i} className="flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <span className="text-green-500 shrink-0 select-none">✓</span>
                                        <span className="text-white break-words">{log}</span>
                                    </div>
                                ))}
                                {/* Blinking cursor indicating active processing */}
                                <div className="flex flex-col gap-2 opacity-50">
                                  <span className="w-2 h-4 bg-neutral-500 animate-pulse ml-6"></span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-500 w-full max-w-[360px]">
                            {/* In a real app, this would display previewImage. We use a placeholder here for the simulation. */}
                            <div className="relative aspect-square w-full border border-white bg-black shadow-2xl p-4 flex flex-col items-center group">
                                
                                {/* Delete button (only if image exists) */}
                                {previewImage && (
                                    <button 
                                        onClick={handleDelete} 
                                        className="absolute top-6 right-6 z-10 bg-black/80 border border-neutral-700 hover:border-red-500 text-neutral-400 hover:text-red-500 h-8 w-8 flex items-center justify-center rounded-sm transition-colors backdrop-blur-md opacity-0 group-hover:opacity-100"
                                        title="ფოტოს წაშლა"
                                    >
                                        <span className="material-symbols-outlined text-sm">delete</span>
                                    </button>
                                )}

                                <div className="w-full aspect-square bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-4 overflow-hidden relative">
                                    {previewImage ? (
                                        <>
                                            {previewImage === '/placeholder-generated.webp' && (
                                                <span className="font-mono text-[10px] text-neutral-200 bg-black/60 px-2 py-1 uppercase tracking-widest absolute bottom-4 right-4 z-10 backdrop-blur-sm pointer-events-none group-hover:opacity-0 transition-opacity duration-300">
                                                    AI Gen.
                                                </span>
                                            )}
                                            <img src={previewImage} alt="Preview Asset" className="w-full h-full object-cover" />
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center text-neutral-600 gap-2">
                                            <span className="material-symbols-outlined text-4xl">hide_image</span>
                                            <span className="font-mono text-[9px] uppercase tracking-widest">ფოტო არ არის შერჩეული</span>
                                        </div>
                                    )}
                                </div>
                                <span className="font-mono text-[10px] uppercase text-neutral-400 tracking-widest border-b border-neutral-800 pb-2 w-full text-center">
                                    {previewType === 'raw' ? '[ RAW UPLOAD ]' : previewType === 'generated' ? '[ AI GENERATED .WEBP ]' : previewType === 'initial' && previewImage ? '[ EXISTING ASSET ]' : '[ NO ASSET ]'}
                                </span>
                            </div>

                            <button
                                onClick={() => onSave(previewImage)}
                                className="mt-8 border border-white bg-white w-full py-4 font-mono text-xs font-bold uppercase tracking-widest text-black transition-all hover:bg-neutral-200 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                            >
                                დადასტურება & შენახვა
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
