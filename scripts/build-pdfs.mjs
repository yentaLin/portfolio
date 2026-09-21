import { readdir } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { preview } from 'astro';
import { chromium } from '@playwright/test';

const root = new URL('../dist/writing/', import.meta.url).pathname;
async function articles(directory) {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory())
      result.push(...(await articles(join(directory, entry.name))));
    else if (entry.name === 'index.html' && directory !== root)
      result.push(directory);
  }
  return result;
}

const folders = await articles(root);
let server;
let browser;
try {
  if (folders.length) {
    server = await preview({
      server: { host: '127.0.0.1', port: 0 },
      logLevel: 'error',
    });
    browser = await chromium.launch({
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
    });
    const page = await browser.newPage({
      viewport: { width: 1200, height: 900 },
    });
    const base = (process.env.BASE_PATH || '/portfolio').replace(/\/$/, '');
    for (const folder of folders) {
      const id = relative(root, folder)
        .split(sep)
        .map(encodeURIComponent)
        .join('/');
      const response = await page.goto(
        `http://127.0.0.1:${server.port}${base}/writing/${id}/`,
      );
      if (!response?.ok()) throw new Error(`無法載入筆記：${id}`);
      // Trigger lazy diagrams and images before switching to print layout.
      for (const diagram of await page.locator('.mermaid-source').all()) {
        await diagram.scrollIntoViewIfNeeded();
        await diagram.locator('svg').waitFor();
      }
      await page.locator('.document-body img').evaluateAll((images) => {
        images.forEach((image) => {
          image.loading = 'eager';
        });
      });
      await page.evaluate(async () => {
        const canonical = document.querySelector('link[rel="canonical"]').href;
        for (const anchor of document.querySelectorAll(
          '.document-body a[href]',
        )) {
          if (anchor.getAttribute('href').startsWith('#')) continue;
          const target = new URL(anchor.href);
          if (target.origin === location.origin) {
            anchor.href = new URL(
              target.pathname + target.search + target.hash,
              canonical,
            ).href;
          }
        }
        await document.fonts.ready;
        await Promise.all(
          [...document.querySelectorAll('.document-body img')].map((image) =>
            image.decode(),
          ),
        );
      });
      await page.pdf({
        path: join(folder, 'note.pdf'),
        format: 'A4',
        margin: { top: '16mm', right: '16mm', bottom: '18mm', left: '16mm' },
        printBackground: true,
        tagged: true,
        outline: true,
        displayHeaderFooter: true,
        headerTemplate: '<span></span>',
        footerTemplate:
          '<div style="font-size:9px;width:100%;text-align:center;color:#666"><span class="pageNumber"></span> / <span class="totalPages"></span></div>',
      });
      console.log(`已產生 PDF：${id}`);
    }
  }
} finally {
  await browser?.close();
  await server?.stop();
}
