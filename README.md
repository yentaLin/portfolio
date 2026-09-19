# Yen-Ta Lin 的個人網站

Astro + TypeScript 的靜態網站，使用 Markdown / MDX 維護作品與文章。英文文案、冷灰與低調藍色的編輯式版面，提供深色模式與手機閱讀版型。

## 開始使用

需要 Node.js 22.12 以上（依套件 engines 要求使用受支援版本）。

```sh
npm ci
npm run dev
```

開啟 `http://localhost:4321`。

```sh
npm run check
npm run build
npm run preview
```

若環境不允許寫入使用者偏好設定資料夾，可在命令前加 `ASTRO_TELEMETRY_DISABLED=1`。

## 新增文章

建立 `content/writing/my-article.md` 或 `.mdx`：

```yaml
---
title: 我的文章
description: 文章的簡短介紹
date: 2026-09-19
updated: 2026-09-19
tags: [ML Systems, Engineering]
category: Learning Notes
draft: false
featured: false
relatedProjects: [llm-quantization]
---
```

接著自由撰寫 Markdown 正文。只有 title、description、date 必填；其餘欄位皆可省略。日期為發表日期，不會自動排程：未完成文章請設定 `draft: true`。標籤直接產生篩選選項，不需修改 UI。

範例檔 `content/writing/technical-writing-example.mdx` 包含程式碼、公式、表格、註腳與 Mermaid，是不公開的草稿，不會出現在文章頁、RSS 或 sitemap。將 draft 改為 false 即可本機預覽完整閱讀頁；正式發布前請改回或填入自己的文章。

- 程式碼：使用附語言名稱的 fenced code block，自動語法上色。
- 數學：`$...$` 或 `$$...$$`，由 KaTeX 在建置階段渲染。
- 目錄：從 h2、h3 自動生成；閱讀時間自動估算中英文。
- 圖片：放在 `public/images/`，用 `![有意義的替代文字](/images/name.webp)` 引用。
- Mermaid：在 MDX 匯入 `../../src/components/Mermaid.astro`，使用 `<Mermaid chart={圖表字串} caption="圖表說明" />`。只在圖表進入可視範圍時載入繪圖引擎；一般頁面不載入。
- 可直接使用 MDX 匯入 Astro 元件，正文不限制固定章節。

## 新增作品

建立 `content/projects/my-project.md`：

```yaml
---
title: 我的作品
description: 解決什麼問題、做了什麼
date: 2026-09-19
period: 2026.01 — 2026.09
category: ML SYSTEMS
tags: [Python, PyTorch]
role: 我的角色
featured: true
order: 5
links:
  - label: GitHub
    url: https://github.com/yentaLin
relatedWriting: []
---
```

正文可自由撰寫問題、實作、挑戰、結果、圖片及評估限制。首頁依 order 顯示前三個 featured 作品。連結欄位可加入 demo、paper、article 等任何網址。`relatedWriting` / `relatedProjects` 使用檔名（不含副檔名），雙向關聯會自動顯示；草稿關聯不顯示。

## 修改個人資料

- 個人簡介、聯絡方式、目前興趣、GitHub fork：`src/data/site.ts`
- 工作、研究、活動、教育：`src/data/experience.ts`
- 關於頁正文：`content/about.md`
- 作品：`content/projects/`
- 履歷 PDF：`public/resume.pdf`
- 視覺系統：`src/styles/global.css`
- 設計原則與資料模型：`docs/design.md`

作品與經歷依提供的履歷整理。關於頁為可編輯初稿；未代寫已發表文章。GitHub 的兩個公開儲存庫均如實標示為 fork。

## 部署

網站輸出為 `dist/`，可部署至支援靜態網站的服務：

- Build command：`npm run build`
- Output directory：`dist`
- 在建置環境設定 `SITE_URL=https://你的網域`。

預設網址為 `https://yentalin.github.io`，僅為可修改的建置設定，不代表已完成部署。請在部署前設定實際網址，讓 canonical、RSS 與 sitemap 使用正確網域。所有路徑以網域根目錄為基準；若使用 GitHub Pages，請使用 `yentaLin.github.io` 根目錄網站，或設定自訂網域。

`robots.txt`、`rss.xml`、`sitemap-index.xml` 自動產生。此版本未連接分析追蹤或 CMS。

## 驗證

`npm run build` 先執行 Astro 型別檢查，再建置所有靜態頁面。

啟動 preview 後可執行 `node scripts/verify.mjs`，檢查主要路由、內部連結、手機溢出、深色模式及草稿排除。第一次需執行 `npx playwright install chromium`。螢幕截圖存至 `/tmp/portfolio-qa/`。

完整技術文章驗證：`TEST_URL=http://127.0.0.1:4322 node scripts/verify-writing.mjs`。先用 `python3 -m http.server 4322 --bind 127.0.0.1 --directory dist` 提供靜態網站。此測試會建立臨時文章，驗證公式與圖表等功能，最後移除測試資料並重建正式成品。請勿在同時編輯內容時執行。

可設定 `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` 使用既有 Chromium。使用 `npm run format` 統一原始碼格式。
