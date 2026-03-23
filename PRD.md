# PRD: OpenRouter Usage Monitor

## 1. Overview

A static single-page web application (SPA) that allows individual team members to monitor their OpenRouter API usage. Users enter their **Management API Key** on each visit and view spend, requests, and token usage with charts and filters.

> **Key Constraint:** OpenRouter's `/api/v1/activity` and `/api/v1/credits` endpoints require a **Management Key** (not a standard inference key). The admin must issue Management Keys from [openrouter.ai/settings/management-keys](https://openrouter.ai/settings/management-keys) for each user, or users must create their own.

## 2. Deployment

| Item | Detail |
|------|--------|
| Hosting | GitHub Pages (static files only) |
| Backend | None — all API calls made directly from the browser |
| Repository | `openrouter_usage` |

## 3. Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Vanilla HTML/CSS/JS (single `index.html`) |
| Charts | Chart.js (CDN) |
| Styling | Modern CSS (responsive, card-based layout) |
| API Calls | Fetch API (browser-native) |

## 4. User Flow

```
┌─────────────────────┐
│  Landing Page        │
│  ┌───────────────┐   │
│  │ Enter API Key  │   │
│  │ [___________]  │   │
│  │ [Connect]      │   │
│  └───────────────┘   │
└─────────┬───────────┘
          │ valid key
          ▼
┌─────────────────────────────────────────┐
│  Dashboard                              │
│  ┌─────────┐ ┌──────────┐ ┌──────────┐ │
│  │ Spend   │ │ Requests │ │ Tokens   │ │
│  │ $12.34  │ │ 156      │ │ 245,000  │ │
│  └─────────┘ └──────────┘ └──────────┘ │
│                                         │
│  Filters: [Period ▼] [Model ▼]          │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  Bar Chart (daily breakdown)    │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  Usage Table (model breakdown)  │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

## 5. Features

### 5.1 API Key Input Screen
- Text input for Management API Key (masked, `type="password"`)
- "Connect" button
- Key is **NOT** stored (no localStorage/cookies) — re-entered every session
- On invalid key: show error message
- On valid key: transition to dashboard

### 5.2 Dashboard — Summary Cards
Three cards displayed horizontally (matching OpenRouter Activity UI):

| Card | Data Source | Format |
|------|-------------|--------|
| **Spend** | Sum of `usage` field | `$X.XX` |
| **Requests** | Sum of `requests` field | Comma-formatted integer |
| **Tokens** | Sum of `prompt_tokens + completion_tokens` | Comma-formatted integer |

### 5.3 Filters
| Filter | Options | Implementation |
|--------|---------|----------------|
| **Period** | 7 Days, 14 Days, 30 Days | Client-side filter on `/api/v1/activity` data (returns last 30 days) |
| **Model** | All Models, + each unique model | Client-side filter on `model` field |

### 5.4 Charts
- **Bar Chart** — Daily usage over selected period
  - X-axis: dates
  - Y-axis: switchable metric (Spend / Requests / Tokens)
  - Colored bars per model (stacked)
- Powered by Chart.js

### 5.5 Usage Table
- Breakdown by model
- Columns: Model, Spend ($), Requests, Prompt Tokens, Completion Tokens, Total Tokens
- Sorted by spend descending

### 5.6 Credits Balance
- Show remaining credits: `total_credits - total_usage` from `/api/v1/credits`
- Displayed as a badge/bar at the top of the dashboard

## 6. API Integration

### Endpoints Used

#### 1. `GET /api/v1/activity`
```
Headers: { Authorization: Bearer <MANAGEMENT_KEY> }
Response: { data: [ { date, model, usage, requests, prompt_tokens, completion_tokens, ... } ] }
```
- Returns last 30 completed UTC days
- All filtering (period, model) done client-side

#### 2. `GET /api/v1/credits`
```
Headers: { Authorization: Bearer <MANAGEMENT_KEY> }
Response: { data: { total_credits, total_usage } }
```

### CORS Consideration
- OpenRouter API supports CORS for browser requests
- If CORS is blocked, we will add a note for users to use a CORS proxy or the app will gracefully show an error

## 7. UI/UX Design

- **Theme:** Clean, white card-based layout (matching the OpenRouter Activity screenshot)
- **Responsive:** Works on desktop and mobile
- **Colors:** Neutral grays for cards, accent color for charts
- **Typography:** System font stack
- **Loading states:** Skeleton/spinner while fetching data
- **Error states:** Clear error messages for API failures

## 8. File Structure

```
openrouter_code/
├── index.html      # Single page application (HTML + CSS + JS)
├── PRD.md          # This document
└── README.md       # Setup & deployment instructions (if needed)
```

## 9. Security

- API key is never persisted (no localStorage, no cookies, no URL params)
- API key is only sent to `openrouter.ai` API endpoints via HTTPS
- No third-party analytics or tracking
- CSP headers where possible

## 10. Out of Scope

- User authentication/login system
- Backend server
- Historical data beyond 30 days (API limitation)
- Multi-user admin view
- Key management (creating/revoking keys)

## 11. Deployment Steps

1. Push code to GitHub repository
2. Enable GitHub Pages (Settings → Pages → Source: main branch)
3. Access via `https://<username>.github.io/openrouter_code/`
