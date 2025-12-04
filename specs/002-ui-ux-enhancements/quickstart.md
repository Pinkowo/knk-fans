# 快速開始：UI/UX 增強功能與聯絡表單

**功能**: 002-ui-ux-enhancements
**目標讀者**: 開發者
**預估閱讀時間**: 10 分鐘

本指南協助開發者快速理解本功能的架構、設定環境與開始開發。

## 功能概覽

本功能包含 7 項 UI/UX 改善：

| 編號 | 功能 | 優先級 | 影響範圍 |
|-----|------|--------|---------|
| 1 | 語言切換載入回饋 | P1 | 全站 |
| 2 | 推坑指南頁面重構 | P1 | `/guide` 頁面 |
| 3 | 綜藝推薦簡化 | P2 | `/variety` 頁面 |
| 4 | 關於 KNK 補充 | P2 | `/about` 頁面 |
| 5 | Footer 資訊完善 | P3 | 全站 |
| 6 | 聯絡表單 | P2 | `/contact` 頁面（新增）|
| 7 | Google Analytics 整合 | P3 | 全站 |

## 先決條件

### 必要環境

- **Node.js**: ≥ 20.x
- **pnpm**: ≥ 9.x（或 npm ≥ 10.x）
- **Git**: 已安裝並配置

### 必要服務帳號

1. **Resend 帳號** - 用於表單 email 發送
   - 註冊：https://resend.com/signup
   - 取得 API Key：https://resend.com/api-keys

2. **Google Analytics 4 帳號** - 用於訪客分析
   - 建立 GA4 屬性：https://analytics.google.com/
   - 取得 Measurement ID（格式：`G-XXXXXXXXXX`）

### 知識需求

- **Next.js 14+ App Router** - 檔案系統路由、Server/Client Components
- **React 19** - Hooks、Context API、Suspense
- **TypeScript** - 基本型別定義、泛型
- **Tailwind CSS** - Utility classes、響應式設計
- **next-intl** - 多語系路由與翻譯

## 環境設定

### 1. 安裝新依賴套件

```bash
pnpm install resend react-hook-form zod @hookform/resolvers @next/third-parties
```

**套件說明**:
- `resend`: Email API 客戶端
- `react-hook-form`: 高效能表單管理
- `zod`: Schema 驗證與型別生成
- `@hookform/resolvers`: React Hook Form + Zod 整合
- `@next/third-parties`: Google Analytics 官方整合

### 2. 配置環境變數

複製 `.env.local.example` 為 `.env.local`:

```bash
cp .env.local.example .env.local
```

編輯 `.env.local`，新增以下變數:

```bash
# Resend Email Service
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx
CONTACT_EMAIL=pink.exp.studio@gmail.com

# Google Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

**取得 API Keys**:
1. **Resend API Key**:
   - 登入 https://resend.com/
   - 前往 API Keys 頁面
   - 建立新 API Key（選擇 "Full Access"）
   - 複製金鑰（僅顯示一次）

2. **Google Analytics Measurement ID**:
   - 登入 https://analytics.google.com/
   - 選擇屬性 → 資料串流 → 選擇網站串流
   - 複製 "評估 ID"（G- 開頭）

### 3. 驗證設定

```bash
# 型別檢查
pnpm type-check

# Lint 檢查
pnpm lint

# 開發伺服器
pnpm dev
```

訪問 http://localhost:3000/zh - 應正常顯示網站。

## 專案結構導覽

### 新增檔案（本功能需建立）

```
src/
├── app/
│   ├── [locale]/
│   │   └── contact/                 # 聯絡頁面（新增）
│   │       ├── page.tsx
│   │       └── layout.tsx
│   └── api/
│       └── contact/                 # 表單 API（新增）
│           └── route.ts
├── components/
│   ├── common/
│   │   ├── LoadingOverlay.tsx       # 全頁載入覆蓋層（新增）
│   │   └── Footer.tsx               # Footer（修改）
│   ├── guide/
│   │   ├── GuideCard.tsx            # 推坑卡片（新增/修改）
│   │   └── YouTubeEmbed.tsx         # YouTube 播放器（新增）
│   └── contact/
│       └── ContactForm.tsx          # 聯絡表單（新增）
├── contexts/
│   └── LoadingContext.tsx           # 載入狀態管理（新增）
├── lib/
│   ├── email.ts                     # Email 發送邏輯（新增）
│   ├── analytics.ts                 # Analytics 配置（修改）
│   └── guide-content.ts             # 推坑內容資料（新增）
├── schemas/
│   └── contact.ts                   # Zod 驗證 schema（新增）
└── types/
    ├── contact.ts                   # 聯絡表單型別（新增）
    ├── guide.ts                     # 推坑指南型別（新增）
    └── analytics.ts                 # Analytics 型別（新增）
