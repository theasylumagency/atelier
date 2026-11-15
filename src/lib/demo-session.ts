import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { cookies, headers } from 'next/headers';
import type { Dish, DishFile } from '@/lib/types';
import type { DemoTableId, FloorStateFile, FloorTableState } from '@/lib/floor-sync';
import {
    createEmptyFloorState,
    isValidDemoSessionId,
    normalizeFloorStateFile,
    normalizeFloorTableState,
} from '@/lib/floor-sync';

const DEMO_COOKIE = 'maitrise_demo_session';
const DEMO_HEADER = 'x-maitrise-demo-session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours

interface DemoSessionMeta {
    lastPublishedAt: string | null;
}

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

function getSessionMetaPath(sessionId: string) {
    return path.join(getSessionDir(sessionId), 'meta.json');
}

function getSessionFloorStatePath(sessionId: string) {
    return path.join(getSessionDir(sessionId), 'floor-state.json');
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

    const headerStore = await headers();
    const injected = headerStore.get(DEMO_HEADER);

    if (isValidDemoSessionId(injected)) {
        return injected;
    }

    return makeSessionId();
}

export async function resolveDemoSessionId(sessionId?: string) {
    if (isValidDemoSessionId(sessionId)) {
        return sessionId;
    }

    return getOrCreateDemoSessionId();
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

async function ensureSessionFloorStateFile(sessionId: string) {
    const floorStatePath = getSessionFloorStatePath(sessionId);

    try {
        await fs.access(floorStatePath);
    } catch {
        await writeJsonFile(floorStatePath, createEmptyFloorState());
    }

    const current = await readJsonFile<FloorStateFile | null>(floorStatePath, null);
    const normalized = normalizeFloorStateFile(current ?? undefined);

    if (JSON.stringify(current) !== JSON.stringify(normalized)) {
        await writeJsonFile(floorStatePath, normalized);
    }

    return floorStatePath;
}

export async function prepareDemoSession(sessionId?: string) {
    const resolvedSessionId = await resolveDemoSessionId(sessionId);
    await ensureDir(getSessionDir(resolvedSessionId));

    await Promise.all([
        ensureDemoSessionFile(resolvedSessionId),
        ensureSessionMetaFile(resolvedSessionId),
        ensureSessionFloorStateFile(resolvedSessionId),
    ]);

    return resolvedSessionId;
}

export async function readSessionDishes(sessionId?: string): Promise<DishFile> {
    const resolvedSessionId = await prepareDemoSession(sessionId);
    const sessionFile = getSessionDishesPath(resolvedSessionId);
    return readJsonFile<DishFile>(sessionFile, { items: [] });
}

export async function updateSessionDish(
    id: string,
    patch: Partial<Dish>,
    sessionId?: string
): Promise<DishFile> {
    const resolvedSessionId = await prepareDemoSession(sessionId);
    const sessionFile = getSessionDishesPath(resolvedSessionId);
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

export async function createSessionDish(newDish: Dish, sessionId?: string): Promise<DishFile> {
    const resolvedSessionId = await prepareDemoSession(sessionId);
    const sessionFile = getSessionDishesPath(resolvedSessionId);
    const current = await readJsonFile<DishFile>(sessionFile, { items: [] });

    const updated: DishFile = {
        updatedAt: new Date().toISOString(),
        items: [...current.items, newDish],
    };

    await writeJsonFile(sessionFile, updated);
    return updated;
}

export async function resetSessionDishes(sessionId?: string): Promise<DishFile> {
    const resolvedSessionId = await prepareDemoSession(sessionId);
    const sessionFile = getSessionDishesPath(resolvedSessionId);
    const seed = await readJsonFile<DishFile>(getSeedPath(), { items: [] });

    const resetData: DishFile = {
        updatedAt: new Date().toISOString(),
        items: seed.items ?? [],
    };

    await writeJsonFile(sessionFile, resetData);

    const metaPath = await ensureSessionMetaFile(resolvedSessionId);
    await writeJsonFile(metaPath, { lastPublishedAt: null });

    return resetData;
}

export async function readSessionFloorState(sessionId?: string): Promise<FloorStateFile> {
    const resolvedSessionId = await prepareDemoSession(sessionId);
    const floorStatePath = await ensureSessionFloorStateFile(resolvedSessionId);
    const current = await readJsonFile<FloorStateFile | null>(floorStatePath, null);
    const normalized = normalizeFloorStateFile(current ?? undefined);

    if (JSON.stringify(current) !== JSON.stringify(normalized)) {
        await writeJsonFile(floorStatePath, normalized);
    }

    return normalized;
}

export async function updateSessionFloorTable(
    tableId: DemoTableId,
    patch: Partial<FloorTableState>,
    sessionId?: string
): Promise<FloorTableState> {
    const resolvedSessionId = await prepareDemoSession(sessionId);
    const floorStatePath = await ensureSessionFloorStateFile(resolvedSessionId);
    const current = normalizeFloorStateFile(
        await readJsonFile<FloorStateFile | null>(floorStatePath, null) ?? undefined
    );
    const now = new Date().toISOString();

    const updatedTable = normalizeFloorTableState(
        tableId,
        {
            ...current.tables[tableId],
            ...patch,
            updatedAt: now,
        },
        now
    );

    const updatedState: FloorStateFile = {
        updatedAt: now,
        tables: {
            ...current.tables,
            [tableId]: updatedTable,
        },
    };

    await writeJsonFile(floorStatePath, updatedState);
    return updatedTable;
}

export async function resetSessionFloorState(sessionId?: string) {
    const resolvedSessionId = await prepareDemoSession(sessionId);
    const floorStatePath = await ensureSessionFloorStateFile(resolvedSessionId);
    const resetState = createEmptyFloorState();

    await writeJsonFile(floorStatePath, resetState);
    return resetState;
}

export async function readSessionMeta(sessionId?: string): Promise<DemoSessionMeta> {
    const resolvedSessionId = await prepareDemoSession(sessionId);
    const metaPath = await ensureSessionMetaFile(resolvedSessionId);

    return readJsonFile<DemoSessionMeta>(metaPath, {
        lastPublishedAt: null,
    });
}

export async function markSessionPublished(sessionId?: string): Promise<DemoSessionMeta> {
    const resolvedSessionId = await prepareDemoSession(sessionId);
    const metaPath = await ensureSessionMetaFile(resolvedSessionId);

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
