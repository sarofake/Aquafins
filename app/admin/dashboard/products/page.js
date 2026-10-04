'use client';

import React, { useState, useEffect, useCallback, Fragment } from 'react';
import Link from 'next/link';
import {
  Plus, Pencil, Trash2, Package, X, Loader2,
  CheckCircle, Search, Filter, Star, AlertCircle, Eye,
} from 'lucide-react';
import ProductForm from '@/components/admin/ProductForm';
import ProductModal from '@/components/ProductModal';
import { formatPrice } from '@/lib/currency';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [previewProduct, setPreviewProduct] = useState(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

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
    if (!previewProduct) return;
    const el = document.documentElement;
    const hadLight = el.classList.contains('light');
    el.classList.remove('light');
    return () => { if (hadLight) el.classList.add('light'); };
  }, [previewProduct]);
  useEffect(() => {
    if (successMsg || errorMsg) { const t = setTimeout(() => { setSuccessMsg(''); setErrorMsg(''); }, 4000); return () => clearTimeout(t); }
  }, [successMsg, errorMsg]);

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
        <button onClick={() => setFormOpen(true)} className="bg-cyan-600 text-white px-5 py-2.5 rounded-full text-xs font-bold hover:bg-cyan-700 transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-cyan-600/20"><Plus className="w-4 h-4" /> Upload Product</button>
      </div>
      {successMsg && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs p-3.5 rounded-xl mb-6 flex items-center gap-2"><CheckCircle className="w-4 h-4 shrink-0" /><span>{successMsg}</span></div>}
      {errorMsg && <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3.5 rounded-xl mb-6 flex items-center gap-2"><AlertCircle className="w-4 h-4 shrink-0" /><span>{errorMsg}</span></div>}
      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="relative w-full sm:w-72"><Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-2/2" /><input type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-cyan-600 focus:bg-white" /></div>
        <div className="flex items-center gap-2 w-full sm:w-auto"><Filter className="w-4 h-4 text-cyan-600 shrink-0" /><select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-full sm:w-48 bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-cyan-600 focus:bg-white"><option value="all">All Categories</option>{motherCategories.map((m) => { const subs = getSubCategories(m.id); return (<Fragment key={m.id}><option value={m.slug}>{m.name} (Mother)</option>{subs.map((s) => <option key={s.id} value={s.slug}>&nbsp;&nbsp;└─ {s.name}</option>)}</Fragment>); })}</select></div>
      </div>
      {loading ? (<div className="py-16 text-center text-cyan-600"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" /><p className="text-xs text-slate-500">Loading products...</p></div>)
      : filtered.length === 0 ? (<div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm"><Package className="w-12 h-12 text-slate-300 mx-auto mb-3" /><h3 className="text-base font-bold text-slate-900 mb-1">No products found</h3><p className="text-xs text-slate-500 mb-4">Click &quot;Upload Product&quot; to add your first item.</p><button onClick={() => setFormOpen(true)} className="bg-cyan-600 text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-cyan-700 inline-flex items-center gap-2 cursor-pointer"><Plus className="w-4 h-4" /> Upload Product Now</button></div>)
      : (<div className="space-y-3 max-w-full">{filtered.map((p) => {
        const href = `/admin/dashboard/products/${p.id}`;
        const discount = p.original_price && p.original_price > p.price ? Math.round(((p.original_price - p.price) / p.original_price) * 100) : null;
        return (<div key={p.id} className="bg-white border border-slate-200 hover:border-cyan-600/50 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center gap-3 transition-all shadow-sm hover:shadow-md group min-w-0">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Link href={href} className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 cursor-pointer">
              <img src={p.image || 'https://placehold.co/400x300?text=No+Image'} alt={p.name} className="w-full h-full object-cover" />
              {p.featured && <span className="absolute top-1 left-1 bg-amber-400 text-slate-900 text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm"><Star className="w-2.5 h-2.5 fill-slate-900" /></span>}
            </Link>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <Link href={href} className="min-w-0"><h3 className="font-bold text-sm text-slate-900 truncate group-hover:text-cyan-600 transition-colors hover:text-cyan-600">{p.name}</h3></Link>
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
              <button onClick={() => setPreviewProduct(p)} className="p-1.5 text-slate-500 hover:text-cyan-600 hover:bg-cyan-50 border border-slate-200 rounded-lg transition-colors cursor-pointer" title="Show as client"><Eye className="w-4 h-4" /></button>
              <Link href={href} className="p-1.5 text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors" title="Edit"><Pencil className="w-4 h-4" /></Link>
              <button onClick={() => handleDelete(p.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" title="Delete"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        </div>);
      })}</div>)}
      {previewProduct && (
        <div className="fixed inset-0 z-[60]">
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[70] bg-slate-900/90 text-white text-[11px] font-bold px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg pointer-events-none">
            <Eye className="w-3.5 h-3.5" /> Client view preview
          </div>
          <ProductModal product={previewProduct} onClose={() => setPreviewProduct(null)} />
        </div>
      )}
      {formOpen && (<div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/50 backdrop-blur-md">
        <div className="w-full max-w-5xl bg-white rounded-3xl relative max-h-[92vh] overflow-hidden shadow-2xl text-slate-900 flex flex-col">

          {/* Header */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-cyan-600 to-cyan-700 px-6 py-4 flex items-center justify-between flex-shrink-0">
            <div>
              <h3 className="text-sm font-bold text-white">New Product</h3>
              <p className="text-[11px] text-cyan-100 mt-0.5">Fill in the details below</p>
            </div>
            <button onClick={() => setFormOpen(false)} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"><X className="w-4 h-4" /></button>
          </div>

          {/* Scrollable Form */}
          <div className="overflow-y-auto flex-1 p-6">
            <ProductForm
              categories={categories}
              onSaved={() => { setFormOpen(false); setSuccessMsg('Product created!'); loadData(); }}
              onCancel={() => setFormOpen(false)}
            />
          </div>
        </div>
      </div>)}
    </div>
  );
}