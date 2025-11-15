import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Do not run code between createServerClient and
  // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: If you remove getClaims() and you use server-side rendering
  // with the Supabase client, your users may be randomly logged out.
  const { data } = await supabase.auth.getClaims()
  const user = data?.claims

  const isAuthRoute = request.nextUrl.pathname.startsWith('/auth')
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')

  // Redirect unauthenticated users to login
  if (!user && !isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  // Handle authenticated users
  if (user) {
    // Get user role and profile status
    const { data: profile } = await supabase
      .from('user_profile')
      .select('role, profile_status')
      .eq('id', user.sub)
      .single()

    const userRole = profile?.role
    const profileStatus = profile?.profile_status
    const currentPath = request.nextUrl.pathname
    const isProfileRoute = currentPath.startsWith('/profile')

    // Admin bypass - can access everything
    if (userRole === 'admin') {
      if (currentPath === '/') {
        const url = request.nextUrl.clone()
        url.pathname = '/admin'
        return NextResponse.redirect(url)
      }
      return supabaseResponse
    }

    // Protect admin routes from non-admins
    if (isAdminRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }

    // Enforce profile status flow for regular users
    switch (profileStatus) {
      case 'incomplete':
        if (currentPath !== '/profile/setup' && !isAuthRoute) {
          const url = request.nextUrl.clone()
          url.pathname = '/profile/setup'
          return NextResponse.redirect(url)
        }
        break

      case 'pending_review':
        if (currentPath !== '/profile/pending' && !isAuthRoute) {
          const url = request.nextUrl.clone()
          url.pathname = '/profile/pending'
          return NextResponse.redirect(url)
        }
        break

      case 'rejected':
        // Allow access to both rejected page and setup page for editing
        if (currentPath !== '/profile/rejected' && currentPath !== '/profile/setup' && !isAuthRoute) {
          const url = request.nextUrl.clone()
          url.pathname = '/profile/rejected'
          return NextResponse.redirect(url)
        }
        break

      case 'approved':
        // Can access main platform
        break
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse
}
