# 研究報告：UI/UX 增強功能與聯絡表單

**日期**: 2025-12-04
**功能**: 002-ui-ux-enhancements

本文件記錄技術研究結果，解決實作計畫中標記為 "NEEDS CLARIFICATION" 的項目。

## 研究項目

### 1. Pre-commit Hooks 配置

**決策**: 目前專案尚未配置 Husky pre-commit hooks

**理由**:
- 檢查專案根目錄無 `.husky/` 資料夾
- `package.json` 無 husky 相依套件
- 現階段使用手動執行 `npm run lint` 與 `npm run type-check` 確保程式碼品質

**考慮的替代方案**:
1. **立即安裝 Husky** - 增加初期配置成本，對單人開發專案效益有限
2. **使用 simple-git-hooks** - 輕量但功能不如 Husky 完整
3. **依賴 CI/CD 檢查** - 可能導致提交後才發現問題

**結論**: 暫不配置 pre-commit hooks，在本功能實作完成後評估是否需要。優先使用 IDE 整合的 ESLint/Prettier 與 PR 前手動檢查。

---

### 2. Conventional Commit 配置

**決策**: 目前專案無 commitlint 配置，但採用 Conventional Commit 格式

**理由**:
- 檢查專案根目錄無 `.commitlintrc` 或相關配置檔案
- `package.json` 無 commitlint 相依套件
- 查看 git log 顯示已使用 `feat:`、`fix:` 前綴（如 `feat: update About UI`）

**考慮的替代方案**:
1. **安裝 commitlint + Husky** - 需要額外配置，增加開發障礙
2. **手動遵循規範** - 目前做法，依賴開發者自律
3. **Git commit template** - 提供模板但無強制檢查

**結論**: 繼續使用手動遵循 Conventional Commit 格式，不強制安裝 commitlint。在 PR 審查時確認 commit 訊息格式。

---

### 3. PR 審查者數量要求

**決策**: 單人開發專案，無強制審查者要求

**理由**:
- 檢查 `.git/config` 顯示為個人專案（pink.exp.studio@gmail.com）
- 無團隊協作跡象
- GitHub 儲存庫未配置 branch protection rules

**考慮的替代方案**:
1. **自我審查 checklist** - 在 PR 前使用清單確認
2. **延遲 merge** - 提交 PR 後隔日再審查 merge
3. **邀請外部審查者** - 成本過高且非必要

**結論**: 採用自我審查 checklist，確保程式碼品質、測試覆蓋、文件更新等項目完成後再 merge。

---

### 4. Email 服務選擇

**決策**: 使用 Resend API 作為 email 發送服務

**理由**:
1. **Next.js 整合友善** - 官方推薦的 email API 服務
2. **免費額度充足** - 3,000 封/月免費，足夠初期使用
3. **簡單 API** - RESTful API，易於整合
4. **良好的送達率** - 專注於交易型郵件（transactional email）
5. **TypeScript 支援** - 提供官方 SDK 與型別定義

**考慮的替代方案**:
1. **Nodemailer + Gmail SMTP**
   - 優點：免費、熟悉
   - 缺點：Gmail 限制 500 封/日、可能被標記為垃圾郵件、需要 App Password 管理
2. **SendGrid**
   - 優點：成熟、免費 100 封/日
   - 缺點：免費額度較少、設定複雜
3. **Mailgun**
   - 優點：強大功能
   - 缺點：免費試用僅 30 天

**實作細節**:
```bash
npm install resend
```

環境變數設定（`.env`）:
```
RESEND_API_KEY=re_xxxxx
CONTACT_EMAIL=pink.exp.studio@gmail.com
```

---

### 5. 檔案上傳處理方式

**決策**: 使用 Next.js API Route 接收 multipart/form-data，將檔案轉換為 base64 附加至 email

**理由**:
1. **簡單實作** - 無需額外儲存服務（S3, Cloudinary）
2. **5MB 限制適用** - base64 編碼後約 6.7MB，仍在多數 email 服務限制內（Resend 支援 40MB）
3. **隱私考量** - 不儲存使用者上傳檔案，符合 GDPR 原則
4. **成本效益** - 無額外儲存成本

**考慮的替代方案**:
1. **Vercel Blob Storage**
   - 優點：與 Vercel 整合佳
   - 缺點：需額外成本、需要檔案清理機制
2. **AWS S3**
   - 優點：成熟、可靠
   - 缺點：複雜設定、成本、需管理檔案生命週期
3. **僅儲存 URL 不儲存檔案**
   - 缺點：無法確保使用者回報時檔案仍可存取

