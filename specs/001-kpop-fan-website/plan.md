# 實作計畫：K-pop 粉絲網站

**分支**: `001-kpop-fan-website` | **日期**: 2025-11-18 | **規格**: [spec.md](./spec.md)
**輸入**: 功能規格來自 `/specs/001-kpop-fan-website/spec.md`

## 摘要

建立一個多語言 K-pop 粉絲網站，專為 KNK 團體設計，提供推坑指南、成員介紹、音樂作品、綜藝內容等功能。網站使用 Next.js + React 作為前端框架，Notion 作為內容管理系統（CMS），並部署在 Vercel 平台。核心特色包括：推坑指南首頁、多語言歌詞顯示、網站小寵物動畫、音樂播放器，以及四種語言介面（韓/中/日/英）。

## 技術背景

**語言/版本**: TypeScript 5.x + Node.js 18+
**主要依賴項**:
- Next.js 14.x（前端框架、SSR、API routes）
- React 18.x（UI 元件庫）
- Tailwind CSS 3.x（樣式系統）
- Framer Motion 10.x（動畫與彈窗效果）
- next-intl 3.x（國際化 i18n）
- @notionhq/client（Notion API 客戶端）

**儲存**:
- Notion（作為內容管理系統，儲存成員、歌曲、專輯、綜藝等結構化資料）
- localStorage（瀏覽器端，儲存使用者偏好設定：語言、小寵物設定）
- Next.js 檔案系統（靜態資源：精靈圖表、圖片）

**測試**:
- Vitest（單元測試）
- React Testing Library（元件測試）
- Playwright（端對端測試）

**目標平台**: 現代網頁瀏覽器（Chrome 90+、Firefox 88+、Safari 14+、Edge 90+），響應式設計支援桌面和行動裝置

**專案類型**: Web 應用程式（前端 + API routes）

**效能目標**:
- 首頁載入時間 < 3 秒（標準寬頻連接）
- Time to Interactive (TTI) < 3 秒
- 歌詞語言切換 < 1 秒
- 網站小寵物動畫 ≥ 30 FPS
- Notion API 資料快取時效：ISR 60 秒

**限制條件**:
- Bundle 大小 < 500KB gzipped（總計）
- 關鍵路徑 < 100KB gzipped
- 頁面載入時間 < 2 秒（3G 網路）
- Notion API rate limit：每秒 3 次請求
- 免費 Vercel 配額：100GB 頻寬/月

**規模/範圍**:
- 預估訪客：1,000-5,000 月活躍使用者
- 內容規模：5-10 位成員、50-100 首歌曲、20-30 個綜藝系列
- 頁面數量：約 15-20 個主要頁面/路由
- 語言數量：4 種（韓/中/日/英）

## 憲章檢查

*門檻：必須在階段 0 研究前通過。在階段 1 設計後重新檢查。*

### I. 程式碼品質

✅ **可讀性優先**：使用 TypeScript 強型別、ESLint、Prettier 確保程式碼可讀性
✅ **SOLID 原則**：React 元件遵循單一職責原則，使用 hooks 實現關注點分離
✅ **DRY 原則**：共用元件、工具函式、類型定義統一管理
✅ **型別安全**：所有公開介面使用 TypeScript 明確型別註解
✅ **錯誤處理**：API routes 使用統一錯誤處理中介軟體，前端使用 Error Boundaries

### II. 測試規範

✅ **TDD 流程**：採用 Red-Green-Refactor 循環
✅ **合約測試**：Notion API 整合測試（模擬回應）
✅ **整合測試**：關鍵使用者旅程（推坑指南 → 歌曲詳細頁）
✅ **單元測試**：複雜業務邏輯（歌詞顯示模式切換、i18n 邏輯）
✅ **涵蓋率目標**：新程式碼 ≥ 80%，關鍵路徑 100%
✅ **測試獨立性**：每個測試可單獨執行
✅ **效能要求**：單元測試 < 100ms，整合測試 < 5s

