import Redis, { type RedisOptions } from 'ioredis';

const globalForRedis = globalThis as typeof globalThis & {
    __maitriseRedisClient?: Redis;
};

const redisOptions: RedisOptions = {
    lazyConnect: true,
    enableOfflineQueue: false,
    maxRetriesPerRequest: 1,
    retryStrategy(times) {
        if (times > 3) {
            return null;
        }

        return Math.min(times * 100, 2000);
    },
};

export function getRedisClient(): Redis {
    if (!globalForRedis.__maitriseRedisClient) {
        const client = new Redis(redisOptions);
        client.on('error', () => {
            // Ignore connection noise and let callers fall back gracefully.
        });
        globalForRedis.__maitriseRedisClient = client;
    }

    return globalForRedis.__maitriseRedisClient;
}

export async function ensureRedisReady(client: Redis): Promise<boolean> {
    const initialStatus = client.status;

    if (initialStatus === 'ready') {
        return true;
    }

    if (initialStatus !== 'wait') {
        return false;
    }

    try {
        await client.connect();
    } catch {
        return false;
    }

    const connectedStatus = client.status;
    if (connectedStatus === 'ready') {
        return true;
    }

    if (connectedStatus === 'connect') {
        try {
            await new Promise<void>((resolve, reject) => {
                const onReady = () => {
                    cleanup();
                    resolve();
                };
                const onError = () => {
                    cleanup();
                    reject(new Error('Redis failed to become ready.'));
                };
                const cleanup = () => {
                    client.off('ready', onReady);
                    client.off('error', onError);
                };

                client.once('ready', onReady);
                client.once('error', onError);
            });

            return client.status === 'ready';
        } catch {
            return false;
        }
    }

    return false;
}