```

### 修改檔案

```
src/
├── app/[locale]/
│   ├── layout.tsx                   # 新增 LoadingProvider、GA
│   ├── guide/page.tsx               # 重構內容結構
│   ├── variety/page.tsx             # 移除系列分類
│   └── about/page.tsx               # 新增粉絲名稱
├── messages/
│   ├── zh.json                      # 新增翻譯 key
│   ├── en.json
│   ├── ko.json
│   └── ja.json
└── components/common/
    └── LanguageSwitch.tsx           # 整合 LoadingContext
```

## 核心概念

### 1. 語言切換載入狀態

**問題**: 使用者切換語言時看不到載入回饋，可能重複點擊。

**解決方案**: 使用 React Context + `useTransition` 管理全域載入狀態。

```tsx
// contexts/LoadingContext.tsx
'use client'
import { createContext, useContext, useState } from 'react'

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setLoading] = useState(false)

  return (
    <LoadingContext.Provider value={{ isLoading, setLoading }}>
      {children}
      {isLoading && <LoadingOverlay />}
    </LoadingContext.Provider>
  )
}

// 使用範例
import { useLoading } from '@/contexts/LoadingContext'

function LanguageSwitch() {
  const { setLoading } = useLoading()

  const handleChange = (locale: string) => {
    setLoading(true)
    // 路由切換...
  }
}

## GA4 / Vercel Analytics 驗證

1. **啟動開發伺服器**：執行 `pnpm dev`，於瀏覽器開啟 `http://localhost:3000/zh`。
2. **GA4 DebugView**：
   - 進入 Google Analytics → Admin → DebugView。
   - 在站上操作語言切換、展開推坑卡片、點擊綜藝卡片、送出聯絡表單。
   - 確認事件 `language_switch`、`guide_card_expand`、`variety_card_click`、`form_submit`、`web_vitals` 都會出現在 DebugView。
3. **Vercel Analytics**：
   - 在 Vercel 專案的 Analytics 介面中切換到 “Realtime” 分頁。
   - 重新整理頁面、展開推坑卡片、提交表單，確認事件在 Realtime stream 中出現。
   - 若使用 AdBlock，需在瀏覽器停用後重新整理以驗證追蹤是否被阻擋。
```

### 2. 推坑指南卡片展開

**問題**: 需要優雅的動畫展開卡片，並內嵌 YouTube 影片。

**解決方案**: 使用 Framer Motion `AnimatePresence` + `react-youtube`。

```tsx
// components/guide/GuideCard.tsx
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import YouTube from 'react-youtube'