### III. 使用者體驗一致性

✅ **回饋機制**：所有互動（點擊、hover、載入）提供即時視覺回饋
✅ **錯誤訊息**：使用者友善的錯誤提示（中文為主，多語言支援）
✅ **載入狀態**：操作 > 200ms 顯示載入指示器（骨架屏、Spinner）
✅ **無障礙性**：WCAG 2.1 AA 標準（鍵盤導航、語義化 HTML、ARIA 標籤）
✅ **響應式設計**：支援桌面（1920x1080）、平板（768x1024）、手機（375x667）
✅ **一致性**：統一設計系統（顏色、字體、間距）使用 Tailwind 設定檔
✅ **漸進式揭露**：推坑指南首頁優先展示核心內容，進階功能透過導航存取

### IV. 效能標準

✅ **回應時間**：客戶端互動 < 100ms（感知即時）
✅ **頁面載入**：< 2s（3G 網路）
✅ **TTI**：< 3 秒
✅ **API 延遲**：Notion API p95 < 200ms（快取策略）
✅ **記憶體使用**：客戶端 < 200MB
✅ **Bundle 大小**：< 500KB gzipped（總計），< 100KB（關鍵路徑）
✅ **監控**：使用 Vercel Analytics 監控 Web Vitals（LCP、FID、CLS）

### V. 文件語言

✅ **規格書**：spec.md 使用繁體中文 ✓
✅ **計畫書**：plan.md、research.md、data-model.md 使用繁體中文 ✓
✅ **任務清單**：tasks.md 使用繁體中文
✅ **分析文件**：analyze.md 使用繁體中文
✅ **使用者文件**：README、Quickstart、API 指南使用繁體中文
✅ **程式碼註解**：公開 API docstrings 使用繁體中文
⚠️ **提交訊息**：優先使用中文，國際協作可使用英文
✅ **憲章例外**：constitution.md 保持英文

**憲章檢查狀態**：✅ 通過（初步檢查）

## 專案結構

### 文件（此功能）

```text
specs/001-kpop-fan-website/
├── plan.md              # 本檔案（/speckit.plan 指令輸出）
├── research.md          # 階段 0 輸出（技術研究與決策）
├── data-model.md        # 階段 1 輸出（Notion 資料庫結構）
├── quickstart.md        # 階段 1 輸出（快速開始指南）
├── contracts/           # 階段 1 輸出（API 合約定義）
│   ├── notion-api.ts    # Notion API 類型定義
│   └── api-routes.md    # Next.js API routes 規格
└── tasks.md             # 階段 2 輸出（/speckit.tasks 指令 - 尚未建立）
```

### 原始碼（專案根目錄）

