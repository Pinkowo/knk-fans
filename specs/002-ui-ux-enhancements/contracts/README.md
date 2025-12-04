# API 契約規格

本目錄包含 002-ui-ux-enhancements 功能的 API 契約定義。

## 檔案列表

| 檔案 | 格式 | 說明 |
|-----|------|------|
| `api-contact.yaml` | OpenAPI 3.1.0 | 聯絡表單 API 規格 |

## 使用方式

### 檢視 OpenAPI 規格

**線上檢視器**:
1. 訪問 [Swagger Editor](https://editor.swagger.io/)
2. 複製 `api-contact.yaml` 內容貼上

**本地檢視（若已安裝 Swagger UI）**:
```bash
npx swagger-ui-watcher specs/002-ui-ux-enhancements/contracts/api-contact.yaml
```

### 從規格產生程式碼（可選）

**TypeScript Client**:
```bash
npx openapi-typescript specs/002-ui-ux-enhancements/contracts/api-contact.yaml -o src/types/api-contact.generated.ts
```

**注意**: 本專案目前手寫型別定義於 `src/types/contact.ts`，無需自動產生。

## API 端點摘要

### POST /api/contact
提交聯絡表單，支援附件上傳（最大 5MB）。

**Request Body** (multipart/form-data):
- `inquiryType`: 詢問類型（必填）
- `title`: 標題（必填，1-100 字元）
- `message`: 訊息內容（必填，10-5000 字元）
- `attachment`: 附件檔案（可選，≤ 5MB）
- `locale`: 使用者語言（必填）

**Responses**:
- `200`: 成功提交
- `400`: 驗證錯誤
- `429`: Rate limiting
- `500`: 伺服器錯誤

詳細規格請參閱 `api-contact.yaml`。

## 契約驗證

### 請求驗證

前端使用 Zod schema 驗證（`src/types/contact.ts`）:
```typescript
import { contactFormSchema } from '@/types/contact'

const result = contactFormSchema.safeParse(formData)
if (!result.success) {
  // 顯示驗證錯誤
}
```

後端 API Route 重複驗證確保安全性。

### 回應驗證（可選）

可使用 Zod 定義回應 schema 進行型別檢查:
```typescript
const successResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  emailId: z.string().optional(),
})
```

## 版本控制

契約版本與功能分支綁定：
- 功能分支：`002-ui-ux-enhancements`
- API 版本：`1.0.0`（info.version）

變更契約時需更新版本號（semantic versioning）。

## 相關文件

- **資料模型**: `../data-model.md` - 定義 ContactFormSubmission 實體
- **研究報告**: `../research.md` - Email 服務選擇與檔案上傳處理決策
- **功能規格**: `../spec.md` - 完整功能需求
