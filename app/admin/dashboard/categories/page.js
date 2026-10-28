'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Plus, Pencil, Trash2, X, Loader2, Save, FolderPlus, UploadCloud,
  Image as ImageIcon, CheckCircle, AlertCircle,
} from 'lucide-react';
import DescriptionInput from '@/components/DescriptionInput';
import FormattedText from '@/components/FormattedText';
import { CATEGORY_ICON_NAMES, resolveCategoryIcon } from '@/lib/categoryIcons';
import { fetchWithCache } from '@/lib/fetchCache';
import { invalidateAdminAndCatalog } from '@/lib/clientCache';

const ADMIN_TTL_MS = 5 * 60 * 1000;

/** Renders the icon an admin picked for a category (stored in categories.icon). */
function CategoryGlyph({ name, className }) {
  const Icon = resolveCategoryIcon(name);
  return <Icon className={className} />;
}

const EMPTY_FORM = { name: '', name_bn: '', slug: '', parent_id: '', description: '', description_bn: '', image: '', image_public_id: '', icon: 'Grid', sort_order: '0' };

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
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

  const motherCategories = categories.filter((c) => !c.parent_id);
  const getSubCategories = (motherId) => categories.filter((c) => c.parent_id === motherId);

  const loadData = useCallback(async (force = false) => {
    setLoading(true); try { const data = await fetchWithCache('/api/admin/categories', 'admin_categories', ADMIN_TTL_MS, { force }); setCategories(data.categories || []); } catch (e) { setErrorMsg(e.message); } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { if (successMsg || errorMsg) { const t = setTimeout(() => { setSuccessMsg(''); setErrorMsg(''); }, 4000); return () => clearTimeout(t); } }, [successMsg, errorMsg]);

  const uploadImageFile = async (file) => {
    setUploadingImage(true); setUploadError('');
    if (file.size > 4.5 * 1024 * 1024) { setUploadError('Image > 4.5MB.'); setUploadingImage(false); return null; }
    try { const fd = new FormData(); fd.append('file', file); fd.append('folder', 'categories'); const res = await fetch('/api/admin/upload', { method: 'POST', body: fd }); const data = await res.json(); if (!res.ok) throw new Error(data.error); return data; } catch (err) { setUploadError(err.message); return null; } finally { setUploadingImage(false); }
  };

  const handleImageChange = async (e) => { const file = e.target.files?.[0]; if (!file) return; const res = await uploadImageFile(file); if (res?.url) setForm((p) => ({ ...p, image: res.url, image_public_id: res.public_id || '' })); };

  const openCreate = (parentId = '') => { setEditingId(null); setForm({ ...EMPTY_FORM, parent_id: parentId ? String(parentId) : '' }); setUploadError(''); setFormOpen(true); };
  const openEdit = (cat) => { setEditingId(cat.id); setForm({ name: cat.name || '', name_bn: cat.name_bn || '', slug: cat.slug || '', parent_id: cat.parent_id ? String(cat.parent_id) : '', description: cat.description || '', description_bn: cat.description_bn || '', image: cat.image || '', image_public_id: cat.image_public_id || '', icon: cat.icon || 'Grid', sort_order: String(cat.sort_order || 0) }); setUploadError(''); setFormOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); try {
      const res = await fetch(editingId ? `/api/admin/categories/${editingId}` : '/api/admin/categories', { method: editingId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json(); if (!res.ok) throw new Error(data.error); setFormOpen(false); setSuccessMsg(editingId ? 'Category updated!' : 'Category created!'); invalidateAdminAndCatalog(); loadData();
    } catch (err) { setErrorMsg(err.message); } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category? All sub-categories will also be deleted!')) return; setSaving(true); try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' }); const data = await res.json();
      if (!res.ok) throw new Error(data.error); setSuccessMsg('Category deleted'); invalidateAdminAndCatalog(); loadData();
    } catch (err) { setErrorMsg(err.message); } finally { setSaving(false); }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div><h2 className="text-2xl font-bold text-slate-900">Mother & Sub-Category Tree</h2><p className="text-xs text-slate-500 mt-1">Manage categories with Cloudinary thumbnails</p></div>
        <button onClick={() => openCreate('')} className="bg-cyan-600 text-white px-5 py-2.5 rounded-full text-xs font-bold hover:bg-cyan-700 transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-cyan-600/20"><FolderPlus className="w-4 h-4" /> Add Mother Category</button>
      </div>
      {successMsg && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs p-3.5 rounded-xl mb-6 flex items-center gap-2"><CheckCircle className="w-4 h-4 shrink-0" /><span>{successMsg}</span></div>}
      {errorMsg && <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3.5 rounded-xl mb-6 flex items-center gap-2"><AlertCircle className="w-4 h-4 shrink-0" /><span>{errorMsg}</span></div>}
      {loading ? (<div className="py-12 text-center text-cyan-600"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" /><p className="text-xs text-slate-500">Loading categories...</p></div>)
      : motherCategories.length === 0 ? (<div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm"><FolderPlus className="w-12 h-12 text-slate-300 mx-auto mb-3" /><h3 className="text-base font-bold text-slate-900 mb-1">No categories yet</h3><p className="text-xs text-slate-500 mb-4">Create your first Mother Category.</p><button onClick={() => openCreate('')} className="bg-cyan-600 text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-cyan-700 inline-flex items-center gap-2 cursor-pointer"><FolderPlus className="w-4 h-4" /> Create Mother Category</button></div>)
      : (<div className="space-y-6">{motherCategories.map((mother) => { const subs = getSubCategories(mother.id); return (<div key={mother.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"><div className="flex items-center justify-between pb-4 border-b border-slate-200"><div className="flex items-center gap-4"><div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center text-cyan-600">{mother.image ? <img src={mother.image} alt={mother.name} className="w-full h-full object-cover" /> : <CategoryGlyph name={mother.icon} className="w-6 h-6 opacity-70" />}</div><div><div className="flex items-center gap-2"><h3 className="font-bold text-lg text-slate-900">{mother.name}</h3><span className="text-[10px] uppercase font-bold bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded-full border border-cyan-200">Mother</span></div><p className="text-xs text-slate-500">{mother.description || `Slug: ${mother.slug}`}</p></div></div><div className="flex items-center gap-2"><button onClick={() => openCreate(mother.id)} className="bg-slate-50 hover:bg-slate-100 text-cyan-700 px-3 py-1.5 rounded-full text-xs font-bold border border-cyan-200 transition-all flex items-center gap-1.5 cursor-pointer"><Plus className="w-3.5 h-3.5" /> Add Sub</button><button onClick={() => openEdit(mother)} className="p-1.5 text-slate-500 hover:text-cyan-600 transition-colors cursor-pointer" title="Edit"><Pencil className="w-4 h-4" /></button><button onClick={() => handleDelete(mother.id)} className="p-1.5 text-slate-500 hover:text-red-600 transition-colors cursor-pointer" title="Delete"><Trash2 className="w-4 h-4" /></button></div></div><div className="mt-4 pt-2">{subs.length === 0 ? <p className="text-xs text-slate-400 italic pl-4 py-2">No sub-categories yet.</p> : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pl-4">{subs.map((sub) => (<div key={sub.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between"><div className="flex items-center gap-3">{sub.image ? <img src={sub.image} alt={sub.name} className="w-8 h-8 rounded-lg object-cover border border-slate-200" /> : <CategoryGlyph name={sub.icon} className="w-4 h-4 text-cyan-600" />}<div><h4 className="text-xs font-bold text-slate-900">{sub.name}</h4><span className="text-[10px] text-slate-500">slug: {sub.slug}</span></div></div><div className="flex items-center gap-1"><button onClick={() => openEdit(sub)} className="p-1 text-slate-500 hover:text-cyan-600 cursor-pointer"><Pencil className="w-3.5 h-3.5" /></button><button onClick={() => handleDelete(sub.id)} className="p-1 text-slate-500 hover:text-red-600 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button></div></div>))}</div>}</div></div>); })}</div>)}
      {formOpen && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"><div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto shadow-2xl text-slate-900"><button onClick={() => setFormOpen(false)} className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"><X className="w-5 h-5" /></button><div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200"><div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600"><FolderPlus className="w-5 h-5" /></div><div><h3 className="text-lg font-bold text-slate-900">{editingId ? 'Edit Category' : form.parent_id ? 'Create Sub-Category' : 'Create Mother Category'}</h3><p className="text-xs text-slate-500">Upload thumbnail & manage details</p></div></div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div><label className="block text-xs font-semibold text-slate-700 mb-2">Category Thumbnail</label><div className="grid grid-cols-1 sm:grid-cols-3 gap-3"><div onClick={() => fileInputRef.current?.click()} className="sm:col-span-2 border-2 border-dashed border-cyan-300 hover:border-cyan-600 bg-slate-50 rounded-2xl p-4 text-center cursor-pointer transition-all hover:bg-cyan-50/50 flex flex-col items-center justify-center group"><input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />{uploadingImage ? <div className="py-2 text-cyan-600 flex flex-col items-center gap-1"><Loader2 className="w-6 h-6 animate-spin" /><span className="text-[11px] font-semibold">Uploading...</span></div> : <><UploadCloud className="w-6 h-6 text-cyan-600 mb-1 group-hover:scale-110 transition-transform" /><p className="text-xs font-bold text-slate-900">Upload Thumbnail</p><p className="text-[10px] text-slate-500">Cloudinary image</p></>}</div><div className="relative h-28 sm:h-auto rounded-xl border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center">{form.image ? <img src={form.image} alt="Preview" className="w-full h-full object-cover" /> : <div className="text-center p-2 text-slate-400"><ImageIcon className="w-6 h-6 mx-auto mb-1 opacity-50" /><span className="text-[10px] block">No thumbnail</span></div>}</div></div><div className="mt-2"><input type="url" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="Or paste image URL" className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-cyan-600 focus:bg-white" /></div></div>
        <div><label className="block text-xs font-semibold text-slate-700 mb-1">Category Type</label><select value={form.parent_id} onChange={(e) => setForm({ ...form, parent_id: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-cyan-600 focus:bg-white"><option value="">Top-Level Mother Category</option>{motherCategories.map((m) => <option key={m.id} value={m.id}>Sub under {m.name}</option>)}</select></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div><label className="block text-xs font-semibold text-slate-700 mb-1">Name (English) <span className="text-cyan-600">*</span></label><input type="text" value={form.name} onChange={(e) => { const name = e.target.value; const slug = name.toLowerCase().trim().replace(/\s+/g, '-'); setForm({ ...form, name, slug: editingId ? form.slug : slug }); }} required placeholder="e.g. Anubias & Ferns" className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-cyan-600 focus:bg-white" /></div><div><label className="block text-xs font-semibold text-slate-700 mb-1">Name (Bangla - Optional)</label><input type="text" value={form.name_bn} onChange={(e) => setForm({ ...form, name_bn: e.target.value })} placeholder="e.g. অনুবিয়াস" className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-cyan-600 focus:bg-white" /></div></div>
        <div><label className="block text-xs font-semibold text-slate-700 mb-1">Slug</label><input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required placeholder="e.g. anubias-ferns" className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-cyan-600 focus:bg-white" /></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DescriptionInput
            label="Description (English)"
            value={form.description}
            onChange={(val) => setForm({ ...form, description: val })}
            placeholder="Brief description... Paste bullets & bold text directly."
            rows={3}
          />
          <DescriptionInput
            label="Description (Bangla - Optional)"
            value={form.description_bn}
            onChange={(val) => setForm({ ...form, description_bn: val })}
            placeholder="সংক্ষিপ্ত বিবরণ... Paste bullets & bold text directly."
            rows={3}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="block text-xs font-semibold text-slate-700 mb-1">Sort Order</label><input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-cyan-600 focus:bg-white" /></div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Card Icon</label>
            <div className="flex items-center gap-2">
              <span className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600 shrink-0">
                <CategoryGlyph name={form.icon} className="w-5 h-5" />
              </span>
              <select value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-cyan-600 focus:bg-white">
                {CATEGORY_ICON_NAMES.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Shown on the category card and the header/footer menus.</p>
          </div>
        </div>
        <button type="submit" disabled={saving || uploadingImage} className="w-full bg-cyan-600 text-white font-bold py-3.5 rounded-xl hover:bg-cyan-700 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-cyan-600/20 disabled:opacity-50">{saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} Save Category</button>
      </form></div></div>)}
    </div>
  );
}
