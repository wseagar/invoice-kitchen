export const config = {
  SIGNING_KEY: process.env.SIGNING_KEY as string,
  CLOUDFLARE_TURNSTILE_SECRET_KEY: process.env
    .CLOUDFLARE_TURNSTILE_SECRET_KEY as string,
  RESEND_API_KEY: process.env.RESEND_API_KEY as string,
  APIFY_TOKEN: process.env.APIFY_TOKEN as string,
  APIFY_PDF_RENDER_ACTOR: process.env.APIFY_PDF_RENDER_ACTOR as string,
  NODE_ENV: process.env.NODE_ENV as string,
};
