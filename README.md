# Personal OS

**Action-Oriented Personal OS** — 第二大腦 × 行動流水線

Personal OS 是一款本地優先（Local-First）的個人營運儀表板 PWA，結合快速捕捉、語音指令、任務管理、學習筆記、Obsidian Wiki 同步與 Google 日曆，幫你把想法快速轉化為可執行的行動。

**線上預覽：** https://mantam0404.github.io/PersonalOS/

---

## 核心理念

| 原則 | 說明 |
|------|------|
| **零阻力捕捉** | 文字、語音、行動快捷指令，2 秒內記錄想法 |
| **本地優先** | 所有資料存於 IndexedDB（Dexie），離線可用，無需後端資料庫 |
| **行動導向** | 捕捉 → 分類 → 待辦 / 筆記，而非純粹存檔 |
| **知識回流** | Wiki 同步 + RAG 問答，讓筆記可被檢索與運用 |
| **今日聚焦** | Bento 儀表板突出今天最重要的事 |

---

## 功能總覽

### 今日（Today Dashboard）

以 Vercel 風格 Bento Grid 呈現的每日指揮中心：

- **快速捕捉** — 內嵌搜尋列 + `⌘K` / `Ctrl+K` 全螢幕閃電輸入
- **到期待辦** — 今日到期與逾期任務提醒
- **今日重點** — 最多 3 個 Daily Highlight 星標任務
- **今日待辦** — 一般待辦清單，一鍵完成
- **已完成** — 當日完成的任務回顧
- **習慣追蹤** — 例行事项 + 連續天數圖表
- **Google 日曆** — 今日行程（OAuth 連接）
- **滑落提醒** — 超過 N 天未更新的任務 / 專案 / 筆記（天數可配置）
- **領域概況** — 各 Domain 的待辦、專案、滑落統計
- **每日復現** — 從重點筆記中隨機復習（間隔重複概念）

### 捕捉（Capture Pipeline）

- **文字捕捉** — 快速輸入框，AI 自動分類（待辦 vs 筆記）
- **語音捕捉** — Web Speech API（繁中 `zh-TW`），支援語音動作引擎
- **收件匣** — 待處理 / 已歸檔，手動或自動轉化為待辦 / 筆記
- **待確認語音指令** — 模糊匹配時進入確認佇列，選擇正確目標後執行
- **整合設定** — Capture Token、Bridge 端點、滑落天數、iOS 快捷指令說明

### 語音動作引擎（Voice Action Engine）

語音輸入不只存文字，還能直接執行動作：

| 指令範例 | 動作 |
|----------|------|
| 「新增待辦明天買牛奶」 | 建立待辦（含相對日期解析） |
| 「完成報告」 | 模糊匹配並完成待辦 |
| 「日誌：今天學了 React」 | 建立日誌筆記 |
| 「花了 2 小時在 Personal OS 專案」 | 記錄專案工時 |
| 「筆記：React hooks 原理」 | 建立學習筆記 |

- 本地中文啟發式解析，可選 `VITE_LLM_API_URL` 升級為 LLM 解析
- 執行結果寫入**通知中心**，支援一鍵復原（Undo）

### 學習（Study Library）

- 支援類型：**筆記、書籍、文章、金句、重點、日誌**
- Markdown 渲染、標籤（`#標籤`）自動提取
- 書籍自動抓取 **Open Library** 封面
- 選取文字 → 建立**金句註解**
- 選取文字 / 全文 → 一鍵轉為待辦
- 筆記關聯（標籤匹配 + 手動連結）
- 設為「每日復現重點」

### Wiki（Obsidian 整合）

- 透過本地 **Obsidian Bridge** 同步 vault 筆記至 IndexedDB
- 增量同步（`since` mtime）、wikilink 圖譜儲存
- **向筆記提問** — RAG 式問答（本地關鍵字檢索 + 可選 LLM）
- 詳見 [`bridge/README.md`](bridge/README.md)

### 領域（Domains & Projects）

- 預設三個領域：**工作、生活、自我提升**（可自訂名稱與顏色）
- 專案看板（依領域分組）
- 專案詳情：里程碑 + 檢查清單 + 關聯待辦
- 專案活動日誌（語音記錄工時）

