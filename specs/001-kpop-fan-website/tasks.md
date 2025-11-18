# 任務清單：K-pop 粉絲網站

**輸入**: `/specs/001-kpop-fan-website/` 的設計文件
**前提條件**: plan.md、spec.md、research.md

**組織方式**: 任務按使用者故事分組，以實現獨立實作和測試

## 格式：`[ID] [P?] [Story] 描述`

- **[P]**: 可並行執行（不同檔案、無相依性）
- **[Story]**: 此任務屬於哪個使用者故事（例如 US1、US2、US3）
- 描述中包含精確的檔案路徑

---

## 階段 1：專案初始化（共用基礎設施）

**目的**: 專案結構建立與基礎工具設定

- [ ] T001 建立 Next.js 14 專案結構，使用 TypeScript 5.x，在專案根目錄執行 `npx create-next-app@latest knk-fans --typescript --tailwind --app --src-dir --import-alias "@/*"`
- [ ] T002 安裝核心依賴項：`npm install @notionhq/client next-intl framer-motion`
- [ ] T003 [P] 設定 ESLint 與 Prettier，在 `.eslintrc.json` 和 `.prettierrc` 設定檔
- [ ] T004 [P] 建立 `.env.local.example`，定義所需環境變數（NOTION_API_KEY、資料庫 ID 等）
- [ ] T005 [P] 設定 Tailwind CSS，在 `tailwind.config.js` 定義設計系統（顏色、字體、間距）
- [ ] T006 建立專案目錄結構：`src/components/`、`src/lib/`、`src/types/`、`public/sprites/`、`messages/`
- [ ] T007 [P] 設定 TypeScript 路徑別名，在 `tsconfig.json` 設定 `@/` 指向 `./src/`
- [ ] T008 [P] 建立 Git 忽略規則，將 `.env.local`、`.next/`、`node_modules/` 加入 `.gitignore`

---

## 階段 2：基礎建設（阻塞性前置條件）

**目的**: 核心基礎設施，**必須**在任何使用者故事之前完成

**⚠️ 關鍵**: 此階段完成前，無法開始任何使用者故事

### 國際化（i18n）基礎設施

- [ ] T009 建立 i18n 設定檔 `i18n.ts`，定義四種語言（ko、zh、ja、en）與訊息載入邏輯
- [ ] T010 設定 next-intl middleware，在 `middleware.ts` 實作語言偵測與路由重導向
- [ ] T011 [P] 建立繁體中文翻譯檔 `messages/zh.json`，包含共用 UI 文字（導航、按鈕、錯誤訊息）
- [ ] T012 [P] 建立韓文翻譯檔 `messages/ko.json`，與 zh.json 結構相同
- [ ] T013 [P] 建立日文翻譯檔 `messages/ja.json`，與 zh.json 結構相同
- [ ] T014 [P] 建立英文翻譯檔 `messages/en.json`，與 zh.json 結構相同
- [ ] T015 更新 `next.config.js`，使用 next-intl 插件包裝設定

### Notion API 整合

- [ ] T016 建立 Notion 客戶端，在 `src/lib/notion/client.ts` 實作速率限制隊列（3 req/s）與重試邏輯
- [ ] T017 定義 Notion 類型介面，在 `src/types/notion.ts` 定義所有 Notion 資料庫回應類型
- [ ] T018 建立 Notion 工具函式，在 `src/lib/notion/utils.ts` 實作 Rich Text 轉 Plain Text 轉換器
- [ ] T019 建立快取策略設定，在 `src/lib/notion/config.ts` 定義各內容類型的 revalidate 時間

### 共用元件與布局

- [ ] T020 建立根布局，在 `src/app/layout.tsx` 設定 HTML lang 屬性、字體載入、Vercel Analytics
- [ ] T021 建立語言路由布局，在 `src/app/[locale]/layout.tsx` 實作 NextIntlClientProvider 與導航結構
- [ ] T022 [P] 建立 Header 元件，在 `src/components/common/Header.tsx` 實作網站導航列與 Logo
- [ ] T023 [P] 建立 Footer 元件，在 `src/components/common/Footer.tsx` 實作頁尾資訊
- [ ] T024 [P] 建立 LanguageSelector 元件，在 `src/components/common/LanguageSelector.tsx` 實作語言切換下拉選單（Client Component）
- [ ] T025 建立 localStorage Hook，在 `src/lib/hooks/useLocalStorage.ts` 實作通用 localStorage 存取邏輯（型別安全）

