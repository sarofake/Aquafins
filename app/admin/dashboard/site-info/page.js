'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Save, Loader2, CheckCircle, AlertCircle, Phone, MapPin, Share2, Clock,
  Palette, Truck, Info, Building2, UploadCloud, Image as ImageIcon, Check, X,
  Megaphone,
} from 'lucide-react';
import { fetchWithCache } from '@/lib/fetchCache';
import { clearClientCache } from '@/lib/clientCache';

const ADMIN_TTL_MS = 5 * 60 * 1000;

const SECTIONS = [
  {
    title: 'Announcement Banner',
    icon: Megaphone,
    fields: [
      {
        key: 'announcement_enabled',
        label: 'Announcement Status',
        type: 'select',
        options: [
          { value: 'true', label: 'Enabled (Visible on Homepage)' },
          { value: 'false', label: 'Disabled (Hidden)' },
        ],
      },
      { key: 'announcement_badge', label: 'Badge Label (English)', placeholder: 'ANNOUNCEMENT or SPECIAL OFFER' },
      { key: 'announcement_badge_bn', label: 'Badge Label (Bangla - Optional)', placeholder: 'বিজ্ঞপ্তি বা বিশেষ অফার' },
      { key: 'announcement_text', label: 'Announcement Text (English)', type: 'textarea', placeholder: 'Free delivery on all plant combo orders this week! | Special discount on shrimp packs.' },
      { key: 'announcement_text_bn', label: 'Announcement Text (Bangla - Optional)', type: 'textarea', placeholder: 'এই সপ্তাহে সকল প্ল্যান্ট কম্বো অর্ডারে ফ্রি ডেলিভারি!' },
      { key: 'announcement_link', label: 'Action Button / Link URL (Optional)', placeholder: 'e.g. /deals or /products?category=combo' },
    ],
  },
  {
    title: 'General',
    icon: Building2,
    fields: [
      { key: 'site_name', label: 'Site Name', placeholder: 'Aqua Fins Bangladesh' },
      { key: 'site_tagline', label: 'Tagline', placeholder: 'Premium Aquatics & Supplies' },
      { key: 'site_description', label: 'Site Description', type: 'textarea', placeholder: 'About your site...' },
      { key: 'logo_url', label: 'Logo', type: 'image', folder: 'site', accept: 'image/*' },
      { key: 'favicon_url', label: 'Favicon', type: 'image', folder: 'site', accept: 'image/*,.ico,.png' },
    ],
  },
  {
    title: 'Contact Info',
    icon: Phone,
    fields: [
      { key: 'phone_primary', label: 'Primary Phone', placeholder: '+880 1XXX-XXXXXX' },
      { key: 'phone_secondary', label: 'Secondary Phone', placeholder: '+880 1XXX-XXXXXX' },
      { key: 'whatsapp', label: 'WhatsApp Number', placeholder: '+880 1XXX-XXXXXX' },
      { key: 'email', label: 'Primary Email', placeholder: 'info@example.com' },
      { key: 'email_support', label: 'Support Email', placeholder: 'support@example.com' },
    ],
  },
  {
    title: 'Address & Location',
    icon: MapPin,
    fields: [
      { key: 'address', label: 'Address (English)', placeholder: '123 Street Name, Area' },
      { key: 'address_bn', label: 'Address (Bangla)', placeholder: '১২৩ স্ট্রিট নাম, এলাকা' },
      { key: 'city', label: 'City', placeholder: 'Dhaka' },
      { key: 'country', label: 'Country', placeholder: 'Bangladesh' },
      { key: 'map_embed_url', label: 'Google Maps Embed URL', placeholder: 'https://www.google.com/maps/embed?...' },
    ],
  },
  {
    title: 'Social Media',
    icon: Share2,
    fields: [
      { key: 'facebook', label: 'Facebook URL', placeholder: 'https://facebook.com/yourpage' },
      { key: 'instagram', label: 'Instagram URL', placeholder: 'https://instagram.com/yourpage' },
      { key: 'youtube', label: 'YouTube URL', placeholder: 'https://youtube.com/yourchannel' },
      { key: 'tiktok', label: 'TikTok URL', placeholder: 'https://tiktok.com/@yourpage' },
      { key: 'twitter', label: 'Twitter / X URL', placeholder: 'https://x.com/yourhandle' },
    ],
  },
  {
    title: 'Business Hours',
    icon: Clock,
    fields: [
      { key: 'business_hours', label: 'Business Hours (English)', placeholder: 'Sat-Thu: 10AM - 9PM' },
      { key: 'business_hours_bn', label: 'Business Hours (Bangla)', placeholder: 'শনি-বৃহঃ: সকাল ১০টা - রাত ৯টা' },
    ],
  },
  {
    title: 'About Us',
    icon: Info,
    fields: [
      { key: 'about_us', label: 'About Us (English)', type: 'textarea', placeholder: 'Tell visitors about your business...' },
      { key: 'about_us_bn', label: 'About Us (Bangla)', type: 'textarea', placeholder: 'আপনার ব্যবসা সম্পর্কে লিখুন...' },
    ],
  },
  {
    title: 'Delivery & Returns',
    icon: Truck,
    fields: [
      { key: 'delivery_info', label: 'Delivery Info (English)', type: 'textarea', placeholder: 'Free delivery on orders over...' },
      { key: 'delivery_info_bn', label: 'Delivery Info (Bangla)', type: 'textarea', placeholder: 'ফ্রি ডেলিভারি...' },
      { key: 'return_policy', label: 'Return Policy (English)', type: 'textarea', placeholder: 'Return policy details...' },
      { key: 'return_policy_bn', label: 'Return Policy (Bangla)', type: 'textarea', placeholder: 'রিটার্ন পলিসি...' },
      { key: 'min_order_amount', label: 'Minimum Order Amount (৳)', placeholder: '500' },
    ],
  },
  {
    title: 'Currency & Colors',
    icon: Palette,
    fields: [
      { key: 'currency', label: 'Currency Symbol', placeholder: '৳' },
      { key: 'currency_code', label: 'Currency Code', placeholder: 'BDT' },
      { key: 'primary_color', label: 'Primary Color', type: 'color' },
      { key: 'secondary_color', label: 'Secondary Color', type: 'color' },
    ],
  },
];