export function GuideCard({ title, videoId, thumbnail }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <motion.div layout>
      <button onClick={() => setIsExpanded(!isExpanded)}>
        <img src={thumbnail} alt={title} />
        <h3>{title}</h3>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <YouTube videoId={videoId} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
```

### 3. 聯絡表單驗證與提交

**問題**: 需要型別安全的表單驗證與檔案上傳處理。

**解決方案**: React Hook Form + Zod schema。

**重要更新（2025-12-04）**：聯絡表單已移除標題欄位，Email 主旨改用 inquiryType（詢問類型）。

```tsx
// schemas/contact.ts
import { z } from 'zod'

export const contactFormSchema = z.object({
  inquiryType: z.enum(['error-report', 'service-request', 'other']),
  // 注意：已移除 title 欄位
  message: z.string().min(10).max(5000),
  attachment: z
    .instanceof(File)
    .optional()
    .refine((file) => !file || file.size <= 5 * 1024 * 1024),
})

// components/contact/ContactForm.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

function ContactForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(contactFormSchema),
  })

  const onSubmit = async (data) => {
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value)
    })

    const res = await fetch('/api/contact', {
      method: 'POST',
      body: formData,
    })

    const result = await res.json()
    // 處理回應...
  }
}
```

### 4. Email 發送（API Route）

```typescript
// app/api/contact/route.ts
import { Resend } from 'resend'
import { contactFormSchema } from '@/schemas/contact'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  const formData = await request.formData()

  // 驗證（已更新：移除 title）
  const result = contactFormSchema.safeParse({
    inquiryType: formData.get('inquiryType'),
    message: formData.get('message'),
    attachment: formData.get('attachment'),
  })

  if (!result.success) {
    return Response.json({ success: false, error: result.error }, { status: 400 })
  }

  // 發送 email（主旨改用 inquiryType）
  const inquiryTypeLabels = {
    'error-report': '錯誤回報',
    'service-request': '網站製作委託',
    'other': '其他',
  }

  const { data, error } = await resend.emails.send({
    from: 'noreply@knk-fans.com',
    to: process.env.CONTACT_EMAIL!,
    subject: `knk-fans-site:${inquiryTypeLabels[result.data.inquiryType]}`,
    text: result.data.message,
    attachments: result.data.attachment ? [{
      filename: result.data.attachment.name,
      content: await result.data.attachment.arrayBuffer(),
    }] : [],
  })

  if (error) {
    return Response.json({ success: false, error }, { status: 500 })
  }

  return Response.json({ success: true, emailId: data?.id })
}
```

### 5. Google Analytics 整合

```tsx
// app/[locale]/layout.tsx
import { GoogleAnalytics } from '@next/third-parties/google'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <LoadingProvider>
          {children}
        </LoadingProvider>
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID!} />
      </body>
    </html>
  )
}

// lib/analytics.ts
export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, properties)
  }
}

// 使用範例
trackEvent('guide_card_expand', { category: 'stage', videoId: 'abc123' })
```

## 開發流程

### 建議實作順序

1. **Phase 1: 基礎設施**（1-2 天）
   - 安裝依賴套件
   - 配置環境變數
   - 建立 LoadingContext
   - 整合 Google Analytics

2. **Phase 2: 語言切換載入**（1 天）
   - 實作 LoadingOverlay 元件
   - 修改 LanguageSwitch 整合 Context
   - 測試四種語言切換

3. **Phase 3: 聯絡表單**（2-3 天）
   - 建立 Zod schema
   - 實作 ContactForm 元件
   - 實作 API Route
   - 整合 Resend email 發送
   - 測試表單提交與 email 接收

4. **Phase 4: 推坑指南重構**（2-3 天）
   - 定義 guide-content.ts 資料
   - 實作 GuideCard 元件
   - 整合 YouTubeEmbed
   - 實作卡片展開動畫
   - 重構 Guide 頁面

5. **Phase 5: 其他頁面修改**（1-2 天）
   - 修改 Variety 頁面（移除系列分類）
   - 修改 About 頁面（新增粉絲名稱）
   - 修改 Footer（新增資訊與連結）

6. **Phase 6: 多語系翻譯**（1 天）
   - 新增所有新增功能的翻譯 key
   - 補齊 zh, en, ko, ja 四種語言

7. **Phase 7: 測試與修正**（1-2 天）
   - 手動測試所有使用者故事
   - 修正 bug
   - 效能優化（Bundle analyzer）

### 開發指令

```bash
# 開發模式（Hot reload）
pnpm dev

# 型別檢查
pnpm type-check

# Lint 檢查
pnpm lint

# 建置正式環境
pnpm build

# 啟動正式環境
pnpm start

