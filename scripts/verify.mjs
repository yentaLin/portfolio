import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
const base = process.env.TEST_URL || 'http://127.0.0.1:4321';
await mkdir('/tmp/portfolio-qa', { recursive: true });
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1050 } });
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
const paths = [
  '/',
  '/about/',
  '/projects/',
  '/writing/',
  '/experience/',
  '/projects/llm-quantization/',
  '/projects/uav-search-rescue/',
  '/projects/formula-control/',
  '/projects/ki67-segmentation/',
];
const localLinks = new Set();
for (const path of paths) {
  const response = await page.goto(base + path);
  assert.equal(response.status(), 200, path);
  assert.equal(await page.locator('h1').count(), 1, `唯一 H1：${path}`);
  assert.ok(
    await page.locator('link[rel=canonical]').getAttribute('href'),
    `canonical：${path}`,
  );
  for (const href of await page
    .locator('a[href^="/"]')
    .evaluateAll((links) => links.map((link) => link.getAttribute('href'))))
    localLinks.add(href);
  for (const width of [375, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      `不應水平溢出：${path} @ ${width}`,
    );
  }
}
for (const link of localLinks)
  assert.ok((await page.request.get(base + link)).ok(), `內部連結：${link}`);
await page.goto(base);
await page.screenshot({
  path: '/tmp/portfolio-qa/home-desktop.png',
  fullPage: true,
});
await page.getByRole('button', { name: 'Switch to dark mode' }).click();
assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
await page.reload();
assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
await page.screenshot({
  path: '/tmp/portfolio-qa/home-dark.png',
  fullPage: true,
});
await page.getByRole('button', { name: 'Switch to light mode' }).click();
await page.setViewportSize({ width: 375, height: 812 });
await page.screenshot({
  path: '/tmp/portfolio-qa/home-mobile.png',
  fullPage: true,
});
await page.goto(base + '/projects/llm-quantization/');
await page.screenshot({
  path: '/tmp/portfolio-qa/project-mobile.png',
  fullPage: true,
});
await page.setViewportSize({ width: 1440, height: 1050 });
await page.screenshot({
  path: '/tmp/portfolio-qa/project-desktop.png',
  fullPage: true,
});
for (const path of ['/rss.xml', '/robots.txt', '/sitemap-index.xml'])
  assert.ok((await page.request.get(base + path)).ok(), path);
const rss = await (await page.request.get(base + '/rss.xml')).text();
assert.ok(!rss.includes('technical-writing-example'));
assert.equal(
  (
    await page.request.get(base + '/writing/technical-writing-example/')
  ).status(),
  404,
);
assert.deepEqual(errors, []);
await browser.close();
console.log(
  `通過：${paths.length} 個路由、${localLinks.size} 個內部連結、3 種寬度、主題持續保存與草稿排除。`,
);
