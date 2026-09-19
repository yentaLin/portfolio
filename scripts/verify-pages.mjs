import assert from 'node:assert/strict';
import { readdir, readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
const root = new URL('../dist/', import.meta.url);
const base = '/portfolio/';
async function visit(folder) {
  for (const item of await readdir(folder, { withFileTypes: true })) {
    const file = join(folder, item.name);
    if (item.isDirectory()) await visit(file);
    else if (item.name.endsWith('.html')) {
      const html = await readFile(file, 'utf8');
      for (const [, path] of html.matchAll(/(?:href|src)="(\/[^"#?]*)(?:[?#][^"]*)?"/g)) {
        if (path.startsWith('//')) continue;
        assert.ok(path.startsWith(base), `${file}: ${path} 缺少部署路徑`);
        const relative = path.slice(base.length);
        const target = new URL(relative.endsWith('/') || !relative ? `${relative}index.html` : relative, root);
        assert.ok((await stat(target)).isFile(), `找不到資源：${target}`);
      }
    }
  }
}
await visit(root.pathname);
for (const filename of ['rss.xml', 'sitemap-0.xml', 'robots.txt']) {
  const text = await readFile(new URL(filename, root), 'utf8');
  assert.ok(text.includes('https://yentalin.github.io/portfolio/'), filename);
  assert.ok(!text.includes('https://yentalin.github.io/writing/'), filename);
}
console.log('所有 HTML 內部連結與資源均位於 /portfolio/，且目標存在；RSS、sitemap 與 robots 網址正確。');
