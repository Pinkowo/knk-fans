# Quickstart 指南

本文件協助新成員在 10 分鐘內完成 KNK 粉絲網站的本機開發環境，並列出常見問題與部署注意事項。

## 1. 需求與安裝

| 工具 | 建議版本 | 備註 |
| --- | --- | --- |
| Node.js | 20.x LTS | 建議使用 `nvm` 以便快速切換版本 |
| npm | 10.x | `npm -v` 確認版本，需支援 `npx` |
| Git | 2.30+ | 用於同步專案程式碼 |

```bash
# 取得程式碼
$ git clone https://github.com/<your-org>/knk-fans.git
$ cd knk-fans

# 安裝依賴
$ npm install
```

## 2. 環境變數設定

1. 複製樣板：`cp .env.local.example .env.local`
2. 依下表填入值：

| 變數 | 說明 |
| --- | --- |
| `NOTION_API_KEY` | Notion Integration 的 Internal Integration Token |
| `NOTION_*_DATABASE_ID` | 各內容資料庫的 UUID，可於 Notion 連結後方取得，詳見 [`docs/notion-setup.md`](./notion-setup.md) |
| `NEXT_PUBLIC_SITE_URL` | 部署網址，例如 `https://knk-fans.vercel.app` |
| `REVALIDATION_SECRET` | 任意隨機長字串，供 `/api/revalidate` 驗證用途 |
| `NEXT_PUBLIC_WEB_VITALS_ENDPOINT` | （可選）若需要上報 Web Vitals，填入自有 API URL |

> 別忘了在 Notion 內將所有資料庫分享給整合（`Share → Invite → <Integration>`）。

## 3. 啟動開發伺服器

```bash
$ npm run dev
```

預設會啟動於 `http://localhost:3000`，網站提供四種語言路由，建議從 `/zh` 開始驗證內容。

## 4. 常用指令

| 指令 | 目的 |
| --- | --- |
| `npm run build` | 產出正式環境 bundle 與 ISR 頁面 |
| `npm run start` | 以 `.next` 產物啟動伺服器（部署前驗證） |
| `npm run analyze` | 以 webpack + Bundle Analyzer 檢視 bundle | 
| `npm run lint` | ESLint 品質檢查 |
| `npm run check:contrast` | 驗證主題顏色是否符合 WCAG |

## 5. 部署到 Vercel

1. 將 Git repository 與 Vercel 專案連結。
2. 在 Vercel Dashboard → Settings → Environment Variables 中輸入 `.env.local` 的所有變數。
3. 在 `Production` 與 `Preview` 兩個環境都輸入相同變數後重新部署。
4. 佈署完成後，造訪 `/api/notion/*` 確認回傳 200，並可透過 `POST /api/revalidate` 手動刷新快取。

## 6. 常見問題 FAQ

**Q1. 首頁 API 回傳 500？**
> 代表 Notion 資料庫 ID 或 API Key 未設定，請再次檢查 `.env.local` 是否正確，並確認整合擁有資料庫權限。

**Q2. Revalidate API 回傳 `Invalid secret`？**
> 需確保 `REVALIDATION_SECRET` 與請求 JSON 內的 `secret` 一致。部署到 Vercel 後也要記得同步設定變數。

**Q3. Lighthouse 分數低於 90？**
> 請先執行 `npm run build && PORT=4000 npm run start`，再使用 `npx lighthouse` 並加上 `--throttling-method=provided`。本專案在無額外網路限制時，桌機與手機性能皆可達 100。

**Q4. 內容更新未立即顯示？**
> 頁面採 ISR，請等待對應 `revalidate` 週期或呼叫 `/api/revalidate`，亦可在 Notion 資料調整完後於部署平台觸發再驗證。

完成上述步驟即可開始開發與部署。若需更詳細的 Notion 欄位格式以及測試報告，請繼續閱讀本資料夾的其他文件。
