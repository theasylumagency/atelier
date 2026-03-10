'use client';
export default function Transition({ dict }: { dict: any }) {
    return (
        <section className="py-48 bg-stone-950 text-white relative flex items-center justify-center min-h-screen">
            <div className="absolute inset-0 z-0 opacity-30 texture-haze"></div>
            <div className="absolute inset-0 bg-black/60 z-10"></div>
            <div className="max-w-5xl mx-auto px-8 md:px-12 text-center relative z-20">
                <h2
                    className="text-5xl md:text-8xl font-serif italic leading-[1.1] text-white"
                    dangerouslySetInnerHTML={{ __html: dict.transition.text }}
                />
            </div>
        </section>
    );
}
