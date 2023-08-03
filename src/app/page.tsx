import InvoiceBuilder from '@/components/InvoiceBuilder';
import { useSearchParams } from 'next/navigation';
import jwt from 'jsonwebtoken';
import { config } from '@/lib/config';
import { kv } from '@vercel/kv';
import { AppState } from '@/types';

export default async function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const token = searchParams.token;
  if (token && typeof token === 'string') {
    // validate jwt
    const isValid = jwt.verify(token, config.SIGNING_KEY);
    if (isValid) {
      const decoded = jwt.decode(token) as { key?: string };
      const key = decoded?.key;
      if (key && typeof key === 'string') {
        const invoice = (await kv.hgetall(key)) as AppState;
        return <InvoiceBuilder invoice={invoice} />;
      }
    }
  }

  return <InvoiceBuilder />;
}