# Bundle 分析
ANALYZE=true pnpm build
```

## 測試檢查清單

### 語言切換載入回饋
- [ ] 點擊語言選擇後立即顯示載入覆蓋層
- [ ] 覆蓋層阻止使用者互動
- [ ] 語言切換完成後覆蓋層消失
- [ ] 快速切換多次語言不會卡住
- [ ] 四種語言皆正常切換

### 推坑指南
- [ ] 內容依序顯示：Why KNK, Stage, Song, Variety
- [ ] 卡片顯示縮圖與標題
- [ ] 點擊卡片後展開動畫流暢
- [ ] YouTube 影片正確載入並可播放
- [ ] 再次點擊卡片收合
- [ ] 響應式設計（手機/桌面）

### 聯絡表單
- [ ] 必填欄位驗證生效
- [ ] 標題長度限制（1-100 字元）
- [ ] 訊息長度限制（10-5000 字元）
- [ ] 附件大小限制（5MB）
- [ ] 不支援的檔案格式顯示錯誤
- [ ] 成功提交顯示確認訊息
- [ ] Email 正確發送至 pink.exp.studio@gmail.com
- [ ] 信件標題格式：`knk-fans-site:{標題}`
- [ ] 附件正確附加
- [ ] 四種語言的錯誤訊息正確

### 綜藝頁面
- [ ] 內容以卡片形式呈現（無系列分類）
- [ ] 點擊卡片開啟新分頁

### 關於 KNK 頁面
- [ ] 顯示出道日期
- [ ] 顯示成員數量（4 位）
- [ ] 顯示粉絲名稱：Tinkerbell（四種語言）

### Footer
- [ ] 顯示創作者：小仙女 Pink
- [ ] 顯示版權聲明（220 Entertainment）
- [ ] 顯示 AI 生成聲明
- [ ] 聯絡連結正確導向 /contact 頁面
- [ ] 四種語言翻譯正確

### Google Analytics
- [ ] 頁面瀏覽事件正確追蹤
- [ ] GA4 後台可看到即時使用者
- [ ] 自訂事件正確觸發（guide_card_expand, form_submit）

## 常見問題

### Q1: Resend email 發送失敗？

**檢查項目**:
1. `RESEND_API_KEY` 是否正確設定在 `.env.local`
2. Resend 帳號是否已驗證 email domain
3. 免費額度是否用盡（3,000 封/月）

**解決方案**: 查看 Resend Dashboard 的 Logs 頁面確認錯誤訊息。

### Q2: YouTube 影片無法播放？

**可能原因**:
1. `videoId` 格式錯誤（應為 11 字元）
2. 影片設為私人或地區限制
3. 瀏覽器阻擋 iframe

**解決方案**: 確認影片 ID 正確，測試不同影片。

### Q3: 語言切換後載入覆蓋層不消失？

**可能原因**:
1. `useTransition` 的 `isPending` 狀態未正確更新
2. 路由切換失敗但未捕獲錯誤

**解決方案**: 檢查 console 錯誤，確認路由路徑正確。

### Q4: 表單驗證訊息未翻譯？

**檢查項目**:
1. `messages/{locale}.json` 是否包含所有 `validation.*` key
2. Zod schema errorMap 是否正確引用翻譯 key
3. `useTranslations` hook 是否正確使用

## 相關資源

### 官方文件
- [Next.js App Router](https://nextjs.org/docs/app)
- [next-intl](https://next-intl.dev/)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)
- [Resend Docs](https://resend.com/docs)
- [Framer Motion](https://www.framer.com/motion/)

### 專案文件
- [功能規格](./spec.md)
- [實作計畫](./plan.md)
- [研究報告](./research.md)
- [資料模型](./data-model.md)
- [API 契約](./contracts/api-contact.yaml)

## 下一步

完成環境設定後，執行以下步驟：

1. **閱讀功能規格** - 詳細了解所有使用者故事與驗收條件
2. **閱讀資料模型** - 理解資料結構與型別定義
3. **執行 `/speckit.tasks`** - 產生詳細的實作任務清單（tasks.md）
4. **開始實作** - 按照建議順序逐步完成功能

**準備好了嗎？開始開發吧！** 🚀
