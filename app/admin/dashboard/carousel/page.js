'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Plus, Pencil, Trash2, X, Loader2, Save, UploadCloud, Image as ImageIcon,
  CheckCircle, Check, AlertCircle, Sliders, Eye, EyeOff, Megaphone, Sparkles, ExternalLink,
} from 'lucide-react';
import { fetchWithCache } from '@/lib/fetchCache';
import { clearClientCache } from '@/lib/clientCache';

const ADMIN_TTL_MS = 5 * 60 * 1000;

const invalidateHeroCaches = () => {
  clearClientCache('admin_hero');
  clearClientCache('hero_slides_public');
};

const invalidateSiteInfoCaches = () => {
  clearClientCache('admin_site_info');
  clearClientCache('site_info_public');
  clearClientCache('af_announcement_dismissed');
};

const EMPTY_FORM = { title: '', title_bn: '', subtitle: '', subtitle_bn: '', badge: '', badge_bn: '', image: '', image_public_id: '', button_text: 'Explore Catalog', button_text_bn: '', button_link: '/products', sort_order: '0', active: true };

const DEFAULT_ANNOUNCEMENT = {
  announcement_enabled: 'true',
  announcement_badge: 'SPECIAL OFFER',
  announcement_badge_bn: 'বিশেষ অফার',
  announcement_text: '🎉 Welcome to Aqua Fins Bangladesh! Free delivery on all Plant & Shrimp Combo orders over ৳1500 this week! | Discover our premium aquatic plants and exotic livestock.',
  announcement_text_bn: '🎉 অ্যাকুয়া ফিন্স বাংলাদেশে স্বাগতম! এই সপ্তাহে ১৫০০ টাকার বেশি কম্বো অর্ডারে ফ্রি ডেলিভারি!',
  announcement_link: '/products?category=combo',
};

