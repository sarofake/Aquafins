'use client';

import { Clock } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function ComingSoonPage({ icon: Icon, title }) {
  const { t } = useLanguage();

  return (
    <div>
      {/* Page Title Banner */}
      <div className="bg-gradient-to-b from-cyan-500/10 via-brand-card to-brand-dark py-12 border-b border-cyan-500/30">
        <div className="max-w-7xl mx-auto px-4 lg:px-12 text-center">
          <div className="inline-flex items-center gap-2 bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 px-3.5 py-1 rounded-full text-xs font-bold mb-3 shadow-sm">
            <Icon className="w-4 h-4" />
            <span>{title}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-main mb-3">
            {title}
          </h1>
        </div>
      </div>

      {/* Coming Soon Content */}
      <main className="max-w-7xl mx-auto px-4 lg:px-12 py-24">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-brand-card border border-brand-border mb-6">
            <Clock className="w-12 h-12 text-cyan-400" />
          </div>
          <h2 className="text-3xl font-display font-bold text-main mb-3">
            {t('archiveComingSoonTitle')}
          </h2>
          <p className="text-muted text-sm max-w-md mx-auto">
            {t('pageComingSoonSubtitle')}
          </p>
        </div>
      </main>
    </div>
  );
}
