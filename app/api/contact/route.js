import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { checkRateLimit } from '@/lib/rateLimit';

// Field caps — anything larger is dropped, so a scripted flood cannot
// bloat rows or exhaust storage (each row stays tiny no matter the input).
const LIMITS = {
  name: 100,
  phone: 20,
  email: 254,
  topic: 80,
  message: 2000,
};

const TOPICS = new Set([
  'General Inquiry',
  'Order Status / Custom Order',
  'Aquascaping & Plants',
  'Livestock & Fish Query',
]);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// Digits with optional +, -, spaces, parentheses (covers BD & international).
const PHONE_RE = /^[+()\-.\s\d]{6,20}$/;

function clean(value, max) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const name = clean(body.name, LIMITS.name);
    const phone = clean(body.phone, LIMITS.phone);
    const email = clean(body.email, LIMITS.email);
    const topicRaw = clean(body.topic, LIMITS.topic);
    const message = clean(body.message, LIMITS.message);

    // Honeypot: the real form hides this input; bots autofill it.
    // Pretend success and silently discard — never reveal the trap.
    if (clean(body.website, LIMITS.name)) {
      return NextResponse.json({
        success: true,
        message: 'Your message has been received successfully!',
      });
    }

    // Stealth throttle (VULN-04): 5 submissions per minute per IP is plenty for a
    // human. Flooders get the same fake-success response the honeypot gives —
    // we never reveal that they were throttled, and nothing reaches the DB.
    const rate = checkRateLimit(request, {
      limit: 5,
      windowMs: 60 * 1000,
      keyPrefix: 'contact',
    });
    if (!rate.success) {
      return NextResponse.json({
        success: true,
        message: 'Your message has been received successfully!',
      });
    }

    // Validation
    const errors = [];
    if (!name) errors.push('Name is required.');
    if (!phone) errors.push('Phone is required.');
    if (phone && !PHONE_RE.test(phone)) {
      errors.push('Phone must be a valid number (6–20 digits).');
    }
    if (email && !EMAIL_RE.test(email)) {
      errors.push('Email address is not valid.');
    }
    if (!message) errors.push('Message is required.');
    if (message && message.length < 5) errors.push('Message is too short.');

    if (errors.length > 0) {
      return NextResponse.json(
        { error: errors.join(' ') },
        { status: 400 }
      );
    }

    const topic = TOPICS.has(topicRaw) ? topicRaw : 'General Inquiry';

    // Insert into Supabase if configured (prefers admin client to bypass RLS)
    const dbClient = supabaseAdmin || supabase;
    if (dbClient) {
      try {
        const { error } = await dbClient.from('contact_messages').insert([
          {
            name,
            phone,
            email,
            topic,
            message,
            created_at: new Date().toISOString(),
          },
        ]);

        if (error) {
          console.warn('Supabase contact_messages table notice:', error.message);
        }
      } catch (dbErr) {
        console.warn('Database error while saving contact message:', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Your message has been received successfully!',
    });
  } catch (error) {
    console.error('Error handling contact submission:', error);
    return NextResponse.json(
      { error: 'Failed to submit contact message. Please try again.' },
      { status: 500 }
    );
  }
}
