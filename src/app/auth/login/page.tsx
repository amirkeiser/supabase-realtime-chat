import { LoginForm } from "@/services/supabase/components/login-form"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Login - Maknoon",
  description: "Sign in to your account",
}

export default function Page() {
  return (
    <div className="flex min-h-screen-with-header w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  )
}
