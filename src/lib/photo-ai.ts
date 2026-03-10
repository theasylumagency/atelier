import { z } from 'zod';
import { PHOTO_TEMPLATES } from '@/lib/photo-templates';

export const photoTemplateIds = PHOTO_TEMPLATES.map((t) => t.id) as [
    'dark-brutalism',
    'heritage-rustic',
    'clean-modern',
    'neutral-editorial'
];

export const PhotoTemplateIdSchema = z.enum(photoTemplateIds);

export const PhotoAnalyzeRequestSchema = z.object({
    dishName: z.string().trim().min(2).max(80),
    mimeType: z.string().trim().min(1).max(100),
});

export const PhotoStylizeRequestSchema = z.object({
    dishName: z.string().trim().min(2).max(80),
    templateId: PhotoTemplateIdSchema,
    mimeType: z.string().trim().min(1).max(100),
});

export type PhotoAnalyzeRequest = z.infer<typeof PhotoAnalyzeRequestSchema>;
export type PhotoStylizeRequest = z.infer<typeof PhotoStylizeRequestSchema>;

export function isValidDishName(value: string) {
    return value.trim().length >= 2 && value.trim().length <= 80;
}