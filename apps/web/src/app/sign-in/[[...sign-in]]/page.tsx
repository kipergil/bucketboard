import { SignIn } from '@clerk/nextjs';

/**
 * Social providers and their display order (Google first, per spec) are
 * configured in the Clerk Dashboard under User & Authentication > Social
 * Connections — enabling Apple/GitHub/Facebook later is a config change
 * only, no code changes here.
 */
export default function SignInPage() {
  return (
    <div className="flex flex-1 items-center justify-center py-16">
      <SignIn />
    </div>
  );
}