### 樣式與設計系統

- [ ] T026 建立全域樣式，在 `src/styles/globals.css` 定義 CSS 變數、字體匯入、基礎樣式重置
- [ ] T027 設定 Framer Motion 變體，在 `src/lib/animation/variants.ts` 定義常用動畫效果（淡入、滑入、彈窗）

**檢查點**: 基礎建設完成 - 現在可以並行開始實作使用者故事

---

## 階段 3：使用者故事 1 - 透過推坑指南入門（優先級：P1）🎯 MVP

**目標**: 建立推坑指南首頁，展示推薦歌曲、推薦舞台/綜藝、團體魅力點，並提供導航連結

**獨立測試**: 造訪首頁 `/zh`，驗證三個區塊（推薦歌曲、推薦舞台/綜藝、團體魅力點）正確顯示，所有推薦項目可點擊導航

### Notion 資料擷取 - 推坑指南

- [ ] T028 [P] 建立推坑指南 Notion 查詢，在 `src/lib/notion/guide.ts` 實作 `fetchGuideData()` 函式，擷取推薦項目與團體魅力點
- [ ] T029 [P] 定義推坑指南類型，在 `src/types/guide.ts` 定義 `Guide`、`RecommendedItem`、`GroupCharm` 介面
- [ ] T030 建立推坑指南 API Route，在 `src/app/api/notion/guide/route.ts` 實作 GET 端點，設定 ISR revalidate 為 21600 秒（6 小時）

### 首頁實作

- [ ] T031 建立首頁 Server Component，在 `src/app/[locale]/page.tsx` 擷取推坑指南資料並渲染三大區塊
- [ ] T032 [P] 建立推薦歌曲元件，在 `src/components/guide/RecommendedSongs.tsx` 顯示推薦歌曲列表，包含連結導向歌曲詳細頁
- [ ] T033 [P] 建立推薦舞台/綜藝元件，在 `src/components/guide/RecommendedShows.tsx` 顯示推薦舞台與綜藝列表，包含外部連結
- [ ] T034 [P] 建立團體魅力點元件，在 `src/components/guide/GroupCharms.tsx` 以卡片形式顯示團體特色（身高、聲線、團魂等）
- [ ] T035 新增推坑指南翻譯，在 `messages/zh.json`、`ko.json`、`ja.json`、`en.json` 新增 `guide.*` 鍵值（標題、區塊名稱）
- [ ] T036 最佳化首頁圖片，使用 `next/image` 元件，設定適當 `sizes` 與 `placeholder="blur"`，在所有推坑指南元件中套用
- [ ] T037 建立首頁骨架屏，在 `src/app/[locale]/loading.tsx` 實作載入狀態 UI

**檢查點**: 推坑指南首頁完整可用，可獨立測試並展示

---

## 階段 4：使用者故事 2 - 瀏覽團體成員（優先級：P1）

**目標**: 顯示現任與已退團成員列表，支援點擊成員卡片開啟彈窗檢視詳細資訊

**獨立測試**: 造訪 `/zh/members`，驗證現任與已退團區塊顯示，點擊成員卡片開啟彈窗，彈窗包含完整成員資訊

### Notion 資料擷取 - 成員

- [ ] T038 [P] 建立成員 Notion 查詢，在 `src/lib/notion/members.ts` 實作 `fetchMembers()` 與 `fetchMemberById()` 函式
- [ ] T039 [P] 定義成員類型，在 `src/types/member.ts` 定義 `Member` 介面（包含 id、name、photo、bio、status 等欄位）
- [ ] T040 建立成員 API Routes，在 `src/app/api/notion/members/route.ts` 實作 GET 端點（列表），revalidate 86400 秒（24 小時）
- [ ] T041 建立單一成員 API Route，在 `src/app/api/notion/members/[id]/route.ts` 實作 GET 端點（單筆），revalidate 86400 秒

