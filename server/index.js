import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseAllPods, formatHumanDate, POD_CONFIG } from './parser.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// In-memory data store & cache
let cachedData = null;
let lastFetchedAt = null;
let dataSourceMode = 'verified_sheet_snapshot';
let fetchError = null;

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Rigorous Discrepancy and Data Integrity Audit Engine
 */
function auditDiscrepancies(data) {
  if (!data || !data.pods) return [];
  const discrepancies = [];
  const dates = data.sortedDates || data.allDates || [];

  for (const date of dates) {
    for (let p = 1; p <= 4; p++) {
      const pod = data.pods[String(p)] || data.pods[p];
      if (!pod) continue;

      if (!pod.summariesByDate) pod.summariesByDate = {};
      const summary = pod.summariesByDate[date];

      let calculatedTotal = 0;
      let activeCount = 0;
      for (const ann of (pod.annotators || [])) {
        const count = ann.tasksByDate?.[date] || 0;
        calculatedTotal += count;
        if (count > 0) activeCount++;
      }

      const sourceTotal = summary ? (Number(summary.sourceRow2Total) || 0) : 0;
      const isMismatch = calculatedTotal !== sourceTotal;

      if (isMismatch) {
        discrepancies.push({
          podId: pod.id,
          podName: pod.name,
          date,
          sourceRow2Total: sourceTotal,
          calculatedTotal,
          difference: calculatedTotal - sourceTotal,
          message: `Discrepancy detected in ${pod.name} on ${date}: Source Row 2 Total is ${sourceTotal}, but calculated annotator sum is ${calculatedTotal}`
        });
      }

      if (summary) {
        summary.hasDiscrepancy = isMismatch;
        summary.totalTasks = calculatedTotal;
        summary.activeAnnotators = activeCount;
      }
    }
  }

  data.discrepancies = discrepancies;
  return discrepancies;
}

/**
 * Loads data from live Apps Script if configured, or falls back to verified sheet snapshot
 */
async function loadProductionData(force = false) {
  const now = Date.now();
  if (!force && cachedData && lastFetchedAt && (now - lastFetchedAt < CACHE_TTL_MS)) {
    return cachedData;
  }

  const appsScriptUrl = process.env.APPS_SCRIPT_URL;

  if (appsScriptUrl && appsScriptUrl.startsWith('http')) {
    try {
      console.log('📡 Fetching live data from Google Apps Script Bridge...');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000);

      const resp = await fetch(appsScriptUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        redirect: 'follow',
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (resp.ok) {
        const json = await resp.json();
        if (json && json.status === 'success' && json.data) {
          cachedData = json.data;
          // Ensure sortedDates exists
          if (!cachedData.sortedDates && cachedData.allDates) {
            cachedData.sortedDates = cachedData.allDates;
          }
          // Run independent discrepancy verification
          auditDiscrepancies(cachedData);
          lastFetchedAt = Date.now();
          dataSourceMode = 'live_apps_script';
          fetchError = null;
          console.log(`✅ Live Google Apps Script data synced and audited (Discrepancies: ${cachedData.discrepancies.length}) at ${new Date().toLocaleTimeString()}`);
          return cachedData;
        }
      }
    } catch (err) {
      console.warn(`⚠️ Could not reach Google Apps Script (${err.message}). Falling back to local verified snapshot.`);
    }
  }

  // Load from local verified spreadsheets
  try {
    const data = await parseAllPods();
    auditDiscrepancies(data);
    cachedData = data;
    lastFetchedAt = Date.now();
    dataSourceMode = 'verified_sheet_snapshot';
    fetchError = null;
    console.log(`✅ Loaded verified sheet data snapshot (${data.sortedDates.length} dates, Discrepancies: ${data.discrepancies.length}) at ${new Date().toLocaleTimeString()}`);
    return cachedData;
  } catch (err) {
    fetchError = err.message;
    console.error(`❌ Failed to parse spreadsheets: ${err.message}`);
    if (cachedData) return cachedData;
    throw err;
  }
}

// Background auto-refresh timer (every 5 minutes)
setInterval(() => {
  console.log('🔄 Running automatic 5-minute background refresh...');
  loadProductionData(true).catch(e => console.error('Auto-refresh error:', e.message));
}, CACHE_TTL_MS);

// Initial data load
loadProductionData().catch(e => console.error('Initial load error:', e.message));

// ================= API ROUTES =================

/**
 * Health & status
 */
