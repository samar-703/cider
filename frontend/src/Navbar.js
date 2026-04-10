import React from "react";
import { HamburgerMenuIcon } from "@radix-ui/react-icons";
import { Menu } from "lucide-react";
import { clerkEnabled, SignInAction, useAuthState, UserMenu } from "./auth";

function Navbar({ onMenuClick, showMenuButton = false, variant = "landing" }) {
  const { isSignedIn } = useAuthState();

  if (variant === "app") {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {showMenuButton && (
              <button
                onClick={onMenuClick}
                className="p-2 bg-gradient-to-br from-purple-500/10 to-indigo-600/10 backdrop-blur-sm border text-purple-400 rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-purple-500/20 hover:border-purple-400/50 active:scale-95"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <h1 className="text-2xl font-bold text-white">Cider</h1>
          </div>

          <div className="flex items-center gap-4">
            {isSignedIn ? (
              <>
                <span className="text-zinc-400 text-sm hidden sm:block">
                  Welcome back!
                </span>
                <UserMenu
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "w-10 h-10",
                    },
                  }}
                />
              </>
            ) : clerkEnabled ? (
              <SignInAction>
                <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200">
                  Sign In
                </button>
              </SignInAction>
            ) : null}
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-white/5 bg-black/40 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          {showMenuButton && (
            <button
              onClick={onMenuClick}
              className="rounded-lg border border-white/10 bg-white/5 p-2 text-white transition-all duration-300 hover:scale-110 hover:bg-white/10"
            >
              <HamburgerMenuIcon className="h-5 w-5" />
            </button>
          )}
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-cyan-400 animate-pulse" />
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-400">
                Cider
              </p>
            </div>
            <h1 className="mt-0.5 text-sm font-semibold text-[#f8fafc]">
              Random video chat for spontaneous conversations
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isSignedIn ? (
            <>
              <span className="hidden text-sm text-[#94a3b8] sm:block">
                Welcome back!
              </span>
              <UserMenu
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-9 h-9 border border-white/10 shadow-md",
                  },
                }}
              />
            </>
          ) : clerkEnabled ? (
            <SignInAction>
              <button className="rounded-full bg-white px-5 py-2 text-sm font-bold text-black transition-all hover:bg-gray-200 hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                Sign In
              </button>
            </SignInAction>
          ) : null}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
