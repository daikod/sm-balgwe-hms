// app/api/email/sendEmail/route.ts
'use server';

import { NextResponse } from 'next/server';
import { sendEmailWithLog } from '@/utils/email';

export async function POST(req: Request) {
  try {
    const { to, subject, text, html } = await req.json();

    if (!to || !subject) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await sendEmailWithLog(to, subject, html, text);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Failed to send email via API route:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
