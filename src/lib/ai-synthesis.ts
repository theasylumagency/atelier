import { z } from 'zod';

export const brandVoiceValues = [
    'Traditional & Warm',
    'Modern & Minimalist',
    'High-End / Fine Dining',
] as const;

export const BrandVoiceSchema = z.enum(brandVoiceValues);

const LocalizedTextSchema = z.object({
    ka: z.string().trim().min(1).max(120),
    en: z.string().trim().min(1).max(120),
    ru: z.string().trim().min(1).max(120),
});

const LocalizedDescriptionSchema = z.object({
    ka: z.string().trim().min(1).max(220),
    en: z.string().trim().min(1).max(220),
    ru: z.string().trim().min(1).max(220),
});

const LocalizedStorySchema = z.object({
    ka: z.string().trim().min(1).max(420),
    en: z.string().trim().min(1).max(420),
    ru: z.string().trim().min(1).max(420),
});

export const SynthesizeRequestSchema = z.object({
    dishName: z.string().trim().min(1).max(80),
    ingredients: z.string().trim().max(240).optional().default(''),
    brandVoice: BrandVoiceSchema.optional().default('Modern & Minimalist'),
});

export const SynthesizeResponseSchema = z.object({
    title: LocalizedTextSchema,
    description: LocalizedDescriptionSchema,
    story: LocalizedStorySchema,
});

export type SynthesizeRequest = z.infer<typeof SynthesizeRequestSchema>;
export type SynthesizeResponse = z.infer<typeof SynthesizeResponseSchema>;
export type BrandVoice = z.infer<typeof BrandVoiceSchema>;

export function sanitizePromptValue(value: string): string {
    return value
        .replace(/[<>`$]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

export function extractJsonObject(raw: string): string {
    const trimmed = raw.trim();

    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        return trimmed;
    }

    const codeFenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (codeFenceMatch?.[1]) {
        return codeFenceMatch[1].trim();
    }

    const firstBrace = trimmed.indexOf('{');
    const lastBrace = trimmed.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        return trimmed.slice(firstBrace, lastBrace + 1);
    }

    throw new Error('No JSON object found in model response.');
}