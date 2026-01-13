import React from "react";
import { SignInButton, UserButton, useUser } from "@clerk/clerk-react";
import { Menu } from "lucide-react";

function Navbar({ onMenuClick, showMenuButton = false }) {
  const { isSignedIn } = useUser();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo/Brand */}
        <div className="flex items-center gap-3">
          {showMenuButton && (
            <button
              onClick={onMenuClick}
              className="p-2 bg-gradient-to-br from-purple-500/10 to-indigo-600/10 backdrop-blur-sm border border-purple-500/30 text-purple-400 rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-purple-500/20 hover:border-purple-400/50 active:scale-95"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <h1 className="text-2xl font-bold text-white">Cider</h1>
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-4">
          {isSignedIn ? (
            <>
              <span className="text-zinc-400 text-sm hidden sm:block">
                Welcome back!
              </span>
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10",
                  },
                }}
              />
            </>
          ) : (
            <SignInButton mode="modal">
              <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200">
                Sign In
              </button>
            </SignInButton>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
