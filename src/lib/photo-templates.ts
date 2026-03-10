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

export const PHOTO_TEMPLATES: PhotoTemplate[] = [
    {
        id: 'dark-brutalism',
        name: 'Dark Brutalism',
        description: 'Matte black, high contrast, dramatic editorial mood.',
        prompt:
            'Re-stage this dish as a high-end editorial food photograph. Preserve the identity, ingredients, proportions, and plating logic of the original dish. Place it on a matte black slate surface, dramatic single-source overhead studio lighting, deep shadows, strong contrast, ultra-minimal environment, premium restaurant campaign aesthetic, realistic food photography.',
    },
    {
        id: 'heritage-rustic',
        name: 'Heritage / Rustic',
        description: 'Warm tradition, oak wood, linen, soft window light.',
        prompt:
            'Re-stage this dish as a refined heritage food photograph. Preserve the identity, ingredients, proportions, and plating logic of the original dish. Place it on aged dark oak wood, soft natural window lighting, subtly out-of-focus background, dark linen accents, warm tonal balance, elegant rustic editorial style, realistic food photography.',
    },
    {
        id: 'clean-modern',
        name: 'Clean Modern',
        description: 'White marble, diffused light, precise and contemporary.',
        prompt:
            'Re-stage this dish as a modern fine-dining menu photograph. Preserve the identity, ingredients, proportions, and plating logic of the original dish. Place it on white marble, bright soft diffused lighting, completely clean environment, restrained composition, premium contemporary editorial style, realistic food photography.',
    },
    {
        id: 'neutral-editorial',
        name: 'Neutral Editorial',
        description: 'Balanced, premium, versatile baseline for most dishes.',
        prompt:
            'Re-stage this dish as a premium restaurant editorial photograph. Preserve the identity, ingredients, proportions, and plating logic of the original dish. Neutral stone surface, soft directional lighting, subtle depth of field, minimal background, elegant plating emphasis, realistic upscale food photography.',
    },
];