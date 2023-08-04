import { Actor } from 'apify';
import { chromium } from 'playwright';
import fetch from 'node-fetch';

await Actor.init();

const input = await Actor.getInput();
console.log(input);

const { jwtToken, fileId, email, callback } = input as any;

const browser = await chromium.launch();

const page = await browser.newPage();

await page.goto('https://invoice.kitchen?token=' + jwtToken);

await page.waitForLoadState('networkidle');

const locator = page.locator('#invoice-page');
await locator.waitFor({ state: 'attached' });

const pdfBuffer = await page.pdf({
  displayHeaderFooter: false,
  printBackground: true,
  width: '210mm',
  height: '297mm',
});

const result = await Actor.setValue(fileId, pdfBuffer, {
  contentType: 'application/pdf',
});

const defaultStore = await Actor.openKeyValueStore();
const url = defaultStore.getPublicUrl(fileId);
console.log(url);

await browser.close();

if (callback) {
  console.log('Calling back');
  const response = await fetch('https://invoice.kitchen/api/invoice', {
    method: 'PUT',
    body: JSON.stringify({
      apifyUrl: url,
      jwtToken,
      fileId,
      email,
    }),
  });
  console.log('response: ', response.status);
}

await Actor.exit();
