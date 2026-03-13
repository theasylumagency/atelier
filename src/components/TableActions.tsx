'use client';

import { useState } from 'react';

interface TableActionsProps {
    scanUrl: string;
    scanPath: string;
}

export default function TableActions({ scanUrl, scanPath }: TableActionsProps) {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(scanUrl);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    return (
        <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-4">
            <button
                onClick={handleCopy}
                className="group flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-stone-500 hover:text-white transition-colors cursor-pointer"
            >
                <span className="material-symbols-outlined text-sm">
                    {isCopied ? 'check' : 'content_copy'}
                </span>
                <span>{isCopied ? 'Copied' : 'Copy Link'}</span>
            </button>

            <a
                href={scanPath}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-stone-500 hover:text-white transition-colors"
            >
                <span>Desktop Preview</span>
                <span className="material-symbols-outlined text-sm">open_in_new</span>
            </a>
        </div>
    );
}