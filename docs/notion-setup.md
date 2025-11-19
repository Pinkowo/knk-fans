# Notion 資料庫設定指南

本專案的所有內容皆來源於 Notion。以下說明如何建立資料庫、設定欄位與取得 `DATABASE_ID` 以配置在 `.env.local` 中。

## 1. 建立整合並授權

1. 前往 [Notion My Integrations](https://www.notion.so/my-integrations) 建立 **Internal Integration**，取得 `NOTION_API_KEY`。
2. 在欲使用的 Workspace 內建立以下資料庫（可位於同一 Page，下列名稱僅供參考）。
3. 在每個資料庫右上角點選 **Share → Invite**，搜尋剛建立的整合並授權。
4. 從資料庫頁面 URL 取得 ID（例如 `https://www.notion.so/<workspace>/<name>?v=...&p=<DATABASE_ID>`）。

> 若未授權整合，API 會回傳 401 或空資料。

## 2. 資料庫欄位定義

### 2.1 推坑指南（`NOTION_GUIDE_DATABASE_ID`）

| 欄位 | 型別 | 用途 |
| --- | --- | --- |
| `Title` | Title | 推薦項目名稱 |
| `Description` | Rich text | 簡介，支援多行 |
| `Category` | Select | `song` / `stage` / `variety`，決定顯示區塊 |
| `Link` | URL | 外部連結（YouTube、Spotify 等）|
| `Tags` | Multi-select | 顯示於卡片底部的標籤 |
| `Thumbnail` | Files & media | 卡片封面，建議 16:9 圖片 |
| `Order` | Number | 升冪排序；越小越優先 |

### 2.2 團體魅力點（`NOTION_CHARMS_DATABASE_ID`）

| 欄位 | 型別 | 用途 |
| --- | --- | --- |
| `Title` | Title | 魅力名稱 |
| `Description` | Rich text | 詳細說明 |
| `Category` | Select | 可自訂分類文字，直接顯示在 UI |
| `Icon` | Rich text | 建議輸入 Emoji（例如 ✨），將成為圓形圖示 |

### 2.3 成員（`NOTION_MEMBERS_DATABASE_ID`）

| 欄位 | 型別 | 用途 |
| --- | --- | --- |
| `Name` | Title | 成員姓名 |
| `Status` | Select | `current` / `former`（大小寫不拘） |
| `Bio` | Rich text | 介紹內容 |
| `Position` | Rich text | 角色/擅長（可留空） |
| `Photo` | Files & media | 卡片與彈窗照片 |
| `Profile` | URL | 個人連結，會自動轉成按鈕 |
| `Order` | Number | 升冪排序，用於控制卡片順序 |

### 2.4 專輯（`NOTION_ALBUMS_DATABASE_ID`）

| 欄位 | 型別 | 用途 |
| --- | --- | --- |
| `Title` | Title | 專輯名稱 |
| `ReleaseDate` | Date / Rich text | 顯示於卡片上的發行日期 |
| `Description` | Rich text | 專輯摘要（選填） |
| `Cover` | Files & media | 封面圖。若留空會以備援圖替代 |
| `Tracks` | Rich text | 每行格式 `歌名 | 3:42 | SONG_SLUG`，最後一段為 optional `songId` 供歌曲內頁連結使用 |
| `Link` | URL | (選填) 連至串流平台 |

### 2.5 歌曲（`NOTION_SONGS_DATABASE_ID`）

| 欄位 | 型別 | 用途 |
| --- | --- | --- |
| `Title` | Title | 歌曲名稱 |
| `Slug` | Rich text | 必填且唯一，對應 URL `/discography/[slug]` |
| `Album` | Select | 歌曲所屬專輯名稱（顯示於歌曲頁） |
| `Description` | Rich text | 曲目介紹 |
| `Video` | URL | YouTube 或 Spotify 連結 |
| `Lyrics (ko/zh/ja/en)` | Rich text | 每行即一段歌詞，可視需求填寫語種 |
| `Lyrics (romanization)` | Rich text | 羅馬拼音（選填） |
| `Lyrics (phonetic)` | Rich text | 發音標注（選填） |

### 2.6 綜藝（`NOTION_VARIETY_DATABASE_ID`）

| 欄位 | 型別 | 用途 |
| --- | --- | --- |
| `Title` | Title | 綜藝系列名稱 |
| `Description` | Rich text | 系列描述（選填） |
| `Cover` | Files & media | 系列卡片封面 |
| `Episodes` | Rich text | 每行 `EP 名稱 | 1,VIDEO_ID`，其中數字代表集數，可留空表示特別篇 |
| `Link` | URL | 系列主連結 |
| `Order` | Number | 用於排列多個系列 |

### 2.7 外部連結（`NOTION_LINKS_DATABASE_ID`）

| 欄位 | 型別 | 用途 |
| --- | --- | --- |
| `Title` | Title | 平台名稱 |
| `URL` | URL | 開啟的外部連結 |
| `Description` | Rich text | 簡短說明 |
| `Icon` | Rich text | Emoji 或文字圖示 |
| `Order` | Number | 排序用 |

### 2.8 團體資訊（`NOTION_ABOUT_DATABASE_ID`）

| 欄位 | 型別 | 用途 |
| --- | --- | --- |
| `Title` | Title | 顯示於頁面頂部的團體名稱 |
| `DebutDate` | Rich text | 出道日期或年份 |
| `Description` | Rich text | 官網式描述 |
| `Achievements` | Rich text | 以換行分隔的成就列表 |
| `MembersCount` | Number | 目前成員數 |
| `Cover` | Files & media | 關於頁的主視覺 |

## 3. 資料格式建議

- **圖片尺寸**：建議至少 1280 × 720，減少 `next/image` 重新取樣成本。
- **排序欄位**：`Order` 建議為整數，方便在 Notion 內以公式或手動調整。
- **歌詞欄位**：每行內容會依照設定顯示，可自由換行；若留空會自動 fallback 至韓文。
- **集數格式**：若一行為 `Weekly Idol | 1,ZKpew5jvwjI`，系統會解析 `1` 為集數並將 `ZKpew5jvwjI` 當成 YouTube videoId。

## 4. 測試與驗證

1. `.env.local` 填好後執行 `npm run dev`，造訪 `/zh` 應看到 Notion 資料。
2. 若 API 回傳 500，先檢查環境變數，再確認 Notion 欄位名稱是否完全相符（大小寫需一致）。
3. 更新內容後可等待 ISR 期間（詳見各 `page.tsx` 的 `revalidate`），或使用 `/api/revalidate` 立即刷新。

完成上述設定即可在本機或 Vercel 上取用 Notion 內容。若未來欄位有所調整，請同步更新此文件與相關 TypeScript 定義以保持資料的一致性。
