import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { z } from 'zod';

export const runtime = 'nodejs';

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 6;
const requestLog = new Map<string, number[]>();

// 1. Updated Schema to catch the 4 new modular fields
const RequestSchema = z.object({
    dishName: z.string().trim().min(2).max(80),
    angle: z.string().trim(),
    lighting: z.string().trim(),
    setting: z.string().trim(),
    styling: z.string().trim(),
});

function getClientKey(req: NextRequest): string {
    const forwardedFor = req.headers.get('x-forwarded-for');
    if (forwardedFor) {
        return forwardedFor.split(',')[0].trim();
    }
    return 'local';
}

function isRateLimited(key: string): boolean {
    const now = Date.now();
    const recent = (requestLog.get(key) ?? []).filter(
        (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS
    );

    recent.push(now);
    requestLog.set(key, recent);

    return recent.length > RATE_LIMIT_MAX;
}

function sanitizePromptValue(value: string): string {
    return value.replace(/[<>`$]/g, '').replace(/\s+/g, ' ').trim();
}

// 2. The "Digital Studio" Prompt Engine
function buildPrompt(dishName: string, angle: string, lighting: string, setting: string, styling: string) {
    const safeDishName = sanitizePromptValue(dishName);

    // Dictionaries translating UI choices into professional photography jargon
    const angles: Record<string, string> = {
        '45-deg': 'Diner POV, 45-degree angle, showing the appetizing depth of the dish.',
        'overhead': 'Perfect 90-degree top-down overhead shot, flatlay style, perfect geometric precision.',
        'macro': 'Hero macro shot, getting right down to eye level with the food, highlighting height, layers, and texture.'
    };

    const lightings: Record<string, string> = {
        'harsh': 'Harsh, direct directional sunlight creating sharp, defined shadows. Bright, stark, and ultra-modern.',
        'moody': 'Cinematic chiaroscuro lighting, single directional softbox light. Deep shadows, rich contrast, moody and expensive.',
        'soft': 'Soft, diffused natural daylight coming from a large window. Very soft shadows, bright, clean, airy, and inviting.'
    };

    const settings: Record<string, string> = {
        'concrete': 'Plated on a stark, pure light-grey textured concrete surface. Zero tabletop clutter.',
        'dark-slate': 'Plated elegantly on a dark, matte ceramic plate resting on a dark slate table.',
        'white-linen': 'Plated on pristine white, slightly textured ceramics resting on a light, whitewashed oak table with soft linen.'
    };

    const stylings: Record<string, string> = {
        'minimalist': 'Extreme minimalist plating. Just the dish, zero distractions. Ample negative space to let the dish breathe.',
        'michelin': 'Michelin-star food styling, exquisite precision, tweezers-placed micro-herbs, perfect sauce drops.',
        'messy': 'Lived-in, organic and messy styling. A casual linen napkin, scattered crumbs, a pinch of coarse sea salt on the table.'
    };

    // Fallbacks just in case the UI sends an unexpected string
    const selectedAngle = angles[angle] || angles['45-deg'];
    const selectedLighting = lightings[lighting] || lightings['harsh'];
    const selectedSetting = settings[setting] || settings['concrete'];
    const selectedStyling = stylings[styling] || stylings['minimalist'];

    return [
        `A breathtaking, award-winning culinary photograph of exactly this dish: ${safeDishName}.`,
        '',
        '--- DIGITAL STUDIO PARAMETERS ---',
        `- Camera Angle: ${selectedAngle}`,
        `- Lighting & Atmosphere: ${selectedLighting}`,
        `- Plating & Background: ${selectedSetting}`,
        `- Styling Details: ${selectedStyling}`,
        '',
        '--- STRICT PHOTOGRAPHIC REQUIREMENTS ---',
        '- Shot on medium format camera, 100mm macro lens, f/2.8 aperture for beautiful bokeh.',
        '- Razor-sharp focus on the intricate textures of the food.',
        '- Exclusions: Single plated dish ONLY. No hands, no people, no text, no logos, no surreal garnishes.',
        '- Quality: 8k resolution, photorealistic, upscale editorial restaurant photography.',
    ].join('\n');
}

function getUploadsDir() {
    return path.join(process.cwd(), 'public', 'uploads', 'dishes');
}

async function ensureUploadsDir() {
    await fs.mkdir(getUploadsDir(), { recursive: true });
}

function makeBaseName() {
    return `dish_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;
}

function extractImageBase64(response: any): string | null {
    const parts = response?.candidates?.[0]?.content?.parts ?? [];
    for (const part of parts) {
        if (part?.inlineData?.data) {
            return part.inlineData.data as string;
        }
    }
    return null;
}

async function saveOptimizedWebpVariants(imageBuffer: Buffer) {
    await ensureUploadsDir();

    const baseName = makeBaseName();
    const fullFilename = `${baseName}.webp`;
    const smallFilename = `${baseName}_sm.webp`;

    const fullPath = path.join(getUploadsDir(), fullFilename);
    const smallPath = path.join(getUploadsDir(), smallFilename);

    await sharp(imageBuffer)
        .rotate()
        .resize({ width: 896, height: 1152, fit: 'cover', position: 'centre', withoutEnlargement: true })
        .webp({ quality: 80, effort: 6 })
        .toFile(fullPath);

    await sharp(imageBuffer)
        .rotate()
        .resize({ width: 448, height: 576, fit: 'cover', position: 'centre', withoutEnlargement: true })
        .webp({ quality: 72, effort: 6 })
        .toFile(smallPath);

    return { small: smallFilename, full: fullFilename };
}

export async function POST(req: NextRequest) {
    try {
        if (!ai) {
            return NextResponse.json({ error: 'Google AI is not configured on the server.' }, { status: 500 });
        }

        const clientKey = getClientKey(req);
        if (isRateLimited(clientKey)) {
            return NextResponse.json({ error: 'Too many image generation requests. Please try again in a minute.' }, { status: 429 });
        }

        const formData = await req.formData();
        const rawDishName = formData.get('dishName');
        const rawAngle = formData.get('angle');
        const rawLighting = formData.get('lighting');
        const rawSetting = formData.get('setting');
        const rawStyling = formData.get('styling');

        const parsed = RequestSchema.safeParse({
            dishName: typeof rawDishName === 'string' ? rawDishName : '',
            angle: typeof rawAngle === 'string' ? rawAngle : '',
            lighting: typeof rawLighting === 'string' ? rawLighting : '',
            setting: typeof rawSetting === 'string' ? rawSetting : '',
            styling: typeof rawStyling === 'string' ? rawStyling : '',
        });

        if (!parsed.success) {
            return NextResponse.json({ error: 'Invalid photo forge payload.', details: parsed.error.flatten() }, { status: 400 });
        }

        const { dishName, angle, lighting, setting, styling } = parsed.data;
        const prompt = buildPrompt(dishName, angle, lighting, setting, styling);

        // 3. Updated to the exact model string for Gemini 3.1 Flash Image
        const response = await ai.models.generateContent({
            model: 'gemini-3.1-flash-image-preview',
            contents: prompt,
            config: {
                responseModalities: ['Image'],
                imageConfig: {
                    aspectRatio: '4:5',
                },
            },
        });

        const imageBase64 = extractImageBase64(response);

        if (!imageBase64) {
            return NextResponse.json({ error: 'Google AI did not return an image.' }, { status: 502 });
        }

        const imageBuffer = Buffer.from(imageBase64, 'base64');
        const photo = await saveOptimizedWebpVariants(imageBuffer);

        return NextResponse.json({ photo }, { status: 200 });
    } catch (error) {
        console.error('POST /api/photo-forge failed:', error);
        return NextResponse.json({ error: 'Failed to generate and save dish photo.' }, { status: 500 });
    }
}