```text
# Web 應用程式結構（前端 + API）
knk-fans/
├── src/
│   ├── app/                    # Next.js 13+ App Router
│   │   ├── [locale]/          # 國際化路由
│   │   │   ├── page.tsx       # 推坑指南首頁
│   │   │   ├── members/       # 成員介紹
│   │   │   ├── discography/   # 音樂作品
│   │   │   ├── variety/       # 綜藝節目
│   │   │   ├── about/         # 團體介紹
│   │   │   └── contact/       # 關於我
│   │   ├── api/               # API Routes
│   │   │   ├── notion/        # Notion 資料擷取
│   │   │   └── revalidate/    # ISR 重新驗證
│   │   └── layout.tsx         # 根布局
│   ├── components/             # React 元件
│   │   ├── common/            # 共用元件
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── LanguageSelector.tsx
│   │   ├── guide/             # 推坑指南元件
│   │   │   ├── RecommendedSongs.tsx
│   │   │   ├── RecommendedShows.tsx
│   │   │   └── GroupCharms.tsx
│   │   ├── members/           # 成員元件
│   │   │   ├── MemberCard.tsx
│   │   │   └── MemberModal.tsx
│   │   ├── lyrics/            # 歌詞元件
│   │   │   ├── LyricsDisplay.tsx
│   │   │   └── LyricsControls.tsx
│   │   ├── pets/              # 網站小寵物
│   │   │   ├── SitePet.tsx
│   │   │   └── PetSettings.tsx
│   │   └── player/            # 音樂播放器
│   │       └── MusicPlayer.tsx
│   ├── lib/                    # 工具函式與服務
│   │   ├── notion/            # Notion API 客戶端
│   │   │   ├── client.ts
│   │   │   ├── members.ts
│   │   │   ├── songs.ts
│   │   │   └── variety.ts
│   │   ├── hooks/             # React Hooks
│   │   │   ├── useLocalStorage.ts
│   │   │   └── usePetSettings.ts
│   │   └── utils/             # 工具函式
│   │       ├── lyrics.ts
│   │       └── i18n.ts
│   ├── types/                  # TypeScript 類型定義
│   │   ├── notion.ts
│   │   ├── lyrics.ts
│   │   └── pets.ts
│   └── styles/                 # 全域樣式
│       └── globals.css
├── public/                     # 靜態資源
│   ├── sprites/               # 精靈圖表（4x4）
│   └── images/                # 圖片資源
├── tests/                      # 測試檔案
│   ├── unit/                  # 單元測試
│   │   ├── components/
│   │   └── lib/
│   ├── integration/           # 整合測試
│   │   └── notion-api.test.ts
│   └── e2e/                   # 端對端測試
│       └── guide-to-song.spec.ts
├── messages/                   # i18n 翻譯檔案
│   ├── ko.json               # 韓文
│   ├── zh.json               # 中文
│   ├── ja.json               # 日文
│   └── en.json               # 英文
├── .env.local.example         # 環境變數範例
├── next.config.js             # Next.js 設定
├── tailwind.config.js         # Tailwind CSS 設定
├── tsconfig.json              # TypeScript 設定
└── package.json               # 專案依賴

```

**結構決策**：選擇 Web 應用程式結構（Option 2 變體），因為專案包含前端頁面和 API routes。使用 Next.js 13+ App Router 實現檔案系統路由和 Server Components。國際化透過 `[locale]` 動態路由實現。Notion API 整合在 `/api/notion` 路由中，使用 ISR（Incremental Static Regeneration）策略快取內容。

## 複雜度追蹤

> **僅當憲章檢查有違規需要辯護時填寫**

本專案無憲章違規，所有設計決策符合憲章要求。

## 階段 0：概述與研究

*狀態：待執行*

### 研究任務

1. **Next.js 14 App Router 最佳實務**
   - 目標：確定 Server Components vs Client Components 使用策略
   - 產出：伺服器元件與客戶端元件的職責劃分指南

2. **Notion API 整合模式**
   - 目標：確定資料快取策略（ISR、SWR）和錯誤處理
   - 產出：Notion API 客戶端架構設計

3. **多語言歌詞顯示最佳化**
   - 目標：研究大量文字切換的效能最佳化方案
   - 產出：歌詞渲染與切換策略

4. **網站小寵物動畫實作**
   - 目標：評估 CSS Animation vs Canvas vs Web Animations API
   - 產出：動畫技術選型與效能基準

5. **next-intl 設定與路由策略**
   - 目標：確定國際化路由結構和語言偵測邏輯
   - 產出：i18n 設定指南

6. **Vercel 部署最佳化**
   - 目標：ISR 設定、環境變數管理、快取策略
   - 產出：部署設定檢查清單

**輸出**：`research.md` 包含所有決策、理由和替代方案評估

## 階段 1：設計與合約

*前提：`research.md` 完成*

### 資料模型設計

從功能規格提取實體 → `data-model.md`：

#### Notion 資料庫結構

1. **推坑指南資料庫**
   - 欄位：推薦類型、項目標題、目標連結、推薦原因、順序
   - 關聯：連結到歌曲資料庫、綜藝資料庫

2. **團體魅力點資料庫**
   - 欄位：特色類別、標題、描述、圖示
   - 驗證：類別必須為預定義值（身高、聲線、團魂等）

