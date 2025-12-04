# KNK 粉絲網站

多語系的 KNK 粉絲入口網站，以 Next.js 16 App Router 建置，整合 Notion 內容、音樂歌詞、綜藝與互動元件。此專案已針對 ISR、Vercel 部署與 Web Vitals 追蹤進行優化。

## 主要技術

- Next.js 16（App Router） + TypeScript
- `next-intl` 語系管理（zh / ko / ja / en）
- `@vercel/analytics/react` + 自訂 Web Vitals Reporter
- Notion API（`@notionhq/client`）與 ISR 快取
- Tailwind CSS、Framer Motion

## 安裝與本機啟動

1. 安裝 Node.js 20（建議使用 `nvm`）。
2. 安裝依賴：`pnpm install`
3. 複製環境變數樣板：`cp .env.local.example .env.local`
4. 依下節說明填入 Notion ID、Revalidation Secret 與公開設定。
5. 啟動開發伺服器：`pnpm dev`，瀏覽 `http://localhost:3000/zh`

> 想了解完整佈署與常見問題，請參考 [`docs/quickstart.md`](docs/quickstart.md)。

## 開發指令

| 指令 | 說明 |
| --- | --- |
| `pnpm dev` | 啟動開發伺服器 |
| `pnpm build` | 產生正式環境 build（含 ISR 頁面） |
| `pnpm analyze` | 以 webpack + Bundle Analyzer 檢視 bundle |
| `pnpm lint` | 執行 ESLint |
| `pnpm check:contrast` | 依 WCAG 2.1 AA 驗證主題對比度 |
| `pnpm check:i18n` | 確認四種語言翻譯鍵值一致 |
| `pnpm type-check` | TypeScript 型別檢查（`tsc --noEmit`） |

## 環境變數

`cp .env.local.example .env.local` 後，填入以下變數；部署到 Vercel 時請在 Project Settings → Environment Variables 逐一設定（Production 與 Preview 皆需設定）。

| 變數 | 說明 |
| --- | --- |
| `NOTION_API_KEY` | Notion 整合專用金鑰 |
| `NOTION_GUIDE_DATABASE_ID` ~ `NOTION_LINKS_DATABASE_ID` | 各內容資料庫 ID |
| `NEXT_PUBLIC_SITE_URL` | 站點網址（用於 metadata） |
| `REVALIDATION_SECRET` | On-Demand Revalidation 用隨機字串 |
| `NEXT_PUBLIC_WEB_VITALS_ENDPOINT` | （選填）Web Vitals 上報 API 路徑，未設定時在開發模式會輸出至 console |
| `RESEND_API_KEY` | Resend API 金鑰（用於聯絡表單寄信） |
| `CONTACT_EMAIL` | 聯絡表單收件者 Email，信件主旨固定為 `knk-fans-site:{類型}` |
| `NEXT_PUBLIC_GA_ID` | Google Analytics 4 Measurement ID（`G-XXXXXXX`） |

> **部署檢查**：Vercel Dashboard → Settings → Environment Variables 中輸入上述值後重新部署，方可啟用 ISR 與 Revalidate API。

**Resend/GA 設定提示**

- Resend：建立 `production` domain 後取得 API Key，並在 Project/Environment Secrets 中設定 `RESEND_API_KEY` 與 `CONTACT_EMAIL`。
- GA4：在 Google Analytics 中建立資料串流並取得 Measurement ID，填入 `NEXT_PUBLIC_GA_ID` 後重新部署，使用 `pnpm type-check && pnpm lint` 驗證程式碼再 push。

## On-Demand Revalidation

`POST /api/revalidate` 允許以 Secret 觸發特定路徑或 Tag 的重新驗證：

```bash
curl -X POST https://your-domain.com/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "YOUR_SECRET",
    "path": "/zh/members",
    "tag": "members"
  }'
```

回應：

```json
{
  "revalidated": true,
  "paths": ["/zh/members"],
  "tags": ["members"],
  "timestamp": 1710000000000
}
```

## Web Vitals 追蹤

`src/components/analytics/WebVitalsReporter.tsx` 會在 Client 端呼叫 `useReportWebVitals`。  

- 若設定 `NEXT_PUBLIC_WEB_VITALS_ENDPOINT`，會使用 `navigator.sendBeacon` 上報。
- 若未設定，開發模式會於 console 顯示量測值，可自行接上 GA、Log Server 等服務。

## 重新整理快取

所有 API Route 與頁面已針對內容特性設定 ISR。若內容更新可以：

1. 透過 `POST /api/revalidate` 指定檢查的 path/tag。
2. 或等待對應的 `revalidate` 週期自動刷新（詳見 `src/app/**/page.tsx` 中的 `export const revalidate`）。

## 部署流程摘要

1. `pnpm type-check && pnpm lint && pnpm build`，確認語法、型別與 build 皆通過。
2. 將 `.env.local.example` 中的變數全部填入 Vercel Dashboard（包含 Resend 以及 GA4 相關設定）。
3. 重新部署後，在 Production URL 測試語言切換、聯絡表單寄信（確認收到 `knk-fans-site:{類型}` 主旨）、GA 即時資料與 Web Vitals（可透過 console 觀察）是否正常。
4. 需要重新整理 ISR 時，可參考 [`docs/testing-report.md`](docs/testing-report.md) 的指令重跑 Lighthouse 與響應式檢查。
