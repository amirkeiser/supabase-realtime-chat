import { SignUpForm } from "@/services/supabase/components/sign-up-form";
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign Up - Maknoon",
  description: "Create your account",
}

export default function Page() {
  return (
    <div className="flex min-h-screen-with-header w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <SignUpForm />
      </div>
    </div>
  );
}
