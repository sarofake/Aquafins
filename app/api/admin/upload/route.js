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

// Folder values are validated against this list (VULN-09: no arbitrary paths)
const ALLOWED_FOLDERS = new Set(['products', 'categories', 'site', 'hero']);

// Vercel Functions cap the request body at 4.5 MB (all plans).
const MAX_UPLOAD_BYTES = 4.5 * 1024 * 1024;

function uploadBufferToCloudinary(buffer, folder = 'products') {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `aqua-fins/${folder}`,
        // image (not auto): never accept video/other resource types
        resource_type: 'image',
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
}

/**
 * Magic-byte content verification (VULN-07): trust the file bytes, not the
 * client-declared MIME type — client-declared MIME is attacker-controlled.
 * Detects jpg, png, gif, and webp.
 * Returns the detected kind, or null for anything else (SVG, pdf, exes...).
 */
function detectImageKind(buffer) {
  if (!buffer || buffer.length < 12) return null;
  const b = buffer;

  // JPEG: FF D8 FF
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'jpg';

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 &&
    b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a
  ) {
    return 'png';
  }

  // GIF: GIF8
  if (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38) return 'gif';

  // WEBP: "RIFF"...."WEBP"
  if (
    b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
    b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50
  ) {
    return 'webp';
  }

  return null;
}

export async function POST(req) {
  const authCheck = await requireAuth(req);
  if (authCheck) return authCheck;

  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const rawFolder = formData.get('folder') || 'products';
    const folder = ALLOWED_FOLDERS.has(rawFolder) ? rawFolder : 'products';

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    if (file.size && file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: 'Image exceeds the 4.5 MB upload limit. Please compress it first.' },
        { status: 413 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Content verification: sniff the magic bytes, never trust file.type
    // (client-controlled). SVG and every other non-raster format is rejected.
    const kind = detectImageKind(buffer);
    if (!kind) {
      return NextResponse.json(
        { error: 'Unsupported image format. Use JPG, PNG, GIF or WEBP.' },
        { status: 415 }
      );
    }

    const mimeByKind = {
      jpg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
    };
    const contentType = mimeByKind[kind];

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

    // Never carry the attacker-chosen filename extension into storage:
    // the extension always matches the content sniffed from the bytes.
    const originalName = file.name || 'image';
    const ext = kind === 'jpg' ? 'jpg' : kind;
    const cleanBase = originalName
      .replace(/\.[^.]+$/, '')
      .substring(0, 80)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'img';
    const filename = `${Date.now()}-${cleanBase}.${ext}`;
    const filePath = `${folder}/${filename}`;

    const { data, error } = await supabaseAdmin.storage
      .from('product-images')
      .upload(filePath, buffer, {
        contentType,
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
