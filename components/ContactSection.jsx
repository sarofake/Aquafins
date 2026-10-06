'use client';

import { useState } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  MessageSquare, 
  User, 
  Tag, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function ContactSection({ id = 'contact', showHeader = true, showInfo = true }) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    topic: 'General Inquiry',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [sendToWhatsapp, setSendToWhatsapp] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccess(false);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit form');
      }

      setSuccess(true);

      // If sendToWhatsapp option checked, format & open WhatsApp link
      if (sendToWhatsapp) {
        const text = `*New Contact Message - Aqua Fins*\n\n*Name:* ${formData.name}\n*Phone:* ${formData.phone}\n*Email:* ${formData.email || 'N/A'}\n*Topic:* ${formData.topic}\n*Message:* ${formData.message}`;
        const encoded = encodeURIComponent(text);
        window.open(`https://wa.me/8801787283804?text=${encoded}`, '_blank');
      }

      setFormData({
        name: '',
        phone: '',
        email: '',
        topic: 'General Inquiry',
        message: '',
      });
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenWhatsapp = () => {
    const text = `Hello Aqua Fins Bangladesh! I have an inquiry:`;
    window.open(`https://wa.me/8801787283804?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <section id={id} className="max-w-7xl mx-auto px-4 lg:px-12 py-16 scroll-mt-20">
      {/* Header */}
      {showHeader && (
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            {t('contactHeaderSubtitle')}
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-main tracking-tight mb-4">
            {t('contactHeaderTitle')}
          </h2>
          <p className="text-sm text-muted leading-relaxed">
            {t('contactDesc')}
          </p>
        </div>
      )}

      <div className={`grid grid-cols-1 gap-8 ${showInfo ? 'lg:grid-cols-12' : ''}`}>
        {/* Left Column: Quick Contact Cards & Info */}
        {showInfo && (
        <div className="lg:col-span-5 space-y-6">
          {/* Quick Contact Methods */}
          <div className="bg-brand-card/90 border border-brand-border rounded-2xl p-6 shadow-lg relative overflow-hidden backdrop-blur-sm">
            <div className="absolute -top-12 -right-12 w-36 h-36 bg-brand-cyan/10 rounded-full blur-2xl pointer-events-none" />

            <h3 className="text-lg font-bold text-main mb-6 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-brand-cyan" />
              {t('orDirectContact')}
            </h3>

            <div className="space-y-4">
              {/* Call Hotline */}
              <a
                href="tel:01787283804"
                className="flex items-center gap-4 p-3.5 rounded-xl bg-brand-dark/50 border border-brand-border/60 hover:border-brand-cyan/60 hover:bg-brand-dark transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-brand-cyan/10 border border-brand-cyan/30 flex items-center justify-center text-brand-cyan group-hover:scale-105 transition-transform flex-shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-subtle font-medium">{t('callUsDirect')}</p>
                  <p className="text-sm font-bold text-main group-hover:text-brand-cyan transition-colors">
                    01787-283804
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-subtle group-hover:text-brand-cyan group-hover:translate-x-1 transition-all" />
              </a>

              {/* WhatsApp Direct */}
              <button
                onClick={handleOpenWhatsapp}
                className="w-full flex items-center gap-4 p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 hover:border-emerald-400 hover:bg-emerald-900/40 transition-all group text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform flex-shrink-0">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-1.107 4.043 4.143-1.085z"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-emerald-400/80 font-medium">{t('whatsappDirect')}</p>
                  <p className="text-sm font-bold text-emerald-300">
                    +880 1787-283804
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-400/70 group-hover:text-emerald-300 group-hover:translate-x-1 transition-all" />
              </button>

              {/* Messenger Direct */}
              <a
                href="https://www.facebook.com/aquafinsbangladesh/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-3.5 rounded-xl bg-brand-dark/50 border border-brand-border/60 hover:border-brand-cyan/60 hover:bg-brand-dark transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-400/30 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform flex-shrink-0">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.497 1.745 6.616 4.472 8.652V24l4.086-2.242c1.09.301 2.246.464 3.442.464 6.627 0 12-4.975 12-11.111C24 4.974 18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26 6.559-6.963 3.13 3.26 5.888-3.26-6.559 6.963z"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-subtle font-medium">{t('messengerDirect')}</p>
                  <p className="text-sm font-bold text-main group-hover:text-brand-cyan transition-colors">
                    Aqua Fins Bangladesh
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-subtle group-hover:text-brand-cyan group-hover:translate-x-1 transition-all" />
              </a>
            </div>
          </div>

          {/* Location & Operating Hours */}
          <div className="bg-brand-card/90 border border-brand-border rounded-2xl p-6 shadow-lg space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-cyan/10 border border-brand-cyan/30 flex items-center justify-center text-brand-cyan flex-shrink-0 mt-0.5">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-subtle uppercase tracking-wider">{t('locationTitle')}</h4>
                <p className="text-sm font-semibold text-main mt-0.5">{t('locationDesc')}</p>
              </div>
            </div>

            <div className="border-t border-brand-border/60 pt-4 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-cyan/10 border border-brand-cyan/30 flex items-center justify-center text-brand-cyan flex-shrink-0 mt-0.5">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-subtle uppercase tracking-wider">{t('businessHours')}</h4>
                <p className="text-sm font-semibold text-main mt-0.5">{t('businessHoursTime')}</p>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Right Column: Contact Form */}
        <div className={showInfo ? 'lg:col-span-7' : ''}>
          <div className="bg-brand-card border border-brand-border rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
            {/* Top Cyan Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-cyan via-brand-accent to-brand-blue" />

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name & Phone Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-subtle uppercase tracking-wider mb-2">
                    {t('yourName')} <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-subtle absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Tanvir Ahmed"
                      className="w-full bg-brand-dark/80 border border-brand-border rounded-xl pl-10 pr-4 py-3 text-sm text-main placeholder:text-subtle focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan transition-all"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-bold text-subtle uppercase tracking-wider mb-2">
                    {t('yourPhone')} <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-subtle absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="017XXXXXXXX"
                      className="w-full bg-brand-dark/80 border border-brand-border rounded-xl pl-10 pr-4 py-3 text-sm text-main placeholder:text-subtle focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Email & Topic Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-subtle uppercase tracking-wider mb-2">
                    {t('yourEmail')}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-subtle absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="name@example.com"
                      className="w-full bg-brand-dark/80 border border-brand-border rounded-xl pl-10 pr-4 py-3 text-sm text-main placeholder:text-subtle focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan transition-all"
                    />
                  </div>
                </div>

                {/* Topic Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-subtle uppercase tracking-wider mb-2">
                    {t('selectTopic')}
                  </label>
                  <div className="relative">
                    <Tag className="w-4 h-4 text-subtle absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      name="topic"
                      value={formData.topic}
                      onChange={handleChange}
                      className="w-full bg-brand-dark/80 border border-brand-border rounded-xl pl-10 pr-4 py-3 text-sm text-main focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan transition-all appearance-none cursor-pointer"
                    >
                      <option value="General Inquiry">{t('generalInquiry')}</option>
                      <option value="Order Status / Custom Order">{t('orderStatus')}</option>
                      <option value="Aquascaping & Plants">{t('aquascapingConsult')}</option>
                      <option value="Livestock & Fish Query">{t('livestockQuery')}</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Message Textarea */}
              <div>
                <label className="block text-xs font-bold text-subtle uppercase tracking-wider mb-2">
                  {t('yourMessage')} <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <textarea
                    name="message"
                    required
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder={t('messagePlaceholder')}
                    className="w-full bg-brand-dark/80 border border-brand-border rounded-xl px-4 py-3 text-sm text-main placeholder:text-subtle focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan transition-all resize-y"
                  />
                </div>
              </div>

              {/* Checkbox: Forward to WhatsApp */}
              <div className="flex items-center gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="sendToWhatsapp"
                  checked={sendToWhatsapp}
                  onChange={(e) => setSendToWhatsapp(e.target.checked)}
                  className="w-4 h-4 rounded border-brand-border bg-brand-dark text-brand-cyan focus:ring-brand-cyan accent-brand-cyan cursor-pointer"
                />
                <label htmlFor="sendToWhatsapp" className="text-xs text-muted font-medium cursor-pointer select-none">
                  {t('sendOnWhatsappOption')}
                </label>
              </div>

              {/* Feedback Notifications */}
              {success && (
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-400" />
                  <div>
                    <h5 className="font-bold text-sm">{t('messageSentSuccess')}</h5>
                    <p className="text-xs opacity-90 mt-0.5">{t('messageSentDesc')}</p>
                  </div>
                </div>
              )}

              {errorMsg && (
                <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-400 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
                  <p className="text-xs font-medium">{errorMsg}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-accent text-brand-dark font-bold text-sm hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-cyan/20"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-brand-dark/30 border-t-brand-dark rounded-full animate-spin" />
                    <span>{t('messageSending')}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{t('sendMessage')}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
