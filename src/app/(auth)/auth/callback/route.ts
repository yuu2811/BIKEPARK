import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const redirect = searchParams.get('redirect') || '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Check if profile exists (new user needs onboarding)
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', user.id)
          .single()

        // If profile display_name is just 'Rider', redirect to onboarding
        if (!profile || profile.display_name === 'Rider') {
          return NextResponse.redirect(`${origin}/onboarding?redirect=${encodeURIComponent(redirect)}`)
        }
      }

      return NextResponse.redirect(`${origin}${redirect}`)
    }
  }

  // Auth error - redirect to login
  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
