'use client';

import React, { useState, useEffect, useCallback, useRef, Fragment } from 'react';
import {
  Plus, Pencil, Trash2, Package, X, Loader2, Save, UploadCloud,
  Image as ImageIcon, CheckCircle, Search, Filter, Star, Check, AlertCircle,
} from 'lucide-react';
import DescriptionInput from '@/components/DescriptionInput';
import FormattedText from '@/components/FormattedText';
import { formatPrice, CURRENCY_SYMBOL, DEFAULT_CURRENCY } from '@/lib/currency';

const EMPTY_FORM = {
  name: '', name_bn: '', quantity: '', quantity_bn: '', category: '', category_id: '', price: '', original_price: '',
  description: '', description_bn: '', image: '', images: [], keywords: '', featured: false, deals: false, available: true,
};

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const fileInputRef = useRef(null);

  const motherCategories = categories.filter((c) => !c.parent_id);
  const getSubCategories = (motherId) => categories.filter((c) => c.parent_id === motherId);

  const getCategoryPath = (p) => {
    const cat = categories.find((c) => String(c.id) === String(p.category_id) || c.slug === p.category);
    if (!cat) return p.category || 'Unknown';
    if (cat.parent_id) {
      const mother = categories.find((c) => c.id === cat.parent_id);
      return mother ? `${mother.name} > ${cat.name}` : cat.name;
    }
    return cat.name;
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([fetch('/api/admin/products'), fetch('/api/admin/categories')]);
      const pData = await pRes.json();
      const cData = await cRes.json();
      setProducts(pData.products || []);
      setCategories(cData.categories || []);
    } catch (e) { setErrorMsg(e.message); } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
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
          const newImages = [...p.images, { url: res.url, is_default: p.images.length === 0 }];
          return { ...p, images: newImages, image: newImages[0]?.url || '' };
        });
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (idx) => {
    setForm((p) => {
      const newImages = p.images.filter((_, i) => i !== idx);
      const newDefault = newImages.length > 0
        ? newImages.some((img) => img.is_default)
          ? newImages
          : newImages.map((img, i) => i === 0 ? { ...img, is_default: true } : img)
        : [];
      return { ...p, images: newDefault, image: newDefault[0]?.url || '' };
    });
  };

  const setDefaultImage = (idx) => {
    setForm((p) => {
      const newImages = p.images.map((img, i) => ({ ...img, is_default: i === idx }));
      return { ...p, images: newImages, image: newImages[idx]?.url || p.image };
    });
  };

  const openCreate = () => {
    setEditingId(null);
    const def = categories.length > 0 ? categories[0].slug : 'plants';
    const defCat = categories.find((c) => c.slug === def);
    setForm({ ...EMPTY_FORM, category: def, category_id: defCat ? String(defCat.id) : '' });
    setUploadError(''); setFormOpen(true);
  };

  const openEdit = (p) => {
    setEditingId(p.id);
    let images = [];
    if (p.images && Array.isArray(p.images) && p.images.length > 0) {
      images = p.images;
    } else if (p.image) {
      images = [{ url: p.image, is_default: true }];
    }
    setForm({
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
    });
    setUploadError(''); setFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); if (form.images.length === 0) { setErrorMsg('At least one product image is required.'); return; }
    const kwCount = form.keywords.split(',').map((k) => k.trim()).filter(Boolean).length;
    if (kwCount < 3) { setErrorMsg('Provide at least 3 search keywords (comma separated).'); return; }
    if (kwCount > 10) { setErrorMsg('Maximum 10 search keywords allowed.'); return; }
    setSaving(true); try {
      const res = await fetch(editingId ? `/api/admin/products/${editingId}` : '/api/admin/products', {
        method: editingId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          original_price: form.original_price ? Number(form.original_price) : null,
          category_id: form.category_id ? Number(form.category_id) : null,
          images: form.images,
          image: form.images.find((img) => img.is_default)?.url || form.images[0]?.url || '',
        }),
      }); const data = await res.json(); if (!res.ok) throw new Error(data.error || 'Save failed');
      setFormOpen(false); setSuccessMsg(editingId ? 'Product updated!' : 'Product created!'); loadData();
    } catch (err) { setErrorMsg(err.message); } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return; setSaving(true); try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' }); const data = await res.json();
      if (!res.ok) throw new Error(data.error); setSuccessMsg('Product deleted'); loadData();
    } catch (err) { setErrorMsg(err.message); } finally { setSaving(false); }
  };

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    const ms = !search || p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q)) || (p.keywords && p.keywords.toLowerCase().includes(q));
    const mc = categoryFilter === 'all' || p.category === categoryFilter || String(p.category_id) === String(categoryFilter);
    return ms && mc;
  });

  return (
    <div className="w-full min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div><h2 className="text-2xl font-bold text-slate-900">Products Catalog</h2><p className="text-xs text-slate-500 mt-1">Upload new products or manage existing inventory</p></div>
        <button onClick={openCreate} className="bg-cyan-600 text-white px-5 py-2.5 rounded-full text-xs font-bold hover:bg-cyan-700 transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-cyan-600/20"><Plus className="w-4 h-4" /> Upload Product</button>
      </div>
      {successMsg && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs p-3.5 rounded-xl mb-6 flex items-center gap-2"><CheckCircle className="w-4 h-4 shrink-0" /><span>{successMsg}</span></div>}
      {errorMsg && <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3.5 rounded-xl mb-6 flex items-center gap-2"><AlertCircle className="w-4 h-4 shrink-0" /><span>{errorMsg}</span></div>}
      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="relative w-full sm:w-72"><Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" /><input type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-cyan-600 focus:bg-white" /></div>
        <div className="flex items-center gap-2 w-full sm:w-auto"><Filter className="w-4 h-4 text-cyan-600 shrink-0" /><select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-full sm:w-48 bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-cyan-600 focus:bg-white"><option value="all">All Categories</option>{motherCategories.map((m) => { const subs = getSubCategories(m.id); return (<Fragment key={m.id}><option value={m.slug}>{m.name} (Mother)</option>{subs.map((s) => <option key={s.id} value={s.slug}>&nbsp;&nbsp;└─ {s.name}</option>)}</Fragment>); })}</select></div>
      </div>
      {loading ? (<div className="py-16 text-center text-cyan-600"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" /><p className="text-xs text-slate-500">Loading products...</p></div>)
      : filtered.length === 0 ? (<div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm"><Package className="w-12 h-12 text-slate-300 mx-auto mb-3" /><h3 className="text-base font-bold text-slate-900 mb-1">No products found</h3><p className="text-xs text-slate-500 mb-4">Click &quot;Upload Product&quot; to add your first item.</p><button onClick={openCreate} className="bg-cyan-600 text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-cyan-700 inline-flex items-center gap-2 cursor-pointer"><Plus className="w-4 h-4" /> Upload Product Now</button></div>)
      : (<div className="space-y-3 max-w-full">{filtered.map((p) => {
        const discount = p.original_price && p.original_price > p.price ? Math.round(((p.original_price - p.price) / p.original_price) * 100) : null;
        return (<div key={p.id} className="bg-white border border-slate-200 hover:border-cyan-600/50 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center gap-3 transition-all shadow-sm hover:shadow-md group min-w-0">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
              <img src={p.image || 'https://placehold.co/400x300?text=No+Image'} alt={p.name} className="w-full h-full object-cover" />
              {p.featured && <span className="absolute top-1 left-1 bg-amber-400 text-slate-900 text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm"><Star className="w-2.5 h-2.5 fill-slate-900" /></span>}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="font-bold text-sm text-slate-900 truncate group-hover:text-cyan-600 transition-colors">{p.name}</h3>
                {p.deals && <span className="bg-amber-400 text-slate-900 text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0">DEAL</span>}
                {discount && <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0">{discount}% OFF</span>}
              </div>
              <p className="text-[11px] text-slate-500 truncate mb-1 hidden sm:block">{p.description || 'No description.'}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">{getCategoryPath(p)}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.available !== false ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>{p.available !== false ? 'In Stock' : 'Out of Stock'}</span>
                {p.keywords && p.keywords.split(',').filter(Boolean).length > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200">{p.keywords.split(',').filter(Boolean).length} kw</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 sm:ml-auto">
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold text-cyan-700">{formatPrice(p.price)}</span>
              {p.original_price && <span className="text-[10px] text-slate-400 line-through">{formatPrice(p.original_price)}</span>}
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => openEdit(p)} className="p-1.5 text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors cursor-pointer" title="Edit"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(p.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" title="Delete"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        </div>);
      })}</div>)}
      {formOpen && (<div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/50 backdrop-blur-md">
        <div className="w-full max-w-5xl bg-white rounded-3xl relative max-h-[92vh] overflow-hidden shadow-2xl text-slate-900 flex flex-col">

          {/* Header */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-cyan-600 to-cyan-700 px-6 py-4 flex items-center justify-between flex-shrink-0">
            <div>
              <h3 className="text-sm font-bold text-white">{editingId ? 'Edit Product' : 'New Product'}</h3>
              <p className="text-[11px] text-cyan-100 mt-0.5">Fill in the details below</p>
            </div>
            <button onClick={() => setFormOpen(false)} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"><X className="w-4 h-4" /></button>
          </div>

          {/* Scrollable Form */}
          <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-6">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

              {/* LEFT: Images (2 cols) */}
              <div className="lg:col-span-2 space-y-4">
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Images <span className="text-red-400">*</span></label>
                  <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-slate-200 hover:border-cyan-400 bg-slate-50 rounded-2xl py-8 text-center cursor-pointer transition-all hover:bg-cyan-50/30 group">
                    <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" multiple className="hidden" />
                    {uploadingImage ? (
                      <div className="flex flex-col items-center justify-center gap-2 text-cyan-600"><Loader2 className="w-6 h-6 animate-spin" /><span className="text-xs font-medium">Uploading...</span></div>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-2 text-slate-400 group-hover:text-cyan-600 transition-colors">
                        <UploadCloud className="w-8 h-8" />
                        <span className="text-xs font-medium">{form.images.length > 0 ? 'Add more images' : 'Click to upload images'}</span>
                        <span className="text-[10px] text-slate-400">PNG, JPG, WEBP (max 4.5MB)</span>
                      </div>
                    )}
                  </div>
                  {uploadError && <p className="text-[11px] text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {uploadError}</p>}
                  <div className="flex gap-2 mt-2">
                    <input type="url" id="imageUrlInput" placeholder="Paste image URL..." className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-cyan-400 focus:bg-white" />
                    <button type="button" onClick={() => { const inp = document.getElementById('imageUrlInput'); if (inp && inp.value) { setForm((p) => { const newImages = [...p.images, { url: inp.value, is_default: p.images.length === 0 }]; return { ...p, images: newImages, image: newImages[0]?.url || '' }; }); inp.value = ''; } }} className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold px-3 py-2 rounded-xl transition-colors cursor-pointer">Add</button>
                  </div>
                </div>

                {form.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {form.images.map((img, idx) => (
                      <div key={idx} className={`relative rounded-xl border-2 overflow-hidden group aspect-square ${img.is_default ? 'border-cyan-500 ring-2 ring-cyan-500/20' : 'border-slate-200'}`}>
                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => setDefaultImage(idx)} className={`absolute top-1.5 left-1.5 w-6 h-6 rounded-full flex items-center justify-center shadow transition-colors cursor-pointer ${img.is_default ? 'bg-cyan-500 text-white' : 'bg-white/80 text-slate-400 hover:text-cyan-500'}`} title="Default">
                          <Star className={`w-3 h-3 ${img.is_default ? 'fill-white' : ''}`} />
                        </button>
                        <button type="button" onClick={() => removeImage(idx)} className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" title="Remove">
                          <X className="w-3 h-3" />
                        </button>
                        {img.is_default && <span className="absolute bottom-1 left-1 bg-cyan-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-md">DEFAULT</span>}
                      </div>
                    ))}
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
            <div className="mt-6 pt-5 border-t border-slate-100">
              <button type="submit" disabled={saving || uploadingImage} className="w-full bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white font-semibold text-sm py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-lg shadow-cyan-600/20">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editingId ? 'Update Product' : 'Save Product'}
              </button>
            </div>
          </form>
        </div>
      </div>)}
    </div>
  );
}