### 通知中心

- Navbar 鈴鐺圖示 + 未讀計數
- 記錄語音動作、自動轉化等操作
- 支援復原（Undo）最近動作

### 其他

- **PWA** — 可安裝至桌面 / 手機主畫面，離線快取
- **深 / 淺色主題** — 一鍵切換，偏好存於 localStorage
- **備份 / 還原** — 匯出 / 匯入全部 17 張資料表（JSON）
- **行動捕捉** — iOS 快捷指令 POST 至 Bridge，App 自動輪詢同步

---

## 技術架構

```
┌─────────────────────────────────────────────────────┐
│  React 19 + Vite 8 + Tailwind CSS 4 + React Router 7 │
│  Dexie 4 (IndexedDB) · dexie-react-hooks             │
│  vite-plugin-pwa (Workbox)                           │
└───────────────┬─────────────────────────────────────┘
                │
    ┌───────────┼───────────┐
    │           │           │
┌───▼───┐  ┌───▼───┐  ┌────▼────┐
│  AI   │  │ Bridge│  │ Google  │
│ (可選) │  │ :8787 │  │ Calendar│
└───────┘  └───────┘  └─────────┘
  LLM API   Obsidian    OAuth GIS
  本地fallback  Vault     readonly
```

### 技術棧

| 層級 | 技術 |
|------|------|
| 前端 | React 19、React Router 7、Tailwind CSS 4 |
| 建置 | Vite 8、vite-plugin-pwa |
| 資料 | Dexie 4（IndexedDB）、dexie-react-hooks |
| UI | lucide-react、react-markdown、Geist 字體 |
| 設計 | Vercel Design System（自訂 token + Bento Grid） |
| Bridge | Node.js 原生 HTTP（無額外依賴） |
| 部署 | GitHub Actions → `gh-pages` 分支 |

### 資料模型（Dexie v4）

| 資料表 | 用途 |
|--------|------|
| `inbox` | 捕捉收件匣 |
| `tasks` | 待辦（含 dueDate、parentTaskId、Daily Highlight） |
| `projects` | 專案 |
| `domains` | 領域 |
| `routines` | 習慣 / 例行 |
| `studyItems` | 學習筆記 |
| `studyLinks` | 筆記關聯 |
| `milestones` | 專案里程碑 |
| `checklistItems` | 里程碑檢查清單 |
| `wikiNotes` | Obsidian 同步筆記 |
| `wikiLinks` | Wikilink 圖譜 |
| `wikiSyncState` | Wiki 同步狀態 |
| `notifications` | 操作通知 |
| `pendingCaptures` | 待確認語音指令 |
| `activityLog` | 專案活動 / 工時 |
| `appSettings` | 應用設定（Capture Token、滑落天數） |
| `quoteAnnotations` | 金句註解 |

---

## 快速開始

### 前置需求

- Node.js 22+
- npm

### 本地開發

```bash
git clone https://github.com/mantam0404/PersonalOS.git
cd PersonalOS
npm install

# 複製環境變數（Google 日曆等可選）
cp .env.example .env

npm run dev
# → http://localhost:5173
```

### 啟動 Obsidian Bridge（Wiki 功能）

```bash
# 終端 1：Bridge 服務
npm run bridge
# → http://localhost:8787

# 終端 2：前端 dev server
npm run dev
```

使用自己的 vault：

```bash
OBSIDIAN_VAULT_PATH=/path/to/your/vault npm run bridge
```

### 建置

```bash
npm run build          # 一般建置
npm run build:gh-pages # GitHub Pages（base path /PersonalOS/）
npm run preview        # 預覽建置結果
```

---

## 環境變數

複製 `.env.example` 為 `.env` 並按需設定：

| 變數 | 必填 | 說明 |
|------|------|------|
| `VITE_GOOGLE_CLIENT_ID` | 可選 | Google Calendar OAuth Client ID |
| `VITE_OBSIDIAN_BRIDGE_URL` | 可選 | Bridge 位址，預設 `http://localhost:8787` |
| `VITE_LLM_API_URL` | 可選 | LLM API（分類、語音解析、Wiki 問答） |
| `VITE_WHISPER_API_URL` | 可選 | Whisper 語音轉文字（預留接口） |
| `VITE_CALENDAR_API_URL` | 可選 | 替代日曆 API（預留接口） |

