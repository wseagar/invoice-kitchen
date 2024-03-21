import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { AppState } from '@/types';
import { createId } from '@paralleldrive/cuid2';
import jwt from 'jsonwebtoken';
import { Resend } from 'resend';
import { ApifyClient } from 'apify-client';
import InvoiceEmail from '@/email/InvoiceEmail';
import { config } from '@/lib/config';

export async function POST(request: Request) {
  console.log('api.invoice.POST.start');
  const {
    email,
    invoice,
    token,
  }: { email: string; invoice: AppState; token: string } = await request.json();
  console.log('api.invoice.POST.body.email', email);
  console.log('api.invoice.POST.body.invoice', invoice);
  console.log('api.invoice.POST.body.token', token);

  // site verify
  // if (config.NODE_ENV !== 'development') {
  //   console.log('api.invoice.POST.siteverify.start');

  //   const form = new URLSearchParams();
  //   form.append('secret', config.CLOUDFLARE_TURNSTILE_SECRET_KEY);
  //   form.append('response', token);
  //   form.append('remoteip', request.headers.get('x-forwarded-for') as string);

  //   const result = await fetch(
  //     'https://challenges.cloudflare.com/turnstile/v0/siteverify',
  //     { method: 'POST', body: form },
  //   );
  //   const json = await result.json();

  //   if (!json.success) {
  //     console.log('api.invoice.POST.siteverify.fail');
  //     return new Response('Invalid captcha', { status: 400 });
  //   }
  //   console.log('api.invoice.POST.siteverify.success');
  // }

  // send request to email and render to cloudflare, don't wait for a response
  console.log('api.invoice.POST.email.start');
  console.log(config.PDF_API_URL);
  console.log(config.PDF_API_KEY);
  const response = await fetch(config.PDF_API_URL, {
    method: 'POST',
    body: JSON.stringify({ email, invoice, token }),
    headers: {
      'x-api-key': config.PDF_API_KEY,
    },
  });
  console.log('api.invoice.POST.email.end');
  console.log('api.invoice.POST.email.response', response.status);

  return new Response('OK', { status: 200 });
}
