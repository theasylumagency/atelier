'use client';
export default function Transition({ dict }: { dict: any }) {
    return (
        <section className="py-48 bg-stone-950 text-white relative flex items-center justify-center min-h-screen">
            <div className="absolute inset-0 z-0 opacity-30" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD-ns0bK428kDLU2zChduJi3DPXr9RzVv35gGZ6mcxTq-VroqK5MTG1PfPiu0nIjzT1fR18LVwWqLzYdOaGersIFWKV0i6hsrqJr3FIpaJwiiboV3bwe3EYXP9Xbh4FrTHnYnH0qcbXW6Af0tpI89NKYlITtFJMXZmKqmHPOxhiqhj41AbVGuhu6q1yT2W7ZHc62kBj5_pMOg_7aymbOQ2kYf2V9vm2ts3j4cS4JBeQkpnKzqBkSA6NzMT1I-yQ1xn4Jt0xHkRQzFrl')", backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(10px) brightness(0.5)' }}></div>
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
