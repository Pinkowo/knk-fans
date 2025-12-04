# 資料模型：UI/UX 增強功能與聯絡表單

**日期**: 2025-12-04
**功能**: 002-ui-ux-enhancements

本文件定義功能所需的資料實體、欄位、關係、驗證規則與狀態轉換。

## 實體概覽

本功能涉及以下資料實體：

1. **ContactFormSubmission** - 聯絡表單提交資料
2. **LanguageLoadingState** - 語言切換載入狀態
3. **GuideContentItem** - 推坑指南內容項目
4. **AnalyticsEvent** - 分析追蹤事件

---

## 1. ContactFormSubmission（聯絡表單提交）

### 目的
代表使用者透過聯絡表單提交的詢問，包含詢問類型、訊息內容、附件檔案等資訊。**注意：此版本無標題欄位，Email 主旨使用詢問類型。**

### 欄位定義

| 欄位名稱 | 型別 | 必填 | 預設值 | 說明 | 驗證規則 |
|---------|------|------|--------|------|---------|
| `inquiryType` | `'error-report' \| 'service-request' \| 'other'` | ✅ | - | 詢問類型（用於 Email 主旨） | 必須為三種類型之一 |
| `message` | `string` | ✅ | - | 詢問內容 | 10-5000 字元 |
| `attachment` | `File \| null` | ❌ | `null` | 附件檔案 | 大小 ≤ 5MB，格式限制見下方 |
| `submittedAt` | `Date` | ✅ | `new Date()` | 提交時間（ISO 8601） | 自動產生 |
| `locale` | `'zh' \| 'ko' \| 'ja' \| 'en'` | ✅ | `'zh'` | 使用者選擇的語言 | 必須為支援的語言之一 |
| `userAgent` | `string` | ❌ | - | 瀏覽器 User Agent | 用於除錯 |
| `ipAddress` | `string` | ❌ | - | 使用者 IP 位址 | 用於 rate limiting（未來） |

### 附件檔案格式限制

**允許的 MIME 類型**:
- 圖片：`image/png`, `image/jpeg`, `image/gif`, `image/webp`
- 文件：`application/pdf`, `text/plain`
- 日誌：`.log`, `.txt`

**大小限制**: 5MB（5,242,880 bytes）

### TypeScript 型別定義

```typescript
// src/types/contact.ts
import { z } from 'zod'

// Zod Schema（已更新：移除 title 欄位）
export const contactFormSchema = z.object({
  inquiryType: z.enum(['error-report', 'service-request', 'other'], {
    errorMap: () => ({ message: 'validation.invalidInquiryType' }),
  }),
  message: z
    .string()
    .min(10, { message: 'validation.messageMinLength' })
    .max(5000, { message: 'validation.messageTooLong' }),
  attachment: z
    .instanceof(File)
    .optional()
    .refine(
      (file) => !file || file.size <= 5 * 1024 * 1024,
      { message: 'validation.fileTooLarge' }
    )
    .refine(
      (file) => {
        if (!file) return true
        const allowedTypes = [
          'image/png',
          'image/jpeg',
          'image/gif',
          'image/webp',
          'application/pdf',
          'text/plain',
        ]
        return allowedTypes.includes(file.type) || file.name.endsWith('.log')
      },
      { message: 'validation.invalidFileType' }
    ),
})

// TypeScript Type
export type ContactFormData = z.infer<typeof contactFormSchema>

// API Request Body (with metadata)
export interface ContactSubmissionRequest extends ContactFormData {
  locale: 'zh' | 'ko' | 'ja' | 'en'
  submittedAt: string // ISO 8601
  userAgent?: string
}

// API Response
export interface ContactSubmissionResponse {
  success: boolean
  message: string
  emailId?: string // Resend email ID
}

// Error Response
export interface ContactSubmissionError {
  success: false
  error: string
  code: 'VALIDATION_ERROR' | 'EMAIL_SEND_ERROR' | 'FILE_TOO_LARGE' | 'RATE_LIMIT_EXCEEDED'
  details?: Record<string, string[]>
}
```

### 狀態轉換

本實體無內部狀態轉換，屬於單次提交行為。

