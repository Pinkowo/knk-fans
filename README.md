# KNK 粉絲網站

多語系的 KNK（韓國男團）粉絲入口網站，提供推坑指南、成員介紹、歌詞對照、綜藝整理與互動小元件，協助新朋友快速認識 KNK，也讓鐵粉有個逛得舒服的據點。

線上內容（成員、歌曲、綜藝、推坑指南等）皆由 Notion 資料庫管理，透過 Next.js ISR 快取，更新後可即時或排程刷新。

## 目錄

- [功能特色](#功能特色)
- [技術架構](#技術架構)
- [專案結構](#專案結構)
- [安裝與本機啟動](#安裝與本機啟動)
- [開發指令](#開發指令)
- [環境變數](#環境變數)
- [內容管理（Notion）](#內容管理notion)
- [On-Demand Revalidation](#on-demand-revalidation)
- [Web Vitals 追蹤](#web-vitals-追蹤)
- [部署流程摘要](#部署流程摘要)
- [相關文件](#相關文件)

## 功能特色

- **推坑指南**：精選歌曲、舞台、綜藝片段，附縮圖與站內預覽，不需跳出頁面即可觀看 YouTube 內容。
- **成員介紹**：現任 / 已退團成員列表，點擊可開啟詳細資料 Modal（含大頭照、簡介、生日星座、官方連結）。
- **歌曲與歌詞**：專輯與單曲列表，個別歌曲頁內嵌 YouTube MV，支援韓文 / 中文 / 日文 / 英文歌詞與羅馬拼音、空耳版本切換，並可選擇逐行對照或整段顯示。
- **綜藝整理**：依系列或單集呈現綜藝內容，快速導向官方頻道。
- **多語系介面**：中 / 韓 / 日 / 英四語切換，依瀏覽器語言自動偵測，並以 Cookie 記住使用者偏好；切換語言時顯示載入動畫，避免閃爍。
- **互動小寵物**：畫面上的動畫角色彩蛋，增加逛網站的趣味性。
- **背景音樂播放器**：可在站內持續播放音樂，瀏覽不同頁面不中斷。
- **聯絡表單**：支援錯誤回報、網站建議、其他類型詢問，可附加檔案，透過 Resend 寄送 Email 通知站長。
- **外部連結**：整理 YouTube、Instagram、台灣粉絲專頁等官方與社群連結。
- **SEO 與效能優化**：頁面層級 Metadata、ISR 快取、圖片優化、Web Vitals 追蹤、Google Analytics 4 整合。
- **無障礙與品質檢查**：內建 WCAG 2.1 AA 對比度檢查與多語系翻譯鍵值一致性檢查腳本。

## 技術架構

| 類別 | 技術 |
| --- | --- |
| 框架 | Next.js 16（App Router） + TypeScript |
| UI / 樣式 | Tailwind CSS、Framer Motion |
| 多語系 | next-intl（zh / ko / ja / en） |
| 內容來源 | Notion API（`@notionhq/client`），搭配 Next.js ISR 快取 |
| 表單處理 | react-hook-form + Zod 驗證 |
| Email 寄送 | Resend |
| 影片嵌入 | react-youtube |
| 分析追蹤 | `@vercel/analytics`、自訂 Web Vitals Reporter、Google Analytics 4（`@next/third-parties`） |
| 部署平台 | Vercel |
| 程式碼品質 | ESLint、Prettier、TypeScript 型別檢查 |

## 專案結構

```text
src/
  app/                 Next.js App Router 頁面與 API Routes
    [locale]/          各語系前綴的頁面（首頁、成員、歌曲、綜藝、聯絡我們...）
    api/                聯絡表單、Notion 代理、ISR Revalidate 等後端路由
  components/          依功能拆分的 React 元件（成員、歌詞、綜藝、聯絡表單、互動小寵物...）
  lib/                 工具函式、Notion 資料解析、i18n、analytics 等共用邏輯
  messages/            四語系翻譯檔（en / ja / ko / zh）
  styles/              全域樣式
  types/               TypeScript 型別定義
public/                靜態資源（圖片、favicon、角色 sprite）
docs/                  快速上手、Notion 設定、測試與部署檢查文件
specs/                 功能規格文件（spec / plan / tasks，採 speckit 流程管理）
scripts/               對比度檢查、翻譯一致性檢查等輔助腳本
```

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
| `pnpm dev:webpack` | 以 Webpack（停用 Turbopack）啟動開發伺服器 |
| `pnpm build` | 產生正式環境 build（含 ISR 頁面） |
| `pnpm start` | 啟動正式環境伺服器（需先執行 `pnpm build`） |
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
| `NOTION_GUIDE_DATABASE_ID` ~ `NOTION_LINKS_DATABASE_ID` | 各內容資料庫 ID（推坑指南、成員、歌曲、專輯、綜藝、魅力點、關於我們、外部連結） |
| `NEXT_PUBLIC_SITE_URL` | 站點網址（用於 metadata） |
| `REVALIDATION_SECRET` | On-Demand Revalidation 用隨機字串 |
| `NEXT_PUBLIC_WEB_VITALS_ENDPOINT` | （選填）Web Vitals 上報 API 路徑，未設定時在開發模式會輸出至 console |
| `RESEND_API_KEY` | Resend API 金鑰（用於聯絡表單寄信） |
| `CONTACT_EMAIL` | 聯絡表單收件者 Email，信件主旨固定為 `knk-fans-site:{類型}` |
| `NEXT_PUBLIC_GA_ID` | Google Analytics 4 Measurement ID（`G-XXXXXXX`） |

> **部署檢查**：Vercel Dashboard → Settings → Environment Variables 中輸入上述值後重新部署，方可啟用 ISR 與 Revalidate API。

**Resend / GA 設定提示**

- Resend：建立 `production` domain 後取得 API Key，並在 Project/Environment Secrets 中設定 `RESEND_API_KEY` 與 `CONTACT_EMAIL`。
- GA4：在 Google Analytics 中建立資料串流並取得 Measurement ID，填入 `NEXT_PUBLIC_GA_ID` 後重新部署，使用 `pnpm type-check && pnpm lint` 驗證程式碼再 push。

## 內容管理（Notion）

所有動態內容（推坑指南、成員、歌曲歌詞、專輯、綜藝、外部連結）皆儲存在 Notion 資料庫中，由 `src/lib/notion/*` 解析後透過 `src/app/api/notion/*` 提供給前端頁面使用。資料庫欄位結構請參考 [`docs/notion-setup.md`](docs/notion-setup.md)。

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

所有 API Route 與頁面已針對內容特性設定 ISR。若內容更新可以：

1. 透過 `POST /api/revalidate` 指定檢查的 path/tag。
2. 或等待對應的 `revalidate` 週期自動刷新（詳見 `src/app/**/page.tsx` 中的 `export const revalidate`）。

## 部署流程摘要

1. `pnpm type-check && pnpm lint && pnpm build`，確認語法、型別與 build 皆通過。
2. 將 `.env.local.example` 中的變數全部填入 Vercel Dashboard（包含 Resend 以及 GA4 相關設定）。
3. 重新部署後，在 Production URL 測試語言切換、聯絡表單寄信（確認收到 `knk-fans-site:{類型}` 主旨）、GA 即時資料與 Web Vitals（可透過 console 觀察）是否正常。
4. 需要重新整理 ISR 時，可參考 [`docs/testing-report.md`](docs/testing-report.md) 的指令重跑 Lighthouse 與響應式檢查。

## 相關文件

- [`docs/quickstart.md`](docs/quickstart.md)：完整安裝與部署步驟
- [`docs/notion-setup.md`](docs/notion-setup.md)：Notion 資料庫欄位設定
- [`docs/acceptance-tests.md`](docs/acceptance-tests.md)：使用者驗收測試案例
- [`docs/testing-report.md`](docs/testing-report.md)：測試結果與 Lighthouse 報告
- [`docs/isr-checklist.md`](docs/isr-checklist.md)：ISR 部署檢查清單
- [`specs/`](specs/)：以 speckit 流程管理的功能規格（spec / plan / tasks）