### 成員頁面實作

- [ ] T042 建立成員列表頁面，在 `src/app/[locale]/members/page.tsx` 擷取成員資料，分為現任與已退團兩個區塊
- [ ] T043 [P] 建立成員卡片元件，在 `src/components/members/MemberCard.tsx` 顯示照片、姓名，支援 onClick 事件
- [ ] T044 建立成員彈窗元件，在 `src/components/members/MemberModal.tsx` 使用 Framer Motion 實作動畫彈窗，顯示完整成員資訊（Client Component）
- [ ] T045 新增成員翻譯，在 `messages/*.json` 新增 `members.*` 鍵值（現任成員、已退團成員、關閉按鈕）
- [ ] T046 最佳化成員照片，在 `MemberCard.tsx` 與 `MemberModal.tsx` 使用 `next/image` 元件
- [ ] T047 建立成員頁面骨架屏，在 `src/app/[locale]/members/loading.tsx` 實作卡片骨架

**檢查點**: 成員列表與彈窗完整運作，可獨立測試

---

## 階段 5：使用者故事 3 - 探索音樂作品並聆聽歌曲（優先級：P1）

**目標**: 顯示專輯列表與歌曲詳細頁，支援多語言歌詞顯示與切換（預設韓文，支援逐行交錯與整段模式）

**獨立測試**: 造訪 `/zh/discography`，驗證專輯列表顯示，點擊歌曲進入詳細頁，YouTube 影片正確嵌入，歌詞預設顯示韓文，可切換其他語言，可切換顯示模式

### Notion 資料擷取 - 音樂作品

- [ ] T048 [P] 建立專輯 Notion 查詢，在 `src/lib/notion/albums.ts` 實作 `fetchAlbums()` 函式
- [ ] T049 [P] 建立歌曲 Notion 查詢，在 `src/lib/notion/songs.ts` 實作 `fetchSongById()` 與 `fetchSongLyrics()` 函式
- [ ] T050 [P] 定義音樂類型，在 `src/types/music.ts` 定義 `Album`、`Song`、`Lyrics` 介面
- [ ] T051 建立專輯 API Route，在 `src/app/api/notion/discography/route.ts` 實作 GET 端點，revalidate 604800 秒（7 天）
- [ ] T052 建立歌曲 API Route，在 `src/app/api/notion/songs/[id]/route.ts` 實作 GET 端點（含歌詞），revalidate 600 秒（10 分鐘）

### 音樂作品頁面實作

- [ ] T053 建立音樂作品列表頁，在 `src/app/[locale]/discography/page.tsx` 擷取專輯列表，顯示封面、標題、發行日期
- [ ] T054 [P] 建立專輯卡片元件，在 `src/components/discography/AlbumCard.tsx` 顯示專輯資訊與曲目列表
- [ ] T055 建立歌曲詳細頁，在 `src/app/[locale]/discography/[id]/page.tsx` 擷取歌曲資料，嵌入 YouTube 播放器，傳遞歌詞資料
- [ ] T056 建立 YouTube 嵌入元件，在 `src/components/music/YouTubeEmbed.tsx` 實作 iframe 嵌入，支援 videoId 參數

### 歌詞顯示系統

- [ ] T057 建立歌詞工具函式，在 `src/lib/utils/lyrics.ts` 實作歌詞格式化邏輯（逐行交錯 vs 整段模式）
- [ ] T058 建立歌詞顯示元件，在 `src/components/lyrics/LyricsDisplay.tsx` 實作 Client Component，使用 `useMemo` 最佳化渲染
- [ ] T059 建立歌詞控制元件，在 `src/components/lyrics/LyricsControls.tsx` 實作語言多選核取方塊與顯示模式切換按鈕（Client Component）
- [ ] T060 實作歌詞預設邏輯，在 `LyricsDisplay.tsx` 確保無語言選擇時自動顯示韓文（符合 FR-021）
- [ ] T061 新增音樂與歌詞翻譯，在 `messages/*.json` 新增 `discography.*` 與 `lyrics.*` 鍵值
- [ ] T062 最佳化歌詞效能，在 `LyricsDisplay.tsx` 使用 `React.memo` 與 CSS `contain` 屬性

