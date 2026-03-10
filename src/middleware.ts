import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['en', 'ka'];
const defaultLocale = 'ka';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const pathnameHasLocale = locales.some(
        (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
    );

    if (pathnameHasLocale) {
        return NextResponse.next();
    }

    const url = request.nextUrl.clone();
    url.pathname = `/${defaultLocale}${pathname}`;
    return NextResponse.redirect(url);
}

export const config = {
    matcher: [
        '/((?!_next|api|favicon.ico|videos|logo|images|uploads|.*\\..*).*)',
    ],
};