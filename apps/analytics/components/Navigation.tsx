'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { name: 'Home', href: '/' },
  { name: 'Techniques', href: '/techniques' },
  { name: 'Meta', href: '/meta' },
  { name: 'Athletes', href: '/athletes' },
  { name: 'Teams', href: '/teams' },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold">
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                GrappleMap Insights
              </span>
            </Link>

            <div className="ml-10 hidden space-x-8 sm:flex">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? 'border-emerald-500 text-emerald-400'
                      : 'border-transparent text-slate-400 hover:border-slate-700 hover:text-slate-300'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/api/data-sources"
              className="text-sm text-slate-400 hover:text-slate-300"
            >
              Data Sources
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
