'use client';

import React, { useState, useEffect, useRef, Fragment } from 'react';
import {
  Loader2, Save, Star, AlertCircle, CheckCircle, UploadCloud,
  Video, ArrowLeft, ArrowRight, Play, X, Plus,
} from 'lucide-react';
import DescriptionInput from '@/components/DescriptionInput';
import { CURRENCY_SYMBOL } from '@/lib/currency';
import { extractYouTubeId, getYouTubeThumbnailUrl } from '@/lib/youtube';

const EMPTY_FORM = {
  name: '', name_bn: '', quantity: '', quantity_bn: '', category: '', category_id: '', price: '', original_price: '',
  description: '', description_bn: '', image: '', images: [], keywords: '', featured: false, deals: false, available: true,
};

const primaryFromImages = (images, fallback = '') => {
  const def = images.find((m) => m.is_default) || images[0];
  if (!def) return fallback;
  if (def.type === 'video') {
    return def.thumbnail_url || def.url || fallback;
  }
  return def.url || fallback;
};

export function productToForm(p) {
  let images = [];
  if (p.images && Array.isArray(p.images) && p.images.length > 0) {
    images = p.images.map((item) => {
      if (!item) return null;
      if (typeof item === 'string') {
        const ytId = extractYouTubeId(item);
        if (ytId) {
        return {
          type: 'video',
          url: item.url || (videoId ? `https://www.youtube.com/watch?v=${videoId}` : ''),
          youtube_id: ytId,
          use_youtube_thumbnail: false,
          thumbnail_url: getYouTubeThumbnailUrl(ytId),
          is_default: false,
        };
        }
        return { type: 'image', url: item, is_default: false };
      }
      const ytId = extractYouTubeId(item.url || item.youtube_id);
      if (item.type === 'video' || ytId) {
        const videoId = ytId || item.youtube_id || '';
        return {
          type: 'video',
          url: item.url || (videoId ? `https://www.youtube.com/watch?v=${videoId}` : ''),
          youtube_id: videoId,
          use_youtube_thumbnail: false,
          thumbnail_url: item.thumbnail_url || getYouTubeThumbnailUrl(videoId),
          is_default: Boolean(item.is_default),
        };
      }
      return {
        type: 'image',
        url: item.url || '',
        is_default: Boolean(item.is_default),
      };
    }).filter(Boolean);
  } else if (p.image) {
    images = [{ type: 'image', url: p.image, is_default: true }];
  }

  return {
    name: p.name || '',
    name_bn: p.name_bn || '',
    quantity: p.quantity || '',
    quantity_bn: p.quantity_bn || '',
    category: p.category || '',
    category_id: p.category_id ? String(p.category_id) : '',
    price: String(p.price || ''),
    original_price: p.original_price ? String(p.original_price) : '',
    description: p.description || '',
    description_bn: p.description_bn || '',
    keywords: p.keywords || '',
    image: p.image || '',
    images,
    featured: !!p.featured,
    deals: !!p.deals,
    available: p.available !== false,
  };
}

/**
 * Full product form. Pass `product` to edit, omit it to create.
 * Owns its own state, validation and persistence.
 */
