import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { preview } from 'astro';
import { chromium } from '@playwright/test';

const server = await preview({
  server: { host: '127.0.0.1', port: 0 },
  logLevel: 'error',
});
let browser;
try {
  browser = await chromium.launch({
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
  });
  const page = await browser.newPage();
  const base = (process.env.BASE_PATH || '/portfolio').replace(/\/$/, '');
  const origin = `http://127.0.0.1:${server.port}`;
  await page.goto(`${origin}${base}/writing/`);
  const links = await page
    .locator('.article-row h3 a')
    .evaluateAll((anchors) => anchors.map((anchor) => anchor.href));
  assert.ok(links.length, '至少有一篇可測試的公開筆記');
  for (const link of links) {
    await page.goto(link);
    const button = page.getByRole('link', { name: 'Download PDF' });
    assert.ok(await button.isVisible());
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      button.click(),
    ]);
    assert.equal(await download.failure(), null);
    assert.ok(download.suggestedFilename().endsWith('.pdf'));
    const bytes = await readFile(await download.path());
    assert.equal(bytes.subarray(0, 5).toString(), '%PDF-');
    assert.ok(bytes.length > 10000);
    for (const width of [375, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      assert.ok(await button.isVisible());
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      );
    }
    await page.emulateMedia({ media: 'print' });
    assert.equal(await button.isVisible(), false);
    assert.equal(await page.locator('.site-header').isVisible(), false);
    assert.ok(await page.locator('.document-body').isVisible());
    await page.emulateMedia({ media: 'screen' });
  }
  await page.goto(`${origin}${base}/projects/llm-quantization/`);
  assert.equal(await page.locator('.pdf-download').count(), 0);
  assert.equal(
    (
      await page.request.get(
        `${origin}${base}/writing/technical-writing-example/note.pdf`,
      )
    ).status(),
    404,
  );
  console.log(
    `通過：${links.length} 篇 PDF 實際下載、檔案格式、手機與桌面版面、列印樣式、草稿排除。`,
  );
} finally {
  await browser?.close();
  await server.stop();
}
