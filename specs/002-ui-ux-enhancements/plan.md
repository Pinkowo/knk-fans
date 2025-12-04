# 實作計畫：UI/UX 增強功能與聯絡表單

**分支**: `002-ui-ux-enhancements` | **日期**: 2025-12-04 | **規格**: [spec.md](./spec.md)
**輸入**: 來自 `/specs/002-ui-ux-enhancements/spec.md` 的功能規格

**更新紀錄**:
- 2025-12-04：移除使用者故事 4（關於 KNK 頁面已完成）
- 2025-12-04：聯絡表單移除標題欄位，信件主旨改為 `knk-fans-site:{類型}`

## 摘要

本功能包含多項 UI/UX 改善，提升 KNK 粉絲網站的使用者體驗：

1. **語言切換載入回饋** - 在語言切換時顯示全頁面載入覆蓋層，避免使用者困惑
2. **推坑指南頁面重構** - 以 "Why KNK" 開頭，展示推薦舞台、歌曲、綜藝的卡片式內容，支援內嵌 YouTube 播放
3. **綜藝推薦簡化** - 移除系列分類，改為直接卡片式呈現並開啟新分頁
4. **Footer 資訊完善** - 顯示創作者、版權聲明、AI 生成聲明與聯絡連結
5. **聯絡表單** - 提供錯誤回報、網站委託、其他類型的表單，支援附件上傳並寄送至指定信箱（**無標題欄位，主旨為類型**）
6. **Google Analytics 整合** - 追蹤訪客數量、地理位置、頁面瀏覽與互動行為

**技術方法**：採用 Next.js 16 App Router、React 19、next-intl 國際化、Tailwind CSS 樣式、Framer Motion 動畫、Vercel Analytics 分析，並透過 API Routes 實作表單提交與 email 發送功能。

## 技術環境

**語言/版本**: TypeScript 5, React 19.2.0, Next.js 16.0.7
**主要相依套件**: next-intl 4.5.3, react-youtube 10.1.0, framer-motion 12.23.24, @vercel/analytics 1.5.0, @notionhq/client 5.4.0
**儲存**: Notion API（現有內容）、Email 傳送（表單提交）
**測試**: TypeScript 型別檢查 (`tsc --noEmit`)、ESLint 9.39.0
**目標平台**: Web（支援多語系：zh, ko, ja, en）
**專案類型**: Web 應用程式（Next.js App Router 架構）
**效能目標**:
- 語言切換載入回饋在 100ms 內顯示
- 頁面載入 < 2s (3G 網路)
- TTI < 3s
- Bundle 大小 < 500KB gzipped

**限制**:
- 聯絡表單附件大小 < 5MB
- Email 服務整合需符合 SMTP 標準
- YouTube 內嵌需在目標地區可存取
- 分析追蹤需符合 GDPR/CCPA 隱私規範

**規模/範圍**:
- **6 個使用者故事**（已移除關於 KNK 頁面）
- 影響頁面：Guide、Variety、Footer（全站）、Contact（新增）
- 支援 4 種語言
- 預估新增/修改 15-20 個元件

## 憲章檢查

*閘門：必須在 Phase 0 研究前通過。Phase 1 設計後重新檢查。*

### I. 程式碼品質

✅ **可讀性優先** - 使用 TypeScript 強型別、明確的元件命名、清晰的檔案結構
✅ **SOLID 原則** - 元件單一職責、介面隔離（Props 介面定義）
✅ **DRY 原則** - 共用元件（LoadingOverlay、Card、ContactForm）避免重複
✅ **型別安全** - 所有公開介面使用 TypeScript 型別標註
✅ **錯誤處理** - 表單驗證、API 錯誤、YouTube 載入失敗等皆需明確處理

### II. 測試紀律

⚠️ **TDD 要求** - 本專案目前無測試框架
**理由**：現階段為快速原型開發，專注於功能實作與使用者驗證
**補償措施**：
- 使用 TypeScript 型別系統提供編譯時期檢查
- 手動測試所有使用者故事的驗收情境
- 使用 ESLint 靜態分析確保程式碼品質
- 未來迭代時將引入 Jest + React Testing Library

### III. 使用者體驗一致性

✅ **回饋機制** - 語言切換載入覆蓋層、表單提交確認訊息
✅ **錯誤訊息** - 表單驗證錯誤、API 失敗訊息皆為可操作的說明
✅ **載入狀態** - 所有超過 200ms 的操作顯示載入指示器
✅ **無障礙** - ARIA labels、鍵盤導航、螢幕閱讀器支援
✅ **響應式設計** - 所有元件支援行動裝置與桌面裝置
✅ **一致性** - 遵循現有設計系統的色彩、字型、間距規範
✅ **漸進式揭露** - 卡片展開顯示影片、表單分步驟填寫

### IV. 效能標準

✅ **回應時間** - 語言切換載入回饋 < 100ms
✅ **頁面載入** - < 2s (3G)
✅ **TTI** - < 3s
⚠️ **Bundle 大小** - 目標 < 500KB gzipped，需監控 react-youtube 與 framer-motion 影響
✅ **記憶體** - < 200MB (客戶端)
✅ **延遲載入** - YouTube 影片使用 lazy loading
✅ **效能監控** - 使用 Vercel Analytics RUM

### V. 文件語言

✅ **規格文件** - spec.md 使用繁體中文
✅ **計畫文件** - plan.md、research.md、data-model.md 等使用繁體中文
✅ **任務文件** - tasks.md 將使用繁體中文
✅ **使用者文件** - quickstart.md 使用繁體中文
✅ **程式碼註解** - 公開 API 的 JSDoc 使用繁體中文
✅ **Commit 訊息** - 使用繁體中文

### 技術標準