3. **成員資料庫**
   - 欄位：姓名、照片、詳細傳記、加入日期、離團日期、狀態（現任/已退團）
   - 狀態轉換：現任 ↔ 已退團（透過日期判斷）

4. **專輯資料庫**
   - 欄位：標題、封面圖片、發行日期、曲目列表（關聯）
   - 關聯：一對多關聯到歌曲資料庫

5. **歌曲資料庫**
   - 欄位：標題、專輯（關聯）、YouTube 影片 ID、歌詞（多語言）
   - 歌詞結構：JSON 格式，包含 ko、zh、ja、en、romanization、phonetic

6. **綜藝系列資料庫**
   - 欄位：系列名稱、描述、集數（關聯）
   - 關聯：一對多關聯到集數資料庫

7. **集數資料庫**
   - 欄位：集數編號、標題、YouTube 影片 ID、系列（關聯）
   - 驗證：集數編號必須為正整數

8. **外部連結資料庫**
   - 欄位：平台名稱、URL、顯示標籤、圖示

#### 客戶端狀態模型

1. **使用者偏好設定**（localStorage）
   - 語言偏好（ko | zh | ja | en）
   - 網站小寵物設定（啟用狀態、個別角色開關、互動開關）
   - 音樂播放器狀態（開啟/關閉、當前播放歌曲）

2. **歌詞顯示狀態**（React State）
   - 選擇的語言（陣列）
   - 顯示模式（逐行交錯 | 段落）
   - 預設語言：ko（韓文）

### API 合約生成

從功能需求產生端點 → `/contracts/`：

#### Next.js API Routes

```typescript
// contracts/api-routes.md

## GET /api/notion/guide
- 描述：擷取推坑指南內容
- 回應：{ recommendedSongs: [], recommendedShows: [], groupCharms: [] }
- 快取：ISR 60 秒

## GET /api/notion/members
- 描述：擷取成員列表
- 查詢參數：status=current|former (可選)
- 回應：{ current: [], former: [] }
- 快取：ISR 300 秒

## GET /api/notion/members/:id
- 描述：擷取單一成員詳細資訊
- 回應：{ id, name, photo, bio, joinDate, leaveDate, status }
- 快取：ISR 300 秒

## GET /api/notion/discography
- 描述：擷取專輯列表
- 回應：[{ id, title, cover, releaseDate, tracks: [] }]
- 快取：ISR 600 秒

## GET /api/notion/songs/:id
- 描述：擷取歌曲詳細資訊（含歌詞）
- 回應：{ id, title, album, videoId, lyrics: { ko, zh, ja, en, romanization, phonetic } }
- 快取：ISR 600 秒

## GET /api/notion/variety
- 描述：擷取綜藝系列列表
- 回應：[{ id, name, description, episodes: [] }]
- 快取：ISR 600 秒

## POST /api/revalidate
- 描述：手動觸發 ISR 重新驗證
- 請求體：{ secret, path }
- 回應：{ revalidated: true }
```

#### Notion API 類型定義

```typescript
// contracts/notion-api.ts

export interface NotionMember {
  id: string;
  properties: {
    Name: { title: [{ plain_text: string }] };
    Photo: { files: [{ file: { url: string } }] };
    Bio: { rich_text: [{ plain_text: string }] };
    JoinDate: { date: { start: string } };
    LeaveDate?: { date: { start: string } };
    Status: { select: { name: 'Current' | 'Former' } };
  };
}

export interface NotionSong {
  id: string;
  properties: {
    Title: { title: [{ plain_text: string }] };
    Album: { relation: [{ id: string }] };
    VideoID: { rich_text: [{ plain_text: string }] };
    LyricsKO: { rich_text: [{ plain_text: string }] };
    LyricsZH: { rich_text: [{ plain_text: string }] };
    LyricsJA: { rich_text: [{ plain_text: string }] };
    LyricsEN: { rich_text: [{ plain_text: string }] };
    LyricsRomanization: { rich_text: [{ plain_text: string }] };
    LyricsPhonetic: { rich_text: [{ plain_text: string }] };
  };
}

// ... 其他 Notion 類型定義
```

