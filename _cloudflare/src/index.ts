import puppeteer, { Browser } from '@cloudflare/puppeteer';
import { createId } from '@paralleldrive/cuid2';
import jwt from '@tsndr/cloudflare-worker-jwt';
import { Resend } from 'resend';
import { Redis } from '@upstash/redis/cloudflare';
// @ts-ignore
import EmailHtml from '../public/email.html';

export interface Env {
	BROWSER: puppeteer.BrowserWorker;
	SIGNING_KEY: string;
	RESEND_API_KEY: string;
	KV_REST_API_URL: string;
	KV_REST_API_TOKEN: string;
	PDF_API_KEY: string;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const allowedCorsOrigins = ['https://invoice.kitchen', 'https://invoicekitchen.com', 'http://localhost:3000'];
		const requestOrigin = request.headers.get('Origin');

		if (!requestOrigin || !allowedCorsOrigins.includes(requestOrigin)) {
			return new Response('Unauthorized', { status: 401 });
		}

		if (request.method === 'OPTIONS') {
			return new Response(null, {
				headers: {
					'Access-Control-Allow-Origin': requestOrigin,
					'Access-Control-Allow-Methods': 'POST,OPTIONS',
					'Access-Control-Max-Age': '86400',
				},
			});
		}

		if (request.method !== 'POST') {
			return new Response('Please use a POST request');
		}

		// const apiKey = request.headers.get('x-api-key');
		// if (apiKey !== env.PDF_API_KEY) {
		// 	return new Response('Unauthorized', { status: 401 });
		// }

		const redis = Redis.fromEnv({
			UPSTASH_REDIS_REST_TOKEN: env.KV_REST_API_TOKEN,
			UPSTASH_REDIS_REST_URL: env.KV_REST_API_URL,
		});

		const { email, invoice, token }: { email: string; invoice: any; token: string } = await request.json();
		const fileId = createId();

		const key = `${email}:invoice:${invoice.identifier}:${fileId}`;
		console.log(key);
		await redis.hset(key, invoice);

		const jwtData = {
			key,
		};
		const jwtToken = await jwt.sign(jwtData, env.SIGNING_KEY);

		let url = new URL(`https://invoice.kitchen/?token=${jwtToken}`).toString();
		let pdf: Buffer;
		if (url) {
			const browser = await puppeteer.launch(env.BROWSER);
			const page = await browser.newPage();
			await page.goto(url);
			pdf = (await page.pdf()) as Buffer;
			await browser.close();

			const resend = new Resend(env.RESEND_API_KEY);

			await resend.emails.send({
				from: 'chef@invoicekitchen.com',
				to: email,
				subject: 'Invoice Kitchen - Your invoice is ready!',
				html: EmailHtml.replace('{{PLACEHOLDER}}', url),
				attachments: [
					{
						content: pdf,
						filename: 'invoice.pdf',
					},
				],
			});

			return new Response('OK', { status: 200, headers: { 'Access-Control-Allow-Origin': requestOrigin } });
		} else {
			return new Response('Please add an ?url=https://example.com/ parameter');
		}
	},
};