export default function CarouselPage() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const fileInputRef = useRef(null);

  // Announcement state
  const [announcement, setAnnouncement] = useState(DEFAULT_ANNOUNCEMENT);
  const [loadingAnnouncement, setLoadingAnnouncement] = useState(true);
  const [savingAnnouncement, setSavingAnnouncement] = useState(false);
  const [announcementMsg, setAnnouncementMsg] = useState('');

  const loadData = useCallback(async (force = false) => {
    setLoading(true);
    try {
      const data = await fetchWithCache('/api/admin/hero', 'admin_hero', ADMIN_TTL_MS, { force });
      setSlides(data.slides || []);
    } catch (e) {
      setErrorMsg(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAnnouncement = useCallback(async () => {
    setLoadingAnnouncement(true);
    try {
      const data = await fetchWithCache('/api/admin/site-info', 'admin_site_info', ADMIN_TTL_MS);
      if (data.info) {
        setAnnouncement((prev) => ({
          ...prev,
          announcement_enabled: data.info.announcement_enabled ?? 'true',
          announcement_badge: data.info.announcement_badge ?? 'SPECIAL OFFER',
          announcement_badge_bn: data.info.announcement_badge_bn ?? 'বিশেষ অফার',
          announcement_text: data.info.announcement_text ?? '',
          announcement_text_bn: data.info.announcement_text_bn ?? '',
          announcement_link: data.info.announcement_link ?? '',
        }));
      }
    } catch (err) {
      console.error('Failed to load announcement in carousel admin:', err);
    } finally {
      setLoadingAnnouncement(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    loadAnnouncement();
  }, [loadData, loadAnnouncement]);

  useEffect(() => {
    if (successMsg || errorMsg || announcementMsg) {
      const t = setTimeout(() => {
        setSuccessMsg('');
        setErrorMsg('');
        setAnnouncementMsg('');
      }, 4000);
      return () => clearTimeout(t);
    }
  }, [successMsg, errorMsg, announcementMsg]);

  const handleSaveAnnouncement = async (e) => {
    e.preventDefault();
    setSavingAnnouncement(true);
    try {
      const res = await fetch('/api/admin/site-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(announcement),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save announcement');
      setAnnouncementMsg('Announcement banner updated successfully!');
      invalidateSiteInfoCaches();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update announcement');
    } finally {
      setSavingAnnouncement(false);
    }
  };

  const uploadImageFile = async (file) => {
    setUploadingImage(true);
    setUploadError('');
    if (file.size > 4.5 * 1024 * 1024) {
      setUploadError('Image > 4.5MB.');
      setUploadingImage(false);
      return null;
    }
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'carousel');
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    } catch (err) {
      setUploadError(err.message);
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const res = await uploadImageFile(file);
    if (res?.url) {
      setForm((p) => ({ ...p, image: res.url, image_public_id: res.public_id || '' }));
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setUploadError('');
    setFormOpen(true);
  };

  const openEdit = (slide) => {
    setEditingId(slide.id);
    setForm({
      title: slide.title || '',
      title_bn: slide.title_bn || '',
      subtitle: slide.subtitle || '',
      subtitle_bn: slide.subtitle_bn || '',
      badge: slide.badge || '',
      badge_bn: slide.badge_bn || '',
      image: slide.image || '',
      image_public_id: slide.image_public_id || '',
      button_text: slide.button_text || 'Explore Catalog',
      button_text_bn: slide.button_text_bn || '',
      button_link: slide.button_link || '/products',
      sort_order: String(slide.sort_order || 0),
      active: slide.active !== false,
    });
    setUploadError('');
    setFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.image) {
      setErrorMsg('Banner image is required.');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(editingId ? `/api/admin/hero/${editingId}` : '/api/admin/hero', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setFormOpen(false);
      setSuccessMsg(editingId ? 'Banner updated!' : 'Banner created!');
      invalidateHeroCaches();
      loadData();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (slide) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/hero/${slide.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...slide, active: !slide.active }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      invalidateHeroCaches();
      loadData();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this banner?')) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/hero/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccessMsg('Banner deleted');
      invalidateHeroCaches();
      loadData();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Global Alerts */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs p-3.5 rounded-xl flex items-center gap-2 shadow-sm">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3.5 rounded-xl flex items-center gap-2 shadow-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. TOP SECTION: Announcement Banner Manager                                */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm text-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600 shrink-0">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Announcement Banner (Ticker)</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Appears on the homepage right below the Hero Carousel. Rotates automatically when text is long.
              </p>
            </div>
          </div>

          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
            announcement.announcement_enabled !== 'false'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-slate-100 text-slate-600 border border-slate-200'
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              announcement.announcement_enabled !== 'false' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
            }`} />
            {announcement.announcement_enabled !== 'false' ? 'Active on Homepage' : 'Disabled / Hidden'}
          </span>
        </div>

        {announcementMsg && (
          <div className="mt-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs p-3.5 rounded-xl flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{announcementMsg}</span>
          </div>
        )}

        <form onSubmit={handleSaveAnnouncement} className="mt-6 space-y-5">
          {/* Status & Badge Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Banner Status
              </label>
              <select
                value={announcement.announcement_enabled || 'true'}
                onChange={(e) => setAnnouncement({ ...announcement, announcement_enabled: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-cyan-600 focus:bg-white cursor-pointer"
              >
                <option value="true">✅ Enabled (Visible to visitors)</option>
                <option value="false">❌ Disabled (Hidden)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Badge Label (English)
              </label>
              <input
                type="text"
                value={announcement.announcement_badge || ''}
                onChange={(e) => setAnnouncement({ ...announcement, announcement_badge: e.target.value })}
                placeholder="e.g. SPECIAL OFFER or NOTICE"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-cyan-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Badge Label (Bangla)
              </label>
              <input
                type="text"
                value={announcement.announcement_badge_bn || ''}
                onChange={(e) => setAnnouncement({ ...announcement, announcement_badge_bn: e.target.value })}
                placeholder="e.g. বিশেষ অফার বা বিজ্ঞপ্তি"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-cyan-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Texts (English & Bangla) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Announcement Text (English) <span className="text-cyan-600">*</span>
              </label>
              <textarea
                rows={3}
                value={announcement.announcement_text || ''}
                onChange={(e) => setAnnouncement({ ...announcement, announcement_text: e.target.value })}
                placeholder="Write announcement message... Tip: Use ' | ' to split multiple rotating phrases."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-cyan-600 focus:bg-white resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Announcement Text (Bangla - Optional)
              </label>
              <textarea
                rows={3}
                value={announcement.announcement_text_bn || ''}
                onChange={(e) => setAnnouncement({ ...announcement, announcement_text_bn: e.target.value })}
                placeholder="ঘোষণা বা নোটিশের লেখা লিখুন..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-cyan-600 focus:bg-white resize-none"
              />
            </div>
          </div>

          {/* Action Link & Save */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Button Link URL (Optional)
              </label>
              <input
                type="text"
                value={announcement.announcement_link || ''}
                onChange={(e) => setAnnouncement({ ...announcement, announcement_link: e.target.value })}
                placeholder="e.g. /deals or /products?category=combo"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-cyan-600 focus:bg-white"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={savingAnnouncement}
                className="w-full bg-cyan-600 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-cyan-700 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-cyan-600/20 disabled:opacity-50 text-sm"
              >
                {savingAnnouncement ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Announcement
              </button>
            </div>
          </div>

          {/* Live Preview Box */}
          <div className="pt-3">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              Live Client Preview:
            </label>
            <div className="bg-slate-950 text-white rounded-2xl p-3 sm:px-5 flex items-center justify-between gap-3 border border-cyan-500/30 overflow-hidden shadow-inner">
              <span className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">
                <Megaphone className="w-3 h-3" />
                <span>{announcement.announcement_badge || 'ANNOUNCEMENT'}</span>
              </span>
              <p className="flex-1 text-xs font-medium text-slate-200 truncate">
                {announcement.announcement_text || 'No announcement text entered yet.'}
              </p>
              {announcement.announcement_link && (
                <span className="shrink-0 text-[11px] font-bold text-cyan-400 flex items-center gap-1">
                  Explore <ExternalLink className="w-3 h-3" />
                </span>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* ========================================================================= */}
      {/* 2. HERO CAROUSEL BANNERS SECTION                                          */}
      {/* ========================================================================= */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Hero Carousel Banners</h2>
            <p className="text-xs text-slate-500 mt-1">
              Upload and manage promotional slides for the top homepage carousel
            </p>
          </div>
          <button
            onClick={openCreate}
            className="bg-cyan-600 text-white px-5 py-2.5 rounded-full text-xs font-bold hover:bg-cyan-700 transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-cyan-600/20"
          >
            <Plus className="w-4 h-4" /> Upload Banner
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center text-cyan-600 bg-white border border-slate-200 rounded-3xl shadow-sm">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500">Loading banners...</p>
          </div>
        ) : slides.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
            <Sliders className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 mb-1">No carousel banners yet</h3>
            <p className="text-xs text-slate-500 mb-4">
              Upload custom hero slides for the homepage.
            </p>
            <button
              onClick={openCreate}
              className="bg-cyan-600 text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-cyan-700 inline-flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Upload Banner Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {slides.map((slide) => (
              <div
                key={slide.id}
                className="bg-white border border-slate-200 rounded-3xl overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative h-48 bg-slate-100 overflow-hidden">
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-transparent p-4 flex flex-col justify-end">
                    {slide.badge && (
                      <span className="self-start text-[10px] font-bold text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-400/40 mb-1">
                        {slide.badge}
                      </span>
                    )}
                    <h3 className="text-base font-bold text-white line-clamp-1">
                      {slide.title}
                    </h3>
                    <p className="text-xs text-slate-200 line-clamp-1">
                      {slide.subtitle}
                    </p>
                  </div>
                  <span
                    className={`absolute top-3 right-3 text-[10px] font-bold px-2.5 py-0.5 rounded-full border backdrop-blur-sm ${
                      slide.active !== false
                        ? 'bg-emerald-500 text-white border-emerald-600'
                        : 'bg-slate-200 text-slate-700 border-slate-300'
                    }`}
                  >
                    {slide.active !== false ? 'Active' : 'Disabled'}
                  </span>
                </div>

                <div className="p-4 flex items-center justify-between border-t border-slate-100 text-xs">
                  <div className="text-slate-500 flex items-center gap-3">
                    <span>
                      Order: <strong className="text-slate-900">{slide.sort_order || 0}</strong>
                    </span>
                    <span>
                      Link: <strong className="text-cyan-700">{slide.button_link || '/products'}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleActive(slide)}
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                        slide.active !== false
                          ? 'text-emerald-600 border-emerald-200 bg-emerald-50 hover:bg-emerald-100'
                          : 'text-slate-500 border-slate-200 bg-slate-50 hover:bg-slate-100'
                      }`}
                      title={slide.active !== false ? 'Disable' : 'Enable'}
                    >
                      {slide.active !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 opacity-60" />}
                    </button>
                    <button
                      onClick={() => openEdit(slide)}
                      className="p-1.5 text-slate-500 hover:text-cyan-600 hover:bg-cyan-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(slide.id)}
                      className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload/Edit Modal */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto shadow-2xl text-slate-900">
            <button
              onClick={() => setFormOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingId ? 'Edit Banner' : 'Upload New Banner'}
                </h3>
                <p className="text-xs text-slate-500">
                  Upload banner image and configure slide options
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Banner Image <span className="text-cyan-600">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="sm:col-span-2 border-2 border-dashed border-cyan-300 hover:border-cyan-600 bg-slate-50 rounded-2xl p-6 text-center cursor-pointer transition-all hover:bg-cyan-50/50 flex flex-col items-center justify-center group"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      accept="image/*"
                      className="hidden"
                    />
                    {uploadingImage ? (
                      <div className="py-4 text-cyan-600 flex flex-col items-center gap-2">
                        <Loader2 className="w-8 h-8 animate-spin" />
                        <span className="text-xs font-semibold">Uploading...</span>
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-full bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600 mb-2 group-hover:scale-110 transition-transform">
                          <UploadCloud className="w-6 h-6" />
                        </div>
                        <p className="text-xs font-bold text-slate-900 mb-1">
                          Click to upload banner
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Recommended 16:9 ratio (Max 10MB)
                        </p>
                      </>
                    )}
                  </div>

                  <div className="relative h-36 sm:h-auto rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center">
                    {form.image ? (
                      <>
                        <img
                          src={form.image}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
                          <Check className="w-3 h-3" /> Ready
                        </span>
                      </>
                    ) : (
                      <div className="text-center p-3 text-slate-400">
                        <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                        <span className="text-[10px] block">No image</span>
                      </div>
                    )}
                  </div>
                </div>

                {uploadError && (
                  <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {uploadError}
                  </p>
                )}

                <div className="mt-3">
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Or paste Image URL:
                  </label>
                  <input
                    type="url"
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-cyan-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Headline (English) <span className="text-cyan-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                    placeholder="e.g. Exclusive Aquascaping Collection"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-cyan-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Headline (Bangla - Optional)
                  </label>
                  <input
                    type="text"
                    value={form.title_bn}
                    onChange={(e) => setForm({ ...form, title_bn: e.target.value })}
                    placeholder="e.g. এক্সক্লুসিভ অ্যাকোয়াস্কেপিং কালেকশন"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-cyan-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Subtitle (English)
                  </label>
                  <textarea
                    rows={2}
                    value={form.subtitle}
                    onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                    placeholder="e.g. Upgrade your aquatic setup"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-cyan-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Subtitle (Bangla - Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={form.subtitle_bn}
                    onChange={(e) => setForm({ ...form, subtitle_bn: e.target.value })}
                    placeholder="e.g. আপনার অ্যাকোয়ারিয়াম সেটআপ আপগ্রেড করুন"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-cyan-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Badge Tag
                  </label>
                  <input
                    type="text"
                    value={form.badge}
                    onChange={(e) => setForm({ ...form, badge: e.target.value })}
                    placeholder="e.g. Special Offer"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-cyan-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Badge Tag (Bangla - Optional)
                  </label>
                  <input
                    type="text"
                    value={form.badge_bn}
                    onChange={(e) => setForm({ ...form, badge_bn: e.target.value })}
                    placeholder="e.g. বিশেষ অফার"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-cyan-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={form.sort_order}
                    onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                    placeholder="0, 1, 2..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-cyan-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Button Text
                  </label>
                  <input
                    type="text"
                    value={form.button_text}
                    onChange={(e) => setForm({ ...form, button_text: e.target.value })}
                    placeholder="e.g. Shop Now"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-cyan-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Button Text (Bangla - Optional)
                  </label>
                  <input
                    type="text"
                    value={form.button_text_bn}
                    onChange={(e) => setForm({ ...form, button_text_bn: e.target.value })}
                    placeholder="e.g. অর্ডার করুন"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-cyan-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Button Link URL
                  </label>
                  <input
                    type="text"
                    value={form.button_link}
                    onChange={(e) => setForm({ ...form, button_link: e.target.value })}
                    placeholder="e.g. /products?category=plants"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-cyan-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="pt-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) => setForm({ ...form, active: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-600 bg-white"
                  />
                  <span>Show this banner in Hero Carousel</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={saving || uploadingImage}
                className="w-full bg-cyan-600 text-white font-bold py-3.5 rounded-xl hover:bg-cyan-700 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-cyan-600/20 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {editingId ? 'Update Banner' : 'Upload & Save Banner'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
