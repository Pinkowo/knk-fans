---
description: "Actionable tasks for UI/UX 增強功能與聯絡表單"
---

# Tasks: UI/UX 增強功能與聯絡表單

**Input**: 設計文件位於 `/specs/002-ui-ux-enhancements/`（plan.md、spec.md、data-model.md、research.md、quickstart.md、contracts/）
**Prerequisites**: Node.js 20+、Next.js 16 App Router、pnpm 9、Resend API Key、GA4 Measurement ID
**Tests**: 無自動化測試要求；依計畫使用 TypeScript 型別檢查、ESLint 與手動驗收
**Organization**: 依優先度拆為 Setup → Foundational → 各使用者故事 → Polish，確保每個故事皆可獨立交付

## Format: `[ID] [P?] [Story] 描述（含檔案路徑）`

- `[P]` 僅標記可與其他任務平行（不同檔案、無未完成依賴）的工作
- `[Story]` 僅在使用者故事 Phase 中出現，如 `[US1]`
- 每項任務皆需指出精準檔案路徑，確保可立即執行

## Path Conventions

- App Router 頁面：`src/app/[locale]/...`
- 共用元件：`src/components/common/`、分頁元件置於對應資料夾
- 資料/型別：`src/lib/**`、`src/types/**`
- 翻譯：`src/messages/{locale}.json`
- API Routes：`src/app/api/**`
- 靜態資源：`public/images/**`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 安裝必要依賴與環境設定，確保後續故事能編譯與部署

- [x] T001 在 `package.json` 與 `pnpm-lock.yaml` 安裝 `resend`、`react-hook-form`、`zod`、`@hookform/resolvers`、`@next/third-parties` 依賴
- [x] T002 於 `.env.local.example` 新增 `RESEND_API_KEY`、`CONTACT_EMAIL`、`NEXT_PUBLIC_GA_ID` 並說明主旨格式 `knk-fans-site:{類型}`
- [x] T003 更新 `README.md` Development/Deployment 區段，加入 Resend/GA 設定與 `pnpm type-check && pnpm lint` 驗證流程

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 建立共用型別、環境與事件介面，所有使用者故事皆倚賴此層

- [x] T004 在 `src/types/ui-ux.ts` 定義 `LanguageLoadingState`、`GuideContentItem`、`VarietyCardItem`、`ContactFormSubmission`、`AnalyticsEvent` 型別與共用 enum
- [x] T005 在 `src/lib/env.ts` 實作 `getEnv` helper 讀取 `RESEND_API_KEY`/`CONTACT_EMAIL`/`NEXT_PUBLIC_GA_ID`，並更新 `next.config.ts` 暴露 GA ID 給客戶端
- [x] T006 建立 `src/lib/analytics.ts`，提供 `trackEvent` stub 與事件常數（language_switch、guide_card_expand、variety_card_click、form_submit、page_view）供後續掛鉤

**⚠️ 完成 Phase 2 前不得進入任何使用者故事**

---

## Phase 3: User Story 1－語言切換需有明確回饋 (Priority: P1) 🎯 MVP

**Goal**: 切換語言時立即顯示全頁載入遮罩並封鎖重複請求
**獨立測試**: 在任兩個語言間切換，確認遮罩於 <100ms 顯示、完成後即消失且無重複跳轉

- [x] T007 [P] [US1] 在 `src/components/common/LoadingOverlay.tsx` 建立 Tailwind + Framer Motion 全畫面遮罩，支援 aria-live 與焦點鎖定
- [x] T008 [P] [US1] 在 `src/lib/context/LoadingContext.tsx` 實作 `LanguageLoadingState` Provider 與 Hook，追蹤 pending 計數
- [x] T009 [US1] 於 `src/app/[locale]/layout.tsx` 掛載 `LoadingProvider`，在主容器渲染 `LoadingOverlay` 並阻擋滾動/點擊
- [x] T010 [US1] 在 `src/components/common/LanguageSelector.tsx` 改用 `startTransition` + context setter，避免重複 replace/refresh 請求
- [x] T011 [US1] 更新 `src/messages/zh.json`、`src/messages/en.json`、`src/messages/ko.json`、`src/messages/ja.json` 新增 loadingOverlay 標題、描述與 ARIA 文案

---

## Phase 4: User Story 2－透過推坑指南快速認識 KNK (Priority: P1)

**Goal**: 以 Why → 推薦舞台 → 推薦歌曲 → 推薦綜藝順序呈現卡片，卡片含縮圖並可內嵌播放
**獨立測試**: 造訪 `/[locale]`，依序檢視各區塊並確認點擊卡片後於卡片內播放 YouTube