```
[使用者填寫表單] → [前端驗證] → [提交至 API] → [後端驗證] → [發送 Email] → [回傳結果]
                       ↓ 失敗                      ↓ 失敗           ↓ 失敗
                   [顯示錯誤]                  [顯示錯誤]       [顯示錯誤]
```

### 關聯實體

- **AnalyticsEvent**: 表單提交成功時觸發 `form_submit` 事件

---

## 2. LanguageLoadingState（語言切換載入狀態）

### 目的
追蹤語言切換過程中的載入狀態，控制全頁面載入覆蓋層的顯示。

### 欄位定義

| 欄位名稱 | 型別 | 必填 | 預設值 | 說明 | 驗證規則 |
|---------|------|------|--------|------|---------|
| `isLoading` | `boolean` | ✅ | `false` | 是否正在載入 | - |
| `targetLocale` | `'zh' \| 'ko' \| 'ja' \| 'en' \| null` | ❌ | `null` | 目標語言 | 必須為支援的語言 |
| `startedAt` | `number \| null` | ❌ | `null` | 開始時間（timestamp） | 用於效能監控 |
| `pendingRequests` | `number` | ✅ | `0` | 待處理的 API 請求數量 | ≥ 0 |

### TypeScript 型別定義

```typescript
// src/contexts/LoadingContext.tsx
export interface LanguageLoadingState {
  isLoading: boolean
  targetLocale: 'zh' | 'ko' | 'ja' | 'en' | null
  startedAt: number | null
  pendingRequests: number
}

export interface LoadingContextType {
  state: LanguageLoadingState
  setLoading: (loading: boolean, locale?: 'zh' | 'ko' | 'ja' | 'en') => void
  incrementPending: () => void
  decrementPending: () => void
}

// Initial State
export const initialLoadingState: LanguageLoadingState = {
  isLoading: false,
  targetLocale: null,
  startedAt: null,
  pendingRequests: 0,
}
```

### 狀態轉換

```
[Idle]
  ↓ 使用者點擊語言選擇
[Loading]
  isLoading: true
  targetLocale: 'en'
  startedAt: Date.now()
  pendingRequests: 1-N
  ↓ 所有 API 請求完成 (pendingRequests === 0)
[Idle]
  isLoading: false
  targetLocale: null
  startedAt: null
  pendingRequests: 0
```

**邊界案例**:
- 使用者快速切換多次語言 → 取消先前請求，僅處理最新選擇
- API 請求失敗 → 顯示錯誤訊息，恢復 Idle 狀態

### 關聯實體

- **AnalyticsEvent**: 載入時間超過 2 秒時觸發 `slow_language_switch` 事件

---

## 3. GuideContentItem（推坑指南內容項目）

### 目的
代表推坑指南頁面的可推薦內容（舞台表演、歌曲、綜藝節目），包含標題、縮圖、YouTube 影片 ID 等資訊。

### 欄位定義

| 欄位名稱 | 型別 | 必填 | 預設值 | 說明 | 驗證規則 |
|---------|------|------|--------|------|---------|
| `id` | `string` | ✅ | - | 唯一識別碼 | UUID 或 slug |
| `category` | `'why-knk' \| 'stage' \| 'song' \| 'variety'` | ✅ | - | 內容類別 | 必須為四種類別之一 |
| `title` | `Record<AppLocale, string>` | ✅ | - | 多語系標題 | 每種語言皆需提供 |
| `description` | `Record<AppLocale, string>` | ❌ | `{}` | 多語系描述 | 可選 |
| `thumbnail` | `string` | ✅ | - | 縮圖 URL | 有效的 URL 或相對路徑 |
| `videoId` | `string` | ✅ | - | YouTube 影片 ID | 11 字元英數字 |
| `displayOrder` | `number` | ✅ | `0` | 顯示順序 | 整數，越小越前 |
| `isExpanded` | `boolean` | ✅ | `false` | 是否展開（客戶端狀態） | - |

### TypeScript 型別定義

