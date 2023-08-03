import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { AppState } from '@/types';
import { createId } from '@paralleldrive/cuid2';
import jwt from 'jsonwebtoken';
import { Resend } from 'resend';
import { ApifyClient } from 'apify-client';
import InvoiceEmail from '@/email/InvoiceEmail';
import { config } from '@/lib/config';

const resend = new Resend(config.RESEND_API_KEY);
const apify = new ApifyClient({
  token: config.APIFY_TOKEN,
});

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
  if (config.NODE_ENV !== 'development') {
    console.log('api.invoice.POST.siteverify.start');

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
      console.log('api.invoice.POST.siteverify.fail');
      return new Response('Invalid captcha', { status: 400 });
    }
    console.log('api.invoice.POST.siteverify.success');
  }

  console.log('api.invoice.POST.kv.start');
  const fileId = createId();

  const key = `${email}:invoice:${invoice.identifier}:${fileId}`;

  console.log('api.invoice.POST.kv.hset', key);
  await kv.hset(key, invoice);
  console.log('api.invoice.POST.kv.success');

  console.log('api.invoice.POST.jwt.start');
  const jwtData = {
    key,
  };

  const jwtToken = jwt.sign(jwtData, config.SIGNING_KEY);
  console.log('api.invoice.POST.jwt.success', jwtToken);

  console.log('api.invoice.POST.apify.start', {
    actor: config.APIFY_PDF_RENDER_ACTOR,
    jwt: jwtToken,
    fileId: fileId,
  });
  const run = await apify.actor(config.APIFY_PDF_RENDER_ACTOR).call({
    jwt: jwtToken,
    fileId: fileId,
  });
  console.log('api.invoice.POST.apify.success', run.id, run.finishedAt);

  const apifyDocumentStore = run.defaultKeyValueStoreId;

  const apifyKvStoreClient = await apify.keyValueStore(apifyDocumentStore);

  console.log('api.invoice.POST.apify.pdf.start', fileId);
  const pdf = await apifyKvStoreClient.getRecord(fileId, {
    buffer: true,
  });
  if (!pdf) {
    console.log('api.invoice.POST.apify.pdf.fail');
    return new Response('PDF not found', { status: 404 });
  }
  console.log(
    'api.invoice.POST.apify.pdf.success',
    pdf?.key,
    pdf?.value?.length,
  );

  console.log('api.invoice.POST.email.start');
  const isLocal = config.NODE_ENV === 'development';
  const inviteLink =
    (isLocal ? `http://localhost:3000` : `https://invoice.kitchen`) +
    `?token=${jwtToken}`;

  const pdfBuffer = pdf.value;

  const sendEmailResponse = await resend.emails.send({
    from: 'chef@invoicekitchen.com',
    to: email,
    subject: 'Invoice Kitchen - Your invoice is ready!',
    react: InvoiceEmail({ inviteLink }),
    attachments: [
      {
        content: pdfBuffer,
        filename: 'invoice.pdf',
      },
    ],
  });
  console.log(
    'api.invoice.POST.email.success',
    inviteLink,
    email,
    pdfBuffer.length,
  );

  if (!sendEmailResponse) {
    console.log('api.invoice.POST.email.fail');
    return new Response('Email not sent', { status: 500 });
  }

  return new Response('OK', { status: 200 });
}