**檢查點**: 音樂作品與歌詞系統完整運作，歌詞切換 < 1 秒

---

## 階段 6：使用者故事 4 - 觀看綜藝節目內容（優先級：P2）

**目標**: 顯示綜藝系列列表，支援瀏覽集數並觀看 YouTube 影片

**獨立測試**: 造訪 `/zh/variety`，驗證系列列表顯示，點擊系列展開集數，點擊集數播放 YouTube 影片

### Notion 資料擷取 - 綜藝

- [ ] T063 [P] 建立綜藝 Notion 查詢，在 `src/lib/notion/variety.ts` 實作 `fetchVarietySeries()` 與 `fetchEpisodes()` 函式
- [ ] T064 [P] 定義綜藝類型，在 `src/types/variety.ts` 定義 `VarietySeries`、`Episode` 介面
- [ ] T065 建立綜藝 API Route，在 `src/app/api/notion/variety/route.ts` 實作 GET 端點，revalidate 86400 秒（24 小時）

### 綜藝頁面實作

- [ ] T066 建立綜藝頁面，在 `src/app/[locale]/variety/page.tsx` 擷取系列列表並渲染
- [ ] T067 [P] 建立系列卡片元件，在 `src/components/variety/SeriesCard.tsx` 顯示系列名稱與描述，支援展開/收合集數列表（Client Component）
- [ ] T068 [P] 建立集數項目元件，在 `src/components/variety/EpisodeItem.tsx` 顯示集數編號與標題，點擊載入 YouTube 播放器
- [ ] T069 新增綜藝翻譯，在 `messages/*.json` 新增 `variety.*` 鍵值

**檢查點**: 綜藝系統完整運作，可獨立測試

---

## 階段 7：使用者故事 5 - 切換網站語言（優先級：P2）

**目標**: 語言選擇器可在任何頁面存取，語言偏好跨頁面持續，回訪時記住偏好

**獨立測試**: 在任何頁面切換語言，驗證 URL 更新、所有 UI 文字翻譯、重新整理後語言保持、關閉瀏覽器後重新開啟仍保持語言偏好

### 語言持久化

- [ ] T070 實作語言偏好記憶，在 `LanguageSelector.tsx` 新增 localStorage 存儲邏輯，使用 `useLocalStorage` Hook
- [ ] T071 實作 Server 端語言偵測，在 `middleware.ts` 讀取 cookie 或 Accept-Language header，設定預設語言為中文（zh）
- [ ] T072 測試語言切換流程，驗證所有頁面的 UI 文字、導航標籤、區塊標題正確翻譯
- [ ] T073 新增缺失翻譯，補全 `messages/*.json` 所有頁面的翻譯鍵值

**檢查點**: 語言切換完整運作，偏好持久化

---

## 階段 8：使用者故事 8 - 存取外部社群連結（優先級：P2）

**目標**: 顯示外部連結頁面，包含台灣 Facebook 粉絲團與官方 Instagram，點擊在新分頁開啟

**獨立測試**: 造訪 `/zh/links`，驗證 Facebook 與 Instagram 連結顯示，點擊在新分頁開啟正確 URL

### Notion 資料擷取 - 外部連結

- [ ] T074 [P] 建立外部連結 Notion 查詢，在 `src/lib/notion/links.ts` 實作 `fetchExternalLinks()` 函式
- [ ] T075 [P] 定義外部連結類型，在 `src/types/links.ts` 定義 `ExternalLink` 介面
- [ ] T076 建立外部連結 API Route，在 `src/app/api/notion/links/route.ts` 實作 GET 端點，revalidate 604800 秒（7 天）

### 外部連結頁面實作

