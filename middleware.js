import { NextResponse } from 'next/server';

export function middleware(request) {
    const token = request.cookies.get('token')?.value;
    
    // Public paths that don't require authentication
    const publicPaths = ['/', '/login', '/signup'];
    const isPublicPath = publicPaths.includes(request.nextUrl.pathname);

    if (!token && !isPublicPath) {
        // Redirect to login if no token and trying to access protected route
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (token && isPublicPath) {
        // Redirect to dashboard if token exists and trying to access public route
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
    matcher: [
        '/login',
        '/signup',
        '/dashboard/:path*',
        '/api/interviews/:path*'
    ]
}