```typescript
// src/types/guide.ts
import { AppLocale } from '@/i18n'

export type GuideCategory = 'why-knk' | 'stage' | 'song' | 'variety'

export interface GuideContentItem {
  id: string
  category: GuideCategory
  title: Record<AppLocale, string>
  description?: Record<AppLocale, string>
  thumbnail: string
  videoId: string // YouTube video ID (11 chars)
  displayOrder: number
}

// Client-side state (with expansion)
export interface GuideContentItemState extends GuideContentItem {
  isExpanded: boolean
}

// Grouped by category
export type GuideContentByCategory = Record<GuideCategory, GuideContentItem[]>
```

### 資料來源

**決策**: 內容定義於 TypeScript 常數檔案（非資料庫）

**理由**:
- 內容更新頻率低（每月 1-2 次）
- 無需動態新增/編輯功能（管理後台）
- 型別安全、版本控制友善
- 部署時即編譯，無 API 延遲

**範例資料**:

```typescript
// src/lib/guide-content.ts
export const guideContent: GuideContentItem[] = [
  {
    id: 'why-knk-1',
    category: 'why-knk',
    title: {
      zh: '為什麼喜歡 KNK？',
      en: 'Why KNK?',
      ko: 'KNK를 좋아하는 이유',
      ja: 'KNKが好きな理由',
    },
    description: {
      zh: '了解 KNK 的魅力',
      // ...其他語言
    },
    thumbnail: '/images/guide/why-knk-thumbnail.jpg',
    videoId: 'dQw4w9WgXcQ',
    displayOrder: 1,
  },
  // ...更多內容
]

// Helper function
export function getContentByCategory(category: GuideCategory): GuideContentItem[] {
  return guideContent
    .filter((item) => item.category === category)
    .sort((a, b) => a.displayOrder - b.displayOrder)
}
```

### 狀態轉換

```
[Collapsed]
  isExpanded: false
  ↓ 使用者點擊卡片
[Expanding] (Framer Motion 動畫)
  ↓ 動畫完成
[Expanded]
  isExpanded: true
  YouTube iframe 載入
  ↓ 使用者再次點擊
[Collapsing] (Framer Motion 動畫)
  ↓ 動畫完成
[Collapsed]
```

### 關聯實體

- **AnalyticsEvent**: 卡片展開時觸發 `guide_card_expand` 事件（category, videoId）

---

## 4. AnalyticsEvent（分析追蹤事件）

### 目的
代表需要追蹤的使用者行為事件，整合 Google Analytics 4 與 Vercel Analytics。

### 欄位定義

| 欄位名稱 | 型別 | 必填 | 預設值 | 說明 | 驗證規則 |
|---------|------|------|--------|------|---------|
| `eventName` | `string` | ✅ | - | 事件名稱（GA4 event） | snake_case |
| `eventType` | `'page_view' \| 'interaction' \| 'navigation' \| 'form' \| 'error'` | ✅ | - | 事件類型 | 必須為五種類型之一 |
| `timestamp` | `number` | ✅ | `Date.now()` | 事件發生時間 | Unix timestamp |
| `pageLocation` | `string` | ✅ | `window.location.pathname` | 頁面路徑 | - |
| `locale` | `'zh' \| 'ko' \| 'ja' \| 'en'` | ✅ | - | 使用者語言 | - |
| `properties` | `Record<string, string \| number \| boolean>` | ❌ | `{}` | 自訂屬性 | - |

### TypeScript 型別定義

```typescript
// src/lib/analytics.ts
export type AnalyticsEventType = 'page_view' | 'interaction' | 'navigation' | 'form' | 'error'

export interface AnalyticsEvent {
  eventName: string
  eventType: AnalyticsEventType
  timestamp: number
  pageLocation: string
  locale: 'zh' | 'ko' | 'ja' | 'en'
  properties?: Record<string, string | number | boolean>
}

// Predefined events
export const ANALYTICS_EVENTS = {
  // Page views (tracked automatically)
  PAGE_VIEW: 'page_view',

  // Guide interactions
  GUIDE_CARD_EXPAND: 'guide_card_expand',
  GUIDE_VIDEO_PLAY: 'guide_video_play',

  // Contact form
  FORM_SUBMIT: 'form_submit',
  FORM_ERROR: 'form_error',

  // Language switching
  LANGUAGE_SWITCH: 'language_switch',
  SLOW_LANGUAGE_SWITCH: 'slow_language_switch',

  // Variety page
  VARIETY_LINK_CLICK: 'variety_link_click',
} as const

// Helper function
export function trackEvent(event: AnalyticsEvent): void {
  // Send to GA4
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', event.eventName, {
      event_category: event.eventType,
      page_location: event.pageLocation,
      locale: event.locale,
      timestamp: event.timestamp,
      ...event.properties,
    })
  }

  // Send to Vercel Analytics (selected events only)
  if (typeof window !== 'undefined' && window.va) {
    window.va('track', event.eventName, event.properties)
  }
}
```

