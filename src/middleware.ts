import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Force dynamic rendering for dashboard routes
  // Prevent static generation by setting cache headers
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    response.headers.set('Cache-Control', 'no-store, must-revalidate')
    response.headers.set('CDN-Cache-Control', 'no-store')
    response.headers.set('Vercel-CDN-Cache-Control', 'no-store')
  }
  
  return response
}

export const config = {
  matcher: '/dashboard/:path*',
}