Bridge 伺服器端（非 Vite 前缀）：

| 變數 | 預設 | 說明 |
|------|------|------|
| `OBSIDIAN_VAULT_PATH` | `fixtures/sample-vault` | Vault 目錄 |
| `OBSIDIAN_BRIDGE_PORT` | `8787` | HTTP 端口 |
| `OBSIDIAN_BRIDGE_API_KEY` | _(空)_ | 可選 API Key |
| `CAPTURE_TOKEN` | _(空)_ | 行動捕捉 Bearer Token |

---

## 可用指令

| 指令 | 說明 |
|------|------|
| `npm run dev` | 本地開發伺服器 |
| `npm run build` | 生產建置 |
| `npm run build:gh-pages` | GitHub Pages 建置 |
| `npm run preview` | 預覽建置 |
| `npm run lint` | oxlint 靜態檢查 |
| `npm run bridge` | 啟動 Obsidian Bridge |
| `npm run bridge:validate` | 驗證 vault 解析器（Phase 0） |
| `npm run bridge:test-api` | 驗證 Bridge API（Phase 1） |
| `npm run bridge:test-capture` | 驗證行動捕捉 API（Phase D） |
| `npm run test:voice-parser` | 語音解析器煙霧測試 |
| `npm run test:calendar` | 日曆整合測試 |

---

## 部署（GitHub Pages）

```
push 到 main
    ↓
GitHub Actions（.github/workflows/deploy.yml）
    ↓
build（BASE_PATH=/PersonalOS/）→ 推送到 gh-pages 分支
    ↓
https://mantam0404.github.io/PersonalOS/
```

- **自動部署：** 每次 push 到 `main` 觸發
- **手動部署指定分支：** Actions → Deploy to GitHub Pages → Run workflow → 填入分支名

---

## 專案結構

```
PersonalOS/
├── src/
│   ├── views/           # 頁面（Today, Capture, Study, Wiki, Domains）
│   ├── components/      # UI 元件（today/, capture/, study/, wiki/, …）
│   ├── db/              # Dexie schema、constants、data services
│   ├── services/        # AI、語音、日曆、Bridge client、action executor
│   ├── hooks/           # React hooks（live query、PWA、wiki）
│   ├── context/         # 主題、Toast
│   └── styles/          # Vercel design tokens、globals（Bento grid）
├── bridge/              # Obsidian Bridge（Node HTTP server）
│   ├── src/vault/       # Markdown 解析、vault 掃描
│   ├── fixtures/        # 範例 vault（10 篇筆記）
│   └── scripts/         # 驗證腳本
├── design-systems/      # Vercel 設計系統文件
├── scripts/             # 測試腳本
├── public/              # 靜態資源、PWA icons
└── .github/workflows/   # CI / GitHub Pages 部署
```

---

## 設計系統

UI 基於 [Vercel Design System](https://github.com/nexu-io/open-design)，主要特色：

- **Bento Grid** — 今日頁 12 欄響應式卡片佈局
- **Vercel Nav** — 毛玻璃頂部導航 + 底部分頁（行動裝置）
- **Design Tokens** — `--accent`、`--surface`、`--border` 等 CSS 變數
- **深 / 淺色主題** — `vercel-tokens.css` + `vercel-theme.css`

詳細規範見 [`design-systems/vercel/DESIGN.md`](design-systems/vercel/DESIGN.md)。

---

## 已知限制

- **Bridge 為本地服務** — GitHub Pages 版無法直接連線 Bridge，Wiki 同步需在本機或區網使用
- **LLM / Whisper** — 可選功能，未配置時使用本地 fallback
- **雲端同步** — 接口已預留（`useSyncData`），尚未實作
- **Google 日曆** — 需在 Google Cloud Console 設定 JavaScript Origins

---

## 授權

Apache License 2.0 — 見 [LICENSE](LICENSE)
