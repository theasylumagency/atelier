import fs from 'node:fs/promises';
import path from 'node:path';

import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MIME_TYPES: Record<string, string> = {
    '.avif': 'image/avif',
    '.gif': 'image/gif',
    '.jpeg': 'image/jpeg',
    '.jpg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
};

function isSafeFilename(filename: string) {
    return /^[A-Za-z0-9._-]+$/.test(filename);
}

function getUploadDirectories() {
    return [
        path.join(process.cwd(), 'data', 'uploads', 'dishes'),
        path.join(process.cwd(), 'public', 'uploads', 'dishes'),
    ];
}

function getContentType(filename: string) {
    const extension = path.extname(filename).toLowerCase();
    return MIME_TYPES[extension] ?? 'application/octet-stream';
}

export async function GET(
    _request: Request,
    context: { params: Promise<{ filename: string }> }
) {
    const { filename } = await context.params;

    if (!isSafeFilename(filename)) {
        return NextResponse.json({ error: 'Invalid filename.' }, { status: 400 });
    }

    for (const directory of getUploadDirectories()) {
        const absolutePath = path.join(directory, filename);

        try {
            const buffer = await fs.readFile(absolutePath);

            return new NextResponse(buffer, {
                headers: {
                    'Cache-Control': 'public, max-age=31536000, immutable',
                    'Content-Type': getContentType(filename),
                },
            });
        } catch (error) {
            const code = (error as NodeJS.ErrnoException).code;
            if (code !== 'ENOENT') {
                console.error(`Failed to read upload ${filename}:`, error);
                return NextResponse.json({ error: 'Failed to read upload.' }, { status: 500 });
            }
        }
    }

    return NextResponse.json({ error: 'Upload not found.' }, { status: 404 });
}
