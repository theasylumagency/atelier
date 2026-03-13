import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['en', 'ka'];
const defaultLocale = 'ka';
const DEMO_COOKIE = 'maitrise_demo_session';
const DEMO_HEADER = 'x-maitrise-demo-session';
const DEMO_SESSION_MAX_AGE = 60 * 60 * 24;

function makeDemoSessionId() {
    return crypto.randomUUID().replace(/-/g, '');
}

function getDemoSession(request: NextRequest) {
    const existing = request.cookies.get(DEMO_COOKIE)?.value;
    const sessionId = existing || makeDemoSessionId();

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set(DEMO_HEADER, sessionId);

    return { sessionId, requestHeaders };
}

function attachDemoSession(response: NextResponse, sessionId: string) {
    response.cookies.set(DEMO_COOKIE, sessionId, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: DEMO_SESSION_MAX_AGE,
    });
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const pathnameHasLocale = locales.some(
        (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
    );

    if (pathnameHasLocale) {
        const { sessionId, requestHeaders } = getDemoSession(request);
        const response = NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });
        attachDemoSession(response, sessionId);
        return response;
    }

    const url = request.nextUrl.clone();
    url.pathname = `/${defaultLocale}${pathname}`;
    const response = NextResponse.redirect(url);
    const { sessionId } = getDemoSession(request);
    attachDemoSession(response, sessionId);
    return response;
}

export const config = {
    matcher: [
        '/((?!_next|api|favicon.ico|videos|logo|images|uploads|.*\\..*).*)',
    ],
};