✅ **Linting** - ESLint 9.39.0 配置，零警告要求
✅ **格式化** - Prettier 3.6.2 自動格式化
⚠️ **Pre-commit Hooks** - 目前未配置，使用 IDE 整合與 PR 前手動檢查
✅ **行長度** ≤ 100 字元
✅ **註解** - 解釋「為什麼」而非「什麼」

### 開發流程

✅ **分支命名** - `002-ui-ux-enhancements`
⚠️ **Conventional Commit** - 手動遵循格式，無 commitlint 強制檢查
✅ **原子提交** - 是
✅ **禁止直接提交至 main** - 需透過 PR
⚠️ **PR 審查** - 單人開發，採用自我審查 checklist

### 閘門評估

**🟡 通過但有條件違規**

**違規項目**：
1. **測試紀律** - 無 TDD、無自動化測試
2. **Pre-commit Hooks** - 未配置 Husky
3. **Conventional Commit** - 無 commitlint 強制檢查
4. **PR 審查** - 單人開發，無外部審查者

**理由**：
- 快速原型開發階段，優先驗證功能與使用者需求
- 使用 TypeScript 型別系統與 ESLint 作為品質保證
- 單人開發專案，工具配置成本高於效益
- 未來迭代將補充測試框架與團隊協作工具

**Phase 1 設計後重新評估結果**：
✅ **資料模型已定義** - ContactFormSubmission（已更新：移除 title）, LanguageLoadingState, GuideContentItem, AnalyticsEvent
✅ **API 契約已建立** - OpenAPI 3.1.0 規格（api-contact.yaml，已更新）
✅ **型別安全保證** - 使用 Zod schema 自動產生 TypeScript 型別
✅ **無新增複雜度** - 無需資料庫、無新架構模式引入
✅ **效能風險已識別** - Bundle 大小需監控（react-youtube, framer-motion）

**最終決策**：通過，維持條件違規但風險可控

## 專案結構

### 文件（本功能）

```text
specs/002-ui-ux-enhancements/
├── plan.md              # 本檔案（/speckit.plan 指令輸出）
├── research.md          # Phase 0 輸出（/speckit.plan 指令）
├── data-model.md        # Phase 1 輸出（/speckit.plan 指令）- 已更新
├── quickstart.md        # Phase 1 輸出（/speckit.plan 指令）- 已更新
├── contracts/           # Phase 1 輸出（/speckit.plan 指令）- 已更新
│   ├── api-contact.yaml # 聯絡表單 API（已更新：移除 title）
│   └── README.md
└── tasks.md             # Phase 2 輸出（/speckit.tasks 指令 - 不由 /speckit.plan 建立）
```

### 原始碼（儲存庫根目錄）

```text
# Next.js App Router 架構
src/
├── app/
│   ├── [locale]/                    # 多語系路由
│   │   ├── guide/                   # 推坑指南頁面（需修改）
│   │   ├── variety/                 # 綜藝推薦頁面（需修改）
│   │   ├── contact/                 # 聯絡表單頁面（新增）- 無標題欄位
│   │   ├── layout.tsx               # 全站佈局（Footer 修改）
│   │   └── page.tsx
│   └── api/
│       └── contact/                 # 表單提交 API（新增）- 主旨使用類型
│           └── route.ts
├── components/
│   ├── common/
│   │   ├── LoadingOverlay.tsx       # 語言切換載入覆蓋層（新增）
│   │   ├── Footer.tsx               # Footer 元件（修改）
│   │   └── LanguageSwitch.tsx       # 語言切換器（修改）
│   ├── guide/
│   │   ├── GuideCard.tsx            # 推坑指南卡片（新增/修改）
│   │   └── YouTubeEmbed.tsx         # YouTube 內嵌播放器（新增）
│   ├── variety/
│   │   └── VarietyCard.tsx          # 綜藝卡片（修改）
│   └── contact/
│       └── ContactForm.tsx          # 聯絡表單（新增）- 無標題欄位
├── lib/
│   ├── email.ts                     # Email 發送邏輯（新增）
│   └── analytics.ts                 # Analytics 配置（修改）
├── messages/                        # 多語系翻譯檔
│   ├── zh.json                      # 繁體中文（修改）
│   ├── en.json                      # 英文（修改）
│   ├── ko.json                      # 韓文（修改）
│   └── ja.json                      # 日文（修改）
├── types/
│   └── contact.ts                   # 聯絡表單型別定義（新增）- 無 title
└── i18n.ts                          # next-intl 配置

public/
└── images/                          # 靜態圖片資源
    └── guide/                       # 推坑指南縮圖（可能新增）

tests/                               # 測試（未來新增）
├── integration/
└── unit/
```

**結構決策**：採用 Next.js App Router 的檔案系統路由，依據功能模組組織元件。使用 `[locale]` 動態路由實現多語系支援。API Routes 位於 `app/api` 處理伺服器端邏輯（表單提交、email 發送）。元件按功能領域分組（guide、variety、contact、common），促進程式碼重用與維護。

**與原計畫差異**：
- 移除 `about/GroupInfo.tsx`（使用者故事 4 已完成）
- ContactForm 簡化為無標題欄位設計
- Email 主旨格式改用類型欄位

## 複雜度追蹤

| 違規項目 | 需要原因 | 拒絕的簡單替代方案及理由 |
|---------|---------|------------------------|
| 無自動化測試 | 快速原型開發，優先驗證功能與使用者需求 | 完整 TDD：初期開發成本過高，需先驗證產品市場適配度 |
| Bundle 大小風險 | react-youtube (10.1.0) 與 framer-motion (12.23.24) 為功能必需 | 純 CSS 動畫：無法達成複雜互動需求；手寫 YouTube iframe：重新發明輪子且缺乏跨瀏覽器相容性保證 |
