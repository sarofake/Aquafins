import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, phone, email, topic, message } = body;

    // Basic Validation
    if (!name || !phone || !message) {
      return NextResponse.json(
        { error: 'Name, phone number, and message are required.' },
        { status: 400 }
      );
    }

    // Insert into Supabase if configured (prefers admin client to bypass RLS)
    const dbClient = supabaseAdmin || supabase;
    if (dbClient) {
      try {
        const { error } = await dbClient.from('contact_messages').insert([
          {
            name: name.trim(),
            phone: phone.trim(),
            email: email ? email.trim() : '',
            topic: topic || 'General Inquiry',
            message: message.trim(),
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
