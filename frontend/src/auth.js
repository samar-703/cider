import React from "react";
import {
  ClerkProvider,
  SignInButton as ClerkSignInButton,
  SignedIn as ClerkSignedIn,
  SignedOut as ClerkSignedOut,
  UserButton as ClerkUserButton,
  useUser as useClerkUser,
} from "@clerk/clerk-react";

const clerkPublishableKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;
const clerkKeyLooksValid =
  typeof clerkPublishableKey === "string" &&
  /^pk_(test|live)_/.test(clerkPublishableKey);

export const clerkEnabled = clerkKeyLooksValid;

if (clerkPublishableKey && !clerkKeyLooksValid) {
  console.warn(
    "Clerk disabled locally because REACT_APP_CLERK_PUBLISHABLE_KEY is not a valid publishable key."
  );
}

const useResolvedUser = clerkEnabled
  ? useClerkUser
  : () => ({
      isLoaded: true,
      isSignedIn: false,
      user: null,
    });

export function AppAuthProvider({ children }) {
  if (!clerkEnabled) {
    return children;
  }

  return (
    <ClerkProvider publishableKey={clerkPublishableKey}>{children}</ClerkProvider>
  );
}

export function useAuthState() {
  return useResolvedUser();
}

export function SignedIn({ children }) {
  if (!clerkEnabled) {
    return null;
  }

  return <ClerkSignedIn>{children}</ClerkSignedIn>;
}

export function SignedOut({ children }) {
  if (!clerkEnabled) {
    return children;
  }

  return <ClerkSignedOut>{children}</ClerkSignedOut>;
}

export function SignInAction({ children, fallback = null }) {
  if (!clerkEnabled) {
    return fallback;
  }

  return <ClerkSignInButton mode="modal">{children}</ClerkSignInButton>;
}

export function UserMenu(props) {
  if (!clerkEnabled) {
    return null;
  }

  return <ClerkUserButton {...props} />;
}
