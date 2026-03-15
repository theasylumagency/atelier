import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { z } from 'zod';
import Redis from 'ioredis'; // <-- Import ioredis

export const runtime = 'nodejs';

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// Initialize Redis. By default, it seamlessly connects to localhost:6379
// Initialize Redis with a retry strategy that gives up gracefully
const redis = new Redis({
    maxRetriesPerRequest: null,
    retryStrategy(times) {
        if (times > 3) return null; // Stop retrying after 3 attempts
        return Math.min(times * 50, 2000);
    }
});

// Prevent connection errors from crashing the Node process or flooding the console
redis.on('error', () => {
    // Silently handle the error. 
});

async function isRateLimited(key: string): Promise<boolean> {
    try {
        // If Redis isn't connected (e.g., local dev), safely bypass the limit
        if (redis.status !== 'ready') return false;

        const redisKey = `limit:${key}`;
        const currentCount = await redis.incr(redisKey);

        if (currentCount === 1) {
            await redis.expire(redisKey, RATE_LIMIT_WINDOW_SECONDS);
        }

        return currentCount > RATE_LIMIT_MAX;
    } catch (error) {
        // Fallback: If the DB throws an error during the check, allow the request
        return false;
    }
}

const RATE_LIMIT_WINDOW_SECONDS = 60; // 1 minute window
const RATE_LIMIT_MAX = 600; // 6 requests allowed




const requestLog = new Map<string, number[]>();

type GeneratedInlineDataPart = {
    inlineData?: {
        data?: string;
        mimeType?: string;
    };
};

type GenerateContentResponseShape = {
    candidates?: Array<{
        content?: {
            parts?: GeneratedInlineDataPart[];
        };
    }>;
};

type GenerateContentInput = string | {
    inlineData: {
        data: string;
        mimeType: string;
    };
};

