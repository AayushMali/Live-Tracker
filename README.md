# AX Production — Internal Production Dashboard

AX Production is a high-performance, dark-themed internal production monitoring web application engineered for team leads, reviewers, and management to track daily annotation output across all 4 production pods.

---

## Key Features

1. **Production Overview (Page 1)**:
   - Real-time grand total of tasks completed across all pods.
   - Number of active pods and active annotators.
   - Individual Pod production cards with task counts, active member counts, and percentage share progress bars.
   - Quick date selector switching between historical dates.
   - Automatic discrepancy detection comparing calculated annotator sums with source sheet Row 2 totals.

2. **Annotator Production (Page 2)**:
   - Dedicated table listing actual annotator names (no email IDs).
   - Pod filter buttons (`All Pods`, `Pod 1`, `Pod 2`, `Pod 3`, `Pod 4`).
   - Sorted in descending order by tasks completed.
   - Live search filter by annotator name.
   - Display toggle between Active Only (tasks > 0) and All Annotators.
   - Selected Pod summary banner showing total tasks and active annotators.

3. **Daily Production History (Page 3)**:
   - Date-wise breakdown grouped strictly by `Date → Pod → Individual Annotator`.
   - Collapsible pod accordions showing each pod's active annotators and their exact task counts.
   - Full 14-day chronological production history table with one-click date inspection.
   - Data integrity verification tags confirming 100% agreement with source sheets.

4. **Security & Access Control**:
   - Internal team access passkey gate (`ax2026`).
   - Zero credential leakage: spreadsheet IDs, tokens, and credentials are handled strictly server-side.
   - Read-only interface preventing any accidental modifications to the source Google Sheets.

5. **Live Data Integration & Automatic Updates**:
   - Automatic background polling every 5 minutes.
   - Manual instant refresh button with animated spinner.
   - Multi-tier live integration supporting Google Apps Script bridge (`google-apps-script/Code.gs`), Google Sheets API, and verified local snapshot sync.
   - Dynamic detection of newly added date columns (Column AN, AO, etc.) without requiring code changes.

---

## Source Structure & Column Verification

As required, the column structure of the source spreadsheets has been thoroughly inspected and verified:

- **Columns K to X**: *Minutes of video per day* (`IF(...)/1800`). These represent duration metrics and **are not** task counts.
- **Column Y**: Section separator (`Tasks logged per day →`).
- **Columns Z onwards (Column 26+)**: *Task counts per day* (`COUNTIFS(...)` / `MAKEARRAY(...)`).
  - Column Z: 30 Oct tasks
  - Column AA: 31 Oct tasks
  - ...
  - Column AM: 12 Nov tasks
- **Row 1**: Date headers (mapped via `minCol = colIndex - 15` or date string).
- **Row 2**: Pod totals (`MAP(...)`).
- **Row 3+**: Annotator records (Col A: Email, Col B: Full Name, Col Z+: Task Counts).

### 12 November 2026 Source Verification:
- **Pod 1**: 8 tasks (Vaishnavi Chavan: 4, Victor Johnson: 2, Sanika Maind: 1, Siddhi Sonawane: 1)
- **Pod 2**: 25 tasks (Soundarya Adaskar: 15, Krishna Choudhary: 6, Sumeet Gupta: 4)
- **Pod 3**: 27 tasks (Rutuja Sonde: 10, Amruta Janbhor: 7, Sandesh Jiwtode: 3, Shraavani Salunkhe: 3, Bhairavi Deshmukh: 2, Kirti More: 1, Preeti Bhoj: 1)
- **Pod 4**: 5 tasks (Siddharth Tripathi: 2, Priya: 1, Rahat: 1, Sabiha: 1)
- **Grand Total (12 Nov)**: **65 tasks** across 18 active annotators (0 discrepancies with Row 2).

---

## Quick Start (Local Development)

```bash
# 1. Install dependencies
npm install

# 2. Build frontend
npm run build

# 3. Start development server (both API server and Vite dev frontend)
npm start
```

- Web App: `http://localhost:3000` (or `http://localhost:3001` for production build)
- Team Passkey: `ax2026`

---

## Deploying to Vercel

This repository is pre-configured for one-click Vercel deployment:

1. Push this repository to GitHub or GitLab.
2. In the Vercel Dashboard, click **New Project** and select this repo.
3. In **Environment Variables**, set:
   - `TEAM_PASSKEY`: (optional, defaults to `ax2026`)
   - `APPS_SCRIPT_URL`: (optional, if using the Google Apps Script Webhook)
4. Click **Deploy**. Vercel will build the frontend and serve `/api/*` via serverless functions defined in `api/index.js` and `vercel.json`.

---

## Deploying Google Apps Script Bridge (Optional Live Cloud Sync)

To have Vercel pull directly from private Google Sheets without creating Google Cloud Service Accounts:

1. Open [Google Apps Script](https://script.google.com) and create a **New Project**.
2. Copy the code from `google-apps-script/Code.gs` and paste it into the editor.
3. Click **Deploy > New deployment**.
4. Select **Web app**, set:
   - **Execute as**: `Me`
   - **Who has access**: `Anyone` (or within your Google Workspace)
5. Copy the generated Web App URL and add it to `.env` or Vercel Environment Variables as `APPS_SCRIPT_URL`.
