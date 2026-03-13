const DISH_UPLOAD_API_PREFIX = '/api/uploads/dishes/';
const LEGACY_DISH_UPLOAD_PREFIX = '/uploads/dishes/';

function tryDecode(value: string) {
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
}

function isRemotePhotoUrl(value: string) {
    return (
        value.startsWith('http://') ||
        value.startsWith('https://') ||
        value.startsWith('data:') ||
        value.startsWith('blob:')
    );
}

function extractKnownDishFilename(value: string) {
    if (value.startsWith(DISH_UPLOAD_API_PREFIX)) {
        return tryDecode(value.slice(DISH_UPLOAD_API_PREFIX.length));
    }

    if (value.startsWith(LEGACY_DISH_UPLOAD_PREFIX)) {
        return tryDecode(value.slice(LEGACY_DISH_UPLOAD_PREFIX.length));
    }

    return null;
}

export function normalizeDishPhotoRef(raw?: string | null) {
    const value = raw?.trim();

    if (!value) {
        return '';
    }

    const filename = extractKnownDishFilename(value);
    if (filename) {
        return filename;
    }

    return value;
}

export function resolveDishPhotoSrc(raw?: string | null) {
    const value = normalizeDishPhotoRef(raw);

    if (!value) {
        return null;
    }

    if (isRemotePhotoUrl(value)) {
        return value;
    }

    if (value.startsWith('/')) {
        return value;
    }

    return `${DISH_UPLOAD_API_PREFIX}${encodeURIComponent(value)}`;
}
