import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { readFile, writeFile, unlink, mkdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
const base = process.env.TEST_URL || 'http://127.0.0.1:4322';
const files = [
  'content/writing/qa-writing-a.mdx',
  'content/writing/qa-writing-b.mdx',
];
const created = [];
const build = () =>
  execFileSync('npm', ['run', 'build'], {
    env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' },
    stdio: 'pipe',
  });
let browser;
try {
  const source = await readFile(
    'content/writing/technical-writing-example.mdx',
    'utf8',
  );
  await writeFile(files[0], source.replace('draft: true', 'draft: false'), {
    flag: 'wx',
  });
  created.push(files[0]);
  await writeFile(
    files[1],
    source
      .replace('draft: true', 'draft: false')
      .replace('title: 技術文章格式範例', 'title: 第二篇測試文章')
      .replace('tags: [Engineering, Learning Notes]', 'tags: [GPU]')
      .replace('date: 2026-09-19', 'date: 2026-09-18'),
    { flag: 'wx' },
  );
  created.push(files[1]);
  await mkdir('/tmp/portfolio-qa', { recursive: true });
  build();
  browser = await chromium.launch({
    headless: true,
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
  });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(base + '/writing/');
  assert.equal(await page.locator('.article-row:visible').count(), 2);
  await page.getByRole('button', { name: 'GPU', exact: true }).click();
  assert.equal(await page.locator('.article-row:visible').count(), 1);
  assert.ok(page.url().includes('tag=GPU'));
  await page.reload();
  assert.equal(await page.locator('.article-row:visible').count(), 1);
  await page.goto(base + '/writing/?tag=unknown');
  assert.ok(await page.locator('#no-results').isVisible());
  await page.goto(base + '/writing/qa-writing-a/');
  assert.ok((await page.locator('.katex').count()) >= 2, '公式渲染');
  assert.ok((await page.locator('pre.astro-code').count()) >= 1, '程式碼上色');
  assert.equal(await page.locator('.prose table').count(), 1, '表格');
  assert.ok(await page.locator('[data-footnote-ref]').count(), '註腳');
  assert.ok((await page.locator('.heading-anchor').count()) >= 5, '標題錨點');
  assert.ok(await page.locator('.article-pagination a').count(), '前後文章');
  assert.ok(
    await page
      .locator('.related a[href="/projects/llm-quantization/"]')
      .count(),
    '關聯作品',
  );
  await page.locator('.mermaid-source').scrollIntoViewIfNeeded();
  await page.locator('.mermaid-source svg').waitFor({ timeout: 20000 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: '/tmp/portfolio-qa/writing-desktop-verified.png',
    fullPage: true,
  });
  for (const width of [375, 768]) {
    await page.setViewportSize({ width, height: 900 });
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `文章寬度 ${width}`,
    );
  }
  await page.setViewportSize({ width: 375, height: 812 });
  await page.screenshot({
    path: '/tmp/portfolio-qa/writing-mobile-verified.png',
    fullPage: true,
  });
  const rss = await (await page.request.get(base + '/rss.xml')).text();
  assert.ok(rss.includes('qa-writing-a') && rss.includes('qa-writing-b'));
  await page.goto(base + '/projects/llm-quantization/');
  assert.equal(await page.locator('.related a').count(), 2, '反向內容關聯');
  assert.deepEqual(errors, []);
  console.log(
    '通過：標籤篩選、網址保存、公式、上色、表格、註腳、錨點、Mermaid、文章導覽、雙向關聯、RSS、響應式閱讀。',
  );
} finally {
  await browser?.close();
  for (const file of created) await unlink(file).catch(() => {});
  build();
  console.log('測試文章已移除，正式網站已重新建置。');
}
