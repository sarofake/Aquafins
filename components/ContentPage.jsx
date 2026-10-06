'use client';

import FormattedText from './FormattedText';

function Section({ section }) {
  switch (section.type) {
    case 'heading':
      return (
        <h2 className="text-2xl md:text-3xl font-display font-bold text-main pt-6">
          {section.text}
        </h2>
      );

    case 'subheading':
      return (
        <h3 className="text-lg font-bold text-main pt-2">
          {section.text}
        </h3>
      );

    case 'paragraph':
      return (
        <div className="text-sm text-muted leading-relaxed">
          <FormattedText text={section.text} />
        </div>
      );

    case 'list':
      return (
        <ul className="space-y-2 list-disc pl-5 text-sm text-muted leading-relaxed marker:text-brand-cyan">
          {section.items.map((item, idx) => (
            <li key={idx}>
              <FormattedText text={item} />
            </li>
          ))}
        </ul>
      );

    case 'note':
      return (
        <div className="bg-brand-card border border-brand-cyan/30 rounded-2xl p-5 space-y-2">
          <h3 className="text-brand-cyan font-bold text-sm uppercase tracking-wide">
            {section.title}
          </h3>
          <div className="text-sm text-muted leading-relaxed">
            <FormattedText text={section.text} />
          </div>
        </div>
      );

    case 'meta':
      return (
        <div className="text-xs text-muted italic">
          <FormattedText text={section.text} />
        </div>
      );

    default:
      return null;
  }
}

export default function ContentPage({ title, subtitle, sections }) {
  return (
    <div>
      {/* Page Banner */}
      <div className="bg-brand-card border-b border-brand-border/40 py-14">
        <div className="max-w-7xl mx-auto px-4 lg:px-12">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-main mb-3">
            {title}
          </h1>
          {subtitle ? (
            <p className="text-muted text-sm max-w-2xl">{subtitle}</p>
          ) : null}
        </div>
      </div>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 lg:px-12 py-14">
        <div className="space-y-6">
          {sections.map((section, idx) => (
            <Section key={idx} section={section} />
          ))}
        </div>
      </main>
    </div>
  );
}
