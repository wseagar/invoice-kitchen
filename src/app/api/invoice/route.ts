import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { AppState } from '@/types';
import { createId } from '@paralleldrive/cuid2';
import jwt from 'jsonwebtoken';
import { Resend } from 'resend';
import { ApifyClient } from 'apify-client';

const config = {
  SIGNING_KEY: process.env.SIGNING_KEY as string,
  CLOUDFLARE_TURNSTILE_SECRET_KEY: process.env
    .CLOUDFLARE_TURNSTILE_SECRET_KEY as string,
  RESEND_API_KEY: process.env.RESEND_API_KEY as string,
  APIFY_TOKEN: process.env.APIFY_TOKEN as string,
  APIFY_PDF_RENDER_ACTOR: process.env.APIFY_PDF_RENDER_ACTOR as string,
  NODE_ENV: process.env.NODE_ENV as string,
};

const resend = new Resend(config.RESEND_API_KEY);
const apify = new ApifyClient({
  token: config.APIFY_TOKEN,
});

export async function POST(request: Request) {
  const {
    email,
    invoice,
    token,
  }: { email: string; invoice: AppState; token: string } = await request.json();

  // site verify
  if (config.NODE_ENV !== 'development') {
    const form = new URLSearchParams();
    form.append('secret', config.CLOUDFLARE_TURNSTILE_SECRET_KEY);
    form.append('response', token);
    form.append('remoteip', request.headers.get('x-forwarded-for') as string);

    const result = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      { method: 'POST', body: form },
    );
    const json = await result.json();

    if (!json.success) {
      return new Response('Invalid captcha', { status: 400 });
    }
  }

  const fileId = createId();

  const key = `${email}:invoice:${invoice.identifier}:${fileId}`;

  await kv.hset(key, invoice);

  const jwtData = {
    key,
  };

  const jwtToken = jwt.sign(jwtData, config.SIGNING_KEY);

  const run = await apify.actor(config.APIFY_PDF_RENDER_ACTOR).call({
    jwt: jwtToken,
    fileId: fileId,
  });

  const apifyDocumentStore = run.defaultKeyValueStoreId;

  const apifyKvStoreClient = await apify.keyValueStore(apifyDocumentStore);

  const pdf = await apifyKvStoreClient.getRecord(fileId, {
    buffer: true,
  });

  if (!pdf) {
    return new Response('PDF not found', { status: 404 });
  }

  const pdfBuffer = pdf.value;

  const sendEmailResponse = await resend.emails.send({
    from: 'chef@invoicekitchen.com',
    to: email,
    subject: 'Hello World',
    html: `<p>${jwtToken}</p>`,
    attachments: [
      {
        content: pdfBuffer,
        filename: 'invoice.pdf',
      },
    ],
  });

  if (!sendEmailResponse) {
    return new Response('Email not sent', { status: 500 });
  }

  return new Response('OK', { status: 200 });
}
