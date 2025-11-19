# 使用者故事驗收紀錄

> 測試日期：2025-11-19（本機 `npm run dev`）

| 使用者故事 | 入口 / 操作 | 驗證重點 | 結果 |
| --- | --- | --- | --- |
| US1 推坑指南 | `/zh` | 推薦歌曲/綜藝/魅力點三區塊載入，卡片動畫與外部連結可開啟 | ✅ |
| US2 成員列表 | `/zh/members` | 成員分組、卡片點擊彈窗、語系切換保持狀態 | ✅ |
| US3 音樂作品 | `/zh/discography`、`/zh/discography/song-back` | 專輯兩欄排版、歌曲頁顯示播放器與多語歌詞 | ✅ |
| US4 綜藝 | `/zh/variety` | 手風琴展開/收合、YouTube 嵌入播放 | ✅ |
| US5 語言切換 | 任一頁面 → 語系下拉選單 | URL locale 更新、重新整理後偏好保留、`middleware.ts` 正確導向 | ✅ |
| US6 小寵物 | 任一頁面 | 右下角控制面板的 Enable/Interactions 切換、畫面上 Canvas 寵物跟隨點擊 | ✅ |
| US7 音樂播放器 | `/zh` 推薦歌曲 → 加入播放清單 (PlayerContext 預設 queue) | Player 可開啟/收合、顯示 Now Playing 與影片 | ✅ |
| US8 外部連結 | `/zh/links` | 卡片資訊、`target="_blank"` 於外部社群上線 | ✅ |
| US9 關於頁 | `/zh/about` / `/zh/about-me` | 團體資訊、聯絡方式區塊呈現 | ✅ |
| 團體介紹（階段 12） | `/zh/about` | generateStaticParams 之靜態內容與快取 | ✅ |

## 測試備註

1. 所有流程皆於桌機（Chrome）與模擬手機寬度（375px）檢視，確保互動元件無遮擋。
2. Notion API 在 `.env.local` 正確設定後，所有頁面於 1 秒內完成載入；若 API 回傳錯誤，`src/app/[locale]/error.tsx` 會顯示在地化訊息。
3. 任何內容更新可透過 `POST /api/revalidate` 立即生效，流程已於實測中驗證。