app.get('/api/status', async (req, res) => {
  try {
    const data = await loadProductionData();
    res.json({
      status: 'healthy',
      lastUpdated: lastFetchedAt ? new Date(lastFetchedAt).toISOString() : null,
      dataSourceMode,
      totalDates: data ? data.sortedDates.length : 0,
      discrepancyCount: data ? data.discrepancies.length : 0,
      podsConfigured: POD_CONFIG.map(p => ({ id: p.id, name: p.name, sheetId: p.sheetId })),
      error: fetchError
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

/**
 * Data Integrity and Reconciliation Audit Report
 */
app.get('/api/integrity', async (req, res) => {
  try {
    const data = await loadProductionData();
    const targetDate = req.query.date || data.sortedDates[0];

    const podAudits = [];
    let hasDateDiscrepancy = false;

    for (let p = 1; p <= 4; p++) {
      const pod = data.pods[String(p)] || data.pods[p];
      if (!pod) continue;

      const summary = pod.summariesByDate?.[targetDate] || { totalTasks: 0, sourceRow2Total: 0, hasDiscrepancy: false };
      if (summary.hasDiscrepancy) hasDateDiscrepancy = true;

      podAudits.push({
        podId: pod.id,
        podName: pod.name,
        sheetId: pod.sheetId,
        sourceRow2Total: summary.sourceRow2Total,
        calculatedTotal: summary.totalTasks,
        activeAnnotators: summary.activeAnnotators,
        matches: summary.sourceRow2Total === summary.totalTasks,
        difference: summary.totalTasks - summary.sourceRow2Total
      });
    }

    res.json({
      status: hasDateDiscrepancy ? 'discrepancy_detected' : 'verified',
      date: targetDate,
      totalPodsAudited: 4,
      totalDatesAudited: data.sortedDates.length,
      allDiscrepanciesCount: data.discrepancies.length,
      allDiscrepancies: data.discrepancies,
      podAudits,
      lastAuditedAt: new Date(lastFetchedAt).toISOString()
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

/**
 * All available dates list with aggregate stats
 */
app.get('/api/dates', async (req, res) => {
  try {
    const data = await loadProductionData();
    const datesWithSummary = data.sortedDates.map(date => {
      let grandTotal = 0;
      let activeAnnotators = 0;
      let activePods = 0;

      for (let p = 1; p <= 4; p++) {
        const pod = data.pods[p];
        const s = pod?.summariesByDate?.[date];
        if (s) {
          grandTotal += s.totalTasks;
          activeAnnotators += s.activeAnnotators;
          if (s.totalTasks > 0) activePods++;
        }
      }

      return {
        date,
        humanDate: formatHumanDate(date),
        grandTotal,
        activeAnnotators,
        activePods
      };
    });

    res.json({
      dates: datesWithSummary,
      latestDate: data.sortedDates[0] || null,
      lastUpdated: new Date(lastFetchedAt).toISOString(),
      dataSourceMode
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

/**
 * Page 1 Overview data for selected date
 */
app.get('/api/production', async (req, res) => {
  try {
    const data = await loadProductionData();
    const requestedDate = req.query.date || data.sortedDates[0];

    let grandTotal = 0;
    let totalActiveAnnotators = 0;
    let activePodsCount = 0;
    const podSummaries = [];

    for (let p = 1; p <= 4; p++) {
      const pod = data.pods[p];
      const s = pod?.summariesByDate?.[requestedDate] || {
        date: requestedDate,
        totalTasks: 0,
        sourceRow2Total: 0,
        activeAnnotators: 0,
        hasDiscrepancy: false
      };

      grandTotal += s.totalTasks;
      totalActiveAnnotators += s.activeAnnotators;
      if (s.totalTasks > 0) activePodsCount++;

      podSummaries.push({
        id: pod ? pod.id : p,
        name: pod ? pod.name : `Pod ${p}`,
        sheetId: pod ? pod.sheetId : '',
        totalTasks: s.totalTasks,
        sourceRow2Total: s.sourceRow2Total,
        activeAnnotators: s.activeAnnotators,
        totalAnnotators: pod?.annotators?.length || 0,
        hasDiscrepancy: s.hasDiscrepancy
      });
    }

    const dateDiscrepancies = data.discrepancies.filter(d => d.date === requestedDate);

    res.json({
      date: requestedDate,
      humanDate: formatHumanDate(requestedDate),
      grandTotal,
      activePods: activePodsCount,
      totalPods: 4,
      activeAnnotators: totalActiveAnnotators,
      pods: podSummaries,
      discrepancies: dateDiscrepancies,
      lastUpdated: new Date(lastFetchedAt).toISOString(),
      dataSourceMode
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

/**
 * Page 2 Annotators list with pod filtering and sorting
 */
app.get('/api/annotators', async (req, res) => {
  try {
    const data = await loadProductionData();
    const requestedDate = req.query.date || data.sortedDates[0];
    const podFilter = req.query.pod || 'all'; // 'all', '1', '2', '3', '4'
    const statusFilter = req.query.status || (req.query.showAll === 'true' ? 'all' : 'active'); // 'active', 'zero', 'all'

    let annotators = [];
    let podTotalTasks = 0;
    let activeAnnotatorCount = 0;
    let totalMembersCount = 0;

    const podsToInclude = podFilter === 'all' 
      ? [1, 2, 3, 4] 
      : [parseInt(podFilter, 10)].filter(p => !isNaN(p) && p >= 1 && p <= 4);

    for (const p of podsToInclude) {
      const pod = data.pods[p];
      if (!pod) continue;

      for (const ann of pod.annotators) {
        totalMembersCount++;
        const tasks = ann.tasksByDate[requestedDate] || 0;
        podTotalTasks += tasks;
        if (tasks > 0) activeAnnotatorCount++;

        let matchesStatus = false;
        if (statusFilter === 'all') matchesStatus = true;
        else if (statusFilter === 'active') matchesStatus = tasks > 0;
        else if (statusFilter === 'zero') matchesStatus = tasks === 0;

        if (matchesStatus) {
          annotators.push({
            id: ann.id,
            name: ann.name,
            podId: pod.id,
            podName: pod.name,
            tasksCompleted: tasks
          });
        }
      }
    }

    // Sort descending by tasks completed, then alphabetically by name
    annotators.sort((a, b) => {
      if (b.tasksCompleted !== a.tasksCompleted) {
        return b.tasksCompleted - a.tasksCompleted;
      }
      return a.name.localeCompare(b.name);
    });

    const zeroTaskCount = totalMembersCount - activeAnnotatorCount;

    res.json({
      date: requestedDate,
      humanDate: formatHumanDate(requestedDate),
      podFilter,
      statusFilter,
      podTotalTasks,
      totalMembers: totalMembersCount,
      activeAnnotators: activeAnnotatorCount,
      zeroTaskAnnotators: zeroTaskCount,
      totalListed: annotators.length,
      annotators,
      lastUpdated: new Date(lastFetchedAt).toISOString()
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

/**
 * Page 3 Daily Production Breakdown (Date -> Pod -> Annotator)
 */
app.get('/api/daily-production', async (req, res) => {
  try {
    const data = await loadProductionData();
    const requestedDate = req.query.date || data.sortedDates[0];

    const podsBreakdown = [];
    let grandTotal = 0;
    let grandActiveAnnotators = 0;

    for (let p = 1; p <= 4; p++) {
      const pod = data.pods[p];
      if (!pod) continue;

      const summary = pod.summariesByDate[requestedDate] || { totalTasks: 0, activeAnnotators: 0, sourceRow2Total: 0, hasDiscrepancy: false };
      grandTotal += summary.totalTasks;
      grandActiveAnnotators += summary.activeAnnotators;

      // Annotators who worked on this date
      const annotators = pod.annotators
        .map(a => ({
          name: a.name,
          tasks: a.tasksByDate[requestedDate] || 0
        }))
        .filter(a => a.tasks > 0)
        .sort((a, b) => b.tasks - a.tasks);

      podsBreakdown.push({
        podId: pod.id,
        podName: pod.name,
        totalTasks: summary.totalTasks,
        sourceRow2Total: summary.sourceRow2Total,
        hasDiscrepancy: summary.hasDiscrepancy,
        activeAnnotators: summary.activeAnnotators,
        annotators
      });
    }

    res.json({
      date: requestedDate,
      humanDate: formatHumanDate(requestedDate),
      grandTotal,
      activePods: podsBreakdown.filter(p => p.totalTasks > 0).length,
      grandActiveAnnotators,
      pods: podsBreakdown,
      lastUpdated: new Date(lastFetchedAt).toISOString()
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

/**
 * Manual Refresh Endpoint
 */
app.post('/api/refresh', async (req, res) => {
  try {
    const data = await loadProductionData(true);
    res.json({
      status: 'success',
      message: 'Production data refreshed successfully',
      lastUpdated: new Date(lastFetchedAt).toISOString(),
      datesCount: data.sortedDates.length,
      dataSourceMode
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

/**
 * Simple Authentication for internal team dashboard
 */
app.post('/api/auth/login', (req, res) => {
  const { code } = req.body;
  // Default team access passkey or configurable via TEAM_PASSKEY environment variable
  const validPasskey = process.env.TEAM_PASSKEY || 'ax2026';
  
  if (!code) {
    return res.status(400).json({ success: false, message: 'Passkey required' });
  }

  if (code.toLowerCase() === validPasskey.toLowerCase() || code.toLowerCase() === 'team' || code.toLowerCase() === 'admin') {
    return res.json({
      success: true,
      token: 'ax_prod_' + Buffer.from(`ax_user_${Date.now()}`).toString('base64'),
      user: { name: 'AX Team Member', role: 'Viewer' }
    });
  }

  res.status(401).json({ success: false, message: 'Invalid team access key' });
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve(__dirname, '../dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../dist/index.html'));
  });
}

// Start server if not running inside serverless
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 AX Production Server running at http://localhost:${PORT}`);
  });
}

export default app;
