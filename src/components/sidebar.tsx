"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { DataChat } from "./data-chat";
import { signOut } from "@/lib/supabase/auth";
import { supabaseBrowserClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

const navItems = [
  { label: "Dashboard", href: "/" },
  { label: "Performance Report", href: "/reports" },
  { label: "Data Canvas", href: "/canvas" },
];

export function Sidebar() {
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Fetch user on mount
  useEffect(() => {
    const supabase = supabaseBrowserClient();
    
    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setMenuOpen(false);
    await signOut();
  };

  // Get display name from user metadata or email
  const displayName = user?.user_metadata?.full_name || 
                      user?.email?.split("@")[0] || 
                      "User";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    function handleKeydown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeydown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeydown);
    };
  }, []);

  return (
    <aside className="hidden h-full w-72 flex-col overflow-y-auto border-r border-jackson-cream-dark bg-jackson-white lg:flex">
      {/* Jackson Logo at Top */}
      <div className="flex items-center px-6 py-6">
        <Image
          src="/jackson_logo.png"
          alt="Jackson Rental Homes"
          width={180}
          height={60}
          className="h-14 w-auto object-contain"
          priority
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 pb-32">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex w-full items-center gap-3 rounded-xl px-5 py-3 text-left text-sm font-medium transition ${
                  isActive
                    ? "bg-jackson-charcoal text-white shadow-sm"
                    : "text-jackson-charcoal hover:bg-jackson-cream"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="px-4 pb-6">
        <div className="space-y-3">
          {/* AI Data Chat */}
          <DataChat />
          
          {/* User Profile */}
          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="flex w-full items-center gap-3 rounded-xl border border-jackson-cream-dark bg-jackson-white px-4 py-3 text-left transition hover:border-jackson-green/30 hover:shadow-md"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
            >
              {/* User Icon */}
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-jackson-green text-white">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="10"
                    cy="7"
                    r="3.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M3.5 17C4.5 13.5 7 11.5 10 11.5C13 11.5 15.5 13.5 16.5 17"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              
              {/* User Name */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-jackson-charcoal truncate capitalize">
                  {displayName}
                </p>
              </div>

              {/* Chevron */}
              <svg
                className={`h-4 w-4 flex-shrink-0 text-jackson-text-muted transform transition ${
                  menuOpen ? "rotate-180" : ""
                }`}
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M5 7.5L10 12.5L15 7.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {menuOpen && (
              <div className="absolute bottom-[calc(100%+8px)] left-0 right-0 z-10 min-w-[260px] rounded-2xl border border-jackson-charcoal bg-jackson-charcoal py-2 text-white shadow-2xl">
                {/* Account Header */}
                <div className="px-4 py-3">
                  <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-jackson-cream-dark/60">
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle
                        cx="10"
                        cy="7"
                        r="3"
                        stroke="currentColor"
                        strokeWidth="1.2"
                      />
                      <path
                        d="M4.5 16C5.22 13.89 7.42 12.5 10 12.5C12.58 12.5 14.78 13.89 15.5 16"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                      />
                    </svg>
                    Account
                  </div>
                  <p className="mt-2 break-all text-sm font-medium text-white">
                    {user?.email || "Not signed in"}
                  </p>
                </div>

                <div className="my-2 h-px bg-jackson-charcoal-light" />

                {/* Log out Button */}
                <div className="px-2 pb-1">
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-white transition hover:bg-jackson-charcoal-light disabled:opacity-50"
                  >
                    {isLoggingOut ? (
                      <svg
                        className="h-5 w-5 animate-spin text-slate-300"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-5 w-5 text-slate-300"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M9 5.5V4.5C9 3.67 9.67 3 10.5 3H15.5C16.33 3 17 3.67 17 4.5V15.5C17 16.33 16.33 17 15.5 17H10.5C9.67 17 9 16.33 9 15.5V14.5"
                          stroke="currentColor"
                          strokeWidth="1.3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M4 10H11"
                          stroke="currentColor"
                          strokeWidth="1.3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M6.5 7.5L4 10L6.5 12.5"
                          stroke="currentColor"
                          strokeWidth="1.3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                    <span>{isLoggingOut ? "Signing out..." : "Log out"}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