const RequestSchema = z.object({
    dishName: z.string().trim().min(2).max(80),
    ingredients: z.string().trim().max(300).optional(),
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


function sanitizePromptValue(value: string): string {
    return value.replace(/[<>`$]/g, '').replace(/\s+/g, ' ').trim();
}

function buildPrompt(dishName: string, ingredients: string | undefined, angle: string, lighting: string, setting: string, styling: string) {
    const safeDishName = sanitizePromptValue(dishName);
    const safeIngredients = ingredients ? sanitizePromptValue(ingredients) : '';

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
        'dark-slate': 'Served elegantly in a dark, matte ceramic vessel appropriate for the specific dish type (e.g., a deep bowl for soups, a small ramekin or sauce boat for tkemali/sauces, a flat plate for solid mains). Resting on a dark slate table.',
        'white-linen': 'Plated on pristine white, slightly textured ceramics resting on a light, whitewashed oak table with soft linen.'
    };

    const stylings: Record<string, string> = {
        'minimalist': 'Extreme minimalist plating. Just the dish, zero distractions. Ample negative space to let the dish breathe.',
        'michelin': 'Michelin-star food styling, exquisite precision, tweezers-placed micro-herbs, perfect sauce drops.',
        'messy': 'Lived-in, organic and messy styling. A casual linen napkin, scattered crumbs, a pinch of coarse sea salt on the table.'
    };


    const selectedAngle = angles[angle] || angles['45-deg'];
    const selectedLighting = lightings[lighting] || lightings['harsh'];
    const selectedSetting = settings[setting] || settings['concrete'];
    const selectedStyling = stylings[styling] || stylings['minimalist'];
    const ingredientsInstruction = safeIngredients
        ? `- STRICT VISUAL COMPOSITION (MUST INCLUDE): Ensure these specific ingredients are visible on the plate: ${safeIngredients}`
        : '';

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
        '- COMPOSITION SAFE ZONE: The main subject (the food) MUST be placed in the absolute dead center of the frame.',
        '- NEGATIVE SPACE: Leave generous, empty padding around all four edges of the food to allow for aggressive UI cropping.',
        ingredientsInstruction,
        '- Exclusions: Single plated dish ONLY. No hands, no people, no text, no logos, no surreal garnishes.',
        '- Quality: 8k resolution, photorealistic, upscale editorial restaurant photography.',
    ].filter(Boolean).join('\n');
}

function getUploadsDir() {
    return path.join(process.cwd(), 'data', 'uploads', 'dishes');
}

async function ensureUploadsDir() {
    await fs.mkdir(getUploadsDir(), { recursive: true });
}

function makeBaseName() {
    return `dish_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;
}

function extractImageBase64(response: GenerateContentResponseShape): string | null {
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

    // 1. FULL QUALITY (1024x1024): 
    // Since the API returns a standard format, we use Sharp to encode the master WebP
    await sharp(imageBuffer)
        .webp({ quality: 90 }) // High quality for the 1600/1024px master asset
        .toFile(fullPath);

    // 2. SMALL PREVIEW (512x512): 
    // Downscale and compress heavily for the mobile thumbnail
    await sharp(imageBuffer)
        .resize({ width: 512, height: 512, fit: 'cover', position: 'centre', withoutEnlargement: true })
        .webp({ quality: 72, effort: 4 })
        .toFile(smallPath);

    return { small: smallFilename, full: fullFilename };
}

export async function POST(req: NextRequest) {
    try {
        if (!ai) {
            return NextResponse.json({ error: 'Google AI is not configured on the server.' }, { status: 500 });
        }

        const clientKey = getClientKey(req);
        if (await isRateLimited(clientKey)) {
            return NextResponse.json({ error: 'Too many image generation requests.' }, { status: 429 });
        }

        const formData = await req.formData();
        const rawDishName = formData.get('dishName');
        const rawIngredients = formData.get('ingredients');
        const rawAngle = formData.get('angle');
        const rawLighting = formData.get('lighting');
        const rawSetting = formData.get('setting');
        const rawStyling = formData.get('styling');

        const referenceFile = formData.get('referenceImage') as File | null;

        const parsed = RequestSchema.safeParse({
            dishName: typeof rawDishName === 'string' ? rawDishName : '',
            ingredients: typeof rawIngredients === 'string' ? rawIngredients : undefined,
            angle: typeof rawAngle === 'string' ? rawAngle : '',
            lighting: typeof rawLighting === 'string' ? rawLighting : '',
            setting: typeof rawSetting === 'string' ? rawSetting : '',
            styling: typeof rawStyling === 'string' ? rawStyling : '',
        });

        if (!parsed.success) {
            return NextResponse.json({ error: 'Invalid payload.' }, { status: 400 });
        }

        const { dishName, ingredients, angle, lighting, setting, styling } = parsed.data;

        let finalPrompt = buildPrompt(dishName, ingredients, angle, lighting, setting, styling);
        const contentsPayload: GenerateContentInput[] = [];

        if (referenceFile && referenceFile.size > 0) {
            const buffer = Buffer.from(await referenceFile.arrayBuffer());
            contentsPayload.push({
                inlineData: {
                    data: buffer.toString('base64'),
                    mimeType: referenceFile.type
                }
            });

            finalPrompt = `[CRITICAL INSTRUCTION: Use the attached image as the strict structural reference for the food plating and shape, but completely restyle the lighting, background, and quality according to the parameters below.]\n\n` + finalPrompt;
        }

        contentsPayload.push(finalPrompt);

        const response = await ai.models.generateContent({
            model: 'gemini-3.1-flash-image-preview',
            contents: contentsPayload,
            config: {
                // Ensure the model knows we expect both text and image formats back
                responseModalities: ['TEXT', 'IMAGE'],
                imageConfig: {
                    aspectRatio: '1:1',
                    // REMOVED: outputMimeType (SDK does not support it for this model)
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
        return NextResponse.json({ error: 'Failed to generate dish photo.' }, { status: 500 });
    }
}