- [ ] T077 建立外部連結頁面，在 `src/app/[locale]/links/page.tsx` 擷取連結資料並渲染
- [ ] T078 [P] 建立連結卡片元件，在 `src/components/links/LinkCard.tsx` 顯示平台名稱、圖示，設定 `target="_blank"` 與 `rel="noopener noreferrer"`
- [ ] T079 新增外部連結翻譯，在 `messages/*.json` 新增 `links.*` 鍵值

**檢查點**: 外部連結頁面完整運作

---

## 階段 9：使用者故事 6 - 與網站小寵物互動（優先級：P3）

**目標**: 顯示四隻動畫小寵物在畫面上走動（4x4 精靈圖），支援設定開關、個別角色開關、互動開關，設定持久化

**獨立測試**: 瀏覽任何頁面，驗證小寵物動畫流暢（≥30 FPS），開啟設定可切換開關，設定跨頁面與工作階段持續

### 精靈圖準備

- [ ] T080 準備精靈圖資源，將 4x4 精靈圖（4 個方向 × 4 幀）放置於 `public/sprites/pets.png`，最佳化 PNG 檔案大小

### 小寵物系統實作

- [ ] T081 建立小寵物設定 Hook，在 `src/lib/hooks/usePetSettings.ts` 實作設定讀取/寫入 localStorage，定義預設值
- [ ] T082 定義小寵物類型，在 `src/types/pets.ts` 定義 `Pet`、`PetSettings` 介面
- [ ] T083 建立小寵物元件，在 `src/components/pets/SitePet.tsx` 使用 Canvas API 與 `requestAnimationFrame` 實作動畫（Client Component）
- [ ] T084 實作小寵物物理，在 `SitePet.tsx` 實作邊界碰撞偵測、速度計算、方向更新
- [ ] T085 實作小寵物渲染，在 `SitePet.tsx` 實作精靈圖切割與繪製邏輯，設定 8 FPS 精靈動畫
- [ ] T086 建立小寵物設定元件，在 `src/components/pets/PetSettings.tsx` 實作設定面板，包含全域開關、個別角色開關、互動開關（Client Component）
- [ ] T087 整合小寵物到布局，在 `src/app/[locale]/layout.tsx` 新增 `<SitePet>` 元件，確保在 z-index 最上層且 `pointer-events-none`
- [ ] T088 實作點擊互動，在 `SitePet.tsx` 新增 Canvas onClick 事件處理，觸發小寵物動畫回應
- [ ] T089 新增小寵物翻譯，在 `messages/*.json` 新增 `pets.*` 鍵值
- [ ] T090 最佳化小寵物效能，驗證 FPS ≥ 30，CPU 使用 < 10%，記憶體 < 50MB

**檢查點**: 小寵物系統完整運作，效能達標

---

## 階段 10：使用者故事 7 - 播放背景音樂（優先級：P3）

**目標**: 提供音樂播放器（預設關閉），支援 YouTube 或 Spotify 來源，跨頁面播放不中斷

**獨立測試**: 開啟音樂播放器，選擇歌曲播放，測試播放/暫停/跳過控制，切換頁面驗證音樂持續播放

### 音樂播放器實作

- [ ] T091 定義播放器類型，在 `src/types/player.ts` 定義 `PlayerState`、`Track` 介面
- [ ] T092 建立播放器 Context，在 `src/lib/context/PlayerContext.tsx` 實作全域播放器狀態管理（Client Component）
- [ ] T093 建立音樂播放器元件，在 `src/components/player/MusicPlayer.tsx` 實作浮動播放器 UI，支援最小化/展開
- [ ] T094 實作 YouTube 播放邏輯，在 `MusicPlayer.tsx` 使用 YouTube iframe API，處理播放事件
- [ ] T095 實作播放控制，在 `MusicPlayer.tsx` 實作播放、暫停、跳過、選歌功能
- [ ] T096 實作播放狀態持久化，使用 localStorage 儲存當前播放歌曲與播放狀態
- [ ] T097 整合播放器到布局，在 `src/app/[locale]/layout.tsx` 包裹 `<PlayerContext.Provider>` 並新增 `<MusicPlayer>` 元件
- [ ] T098 新增播放器翻譯，在 `messages/*.json` 新增 `player.*` 鍵值

**檢查點**: 音樂播放器完整運作，跨頁面播放不中斷

