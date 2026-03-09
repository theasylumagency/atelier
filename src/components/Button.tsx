'use client';

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'outline';
    className?: string;
}

export default function Button({ children, variant = 'primary', className = '', ...props }: ButtonProps) {
    const baseStyle = "group relative inline-flex items-center justify-center overflow-hidden font-inter text-sm md:text-base tracking-[0.15em] uppercase font-semibold transition-all duration-500";

    const variants = {
        primary: "bg-white text-black hover:bg-zinc-200 px-10 py-5 rounded-none border border-transparent",
        secondary: "bg-transparent text-white hover:text-zinc-300 px-8 py-4 rounded-none border border-transparent",
        outline: "border border-white/10 text-white hover:bg-white hover:text-black px-10 py-5 rounded-none"
    };

    return (
        <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
            <span className="relative z-10 flex items-center gap-4">
                {children}
                <svg
                    className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                </svg>
            </span>
            {variant === 'primary' && (
                <div className="absolute inset-0 h-full w-0 bg-black/10 transition-all duration-500 ease-out group-hover:w-full" />
            )}
        </button>
    );
}