- [x] T012 [P] [US2] 在 `src/lib/notion/guide.ts` 依 data-model 產生 `GuideContentItem[]`，含排序常數（Why/Stage/Song/Variety）
- [x] T013 [P] [US2] 在 `src/components/guide/YouTubeEmbed.tsx` 建立 lazy `react-youtube` 內嵌元件並處理載入/錯誤狀態
- [x] T014 [US2] 在 `src/components/guide/GuideCard.tsx` 使用 Framer Motion 建立卡片、展示縮圖並於展開後渲染 `YouTubeEmbed`
- [x] T015 [US2] 重構 `src/app/[locale]/page.tsx`，依 Why→舞台→歌曲→綜藝順序渲染新卡片區塊與標題
- [x] T016 [US2] 更新 `src/messages/zh.json`、`src/messages/en.json`、`src/messages/ko.json`、`src/messages/ja.json` 新增 Why KNK 摘要、各區塊說明與卡片 CTA 文案
- [x] T017 [US2] 於 `public/images/guide/` 新增縮圖資產並在 `next.config.ts` 扩充 remotePatterns 允許 `i.ytimg.com`/Notion 圖源

---

## Phase 5: User Story 3－快速瀏覽綜藝內容 (Priority: P2)

**Goal**: 綜藝頁改為單層卡片清單，顯示縮圖與標題，點擊於新分頁開啟
**獨立測試**: 造訪 `/[locale]/variety`，確認無系列分類、所有卡片點擊後在新分頁開啟正確連結

- [x] T018 [P] [US3] 在 `src/lib/notion/variety.ts` 將資料轉換為 `VarietyCardItem[]`（含縮圖、標題、外部 URL）並移除系列分組
- [x] T019 [P] [US3] 在 `src/components/variety/VarietyCard.tsx` 重構卡片版型、顯示縮圖/標題且設定 `target="_blank" rel="noreferrer"`
- [x] T020 [US3] 重寫 `src/app/[locale]/variety/page.tsx`，以單一 responsive grid 呈現卡片並更新導言文字
- [x] T021 [US3] 更新 `src/messages/zh.json`、`src/messages/en.json`、`src/messages/ko.json`、`src/messages/ja.json` 新增綜藝 CTA 與「新分頁開啟」ARIA 描述

---

## Phase 6: User Story 5－回報問題或提出需求 (Priority: P2)

**Goal**: 新增聯絡頁與表單（類型下拉、內容、附件），送出後寄信並顯示成功提示
**獨立測試**: 於 `/[locale]/contact` 選各種類型並附檔送出，確認 email 主旨 `knk-fans-site:{類型}`、成功/失敗訊息與 5MB 驗證

- [x] T022 [US5] 在 `src/types/contact.ts` 建立 `contactFormSchema`（無 title 欄位）與 `ContactSubmissionRequest/Response` 型別，並於 `src/types/ui-ux.ts` 匯出
- [x] T023 [P] [US5] 在 `src/lib/email.ts` 實作 Resend 客戶端，使用 `CONTACT_EMAIL` 及附件 base64 編碼產出 `knk-fans-site:{類型}` 主旨
- [x] T024 [P] [US5] 依 `specs/002-ui-ux-enhancements/contracts/api-contact.yaml` 於 `src/app/api/contact/route.ts` 解析 `formData()`、執行 Zod 驗證與 5MB/MIME 檢查並呼叫 email helper
- [x] T025 [US5] 在 `src/components/contact/ContactForm.tsx` 建立 React Hook Form UI（下拉、文字區、附件輸入、狀態指示）
- [x] T026 [US5] 於 `src/components/contact/ContactForm.tsx` 串接 `/api/contact` POST、顯示成功/錯誤回饋、阻擋重複提交並重設表單
- [x] T027 [US5] 在 `src/app/[locale]/contact/page.tsx` 建立頁面結構與 hero 文案，載入 `ContactForm` 並設定 `generateMetadata`
- [x] T028 [US5] 更新 `src/messages/zh.json`、`src/messages/en.json`、`src/messages/ko.json`、`src/messages/ja.json` 新增類型選項、驗證訊息、成功/失敗提示與附件限制文字

---

## Phase 7: User Story 4－理解站點歸屬與內容權利 (Priority: P3)

**Goal**: Footer 顯示製作者、版權、AI 聲明、聯絡連結並支援四語
**獨立測試**: 捲動至任一頁底部，確認上述資訊完整且聯絡連結導向 `/contact`

- [x] T029 [US4] 在 `src/components/common/Footer.tsx` 加入 Pink 製作者、220 Entertainment 版權、AI 聲明與 `/contact` CTA（含 aria-label）
- [x] T030 [US4] 更新 `src/messages/zh.json`、`src/messages/en.json`、`src/messages/ko.json`、`src/messages/ja.json` 新增 Footer 免責文字與多語聯絡 CTA
- [x] T031 [US4] 調整 `src/app/[locale]/layout.tsx` 讓 Footer 接收多段文字、導向 `/{locale}/contact` 並於 skip-link 後呈現
- [x] T032 [P] [US4] 在 `src/styles/globals.css` 與 `tailwind.config.js` 新增 Footer 色彩/排版變數，確保對比度與行動裝置間距