---

## 階段 11：使用者故事 9 - 了解網站創作者（優先級：P3）

**目標**: 顯示「關於我」頁面，介紹網站創作者與粉絲網站服務，提供聯絡資訊

**獨立測試**: 造訪 `/zh/about-me`，驗證創作者介紹與聯絡資訊顯示

### 關於我頁面實作

- [ ] T099 建立關於我頁面，在 `src/app/[locale]/about-me/page.tsx` 顯示創作者自我介紹與服務說明
- [ ] T100 新增關於我翻譯，在 `messages/*.json` 新增 `aboutMe.*` 鍵值（包含創作者介紹、服務說明、聯絡資訊）

**檢查點**: 關於我頁面完整顯示

---

## 階段 12：團體介紹頁面（補充功能）

**目標**: 建立獨立的團體介紹頁面（與推坑指南分開），提供 KNK 團體的詳細背景資訊

**獨立測試**: 造訪 `/zh/about`，驗證團體介紹內容顯示

### Notion 資料擷取 - 團體介紹

- [ ] T101 [P] 建立團體介紹 Notion 查詢，在 `src/lib/notion/about.ts` 實作 `fetchGroupInfo()` 函式
- [ ] T102 [P] 定義團體類型，在 `src/types/group.ts` 定義 `GroupInfo` 介面
- [ ] T103 建立團體介紹 API Route，在 `src/app/api/notion/about/route.ts` 實作 GET 端點，revalidate 604800 秒（7 天）

### 團體介紹頁面實作

- [ ] T104 建立團體介紹頁面，在 `src/app/[locale]/about/page.tsx` 擷取團體資料並渲染
- [ ] T105 新增團體介紹翻譯，在 `messages/*.json` 新增 `about.*` 鍵值

**檢查點**: 團體介紹頁面完整顯示

---

## 階段 13：優化與跨功能調整

**目的**: 影響多個使用者故事的改進與最終調整

### 效能最佳化

- [ ] T106 [P] 分析 Bundle 大小，執行 `npm run build`，使用 Next.js Bundle Analyzer，確保首頁 < 100KB gzipped
- [ ] T107 [P] 最佳化圖片載入，驗證所有圖片使用 `next/image`，設定適當 `sizes` 與 `priority` 屬性
- [ ] T108 [P] 實作字體最佳化，在 `src/app/layout.tsx` 使用 `next/font/google` 載入 Noto Sans TC，設定 `display: 'swap'`
- [ ] T109 設定快取 Headers，在 `next.config.js` 定義靜態資源與頁面的 Cache-Control
- [ ] T110 實作 generateStaticParams，在所有動態路由頁面（成員、歌曲等）實作靜態生成參數

### 錯誤處理與 Loading 狀態

- [ ] T111 [P] 建立全域錯誤邊界，在 `src/app/[locale]/error.tsx` 實作錯誤處理 UI
- [ ] T112 [P] 建立 404 頁面，在 `src/app/[locale]/not-found.tsx` 實作自訂 404 UI
- [ ] T113 補全所有 loading.tsx，確保所有頁面都有骨架屏或 Loading 指示器

### 無障礙性（WCAG 2.1 AA）

- [ ] T114 [P] 驗證鍵盤導航，確保所有互動元件可用 Tab、Enter、Escape 操作
- [ ] T115 [P] 新增 ARIA 標籤，在導航、彈窗、按鈕元件新增適當 `aria-label`、`role` 屬性
- [ ] T116 [P] 驗證顏色對比度，使用工具檢查文字與背景對比度 ≥ 4.5:1
- [ ] T117 新增語義化 HTML，確保使用 `<header>`、`<nav>`、`<main>`、`<footer>` 標籤

### Vercel 部署準備

- [ ] T118 建立 On-Demand Revalidation API，在 `src/app/api/revalidate/route.ts` 實作手動觸發 ISR 重新驗證端點
- [ ] T119 設定環境變數，在 Vercel Dashboard 設定所有 NOTION_* 環境變數與 REVALIDATION_SECRET
- [ ] T120 整合 Vercel Analytics，在 `src/app/layout.tsx` 新增 `<Analytics />` 元件
- [ ] T121 設定 Web Vitals 追蹤，在 `src/app/[locale]/layout.tsx` 實作 `useReportWebVitals` Hook

