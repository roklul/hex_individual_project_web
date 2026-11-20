# EMMA 電子零件 — 前端

**Vite + Vue 3 (Composition API, `<script setup>`) + Pinia + Vue Router + Tailwind CSS v4 + Axios**

- **線上網站**：`https://<your-web>.vercel.app`（部署後填入）
- **後端 API**：`https://<your-api>.onrender.com/api`
- **後端 Repo**：`https://github.com/roklul/hex_individual_project`

所有資料皆來自自行開發的後端 API，未使用任何假資料或 JSON Server。

## 頁面

| 路徑 | 頁面 | 說明 |
| --- | --- | --- |
| `/` | 首頁 | Hero、分類入口、最新上架 |
| `/products` | 商品列表 | 分類篩選、關鍵字搜尋（防抖）、排序、分頁；條件同步到網址 |
| `/products/:id` | 商品內容 | 圖片切換、數量選擇、庫存提示 |
| `/login`、`/register` | 登入 / 註冊 | 即時欄位驗證，登入後導回原頁 |
| `/cart` | 購物車 | 需登入；增減數量、移除、清空、小計與運費 |

## 狀態管理重點

- **auth store**：token 存於 `localStorage`，重新整理時以 `GET /auth/me` 還原登入狀態；token 失效時自動登出並導向登入頁。
- **cart store**：每次加入/修改/移除都呼叫 API，並以**後端回傳的完整購物車覆蓋本地狀態**，確保前後端一致；操作失敗時重新抓取購物車。
- **未登入加入購物車**：顯示提示並導向登入頁，登入/註冊後自動回到原頁面。
- **操作回饋**：Toast 通知、按鈕 loading、購物車徽章數字動畫。
- **載入 / 查無結果 / API 錯誤**：骨架屏、空狀態、錯誤訊息與「重新載入」按鈕。

## 元件結構

```
src/
├─ api/            http.js（axios 實例、攔截器）、index.js（API 函式）
├─ stores/         auth / cart / toast（Pinia）
├─ composables/    useAddToCart、useSafeRedirect
├─ router/         路由與登入守衛
├─ components/
│  ├─ layout/      AppHeader、AppFooter
│  ├─ product/     ProductCard、ProductGrid、CategoryFilter、SearchBar
│  ├─ cart/        CartItem
│  └─ common/      AppPagination、QuantityStepper、StatusMessage、LoadingSpinner、ToastContainer、AuthCard
└─ views/          Home、Products、ProductDetail、Login、Register、Cart、NotFound
```

語意標籤：`header` / `nav` / `main` / `section` / `article` / `aside` / `footer` / `figure` / `form` / `dl` / `address`。

## 本機開發

```bash
npm install
cp .env.example .env.local   # 設定 VITE_API_BASE_URL
npm run dev
```

## 部署（Vercel）

1. 匯入此 Repo，Framework 選 Vite。
2. 環境變數：`VITE_API_BASE_URL=https://<your-api>.onrender.com/api`
3. `vercel.json` 已設定 SPA rewrite（Netlify 則使用 `public/_redirects`）。
