'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, FolderTree, Sliders, Settings, Loader2 } from 'lucide-react';

export default function DashboardOverviewPage() {
  const [stats, setStats] = useState({ products: 0, categories: 0, slides: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/counts')
      .then((r) => r.json())
      .then((data) => {
        setStats({
          products: data.products || 0,
          categories: data.categories || 0,
          slides: data.slides || 0,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center text-cyan-600">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
        <p className="text-xs text-slate-500">Loading overview...</p>
      </div>
    );
  }

  const cards = [
    { label: 'Products', count: stats.products, icon: Package, href: '/admin/dashboard/products', colorBg: 'bg-cyan-50', colorBorder: 'border-cyan-200', colorText: 'text-cyan-700' },
    { label: 'Categories', count: stats.categories, icon: FolderTree, href: '/admin/dashboard/categories', colorBg: 'bg-emerald-50', colorBorder: 'border-emerald-200', colorText: 'text-emerald-700' },
    { label: 'Carousel Banners', count: stats.slides, icon: Sliders, href: '/admin/dashboard/carousel', colorBg: 'bg-amber-50', colorBorder: 'border-amber-200', colorText: 'text-amber-700' },
    { label: 'Site Info', count: null, icon: Settings, href: '/admin/dashboard/site-info', colorBg: 'bg-violet-50', colorBorder: 'border-violet-200', colorText: 'text-violet-700' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Dashboard Overview</h2>
        <p className="text-xs text-slate-500 mt-1">Quick summary of your catalog and site content</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              href={card.href}
              className="bg-white border border-slate-200 hover:border-cyan-600/50 rounded-2xl p-6 transition-all shadow-sm hover:shadow-md group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${card.colorBg} border ${card.colorBorder} flex items-center justify-center ${card.colorText} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                {card.count !== null && <span className="text-3xl font-bold text-slate-900">{card.count}</span>}
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-cyan-600 transition-colors">{card.label}</h3>
              <p className="text-[11px] text-slate-500 mt-1">Manage {card.label.toLowerCase()} →</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
