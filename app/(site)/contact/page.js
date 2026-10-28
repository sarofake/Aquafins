'use client';

import { Phone, MessageCircle, Globe, MapPin, Clock } from 'lucide-react';
import ContactSection from '@/components/ContactSection';
import FormattedText from '@/components/FormattedText';
import contact from '@/lib/content/contact';
import { useLanguage } from '@/context/LanguageContext';
import { useBrand, useContactInfo, useSocialLinks } from '@/hooks/useSiteInfo';
import { brandify } from '@/lib/brandText';

function FacebookIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
    </svg>
  );
}

export default function ContactPage() {
  const { lang } = useLanguage();
  const brand = useBrand();
  const contactInfo = useContactInfo();
  const socials = useSocialLinks();
  const page = contact[lang] || contact.en;

  const bx = (text) => brandify(text, brand.name);

  const channels = [
    { icon: Phone, label: page.phoneLabel, value: contactInfo.phone, href: contactInfo.phoneHref },
    {
      icon: MessageCircle,
      label: page.whatsappLabel,
      value: contactInfo.whatsappNumber,
      href: socials.whatsapp,
    },
    {
      icon: FacebookIcon,
      label: page.facebookLabel,
      value: brand.name,
      href: socials.facebook || page.facebookHref,
    },
    ...(contactInfo.website
      ? [
          {
            icon: Globe,
            label: page.websiteLabel,
            value: contactInfo.website.replace(/^https?:\/\//i, ''),
            href: contactInfo.websiteHref,
          },
        ]
      : []),
  ];

  return (
    <div>
      {/* Page Banner */}
      <div className="bg-brand-card border-b border-brand-border/40 py-14">
        <div className="max-w-7xl mx-auto px-4 lg:px-12">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-main">
            {page.title}
          </h1>
        </div>
      </div>

      {/* Intro */}
      <section className="max-w-7xl mx-auto px-4 lg:px-12 pt-14">
        <div className="max-w-3xl space-y-4">
          <h2 className="text-3xl font-display font-bold text-main">{brand.name}</h2>
          <div className="text-sm text-muted leading-relaxed">
            <FormattedText text={bx(page.intro1)} />
          </div>
          <div className="text-sm text-muted leading-relaxed">
            <FormattedText text={bx(page.intro2)} />
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="max-w-7xl mx-auto px-4 lg:px-12 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Channels */}
          <div className="bg-brand-card border border-brand-border rounded-2xl p-6">
            <h3 className="font-bold text-main mb-4">{page.channelsTitle}</h3>
            <ul className="space-y-3">
              {channels.map((channel) => {
                const IconComponent = channel.icon;
                return (
                  <li key={channel.label}>
                    <a
                      href={channel.href}
                      target={channel.href.startsWith('http') ? '_blank' : undefined}
                      rel={channel.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="flex items-center gap-3 text-sm text-muted hover:text-brand-cyan transition-colors"
                    >
                      <span className="w-8 h-8 rounded-lg bg-brand-cyan/10 border border-brand-cyan/30 flex items-center justify-center text-brand-cyan flex-shrink-0">
                        <IconComponent className="w-4 h-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-xs text-subtle">{channel.label}</span>
                        <span className="block font-semibold text-main">{channel.value}</span>
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Address */}
          <div className="bg-brand-card border border-brand-border rounded-2xl p-6">
            <h3 className="font-bold text-main mb-4">{page.addressTitle}</h3>
            <div className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-lg bg-brand-cyan/10 border border-brand-cyan/30 flex items-center justify-center text-brand-cyan flex-shrink-0">
                <MapPin className="w-4 h-4" />
              </span>
              <div className="text-sm text-muted leading-relaxed">
                <p className="font-semibold text-main">{brand.name}</p>
                <p>{contactInfo.address || page.addressCountry}</p>
              </div>
            </div>
          </div>

          {/* Hours */}
          <div className="bg-brand-card border border-brand-border rounded-2xl p-6">
            <h3 className="font-bold text-main mb-4">{page.hoursTitle}</h3>
            <div className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-lg bg-brand-cyan/10 border border-brand-cyan/30 flex items-center justify-center text-brand-cyan flex-shrink-0">
                <Clock className="w-4 h-4" />
              </span>
              <p className="text-sm text-muted leading-relaxed">{page.hoursValue}</p>
            </div>
          </div>
        </div>

        <p className="text-brand-cyan font-display text-xl md:text-2xl tracking-wide mt-10">
          {bx(page.tagline)}
        </p>
      </section>

      {/* Contact Form */}
      <ContactSection showHeader={false} showInfo={false} />
    </div>
  );
}
