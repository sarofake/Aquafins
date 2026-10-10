'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Package, AlertCircle, Trash2 } from 'lucide-react';
import ProductForm from '@/components/admin/ProductForm';
import { fetchWithCache } from '@/lib/fetchCache';
import { invalidateAdminAndCatalog } from '@/lib/clientCache';

const ADMIN_TTL_MS = 5 * 60 * 1000;

export default function ProductEditPage() {
  const { productid } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [deleting, setDeleting] = useState(false);

  const loadData = useCallback(async (force = false) => {
    setLoading(true);
    try {
      let pData;
      try {
        pData = await fetchWithCache(`/api/admin/products/${productid}`, `admin_product_${productid}`, ADMIN_TTL_MS, { force });
      } catch (err) {
        if (err.status === 404) { setNotFound(true); setProduct(null); return; }
        throw err;
      }
      const cData = await fetchWithCache('/api/admin/categories', 'admin_categories', ADMIN_TTL_MS, { force });
      setProduct(pData.product);
      setCategories(cData.categories || []);
      setNotFound(false);
    } catch (e) {
      setErrorMsg(e.message);
    } finally {
      setLoading(false);
    }
  }, [productid]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this product?')) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${productid}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      invalidateAdminAndCatalog();
      router.push('/admin/dashboard/products');
    } catch (err) {
      setErrorMsg(err.message);
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-cyan-600">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
        <p className="text-xs text-slate-500">Loading product...</p>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
        <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-900 mb-1">Product not found</h3>
        <p className="text-xs text-slate-500 mb-4">
          {errorMsg || `No product exists with id "${productid}".`}
        </p>
        <Link href="/admin/dashboard/products" className="bg-cyan-600 text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-cyan-700 inline-flex items-center gap-2">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-start gap-3 min-w-0">
          <Link href="/admin/dashboard/products" className="mt-1 w-9 h-9 shrink-0 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-cyan-600 hover:border-cyan-300 flex items-center justify-center transition-colors" title="Back to products">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="min-w-0">
            <h2 className="text-2xl font-bold text-slate-900 truncate">{product.name}</h2>
            <p className="text-xs text-slate-500 mt-1">
              Editing product <span className="font-mono text-slate-700">#{product.id}</span> — changes save to the live catalog.
            </p>
          </div>
        </div>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="bg-white border border-red-200 text-red-500 hover:bg-red-50 px-4 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
        >
          {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Delete
        </button>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3.5 rounded-xl mb-6 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" /><span>{errorMsg}</span>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
        <ProductForm
          key={product.id}
          product={product}
          categories={categories}
          onSaved={() => { invalidateAdminAndCatalog(); router.push('/admin/dashboard/products'); }}
          onCancel={() => router.push('/admin/dashboard/products')}
        />
      </div>
    </div>
  );
}