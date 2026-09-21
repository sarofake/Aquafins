import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/adminHelpers';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary if environment credentials exist
const hasCloudinaryKeys = Boolean(
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
);

if (hasCloudinaryKeys) {
  cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

// Vercel Functions cap the request body at 4.5 MB (all plans).
const MAX_UPLOAD_BYTES = 4.5 * 1024 * 1024;

function uploadBufferToCloudinary(buffer, folder = 'products') {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `aqua-fins/${folder}`,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
}

export async function POST(req) {
  const authCheck = requireAuth(req);
  if (authCheck) return authCheck;

  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const folder = formData.get('folder') || 'products';

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    const type = file.type || '';
    if (!type.startsWith('image/')) {
      return NextResponse.json({ error: 'Uploaded file must be an image' }, { status: 400 });
    }

    if (file.size && file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: 'Image exceeds the 4.5 MB upload limit. Please compress it first.' },
        { status: 413 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 1. Try Cloudinary if keys are present
    if (hasCloudinaryKeys) {
      try {
        const res = await uploadBufferToCloudinary(buffer, folder);
        return NextResponse.json({
          url: res.secure_url,
          public_id: res.public_id,
          provider: 'cloudinary',
        });
      } catch (cErr) {
        console.warn('Cloudinary upload failed, falling back to Supabase storage:', cErr);
      }
    }

    // 2. Fallback to Supabase Storage
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Neither Cloudinary nor Supabase Service Role Key configured' },
        { status: 503 }
      );
    }

    const originalName = file.name || 'image.jpg';
    const ext = originalName.split('.').pop() || 'jpg';
    const cleanBase = originalName
      .substring(0, originalName.lastIndexOf('.'))
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-');
    const filename = `${Date.now()}-${cleanBase || 'img'}.${ext}`;
    const filePath = `${folder}/${filename}`;

    const { data, error } = await supabaseAdmin.storage
      .from('product-images')
      .upload(filePath, buffer, {
        contentType: type,
        upsert: true,
      });

    if (error) {
      console.error('Supabase storage upload error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return NextResponse.json({
      url: publicUrlData.publicUrl,
      public_id: data.path,
      provider: 'supabase',
    });
  } catch (err) {
    console.error('Image upload handler error:', err);
    return NextResponse.json({ error: err.message || 'Failed to upload image' }, { status: 500 });
  }
}