### 文件與測試

- [ ] T122 [P] 建立 README.md，包含專案說明、安裝步驟、環境變數設定、執行指令
- [ ] T123 [P] 建立 quickstart.md，提供快速開始指南與常見問題解答
- [ ] T124 建立 Notion 資料庫設定文件，在 `docs/notion-setup.md` 說明所需資料庫結構與欄位
- [ ] T125 執行 Lighthouse 測試，驗證首頁效能分數 > 90、無障礙性分數 > 90
- [ ] T126 測試行動裝置響應式，驗證網站在 375px、768px、1920px 寬度正常顯示

### 最終檢查

- [ ] T127 驗證所有翻譯完整性，確保四種語言的 `messages/*.json` 包含所有鍵值
- [ ] T128 驗證所有 ISR 快取設定，確認各 API Route 的 revalidate 時間符合計畫
- [ ] T129 測試所有使用者故事的驗收情境，逐一執行 spec.md 中的驗收測試
- [ ] T130 執行 TypeScript 型別檢查，執行 `npm run type-check`，確保無型別錯誤
- [ ] T131 執行 ESLint 檢查，執行 `npm run lint`，確保程式碼品質

---

## 相依性與執行順序

### 階段相依性

- **專案初始化（階段 1）**: 無相依性 - 可立即開始
- **基礎建設（階段 2）**: 依賴階段 1 完成 - **阻塞所有使用者故事**
- **使用者故事（階段 3-12）**: 全部依賴階段 2 完成
  - 使用者故事可並行進行（若有足夠人力）
  - 或依優先級依序進行（P1 → P2 → P3）
- **優化（階段 13）**: 依賴所有希望包含的使用者故事完成

### 使用者故事相依性

- **使用者故事 1（P1）**: 階段 2 完成後可開始 - 無其他故事相依性
- **使用者故事 2（P1）**: 階段 2 完成後可開始 - 無其他故事相依性
- **使用者故事 3（P1）**: 階段 2 完成後可開始 - 可與 US1 整合（推坑指南連結至歌曲），但應可獨立測試
- **使用者故事 4（P2）**: 階段 2 完成後可開始 - 可與 US1 整合（推坑指南連結至綜藝），但應可獨立測試
- **使用者故事 5（P2）**: 階段 2 完成後可開始 - 無其他故事相依性（語言切換基礎建設已在階段 2）
- **使用者故事 6（P3）**: 階段 2 完成後可開始 - 無其他故事相依性
- **使用者故事 7（P3）**: 階段 2 完成後可開始 - 可與 US3 整合（播放器選歌），但應可獨立測試
- **使用者故事 8（P2）**: 階段 2 完成後可開始 - 無其他故事相依性
- **使用者故事 9（P3）**: 階段 2 完成後可開始 - 無其他故事相依性
- **團體介紹頁（階段 12）**: 階段 2 完成後可開始 - 可與 US1 整合（推坑指南連結），但應可獨立測試

### 並行執行機會

- 階段 1 所有標記 [P] 的任務可並行執行
- 階段 2 同類型任務可並行執行（例如：四個翻譯檔可同時建立）
- 階段 2 完成後，所有使用者故事可同時由不同開發者處理
- 每個使用者故事內，標記 [P] 的任務可並行執行
- 階段 13 所有標記 [P] 的任務可並行執行

---

## 並行範例：使用者故事 1

```bash
# 並行啟動推坑指南的所有 Notion 查詢與類型定義：
Task: "建立推坑指南 Notion 查詢，在 src/lib/notion/guide.ts"
Task: "定義推坑指南類型，在 src/types/guide.ts"

# 並行建立推坑指南的所有元件：
Task: "建立推薦歌曲元件，在 src/components/guide/RecommendedSongs.tsx"
Task: "建立推薦舞台/綜藝元件，在 src/components/guide/RecommendedShows.tsx"
Task: "建立團體魅力點元件，在 src/components/guide/GroupCharms.tsx"
```