**實作細節**:
- 使用 `formidable` 或 Next.js 內建 `formData()` 解析
- 限制檔案類型：image/*, application/pdf, .txt, .log
- 檔案大小檢查在客戶端（JavaScript）與伺服器端（API Route）雙重驗證

---

### 6. Google Analytics vs Vercel Analytics

**決策**: 並用 Google Analytics 4 (GA4) 與 Vercel Analytics

**理由**:
1. **Vercel Analytics 已安裝** - 專案已有 `@vercel/analytics` (1.5.0)
2. **GA4 補充需求** - 提供地理位置、自訂事件等 Vercel Analytics 不支援的功能
3. **免費** - 兩者皆免費
4. **互補性**:
   - Vercel Analytics：即時效能監控、Web Vitals（Core Web Vitals）
   - GA4：使用者行為、地理位置、自訂事件、長期趨勢分析

**考慮的替代方案**:
1. **僅使用 Vercel Analytics**
   - 缺點：無法滿足地理位置與自訂事件需求（FR-034, FR-035）
2. **僅使用 GA4**
   - 缺點：失去 Vercel 整合的效能監控與 Web Vitals
3. **使用 Plausible/Fathom**
   - 優點：隱私友善、簡單
   - 缺點：需額外成本、功能較少

**實作細節**:
```bash
npm install @next/third-parties
```

在 `app/layout.tsx` 新增:
```tsx
import { GoogleAnalytics } from '@next/third-parties/google'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <GoogleAnalytics gaId="G-XXXXXXXXXX" />
      </body>
    </html>
  )
}
```

環境變數（`.env`）:
```
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

---

### 7. 語言切換載入狀態管理

**決策**: 使用 React Context + `useTransition` 管理載入狀態

**理由**:
1. **next-intl 路由機制** - 語言切換透過路由改變（`/zh/guide` → `/en/guide`）
2. **React 18+ useTransition** - 原生支援過渡狀態，無需額外狀態管理庫
3. **簡單實作** - 在 `LanguageSwitch` 元件使用 `startTransition` 包裹路由切換
4. **全域覆蓋層** - 透過 Context 在 layout 層級控制 LoadingOverlay 顯示

**考慮的替代方案**:
1. **Zustand/Redux 全域狀態**
   - 缺點：過度設計，增加依賴與複雜度
2. **next-intl middleware + loading.tsx**
   - 缺點：`loading.tsx` 僅在 Suspense boundary 觸發，不符合「全頁面覆蓋」需求
3. **純 CSS loading 動畫**
   - 缺點：無法與 API 完成狀態同步

**實作細節**:
```tsx
// contexts/LoadingContext.tsx
'use client'
import { createContext, useContext, useState } from 'react'

type LoadingContextType = {
  isLoading: boolean
  setLoading: (loading: boolean) => void
}

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

// components/common/LanguageSwitch.tsx
import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useLoading } from '@/contexts/LoadingContext'

function LanguageSwitch() {
  const [isPending, startTransition] = useTransition()
  const { setLoading } = useLoading()
  const router = useRouter()

  const handleChange = (locale: string) => {
    setLoading(true)
    startTransition(() => {
      router.push(`/${locale}${pathname}`)
      // router.push 完成後會自動觸發 onRouteChangeComplete
    })
  }

  useEffect(() => {
    if (!isPending) {
      setLoading(false)
    }
  }, [isPending])
}
```

---

### 8. YouTube 內嵌播放器實作

**決策**: 使用 `react-youtube` 套件（已安裝 10.1.0）

**理由**:
1. **已存在於專案** - 無需額外安裝
2. **TypeScript 支援** - 官方型別定義
3. **事件處理完整** - onReady, onPlay, onError 等事件
4. **效能優化** - 支援 lazy loading、playerVars 配置

**考慮的替代方案**:
1. **手寫 iframe**
   - 缺點：需處理 YouTube IFrame API 載入、事件監聽、跨瀏覽器相容性
2. **lite-youtube-embed**
   - 優點：極輕量（<3KB）
   - 缺點：無法內嵌播放（點擊後仍跳轉 YouTube），不符需求 FR-009
3. **plyr**
   - 優點：美觀 UI
   - 缺點：額外依賴、Bundle 較大

**實作細節**:
```tsx
// components/guide/YouTubeEmbed.tsx
import YouTube from 'react-youtube'

interface YouTubeEmbedProps {
  videoId: string
  onError?: () => void
}

export function YouTubeEmbed({ videoId, onError }: YouTubeEmbedProps) {
  const opts = {
    height: '390',
    width: '640',
    playerVars: {
      autoplay: 0,
      modestbranding: 1, // 最小化 YouTube logo
      rel: 0, // 不顯示相關影片
    },
  }

  return (
    <div className="aspect-video">
      <YouTube
        videoId={videoId}
        opts={opts}
        onError={onError}
        className="w-full h-full"
      />
    </div>
  )
}
```

---

### 9. 卡片展開/收合互動

**決策**: 使用 Framer Motion `AnimatePresence` + `motion.div`

**理由**:
1. **已安裝** - 專案已有 `framer-motion` (12.23.24)
2. **流暢動畫** - 硬體加速、高效能
3. **簡單 API** - `initial`, `animate`, `exit` 宣告式動畫
4. **無障礙支援** - 尊重 `prefers-reduced-motion`

**考慮的替代方案**:
1. **純 CSS transition**
   - 缺點：無法動畫 height: auto、需要 JavaScript 計算高度
2. **react-spring**
   - 優點：物理動畫
   - 缺點：Bundle 較大、學習曲線
3. **Details/Summary HTML**
   - 優點：原生、無障礙
   - 缺點：樣式限制、無法內嵌影片（瀏覽器可能阻擋 autoplay）

**實作細節**:
```tsx
// components/guide/GuideCard.tsx
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

export function GuideCard({ title, thumbnail, videoId }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <motion.div
      layout
      className="border rounded-lg overflow-hidden"
    >
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
            transition={{ duration: 0.3 }}
          >
            <YouTubeEmbed videoId={videoId} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
```

---

### 10. 表單驗證策略

**決策**: 使用 React Hook Form + Zod schema 驗證

**理由**:
1. **型別安全** - Zod schema 自動產生 TypeScript 型別
2. **效能** - 僅重新渲染受影響欄位
3. **易於測試** - Schema 可獨立測試
4. **友善錯誤訊息** - Zod 支援自訂多語系錯誤訊息

**考慮的替代方案**:
1. **原生 HTML5 驗證**
   - 缺點：無法自訂錯誤訊息翻譯、樣式限制
2. **Formik**
   - 優點：成熟、廣泛使用
   - 缺點：較重、效能較差（整表單重新渲染）
3. **手寫驗證邏輯**
   - 缺點：重複程式碼、難以維護

**實作細節**:
```bash
npm install react-hook-form zod @hookform/resolvers
```

```tsx
// schemas/contact.ts
import { z } from 'zod'

export const contactFormSchema = z.object({
  inquiryType: z.enum(['error-report', 'service-request', 'other']),
  title: z.string().min(1, { message: 'validation.required' }).max(100),
  message: z.string().min(10, { message: 'validation.minLength' }).max(5000),
  attachment: z
    .instanceof(File)
    .optional()
    .refine((file) => !file || file.size <= 5 * 1024 * 1024, {
      message: 'validation.fileTooLarge',
    }),
})

export type ContactFormData = z.infer<typeof contactFormSchema>

// components/contact/ContactForm.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

function ContactForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  })

  const onSubmit = async (data: ContactFormData) => {
    // API call
  }
}
```

---

## 技術決策摘要

| 項目 | 決策 | 主要理由 |
|-----|------|---------|
| Pre-commit Hooks | 暫不配置 | 單人開發、依賴手動檢查與 IDE 整合 |
| Conventional Commit | 手動遵循 | 已實行中、無強制工具 |
| Email 服務 | Resend API | Next.js 友善、免費額度充足、簡單 API |
| 檔案上傳 | base64 email 附件 | 簡單、隱私、成本效益 |
| Analytics | GA4 + Vercel Analytics | 互補功能、滿足所有需求 |
| 語言載入狀態 | React Context + useTransition | 原生支援、簡單、符合需求 |
| YouTube 播放器 | react-youtube | 已安裝、完整功能、TypeScript 支援 |
| 卡片動畫 | Framer Motion | 已安裝、高效能、簡單 API |
| 表單驗證 | React Hook Form + Zod | 型別安全、效能、易測試 |

## 新增依賴套件

```json
{
  "dependencies": {
    "resend": "^4.0.1",
    "react-hook-form": "^7.54.2",
    "zod": "^3.24.1",
    "@hookform/resolvers": "^3.10.0",
    "@next/third-parties": "^16.0.7"
  }
}
```

## 環境變數需求

```bash
# .env
RESEND_API_KEY=re_xxxxx                    # Resend API Key
CONTACT_EMAIL=pink.exp.studio@gmail.com    # 接收聯絡表單的信箱
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX             # Google Analytics 4 Measurement ID
```

## 風險與緩解

| 風險 | 影響 | 緩解措施 |
|-----|------|---------|
| Resend API 額度用盡 | 表單無法提交 | 監控用量、實作 rate limiting、備用 SMTP |
| YouTube API 封鎖 | 影片無法播放 | 錯誤處理顯示連結、考慮 CDN proxy |
| Bundle 大小超標 | 效能下降 | Dynamic import、Tree shaking、Bundle analyzer |
| GA4 被 ad blocker 封鎖 | 分析不完整 | 不影響功能、接受分析缺漏（FR-036 已涵蓋） |
| 表單垃圾訊息 | 信箱爆滿 | Rate limiting（IP based）、未來加入 Turnstile CAPTCHA |

## 後續研究需求

無。所有 NEEDS CLARIFICATION 項目已解決。