function ImageUploadField({ field, value, onChange }) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', field.folder || 'site');
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      if (data.url) onChange(data.url);
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onChange('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-cyan-300 hover:border-cyan-600 bg-slate-50 text-xs font-semibold text-slate-900 transition-all cursor-pointer hover:bg-cyan-50/50 disabled:opacity-50"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-cyan-600" />
              Uploading...
            </>
          ) : (
            <>
              <UploadCloud className="w-4 h-4 text-cyan-600" />
              {value ? 'Change Image' : 'Upload Image'}
            </>
          )}
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleUpload}
          accept={field.accept || 'image/*'}
          className="hidden"
        />
        {value && (
          <button
            type="button"
            onClick={handleRemove}
            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            title="Remove image"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      {value && (
        <div className="relative mt-3 w-32 h-20 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center">
          <img src={value} alt={field.label} className="w-full h-full object-contain" />
          <span className="absolute top-1 right-1 bg-emerald-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
            <Check className="w-2.5 h-2.5" /> Saved
          </span>
        </div>
      )}
      {!value && (
        <div className="mt-3 w-32 h-20 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center">
          <div className="text-center text-slate-400">
            <ImageIcon className="w-5 h-5 mx-auto mb-0.5 opacity-40" />
            <span className="text-[9px] block">No image</span>
          </div>
        </div>
      )}
      {uploadError && (
        <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> {uploadError}
        </p>
      )}
      <div className="mt-2">
        <input
          type="url"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Or paste image URL (https://...)"
          className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-[11px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-cyan-600 focus:bg-white"
        />
      </div>
    </div>
  );
}

export default function SiteInfoPage() {
  const [info, setInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [activeSection, setActiveSection] = useState(0);

  useEffect(() => {
    fetchWithCache('/api/admin/site-info', 'admin_site_info', ADMIN_TTL_MS)
      .then((d) => { if (d.info) setInfo(d.info); })
      .catch(() => setErrorMsg('Failed to load site info'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (successMsg || errorMsg) {
      const t = setTimeout(() => { setSuccessMsg(''); setErrorMsg(''); }, 4000);
      return () => clearTimeout(t);
    }
  }, [successMsg, errorMsg]);

  const handleChange = (key, value) => {
    setInfo((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true); setSuccessMsg(''); setErrorMsg('');
    try {
      const res = await fetch('/api/admin/site-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(info),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setSuccessMsg('Site information saved successfully!');
      clearClientCache('admin_site_info');
    } catch (err) { setErrorMsg(err.message); } finally { setSaving(false); }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-cyan-600">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
        <p className="text-xs text-slate-500">Loading site info...</p>
      </div>
    );
  }

  const section = SECTIONS[activeSection];
  const SectionIcon = section.icon;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Site Information</h2>
          <p className="text-xs text-slate-500 mt-1">Manage all site-wide information displayed to visitors</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-cyan-600 text-white px-6 py-2.5 rounded-full text-xs font-bold hover:bg-cyan-700 transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-cyan-600/20 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save All Changes
        </button>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs p-3.5 rounded-xl mb-6 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" /><span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3.5 rounded-xl mb-6 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" /><span>{errorMsg}</span>
        </div>
      )}

      <div className="flex gap-6">
        {/* Section Tabs */}
        <div className="w-56 shrink-0">
          <div className="bg-white border border-slate-200 rounded-2xl p-2 space-y-1 sticky top-8 shadow-sm">
            {SECTIONS.map((sec, i) => {
              const SecIcon = sec.icon;
              return (
                <button
                  key={sec.title}
                  onClick={() => setActiveSection(i)}
                  className={`w-full px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2.5 cursor-pointer text-left ${
                    activeSection === i
                      ? 'bg-cyan-50 text-cyan-700 border border-cyan-200 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <SecIcon className="w-4 h-4 shrink-0" />
                  {sec.title}
                </button>
              );
            })}
          </div>
        </div>

        {/* Fields */}
        <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm text-slate-900">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600">
              <SectionIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">{section.title}</h3>
              <p className="text-xs text-slate-500">Update {section.title.toLowerCase()} information</p>
            </div>
          </div>

          <div className="space-y-5">
            {section.fields.map((field) => (
              <div key={field.key}>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">{field.label}</label>
                {field.type === 'image' ? (
                  <ImageUploadField
                    field={field}
                    value={info[field.key] || ''}
                    onChange={(val) => handleChange(field.key, val)}
                  />
                ) : field.type === 'textarea' ? (
                  <textarea
                    rows={3}
                    value={info[field.key] || ''}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-cyan-600 focus:bg-white resize-none"
                  />
                ) : field.type === 'color' ? (
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={info[field.key] || '#000000'}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      className="w-10 h-10 rounded-lg border border-slate-300 cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={info[field.key] || ''}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-cyan-600 focus:bg-white"
                    />
                  </div>
                ) : field.type === 'select' ? (
                  <select
                    value={info[field.key] || (field.options && field.options[0]?.value) || ''}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-cyan-600 focus:bg-white cursor-pointer"
                  >
                    {field.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={info[field.key] || ''}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-cyan-600 focus:bg-white"
                  />
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-cyan-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-cyan-700 transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-cyan-600/20 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} Save {section.title}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
