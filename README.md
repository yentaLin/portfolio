# Yen-Ta Lin website

## GitHub Pages 部署

網站網址：<https://yentalin.github.io/portfolio/>

在儲存庫 **Settings → Pages → Build and deployment → Source** 選擇 **GitHub Actions**，不要使用 Jekyll 的分支建置。推送至 `main` 後，`.github/workflows/deploy.yml` 會安裝套件、建置 Astro，並部署 `dist/`。

- `npm run dev`：本機網址為 `http://localhost:4321/portfolio/`。
- `npm run build`：型別檢查及靜態建置。
- `node scripts/verify-pages.mjs`：檢查部署路徑、內部連結與資源。
- `SITE_URL` 預設為 `https://yentalin.github.io`，`BASE_PATH` 預設為 `/portfolio`；改用自訂網域根目錄時將 `BASE_PATH` 設為 `/`。

Markdown 中的根目錄連結（例如 `/projects/`）會在建置時自動加上部署前綴，不必手動修改每篇文章。
