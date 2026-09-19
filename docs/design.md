# 網站設計與內容模型

## 資訊架構

- `/`：精簡自介 → 當前探索 → 精選作品 → 近期文章 → 背景與聯絡。
- `/about/`：個人背景、工程興趣與學習方向。
- `/projects/` 與 `/projects/[id]/`：工程作品列表及長篇技術說明。
- `/writing/` 與 `/writing/[id]/`：可依標籤瀏覽的文章與閱讀頁。
- `/experience/`：工作、研究與教育，集中於單一資料檔。

## 內容模型

Writing：title、description、date、updated、tags、category、draft、featured、relatedProjects。
Projects：title、description、date、tags、category、draft、featured、order、role、period、links、relatedWriting。
兩者均以 Markdown / MDX 儲存；正文自由組織，不要求固定章節。draft 內容不產生公開頁面或 RSS 項目。

## 頁面結構

共用頁首、頁尾、內容列表及閱讀版型。閱讀欄最大 760px；桌面顯示側邊目錄，手機改為可展開目錄。

## 視覺系統

冷灰背景、深藍灰文字、低調藍色強調色。網站文案使用英文與系統 sans-serif，姓名以 serif 呈現，序號、日期與技術標籤使用 monospace。
全站最大寬度 1080px，8px 間距基準。細線只用於列表與章節分界。不使用裝飾卡片、陰影或動畫套件。

## 來源與編輯原則

作品與經歷來自提供的履歷。GitHub fork 明確標示來源關係。量化結果保留 component-ablation 測試範圍，不擴大成整體模型加速或品質指標。關於頁是依履歷及需求整理的可編輯初稿。沒有提供文章原稿，因此公開文章保持空白，技術示範放在 draft。
