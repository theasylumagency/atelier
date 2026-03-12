import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { cookies } from 'next/headers';
import type { Dish, DishFile } from '@/lib/types';

const DEMO_COOKIE = 'maitrise_demo_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours

function getSeedPath() {
    return path.join(process.cwd(), 'data', 'dishes.json');
}

function getSessionsRoot() {
    return path.join(process.cwd(), 'data', 'demo-sessions');
}

function getSessionDir(sessionId: string) {
    return path.join(getSessionsRoot(), sessionId);
}

function getSessionDishesPath(sessionId: string) {
    return path.join(getSessionDir(sessionId), 'dishes.json');
}

async function ensureDir(dirPath: string) {
    await fs.mkdir(dirPath, { recursive: true });
}

async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
    try {
        const raw = await fs.readFile(filePath, 'utf8');
        return JSON.parse(raw) as T;
    } catch {
        return fallback;
    }
}

async function writeJsonFile(filePath: string, data: unknown) {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function makeSessionId() {
    return crypto.randomBytes(16).toString('hex');
}

export async function getOrCreateDemoSessionId() {
    const cookieStore = await cookies();
    const existing = cookieStore.get(DEMO_COOKIE)?.value;

    if (existing) {
        return existing;
    }

    const sessionId = makeSessionId();

    cookieStore.set(DEMO_COOKIE, sessionId, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: SESSION_TTL_MS / 1000,
    });

    return sessionId;
}

export async function ensureDemoSessionFile(sessionId: string) {
    const sessionDir = getSessionDir(sessionId);
    const sessionFile = getSessionDishesPath(sessionId);

    await ensureDir(sessionDir);

    try {
        await fs.access(sessionFile);
    } catch {
        const seed = await readJsonFile<DishFile>(getSeedPath(), { items: [] });
        const seeded: DishFile = {
            updatedAt: new Date().toISOString(),
            items: seed.items ?? [],
        };
        await writeJsonFile(sessionFile, seeded);
    }

    return sessionFile;
}

export async function readSessionDishes(): Promise<DishFile> {
    const sessionId = await getOrCreateDemoSessionId();
    const sessionFile = await ensureDemoSessionFile(sessionId);
    return readJsonFile<DishFile>(sessionFile, { items: [] });
}

export async function updateSessionDish(id: string, patch: Partial<Dish>): Promise<DishFile> {
    const sessionId = await getOrCreateDemoSessionId();
    const sessionFile = await ensureDemoSessionFile(sessionId);
    const current = await readJsonFile<DishFile>(sessionFile, { items: [] });

    const nextItems = current.items.map((dish) =>
        dish.id === id
            ? {
                ...dish,
                ...patch,
                id: dish.id,
            }
            : dish
    );

    const updated: DishFile = {
        updatedAt: new Date().toISOString(),
        items: nextItems,
    };

    await writeJsonFile(sessionFile, updated);
    return updated;
}

export async function createSessionDish(newDish: Dish): Promise<DishFile> {
    const sessionId = await getOrCreateDemoSessionId();
    const sessionFile = await ensureDemoSessionFile(sessionId);
    const current = await readJsonFile<DishFile>(sessionFile, { items: [] });

    const updated: DishFile = {
        updatedAt: new Date().toISOString(),
        items: [...current.items, newDish],
    };

    await writeJsonFile(sessionFile, updated);
    return updated;
}

export async function resetSessionDishes(): Promise<DishFile> {
    const sessionId = await getOrCreateDemoSessionId();
    const sessionFile = await ensureDemoSessionFile(sessionId);
    const seed = await readJsonFile<DishFile>(getSeedPath(), { items: [] });

    const resetData: DishFile = {
        updatedAt: new Date().toISOString(),
        items: seed.items ?? [],
    };

    await writeJsonFile(sessionFile, resetData);

    const metaPath = await ensureSessionMetaFile(sessionId);
    await writeJsonFile(metaPath, { lastPublishedAt: null });

    return resetData;
}
interface DemoSessionMeta {
    lastPublishedAt: string | null;
}

function getSessionMetaPath(sessionId: string) {
    return path.join(getSessionDir(sessionId), 'meta.json');
}

async function ensureSessionMetaFile(sessionId: string) {
    const metaPath = getSessionMetaPath(sessionId);

    try {
        await fs.access(metaPath);
    } catch {
        const initialMeta: DemoSessionMeta = {
            lastPublishedAt: null,
        };
        await writeJsonFile(metaPath, initialMeta);
    }

    return metaPath;
}

export async function readSessionMeta(): Promise<DemoSessionMeta> {
    const sessionId = await getOrCreateDemoSessionId();
    await ensureDir(getSessionDir(sessionId));
    const metaPath = await ensureSessionMetaFile(sessionId);

    return readJsonFile<DemoSessionMeta>(metaPath, {
        lastPublishedAt: null,
    });
}

export async function markSessionPublished(): Promise<DemoSessionMeta> {
    const sessionId = await getOrCreateDemoSessionId();
    await ensureDir(getSessionDir(sessionId));
    const metaPath = await ensureSessionMetaFile(sessionId);

    const meta: DemoSessionMeta = {
        lastPublishedAt: new Date().toISOString(),
    };

    await writeJsonFile(metaPath, meta);
    return meta;
}
export async function cleanupExpiredDemoSessions() {
    const root = getSessionsRoot();
    await ensureDir(root);

    const entries = await fs.readdir(root, { withFileTypes: true });
    const now = Date.now();

    await Promise.all(
        entries
            .filter((entry) => entry.isDirectory())
            .map(async (entry) => {
                const dirPath = path.join(root, entry.name);
                try {
                    const stat = await fs.stat(dirPath);
                    if (now - stat.mtimeMs > SESSION_TTL_MS) {
                        await fs.rm(dirPath, { recursive: true, force: true });
                    }
                } catch {
                    // ignore cleanup errors
                }
            })
    );
}