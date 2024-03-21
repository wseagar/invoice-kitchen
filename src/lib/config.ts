export const config = {
  PDF_API_KEY: process.env.PDF_API_KEY as string,
  PDF_API_URL: process.env.PDF_API_URL as string,
  SIGNING_KEY: process.env.SIGNING_KEY as string,
  CLOUDFLARE_TURNSTILE_SECRET_KEY: process.env
    .CLOUDFLARE_TURNSTILE_SECRET_KEY as string,
  NODE_ENV: process.env.NODE_ENV as string,
};
