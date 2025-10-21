import { NextRequest, NextResponse } from 'next/server';
import { config as appConfig } from './lib/config';

const locales = appConfig?.i18n?.locales || ['en', 'ar'];
const defaultLocale = appConfig?.i18n?.defaultLocale || 'en';

// Get the preferred locale from the request
function getLocale(request: NextRequest): string {
  // Check if locale is in the pathname
  const pathname = request.nextUrl.pathname;
  
  // Ensure locales is an array before using array methods
  const localesArray = Array.isArray(locales) ? locales : ['en', 'ar'];
  
  const pathnameHasLocale = localesArray.some(
    (locale: string) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    const pathLocale = pathname.split('/')[1];
    return localesArray.includes(pathLocale) ? pathLocale : defaultLocale;
  }

  // Check Accept-Language header
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    const preferredLocales = acceptLanguage
      .split(',')
      .map((lang) => lang.split(';')[0].trim().split('-')[0])
      .filter((lang) => localesArray.includes(lang));
    
    if (preferredLocales.length > 0) {
      return preferredLocales[0];
    }
  }

  // Check cookies
  const localeCookie = request.cookies.get('locale')?.value;
  if (localeCookie && localesArray.includes(localeCookie)) {
    return localeCookie;
  }

  return defaultLocale;
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const searchParams = request.nextUrl.searchParams;

  // Skip middleware for API routes, static files, Next.js internals, and RSC requests
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/robots.txt') ||
    pathname.startsWith('/sitemap.xml') ||
    pathname.startsWith('/manifest.json') ||
    pathname.startsWith('/sw.js') ||
    pathname.startsWith('/offline.html') ||
    pathname.includes('.') ||
    searchParams.has('_rsc') // Skip RSC payload requests
  ) {
    const response = NextResponse.next();
    
    // Add performance and security headers for static assets
    if (pathname.startsWith('/_next/static/') || pathname.match(/\.(js|css|woff2?|png|jpg|jpeg|gif|svg|ico)$/)) {
      response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
      response.headers.set('X-Content-Type-Options', 'nosniff');
    }
    
    // Add compression headers for API routes
    if (pathname.startsWith('/api/')) {
      response.headers.set('Vary', 'Accept-Encoding');
    }
    
    // Add security headers
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
    response.headers.set('X-DNS-Prefetch-Control', 'on');
    
    return response;
  }

  // Check if pathname already has a locale
  const localesArray = Array.isArray(locales) ? locales : ['en', 'ar'];
  const pathnameHasLocale = localesArray.some(
    (locale: string) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    // Extract locale from pathname and set cookie
    const locale = pathname.split('/')[1];
    const response = NextResponse.next();
    
    // Add performance and security headers
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
    response.headers.set('X-DNS-Prefetch-Control', 'on');
    
    response.cookies.set('locale', locale, {
      maxAge: 60 * 60 * 24 * 365, // 1 year
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    return response;
  }

  // Redirect to locale-prefixed URL
  const locale = getLocale(request);
  const newUrl = new URL(`/${locale}${pathname}`, request.url);
  
  const response = NextResponse.redirect(newUrl);
  
  // Add performance and security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  
  response.cookies.set('locale', locale, {
    maxAge: 60 * 60 * 24 * 365, // 1 year
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
  
  return response;
}

export const config = {
  matcher: [
    // Skip all internal paths (_next), API routes, and static files
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.json|sw.js|offline.html).*)',
  ],
};