---

## Phase 8: User Story 6－站長掌握分析資料 (Priority: P3)

**Goal**: 於所有頁面載入 GA4 與 Vercel Analytics，並追蹤 page view + 互動事件
**獨立測試**: 於 GA4 及 Vercel Analytics 後台檢視即時流量，確認語言切換、卡片展開、聯絡表單送出事件被記錄

- [x] T033 [P] [US6] 在 `src/app/layout.tsx` 透過 `@next/third-parties/google` 注入 GA4 script，使用 `NEXT_PUBLIC_GA_ID` 並避免重複載入
- [x] T034 [US6] 擴充 `src/lib/analytics.ts` 實作 `trackEvent`，將事件傳送至 `window.gtag` 與 `@vercel/analytics`（`va`），並在 ad blocker 情況下安全 no-op
- [x] T035 [US6] 在 `src/components/analytics/WebVitalsReporter.tsx` 導入 `trackEvent`，上報 CLS/FID/LCP 等 Web Vitals 為 GA 自訂事件
- [x] T036 [US6] 於 `src/components/common/LanguageSelector.tsx`、`src/components/guide/GuideCard.tsx`、`src/components/variety/VarietyCard.tsx`、`src/components/contact/ContactForm.tsx` 呼叫 `trackEvent` 紀錄 language_switch / guide_card_expand / variety_card_click / form_submit
- [x] T037 [P] [US6] 更新 `specs/002-ui-ux-enhancements/quickstart.md`，新增 GA4 即時流量驗證與 Vercel Analytics 觀察步驟

---

## Phase 9: Polish & Cross-Cutting

**Purpose**: 文件、樣式與驗收檢查，確保所有故事一致性與線上品質

- [x] T038 在 `src/styles/globals.css` 精簡 overlay/卡片/表單樣式並更新 `tailwind.config.js` token，以維持 <100ms 載入回饋與 <500KB bundle
- [x] T039 更新 `specs/002-ui-ux-enhancements/checklists/requirements.md`，加入語言切換、指南、綜藝、聯絡表單、Footer、Analytics 驗收條目
- [x] T040 在 `docs/acceptance-tests.md` 撰寫語言切換、指南卡片、綜藝卡片、聯絡表單、Footer、GA 手動測試流程

---

## Dependencies & Execution Order

- Phase 1 → Phase 2：完成依賴與環境後建立共用型別/Helper，否則後續無法編譯
- User Stories 依優先度：US1 (MVP) → US2 → US3 → US5 → US4 → US6；各故事皆仰賴 Phase 2 型別/事件介面
- Page/Component 任務依序：資料來源 (Notion/data) → 元件 → 頁面組裝 → 翻譯/資產 → 分析/整合
- Phase 9 僅在所有預計交付的故事完成後執行

## Parallel Execution Examples

- **US1**: 完成 T008 後，可並行處理 `LoadingOverlay` (T007) 與 `LanguageSelector` 行為 (T010)
- **US2**: `Guide` 資料重構 (T012) 與 `YouTubeEmbed` (T013) 無互相依賴，可同時開發
- **US3**: `Variety` 資料轉換 (T018) 與卡片元件重構 (T019) 可在不同模組同步進行
- **US4**: Footer 样版 (T029) 與樣式 token 調整 (T032) 互不衝突，可同時作業
- **US5**: Resend helper (T023) 與 API Route (T024) 只需 schema (T022) 完成即可並行
- **US6**: GA script 注入 (T033) 與 Quickstart 文件更新 (T037) 可交由不同成員同時處理

## Implementation Strategy

### MVP First (User Story 1)

1. 完成 Phase 1-2
2. 實作 US1（語言切換載入），驗證遮罩體驗與多語 copy
3. 於 main 分支部署/驗收，作為 MVP

### Incremental Delivery

1. US2：完成推坑指南重構 → 驗收 → 可部署
2. US3 + US5：在 US2 穩定後實作綜藝頁與聯絡表單，兩者各自驗收
3. US4 + US6：最後補上 Footer 法務資訊與分析追蹤，驗證 GA/VA 數據
4. 每次遞增皆執行 Phase 9 的文件/樣式檢查

### Parallel Team Strategy

1. 共同完成 Setup + Foundational
2. 指派：A 處理 US1→US2、B 在 US3→US5、C 負責 US4→US6 與 Polish
3. 各人依本表列之 [P] 任務分工，避免同檔案衝突

---

> 所有任務皆已確認符合 `- [x] T### [P?] [Story?] 描述` 格式，且描述含明確檔案路徑。
