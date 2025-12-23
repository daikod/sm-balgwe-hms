import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <SignUp
      // After signup, send user to our post-signup logic
      forceRedirectUrl="/patient/onboarding"
      signInUrl="/sign-in"
    />
  );
}