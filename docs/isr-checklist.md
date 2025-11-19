# ISR 設定驗證

> 最後更新：2025-11-19

使用 `rg "export const revalidate" -n src` 逐一確認頁面與 API Route 的 ISR 週期，結果如下。秒數與 specs/plan 中的預期一致。

| 位置 | revalidate 秒數 | 覆蓋內容 | 規格期望 |
| --- | --- | --- | --- |
| `src/app/[locale]/about/page.tsx` | 604800 (7 天) | 關於頁 | 1 週內不會頻繁更新 |
| `src/app/[locale]/discography/page.tsx` | 86400 (24 小時) | 專輯列表 | 每日同步 Notion |
| `src/app/[locale]/links/page.tsx` | 604800 | 外部連結頁 | 週期更新 |
| `src/app/[locale]/members/page.tsx` | 3600 (1 小時) | 成員列表 | 快速同步成員異動 |
| `src/app/[locale]/variety/page.tsx` | 86400 | 綜藝頁面 | 每日檢查 |
| `src/app/api/notion/guide/route.ts` | 21600 (6 小時) | 首頁資料 | 高頻內容 |
| `src/app/api/notion/members/route.ts` | 86400 | 成員 API | 與頁面一致 |
| `src/app/api/notion/members/[id]/route.ts` | 86400 | 單一成員 | 與列表一致 |
| `src/app/api/notion/discography/route.ts` | 604800 | 專輯 API | 長週期內容 |
| `src/app/api/notion/songs/[id]/route.ts` | 600 (10 分鐘) | 歌曲詳細 | 歌詞更新需快速生效 |
| `src/app/api/notion/variety/route.ts` | 86400 | 綜藝 API | 每日同步 |
| `src/app/api/notion/links/route.ts` | 604800 | 外部連結 API | 週期更新 |
| `src/app/api/notion/about/route.ts` | 604800 | 團體資訊 | 少變動資料 |

所有動態路由 (`generateStaticParams`) 已實作於相關 `page.tsx` 中，並搭配 `/api/revalidate` 以便必要時手動刷新。若未來需要調整快取週期，可依內容更新頻率修改上述常數，同步更新此文件以保持追蹤。