export default function ProductForm({ product = null, categories = [], onSaved, onCancel }) {
  const isEdit = Boolean(product);
  const [form, setForm] = useState(EMPTY_FORM);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');

  const [videoInputUrl, setVideoInputUrl] = useState('');
  const [videoError, setVideoError] = useState('');

  const fileInputRef = useRef(null);

  const motherCategories = categories.filter((c) => !c.parent_id);
  const getSubCategories = (motherId) => categories.filter((c) => c.parent_id === motherId);

  useEffect(() => {
    if (product) setForm(productToForm(product));
    else {
      const def = categories.length > 0 ? categories[0].slug : 'plants';
      const defCat = categories.find((c) => c.slug === def);
      setForm({ ...EMPTY_FORM, category: def, category_id: defCat ? String(defCat.id) : '' });
    }
    setUploadError('');
    setImageUrlInput('');
    setVideoInputUrl('');
    setVideoError('');
  }, [product, categories]);

  useEffect(() => {
    if (successMsg || errorMsg) { const t = setTimeout(() => { setSuccessMsg(''); setErrorMsg(''); }, 4000); return () => clearTimeout(t); }
  }, [successMsg, errorMsg]);

  const uploadImageFile = async (file) => {
    setUploadingImage(true); setUploadError('');
    if (file.size > 4.5 * 1024 * 1024) { setUploadError('Image > 4.5MB.'); setUploadingImage(false); return null; }
    try {
      const fd = new FormData(); fd.append('file', file); fd.append('folder', 'products');
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      const data = await res.json(); if (!res.ok) throw new Error(data.error); return data;
    } catch (err) { setUploadError(err.message); return null; } finally { setUploadingImage(false); }
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    for (const file of files) {
      const res = await uploadImageFile(file);
      if (res?.url) {
        setForm((p) => {
          const isDefault = p.images.length === 0;
          const newImages = [...p.images, { type: 'image', url: res.url, is_default: isDefault }];
          return { ...p, images: newImages, image: primaryFromImages(newImages) };
        });
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const addImageUrl = () => {
    const url = imageUrlInput.trim();
    if (!url) return;
    setForm((p) => {
      const isDefault = p.images.length === 0;
      const newImages = [...p.images, { type: 'image', url, is_default: isDefault }];
      return { ...p, images: newImages, image: primaryFromImages(newImages) };
    });
    setImageUrlInput('');
  };

  const handleAddVideo = () => {
    setVideoError('');
    if (!videoInputUrl.trim()) {
      setVideoError('Please enter a YouTube video URL.');
      return;
    }
    const ytId = extractYouTubeId(videoInputUrl);
    if (!ytId) {
      setVideoError('Invalid YouTube URL or Video ID.');
      return;
    }

    setForm((p) => {
        const newVideo = {
          type: 'video',
          url: videoInputUrl.trim(),
          youtube_id: ytId,
          use_youtube_thumbnail: false,
          thumbnail_url: getYouTubeThumbnailUrl(ytId),
          is_default: false,
        };
      const newImages = [...p.images, newVideo];
      return { ...p, images: newImages, image: primaryFromImages(newImages) };
    });

    setVideoInputUrl('');
    setVideoError('');
  };

  const removeImage = (idx) => {
    setForm((p) => {
      const filtered = p.images.filter((_, i) => i !== idx);
      const newDefault = filtered.length > 0
        ? filtered.some((img) => img.is_default)
          ? filtered
          : filtered.map((img, i) => (i === 0 ? { ...img, is_default: true } : img))
        : [];
      return { ...p, images: newDefault, image: primaryFromImages(newDefault) };
    });
  };

  const setDefaultImage = (idx) => {
    setForm((p) => {
      const newImages = p.images.map((img, i) => ({ ...img, is_default: i === idx }));
      return { ...p, images: newImages, image: primaryFromImages(newImages, p.image) };
    });
  };

  const moveMediaItem = (fromIdx, toIdx) => {
    if (toIdx < 0 || toIdx >= form.images.length) return;
    setForm((p) => {
      const newImages = [...p.images];
      const [moved] = newImages.splice(fromIdx, 1);
      newImages.splice(toIdx, 0, moved);
      return { ...p, images: newImages, image: primaryFromImages(newImages) };
    });
  };

  const toggleVideoThumbnailMode = (idx) => {
    setForm((p) => {
      const newImages = p.images.map((img, i) => {
        if (i !== idx) return img;
        const newUseYt = !img.use_youtube_thumbnail;
        const defaultYtThumb = img.youtube_id ? getYouTubeThumbnailUrl(img.youtube_id) : '';
        return {
          ...img,
          use_youtube_thumbnail: newUseYt,
          thumbnail_url: newUseYt ? defaultYtThumb : (img.thumbnail_url || defaultYtThumb),
        };
      });
      return { ...p, images: newImages, image: primaryFromImages(newImages) };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.images.length === 0) { setErrorMsg('At least one product image or video is required.'); return; }
    const kwCount = form.keywords.split(',').map((k) => k.trim()).filter(Boolean).length;
    if (kwCount < 3) { setErrorMsg('Provide at least 3 search keywords (comma separated).'); return; }
    if (kwCount > 10) { setErrorMsg('Maximum 10 search keywords allowed.'); return; }

    setSaving(true);
    try {
      const res = await fetch(isEdit ? `/api/admin/products/${product.id}` : '/api/admin/products', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          original_price: form.original_price ? Number(form.original_price) : null,
          category_id: form.category_id ? Number(form.category_id) : null,
          images: form.images,
          image: primaryFromImages(form.images),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setErrorMsg('');
      setSuccessMsg(isEdit ? 'Product updated!' : 'Product created!');
      if (onSaved) onSaved(data.product || product);
    } catch (err) { setErrorMsg(err.message); } finally { setSaving(false); }
  };

  return (
    <div className="text-slate-900">
      {successMsg && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs p-3.5 rounded-xl mb-6 flex items-center gap-2"><CheckCircle className="w-4 h-4 shrink-0" /><span>{successMsg}</span></div>}
      {errorMsg && <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3.5 rounded-xl mb-6 flex items-center gap-2"><AlertCircle className="w-4 h-4 shrink-0" /><span>{errorMsg}</span></div>}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* LEFT: Media / Images & YouTube Video (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Product Media (Images / Video) <span className="text-red-400">*</span></label>
              <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-slate-200 hover:border-cyan-400 bg-slate-50 rounded-2xl py-6 text-center cursor-pointer transition-all hover:bg-cyan-50/30 group">
                <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" multiple className="hidden" />
                {uploadingImage ? (
                  <div className="flex flex-col items-center justify-center gap-2 text-cyan-600"><Loader2 className="w-6 h-6 animate-spin" /><span className="text-xs font-medium">Uploading...</span></div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-1.5 text-slate-400 group-hover:text-cyan-600 transition-colors">
                    <UploadCloud className="w-7 h-7" />
                    <span className="text-xs font-medium">{form.images.length > 0 ? 'Add more images' : 'Click to upload images'}</span>
                    <span className="text-[10px] text-slate-400">PNG, JPG, WEBP (max 4.5MB)</span>
                  </div>
                )}
              </div>
              {uploadError && <p className="text-[11px] text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {uploadError}</p>}

              {/* Image URL Input */}
              <div className="flex gap-2 mt-2">
                <input type="url" value={imageUrlInput} onChange={(e) => setImageUrlInput(e.target.value)} placeholder="Paste image URL..." className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-cyan-400 focus:bg-white" />
                <button type="button" onClick={addImageUrl} className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold px-3 py-2 rounded-xl transition-colors cursor-pointer">Add</button>
              </div>
            </div>

            {/* YouTube Video URL Section */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-red-600" />
                  YouTube Video URL
                </label>
              </div>

              <div className="flex gap-2">
                <input
                  type="url"
                  value={videoInputUrl}
                  onChange={(e) => { setVideoInputUrl(e.target.value); setVideoError(''); }}
                  placeholder="Paste YouTube Video URL (e.g. https://youtu.be/...)"
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-red-500"
                />
                <button
                  type="button"
                  onClick={handleAddVideo}
                  className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Video
                </button>
              </div>
              {videoError && <p className="text-[11px] text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {videoError}</p>}

              <div className="space-y-2 pt-2 border-t border-slate-200">
              </div>
            </div>

            {/* Media Thumbnails & Ordering List */}
            {form.images.length > 0 && (
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Media Items &amp; Position (First to Last)</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {form.images.map((img, idx) => {
                    const isVideo = img.type === 'video' || !!extractYouTubeId(img.url || img.youtube_id);
                    const thumbUrl = img.type === 'video' ? (img.thumbnail_url || getYouTubeThumbnailUrl(img.youtube_id)) : img.url;

                    return (
                      <div key={idx} className={`relative rounded-xl border-2 overflow-hidden group flex flex-col bg-slate-50 ${img.is_default ? 'border-cyan-500 ring-2 ring-cyan-500/20' : 'border-slate-200'}`}>
                        <div className="relative aspect-square w-full bg-slate-200 overflow-hidden">
                          <img src={thumbUrl || 'https://placehold.co/400x300?text=No+Image'} alt="" className="w-full h-full object-cover" />

                          {isVideo && (
                            <div className="absolute top-1.5 left-1.5 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow">
                              <Play className="w-2.5 h-2.5 fill-white" /> VIDEO
                            </div>
                          )}

                          <button type="button" onClick={() => setDefaultImage(idx)} className={`absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center shadow transition-colors cursor-pointer z-10 ${img.is_default ? 'bg-cyan-500 text-white' : 'bg-white/80 text-slate-400 hover:text-cyan-500'}`} title="Set as Default">
                            <Star className={`w-3 h-3 ${img.is_default ? 'fill-white' : ''}`} />
                          </button>

                          <button type="button" onClick={() => removeImage(idx)} className="absolute bottom-1.5 right-1.5 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow opacity-90 hover:opacity-100 transition-opacity cursor-pointer z-10" title="Remove">
                            <X className="w-3 h-3" />
                          </button>

                          {img.is_default && <span className="absolute bottom-1.5 left-1.5 bg-cyan-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-md shadow">DEFAULT</span>}
                        </div>

                        <div className="p-1.5 bg-white border-t border-slate-200 flex items-center justify-between gap-1">
                          <span className="text-[10px] font-bold text-slate-500 pl-1">#{idx + 1}</span>
                          <div className="flex items-center gap-1">
                            <button type="button" onClick={() => moveMediaItem(idx, idx - 1)} disabled={idx === 0} className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed text-slate-700 flex items-center justify-center cursor-pointer transition-colors" title="Move Left / Earlier">
                              <ArrowLeft className="w-3 h-3" />
                            </button>
                            <button type="button" onClick={() => moveMediaItem(idx, idx + 1)} disabled={idx === form.images.length - 1} className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed text-slate-700 flex items-center justify-center cursor-pointer transition-colors" title="Move Right / Later">
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Details (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            {/* Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Name (EN) <span className="text-red-400">*</span></label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Red Cherry Shrimp" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:bg-white transition-all" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Name (BN)</label>
                <input type="text" value={form.name_bn} onChange={(e) => setForm({ ...form, name_bn: e.target.value })} placeholder="রেড চেরি শ্রিম্প" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:bg-white transition-all" />
              </div>
            </div>

            {/* Quantity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Quantity (EN)</label>
                <input type="text" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="e.g. 10 pcs, 500g, 1 pair" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:bg-white transition-all" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Quantity (BN)</label>
                <input type="text" value={form.quantity_bn} onChange={(e) => setForm({ ...form, quantity_bn: e.target.value })} placeholder="যেমন ১০ পিস, ৫০০ গ্রাম" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:bg-white transition-all" />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Category <span className="text-red-400">*</span></label>
              <select value={form.category_id || form.category} onChange={(e) => { const val = e.target.value; const found = categories.find((c) => String(c.id) === val || c.slug === val); setForm({ ...form, category: found ? found.slug : val, category_id: found ? String(found.id) : '' }); }} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:bg-white transition-all">
                {motherCategories.map((m) => { const subs = getSubCategories(m.id); return (<optgroup key={m.id} label={m.name}><option value={m.id}>{m.name}</option>{subs.map((s) => <option key={s.id} value={s.id}>└ {s.name}</option>)}</optgroup>); })}
              </select>
            </div>

            {/* Price */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Price ({CURRENCY_SYMBOL}) <span className="text-red-400">*</span></label>
                <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required placeholder="450" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:bg-white transition-all" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Original Price</label>
                <input type="number" value={form.original_price} onChange={(e) => setForm({ ...form, original_price: e.target.value })} placeholder="550" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:bg-white transition-all" />
              </div>
            </div>

            {/* Descriptions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <DescriptionInput label="Description (EN)" value={form.description} onChange={(val) => setForm({ ...form, description: val })} placeholder="Product details..." rows={3} />
              <DescriptionInput label="Description (BN)" value={form.description_bn} onChange={(val) => setForm({ ...form, description_bn: val })} placeholder="পণ্যের বিবরণ..." rows={3} />
            </div>

            {/* Search Keywords */}
            {(() => {
              const kwList = form.keywords.split(',').map((k) => k.trim()).filter(Boolean);
              const kwCount = kwList.length;
              const tooFew = kwCount < 3;
              const tooMany = kwCount > 10;
              const kwOk = !tooFew && !tooMany && kwCount > 0;
              return (
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">
                    Search Keywords <span className="text-red-400">*</span>
                    <span className={`ml-2 normal-case font-bold text-[10px] ${kwOk ? 'text-emerald-600' : (tooFew || tooMany) ? 'text-red-500' : 'text-slate-400'}`}>
                      {kwCount}/10
                    </span>
                  </label>
                  <input
                    type="text"
                    value={form.keywords}
                    onChange={(e) => setForm({ ...form, keywords: e.target.value })}
                    placeholder="shrimp, red cherry, চিংড়ি, aquarium cleaner, ..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:bg-white transition-all"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Comma separated keywords for search — English &amp; Bangla.</p>
                  {tooFew && <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Add at least 3 keywords.</p>}
                  {tooMany && <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Maximum 10 keywords allowed.</p>}
                  {kwCount > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {kwList.map((k, i) => (
                        <span key={i} className="bg-cyan-50 text-cyan-700 border border-cyan-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full">{k}</span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Toggles */}
            <div className="flex items-center gap-4 pt-1">
              <label className="flex items-center gap-2.5 text-xs font-medium text-slate-600 cursor-pointer select-none">
                <div className="relative"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="peer sr-only" /><div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:bg-cyan-500 transition-colors" /><div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-4 transition-transform" /></div>
                Featured
              </label>
              <label className="flex items-center gap-2.5 text-xs font-medium text-slate-600 cursor-pointer select-none">
                <div className="relative"><input type="checkbox" checked={form.deals} onChange={(e) => setForm({ ...form, deals: e.target.checked })} className="peer sr-only" /><div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:bg-amber-400 transition-colors" /><div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-4 transition-transform" /></div>
                Offer &amp; Deals
              </label>
              <label className="flex items-center gap-2.5 text-xs font-medium text-slate-600 cursor-pointer select-none">
                <div className="relative"><input type="checkbox" checked={form.available} onChange={(e) => setForm({ ...form, available: e.target.checked })} className="peer sr-only" /><div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:bg-emerald-500 transition-colors" /><div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-4 transition-transform" /></div>
                In Stock
              </label>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
          <button type="submit" disabled={saving || uploadingImage} className="flex-1 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white font-semibold text-sm py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-lg shadow-cyan-600/20">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isEdit ? 'Update Product' : 'Save Product'}
          </button>
          {onCancel && (
            <button type="button" onClick={onCancel} disabled={saving} className="sm:w-40 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-semibold py-3 rounded-xl transition-colors cursor-pointer disabled:opacity-50">
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}