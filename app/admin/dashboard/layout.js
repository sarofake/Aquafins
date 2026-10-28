'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Package, FolderTree, Sliders, LogOut, Loader2, LayoutDashboard, Settings } from 'lucide-react';
import { useBrand } from '@/hooks/useSiteInfo';

const navItems = [
  { href: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/dashboard/products', label: 'Products', icon: Package },
  { href: '/admin/dashboard/categories', label: 'Categories', icon: FolderTree },
  { href: '/admin/dashboard/carousel', label: 'Carousel', icon: Sliders },
  { href: '/admin/dashboard/site-info', label: 'Site Info', icon: Settings },
];

export default function DashboardLayout({ children }) {
  const brand = useBrand();
  const router = useRouter();
  const pathname = usePathname();
  const [authed, setAuthed] = useState(null);

  useEffect(() => {
    // Force light/white mode for admin dashboard
    document.documentElement.classList.add('light');

    fetch('/api/admin/me')
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) setAuthed(true);
        else router.replace('/admin');
      })
      .catch(() => router.replace('/admin'));
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin');
  };

  if (authed === null) {
    return (
      <div className="min-h-screen flex items-center justify-center text-cyan-600 bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* LEFT SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full z-20 shadow-sm">
        <div className="p-5 border-b border-slate-200">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900">{brand.name}</h1>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Admin Dashboard</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = item.href === '/admin/dashboard'
              ? pathname === '/admin/dashboard'
              : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-3 ${
                  isActive
                    ? 'bg-cyan-50 text-cyan-700 border border-cyan-200 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="flex-1">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-200">
          <button
            onClick={handleLogout}
            className="w-full bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-red-600 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* RIGHT CONTENT */}
      <main className="flex-1 ml-64 px-6 lg:px-10 py-8 min-h-screen overflow-hidden">
        {children}
      </main>
    </div>
  );
}
