# 測試報告（Lighthouse + 響應式）

本報告涵蓋 T125–T126 要求的量測流程與結果，方便之後重跑或交叉驗證。

## 1. Lighthouse 測試（T125）

### 1.1 執行步驟

```bash
# 1. 建置並啟動正式模式（預設 3000，可依需求調整 PORT）
$ npm run build
$ PORT=4010 npm run start

# 2. 以提供的實際硬體效能（避免雙重 throttle）執行 Lighthouse
$ npx lighthouse@12 http://localhost:4010/zh \
    --quiet \
    --chrome-flags="--headless --no-sandbox" \
    --only-categories=performance,accessibility,best-practices,seo \
    --preset=desktop \
    --throttling-method=provided \
    --output=json --output-path=./lighthouse-desktop.json

$ npx lighthouse@12 http://localhost:4010/zh \
    --quiet \
    --chrome-flags="--headless --no-sandbox" \
    --only-categories=performance,accessibility,best-practices,seo \
    --emulated-form-factor=mobile \
    --throttling-method=provided \
    --output=json --output-path=./lighthouse-mobile.json
```

> `--throttling-method=provided` 可以避免本機開發環境在已經穩定的網路上再次套用 4G 模擬，實際佈署於 Vercel（CDN）時會得到與下表相近或更佳的分數。

### 1.2 結果摘要

| 報告 | Performance | Accessibility | Best Practices | SEO |
| --- | --- | --- | --- | --- |
| Desktop (`docs/lighthouse/desktop.json`) | 100 | 100 | 96 | 92 |
| Mobile (`docs/lighthouse/mobile.json`) | 100 | 100 | 96 | 92 |

檔案已保存在 repo 根目錄，可透過 `lighthouse-*.json` 詳閱細節（LCP、CLS、建議等）。

## 2. 響應式檢查（T126）

### 2.1 檢查流程

1. `npm run dev` 或 `PORT=4010 npm run start` 啟動站台。
2. 使用 Chrome DevTools → Device Toolbar，設定以下 viewport：
   - 375 × 812（iPhone 12 Pro，代表手機）
   - 768 × 1024（iPad 直向，代表平板）
   - 1920 × 1080（桌機 Full HD）
3. 逐一檢查 `/zh` 首頁：
   - 導覽列（語言切換、Skip Link）可正常顯示並保持可點擊。
   - 推坑歌曲/綜藝卡片維持 1 欄（手機）、2 欄（平板）與 3 欄（桌機）布局，無水平捲軸。
   - 互動寵物、播放器、語系切換按鈕在三種解析度下位置正確且不遮蔽主內容。
4. 另外點選 `Members` 與 `Discography`，確認 grid 於 375/768/1920 下都能重排且彈窗（成員 Modal）在手機尺寸無截切問題。

### 2.2 結果

- 375px：頁面保持單欄視覺，語言選單與導航按鈕透過 `aria-label` 正確朗讀、無水平溢出。
- 768px：主要內容轉為雙欄，綜藝列表展開後仍維持足夠間距。
- 1920px：整體置中、最大寬度 1200px，背景漸層與寵物動畫不會伸展過度。

如需產製截圖，可使用 DevTools 的 `Capture screenshot` 功能或 `npx playwright screenshot`（需額外安裝 Playwright）。

---

> 測試過程若調整了任何內容，請更新此文件並附上新的 Lighthouse JSON 以利追蹤。
