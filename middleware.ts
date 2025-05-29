import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'


// Public API routes that don't require authentication
const isPublicApiRoute = createRouteMatcher(["/api/widget/(.*)", "/api/chat/(.*)", "/api/survey/(.*)"])

// Public pages that don't require authentication
const isPublicPage = createRouteMatcher(["/", "/chat/(.*)", "/survey/(.*)"])

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicApiRoute(req) && !isPublicPage(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}

