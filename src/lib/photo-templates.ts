export type PhotoTemplateId =
    | 'dark-brutalism'
    | 'heritage-rustic'
    | 'clean-modern'
    | 'neutral-editorial';

export interface PhotoTemplate {
    id: PhotoTemplateId;
    name: string;
    description: string;
    prompt: string;
}

export const PHOTO_TEMPLATES = [
    {
        id: 'tbilisi-modern',
        name: 'Modern Georgian / Brutalist',
        description: 'Dark stone, dramatic lighting, contemporary plating.',
        prompt: 'Modern fine-dining aesthetic. Plated on dark matte ceramic resting on a brutalist slate or Tusheti-inspired dark stone surface. Cinematic directional lighting creating rich contrast. Elegant, moody, and highly contemporary.'
    },
    {
        id: 'georgian-rustic',
        name: 'Traditional Rustic (Ketsi)',
        description: 'Warm, welcoming, clay and wood textures.',
        prompt: 'Warm, rustic, traditional dining aesthetic. Plated in a traditional red clay pan or on a rustic, heavily textured wooden board. Warm, inviting ambient light. Accents of crushed walnuts and fresh herbs in the soft-focus background. Comforting and authentic.'
    },
    {
        id: 'asian-minimalist',
        name: 'Asian / Zen Minimalist',
        description: 'Clean geometry, dark ceramics, stark presentation.',
        prompt: 'Japanese Zen minimalism. Plated perfectly centered on a flat, rimless dark slate or rectangular ceramic dish. Soft, even studio lighting with zero harsh shadows. Extreme focus on the clean geometry and fresh textures of the food.'
    },
    {
        id: 'mediterranean-bright',
        name: 'Mediterranean Coastal',
        description: 'Bright sunlight, whitewashed wood, fresh.',
        prompt: 'Bright, coastal Mediterranean aesthetic. Plated on hand-painted light ceramic resting on a sun-bleached, whitewashed wooden table. Hard, dappled natural sunlight suggesting an outdoor patio setting. Bright, fresh, airy, and vibrant.'
    }
];