### 關聯實體

所有其他實體皆可觸發 AnalyticsEvent。

---

## 資料流程圖

### 1. 聯絡表單提交流程

```
[使用者] → [ContactForm 元件]
              ↓ 填寫表單
              ↓ React Hook Form 即時驗證
              ↓ 點擊提交
           [Zod Schema 驗證]
              ↓ 通過
           [POST /api/contact]
              ↓
           [API Route Handler]
              ↓ 驗證檔案大小、格式
              ↓ 轉換附件為 base64
              ↓ 呼叫 Resend API
           [Email 發送]
              ↓ 成功
           [回傳成功訊息]
              ↓
           [顯示確認訊息]
              ↓
           [觸發 Analytics: form_submit]
```

### 2. 語言切換載入流程

```
[使用者] → [LanguageSwitch 元件]
              ↓ 選擇語言
           [LoadingContext.setLoading(true, 'en')]
              ↓
           [顯示 LoadingOverlay]
              ↓
           [useTransition + router.push('/en/...')]
              ↓ Next.js 路由切換
              ↓ fetch 語言檔案 (/messages/en.json)
              ↓ 重新渲染頁面
           [useEffect: isPending === false]
              ↓
           [LoadingContext.setLoading(false)]
              ↓
           [隱藏 LoadingOverlay]
              ↓
           [觸發 Analytics: language_switch]
```

### 3. 推坑指南卡片展開流程

```
[使用者] → [GuideCard 元件]
              ↓ 點擊卡片
           [setState: isExpanded = true]
              ↓
           [Framer Motion AnimatePresence]
              ↓ 動畫展開 (300ms)
           [渲染 YouTubeEmbed 元件]
              ↓
           [react-youtube 載入 iframe]
              ↓ onReady callback
           [影片準備就緒]
              ↓
           [觸發 Analytics: guide_card_expand]
```

---

## 驗證規則摘要

### ContactFormSubmission
- `inquiryType`: 必須為 `'error-report' | 'service-request' | 'other'`
- `title`: 1-100 字元
- `message`: 10-5000 字元
- `attachment`: ≤ 5MB，允許的 MIME 類型見上方

### LanguageLoadingState
- `pendingRequests`: ≥ 0

### GuideContentItem
- `videoId`: 11 字元（YouTube 標準）
- `displayOrder`: 整數
- `title`: 必須包含 zh, ko, ja, en 四種語言

### AnalyticsEvent
- `eventName`: snake_case 命名規範

---

## 資料庫需求

**無需資料庫**。本功能所有資料皆為：
1. **客戶端狀態** - 儲存於 React state/context
2. **靜態內容** - 定義於 TypeScript 檔案（guide-content.ts）
3. **一次性提交** - 透過 Email 發送，不儲存（符合 GDPR 隱私原則）

---

## 後續擴展考量

未來若需新增以下功能，建議資料模型調整：

1. **聯絡表單歷史記錄** → 新增 Prisma + PostgreSQL，儲存 ContactFormSubmission
2. **管理後台編輯推坑內容** → 遷移 guideContent 至 CMS（Notion, Contentful）或資料庫
3. **使用者帳號系統** → 新增 User 實體，關聯 ContactFormSubmission 與 AnalyticsEvent
4. **進階分析** → 匯出 AnalyticsEvent 至 BigQuery 進行深度分析

**目前階段**：保持簡單，無資料庫，符合快速原型開發目標。