### 代理程式背景更新

執行 `.specify/scripts/bash/update-agent-context.sh claude`

**輸出**：
- `data-model.md`（Notion 資料庫結構、客戶端狀態）
- `/contracts/api-routes.md`（API 端點規格）
- `/contracts/notion-api.ts`（TypeScript 類型定義）
- `quickstart.md`（快速開始指南）
- `.claude_code/context.md`（更新代理程式背景）

## 階段 2：任務產生

*由 `/speckit.tasks` 指令執行，不在此計畫範圍內*

## 附錄

### 技術決策記錄（TDR）

#### TDR-001: 選擇 Next.js 作為主框架
- **決策**：使用 Next.js 14 App Router
- **理由**：SSR/SSG 支援良好 SEO、API Routes 簡化後端、內建圖片最佳化、Vercel 部署整合完善
- **替代方案**：Remix（學習曲線較陡）、Astro（靜態優先，不適合動態內容）

#### TDR-002: 使用 Notion 作為 CMS
- **決策**：Notion 作為內容管理系統
- **理由**：非技術人員友善、結構化資料庫、免費方案足夠、API 穩定
- **替代方案**：Contentful（付費）、Strapi（需自行託管）、Markdown 檔案（缺乏結構化、難以管理多語言）

#### TDR-003: Tailwind CSS 用於樣式
- **決策**：使用 Tailwind CSS
- **理由**：快速開發、設計系統一致性、小型 Bundle、設定檔集中管理主題
- **替代方案**：CSS Modules（缺乏設計系統）、Styled Components（執行時開銷）

#### TDR-004: Framer Motion 用於動畫
- **決策**：使用 Framer Motion
- **理由**：宣告式 API、彈窗/頁面轉場支援、效能最佳化、與 React 整合良好
- **替代方案**：React Spring（學習曲線較陡）、純 CSS（功能有限）

#### TDR-005: next-intl 用於國際化
- **決策**：使用 next-intl
- **理由**：App Router 原生支援、型別安全、訊息格式化、效能最佳化
- **替代方案**：next-i18next（Pages Router 設計）、react-intl（需手動整合路由）

### 效能基準

| 指標 | 目標 | 測量方法 |
|------|------|----------|
| 首頁 LCP | < 2.5s | Lighthouse、Web Vitals |
| 首頁 FID | < 100ms | Web Vitals |
| 首頁 CLS | < 0.1 | Web Vitals |
| 歌詞切換 | < 1s | 自訂效能標記 |
| 小寵物動畫 | ≥ 30 FPS | Chrome DevTools Performance |
| Notion API 回應 | < 200ms (p95) | Next.js Analytics |
| Bundle 大小（首頁） | < 100KB | Next.js Bundle Analyzer |

### 安全考量

1. **環境變數保護**：Notion API Token 存放於 Vercel 環境變數，不提交到 Git
2. **API Rate Limiting**：實作快取層避免超過 Notion API 限制
3. **XSS 防護**：React 預設跳脫、Notion 內容清理
4. **HTTPS**：Vercel 自動提供 SSL 憑證
5. **CORS**：API Routes 限制來源網域

### 無障礙性檢查清單

- [ ] 所有圖片包含 alt 屬性
- [ ] 鍵盤導航支援（Tab、Enter、Escape）
- [ ] ARIA 標籤（按鈕、彈窗、導航）
- [ ] 顏色對比度 ≥ 4.5:1（文字）、3:1（大型文字）
- [ ] 焦點指示器明確可見
- [ ] 語義化 HTML（header、nav、main、footer）
- [ ] 螢幕閱讀器測試（VoiceOver、NVDA）

---

**計畫狀態**：✅ 階段 0-1 規劃完成，待執行研究與設計任務
**下一步**：執行 Phase 0 研究任務，產生 `research.md`
