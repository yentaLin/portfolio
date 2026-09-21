# Yen-Ta Lin website

## GitHub Pages 部署

網站網址：<https://yentalin.github.io/portfolio/>

在儲存庫 **Settings → Pages → Build and deployment → Source** 選擇 **GitHub Actions**，不要使用 Jekyll 的分支建置。推送至 `main` 後，`.github/workflows/deploy.yml` 會安裝套件、建置 Astro，並部署 `dist/`。

- `npm run dev`：本機網址為 `http://localhost:4321/portfolio/`。
- `npm run build`：型別檢查、靜態建置及筆記 PDF 產生。
- `node scripts/verify-pages.mjs`：檢查部署路徑、內部連結與資源。
- `SITE_URL` 預設為 `https://yentalin.github.io`，`BASE_PATH` 預設為 `/portfolio`；改用自訂網域根目錄時將 `BASE_PATH` 設為 `/`。

Markdown 中的根目錄連結（例如 `/projects/`）會在建置時自動加上部署前綴，不必手動修改每篇文章。

## 筆記 PDF 下載

每篇已公開的 Writing 筆記上方都有 **Download PDF** 連結，直接下載該篇筆記的 PDF。PDF 包含文章標題、內容、公式、圖片與頁碼，不包含網站導覽與相關文章；草稿不會產生 PDF。

首次本機建置前執行 `npx playwright install chromium`。`npm run build` 會先建置網站，再使用 Chromium 產生 `dist/writing/<文章 id>/note.pdf`；GitHub Actions 已包含瀏覽器與中文字型安裝步驟。新增或修改筆記後重新建置即可更新 PDF。

使用 `npm run preview` 預覽下載功能（開發伺服器 `npm run dev` 不提供建置產生的 PDF）。若要使用自訂 Chromium，可設定 `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`。

建置後可執行 `node scripts/verify-pdfs.mjs`，驗證實際下載、PDF 格式、響應式版面與草稿排除。
