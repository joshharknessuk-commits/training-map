'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GrappleMapWordmark } from './grapple-map-wordmark';

export interface AppHeaderProps {
  user?: {
    name?: string | null;
    email?: string | null;
  } | null;
  onSignOut?: () => void;
  showNetworkLinks?: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ user, onSignOut, showNetworkLinks = false }) => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Don't show on auth pages
  if (pathname?.startsWith('/auth')) {
    return null;
  }

  const NavLink = ({ href, children, external = false }: { href: string; children: React.ReactNode; external?: boolean }) => {
    const isActive = pathname === href;

    if (external) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-3 py-2 text-sm font-semibold text-neutral-700 transition-all duration-200 hover:text-blue-600"
        >
          {children}
        </a>
      );
    }

    return (
      <Link
        href={href}
        className={`
          inline-flex items-center px-3 py-2 text-sm font-semibold transition-all duration-200
          ${isActive
            ? 'text-blue-600 border-b-2 border-blue-600'
            : 'text-neutral-700 border-b-2 border-transparent hover:text-blue-600 hover:border-neutral-300'
          }
        `}
      >
        {children}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center transition-opacity hover:opacity-80">
              <GrappleMapWordmark />
            </Link>

            {/* Desktop Navigation */}
            {user && (
              <div className="hidden items-center gap-1 md:flex">
                <NavLink href="/discover">Discover</NavLink>
                <NavLink href="/classes">Classes</NavLink>
                <NavLink href="/bookings">Bookings</NavLink>
                <NavLink href="/feed">Feed</NavLink>
                {showNetworkLinks && (
                  <>
                    <div className="mx-2 h-6 w-px bg-neutral-200" />
                    <NavLink href="/network">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500"></span>
                        </span>
                        Network
                      </span>
                    </NavLink>
                    <NavLink href="/network/checkin">Check-in</NavLink>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="hidden items-center gap-3 md:flex">
                <Link
                  href="/profile"
                  className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-neutral-700 transition-all duration-200 hover:bg-neutral-100"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-xs font-bold text-white shadow-sm">
                    {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <span className="hidden lg:inline">{user.name || 'Profile'}</span>
                </Link>
                <button
                  onClick={onSignOut}
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-neutral-700 transition-all duration-200 hover:bg-neutral-100"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="hidden items-center gap-3 md:flex">
                <Link
                  href="/auth/signin"
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-neutral-900 transition-all duration-200 hover:bg-neutral-100"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="group relative inline-flex items-center justify-center overflow-hidden rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition-all duration-200 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/40"
                >
                  <span className="relative">Sign Up</span>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-xl p-2 text-neutral-700 hover:bg-neutral-100 md:hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="border-t border-neutral-200 py-4 md:hidden">
            <div className="flex flex-col gap-2">
              {user ? (
                <>
                  <Link
                    href="/discover"
                    className="rounded-xl px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Discover
                  </Link>
                  <Link
                    href="/classes"
                    className="rounded-xl px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Classes
                  </Link>
                  <Link
                    href="/bookings"
                    className="rounded-xl px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Bookings
                  </Link>
                  <Link
                    href="/feed"
                    className="rounded-xl px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Feed
                  </Link>
                  {showNetworkLinks && (
                    <>
                      <div className="my-2 h-px bg-neutral-200" />
                      <Link
                        href="/network"
                        className="rounded-xl px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Network
                      </Link>
                      <Link
                        href="/network/checkin"
                        className="rounded-xl px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-100"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Check-in
                      </Link>
                    </>
                  )}
                  <div className="my-2 h-px bg-neutral-200" />
                  <Link
                    href="/profile"
                    className="rounded-xl px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      onSignOut?.();
                      setMobileMenuOpen(false);
                    }}
                    className="rounded-xl px-4 py-2 text-left text-sm font-semibold text-neutral-900 hover:bg-neutral-100"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/signin"
                    className="rounded-xl px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="rounded-xl bg-blue-600 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-blue-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