---

## 實作策略

### MVP 優先（僅使用者故事 1-3）

1. 完成階段 1：專案初始化
2. 完成階段 2：基礎建設（關鍵 - 阻塞所有故事）
3. 完成階段 3：使用者故事 1（推坑指南）
4. 完成階段 4：使用者故事 2（成員列表）
5. 完成階段 5：使用者故事 3（音樂作品與歌詞）
6. **停止並驗證**: 測試 P1 使用者故事獨立運作
7. 部署/展示（MVP 完成！）

### 漸進式交付

1. 完成初始化 + 基礎建設 → 基礎就緒
2. 新增使用者故事 1 → 獨立測試 → 部署/展示（MVP！）
3. 新增使用者故事 2 → 獨立測試 → 部署/展示
4. 新增使用者故事 3 → 獨立測試 → 部署/展示
5. 新增使用者故事 4、5、8（P2）→ 獨立測試 → 部署/展示
6. 新增使用者故事 6、7、9（P3）→ 獨立測試 → 部署/展示
7. 每個故事增加價值而不破壞先前故事

### 並行團隊策略

若有多位開發者：

1. 團隊一起完成初始化 + 基礎建設
2. 基礎建設完成後：
   - 開發者 A：使用者故事 1（推坑指南）
   - 開發者 B：使用者故事 2（成員列表）
   - 開發者 C：使用者故事 3（音樂作品）
3. 故事獨立完成並整合
4. P1 完成後，依相同模式處理 P2、P3

---

## 備註

- [P] 任務 = 不同檔案，無相依性，可並行
- [Story] 標籤將任務對應到特定使用者故事，方便追溯
- 每個使用者故事應可獨立完成並測試
- 在任何檢查點停止以獨立驗證故事
- 每完成一個任務或邏輯群組後提交
- 避免：模糊任務、相同檔案衝突、破壞獨立性的跨故事相依性

---

## 任務統計

- **總任務數**: 131 個任務
- **階段 1（初始化）**: 8 個任務
- **階段 2（基礎建設）**: 19 個任務
- **階段 3（US1 推坑指南）**: 10 個任務
- **階段 4（US2 成員列表）**: 10 個任務
- **階段 5（US3 音樂作品）**: 15 個任務
- **階段 6（US4 綜藝）**: 7 個任務
- **階段 7（US5 語言切換）**: 4 個任務
- **階段 8（US8 外部連結）**: 6 個任務
- **階段 9（US6 小寵物）**: 11 個任務
- **階段 10（US7 音樂播放器）**: 8 個任務
- **階段 11（US9 關於我）**: 2 個任務
- **階段 12（團體介紹）**: 5 個任務
- **階段 13（優化與調整）**: 26 個任務

### 並行執行機會

- **階段 1**: 7 個任務可並行（標記 [P]）
- **階段 2**: 10 個任務可並行
- **階段 3**: 3 個元件可並行建立
- **階段 4**: 3 個任務可並行
- **階段 5**: 3 個任務可並行
- **階段 6-12**: 各階段內多個任務可並行
- **使用者故事並行**: 階段 2 完成後，所有 9 個使用者故事可同時開發（若有團隊）

### MVP 範圍建議

**最小 MVP（約 52 個任務）**：
- 階段 1：專案初始化（8 個任務）
- 階段 2：基礎建設（19 個任務）
- 階段 3：使用者故事 1 - 推坑指南（10 個任務）
- 階段 4：使用者故事 2 - 成員列表（10 個任務）
- 階段 5：使用者故事 3 - 音樂作品與歌詞（15 個任務）

**擴展 MVP（+ 17 個任務）**：
- 新增階段 6：使用者故事 4 - 綜藝（7 個任務）
- 新增階段 7：使用者故事 5 - 語言切換完善（4 個任務）
- 新增階段 8：使用者故事 8 - 外部連結（6 個任務）

**完整版本（131 個任務）**：
- 包含所有使用者故事（P1、P2、P3）
- 包含優化與跨功能調整（階段 13）
