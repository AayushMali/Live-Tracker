/**
 * AX Production — Google Apps Script Data Bridge (v2 - Tasks & Minutes)
 * 
 * Deployment Instructions:
 * 1. Open https://script.google.com and open your "AX Production API Bridge" project
 * 2. Replace Code.gs with this entire code
 * 3. Click "Deploy" -> "Manage deployments" -> Click Edit (pencil icon) on active deployment
 * 4. Choose Version: "New version"
 * 5. Click "Deploy"
 */

const PODS = [
  { id: 1, name: "Pod 1", sheetId: "1vjaFLjCEY-arc_-ubwsLQYgL-0CpbvZD1WKGGsLP1ko" },
  { id: 2, name: "Pod 2", sheetId: "1g4Z_kc_Kwx22-TYr2Jy9volaIWJy3KlOi-4MchPZrP8" },
  { id: 3, name: "Pod 3", sheetId: "1LiZ3dUqo-fQ0Yc5nSAxxazQWDd6IUaOYVIXYgQGXnB4" },
  { id: 4, name: "Pod 4", sheetId: "12kymnvHA8Pc_uBA0UbrGKjffyRZIKoro1zLqFtJhsUI" }
];

function doGet(e) {
  try {
    const data = fetchAllPodsData();
    return ContentService
      .createTextOutput(JSON.stringify({ status: "success", data: data }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: err.message, stack: err.stack }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  return doGet(e);
}

function fetchAllPodsData() {
  const result = {
    timestamp: new Date().toISOString(),
    pods: {},
    allDates: [],
    discrepancies: []
  };
  
  const datesSet = {};

  for (let p = 0; p < PODS.length; p++) {
    const pod = PODS[p];
    const ss = SpreadsheetApp.openById(pod.sheetId);
    const sheet = ss.getSheetByName("Daily output");
    if (!sheet) {
      throw new Error("Sheet 'Daily output' not found in " + pod.name);
    }

    const values = sheet.getDataRange().getValues();
    if (values.length < 3) {
      continue;
    }

    const row1 = values[0];
    const row2 = values[1];
    
    // Task columns start from column Z (index 25)
    // Minute columns are columns K..X (index 10..23) corresponding to (c - 15)
    const taskCols = [];
    for (let c = 25; c < row1.length; c++) {
      const header = row1[c];
      const minColIdx = c - 15; // Minute column index (K is col 11, index 10)
      const minDateVal = minColIdx >= 10 ? row1[minColIdx] : null;

      let isoDate = null;
      const headerStr = String(header || "");
      let match = headerStr.match(/(\d{1,2})\s+([A-Za-z]{3})/i);
      
      if (!match && minDateVal) {
        if (minDateVal instanceof Date && !isNaN(minDateVal.getTime())) {
          const day = ("0" + minDateVal.getDate()).slice(-2);
          const month = ("0" + (minDateVal.getMonth() + 1)).slice(-2);
          isoDate = "2026-" + month + "-" + day;
        } else {
          match = String(minDateVal).match(/(\d{1,2})\s+([A-Za-z]{3})/i);
        }
      }
      
      if (match) {
        const day = ("0" + match[1]).slice(-2);
        const months = { jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06", jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12" };
        const m = months[match[2].toLowerCase()];
        if (m) isoDate = "2026-" + m + "-" + day;
      }

      if (isoDate) {
        datesSet[isoDate] = true;
        const r2Tasks = Number(row2[c]) || 0;
        const r2Minutes = minColIdx >= 10 ? (Number(row2[minColIdx]) || 0) : 0;
        taskCols.push({
          colIndex: c,
          minColIndex: minColIdx,
          date: isoDate,
          row2Total: r2Tasks,
          row2Minutes: r2Minutes
        });
      }
    }

    // Annotators from row index 2 (Row 3) onwards
    const annotators = [];
    for (let r = 2; r < values.length; r++) {
      const row = values[r];
      const email = String(row[0] || "").trim();
      let name = String(row[1] || "").trim();

      if (!name && !email) continue;
      if (!name && email) {
        name = email.split("@")[0].replace(/_/g, " ");
      }

      const tasksByDate = {};
      const minutesByDate = {};
      for (let t = 0; t < taskCols.length; t++) {
        const tCol = taskCols[t];
        const taskCount = Number(row[tCol.colIndex]) || 0;
        const minCount = tCol.minColIndex >= 0 ? (Number(row[tCol.minColIndex]) || 0) : 0;
        tasksByDate[tCol.date] = taskCount > 0 ? taskCount : 0;
        minutesByDate[tCol.date] = minCount > 0 ? minCount : 0;
      }

      annotators.push({
        id: email || ("ann_" + r),
        name: name,
        email: email,
        tasksByDate: tasksByDate,
        minutesByDate: minutesByDate
      });
    }

    // Summaries & Discrepancy validation
    const summariesByDate = {};
    for (let t = 0; t < taskCols.length; t++) {
      const tCol = taskCols[t];
      const date = tCol.date;
      let calculatedTasks = 0;
      let calculatedMinutes = 0;
      let active = 0;

      for (let a = 0; a < annotators.length; a++) {
        const tc = annotators[a].tasksByDate[date] || 0;
        const mc = annotators[a].minutesByDate[date] || 0;
        calculatedTasks += tc;
        calculatedMinutes += mc;
        if (tc > 0 || mc > 0) active++;
      }

      const hasDiscrepancy = calculatedTasks !== tCol.row2Total;
      if (hasDiscrepancy) {
        result.discrepancies.push({
          podId: pod.id,
          podName: pod.name,
          date: date,
          sourceRow2Total: tCol.row2Total,
          calculatedTotal: calculatedTasks
        });
      }

      summariesByDate[date] = {
        date: date,
        totalTasks: calculatedTasks,
        sourceRow2Total: tCol.row2Total,
        totalMinutes: calculatedMinutes,
        sourceRow2Minutes: tCol.row2Minutes,
        activeAnnotators: active,
        hasDiscrepancy: hasDiscrepancy
      };
    }

    result.pods[pod.id] = {
      id: pod.id,
      name: pod.name,
      sheetId: pod.sheetId,
      annotators: annotators,
      summariesByDate: summariesByDate
    };
  }

  result.allDates = Object.keys(datesSet).sort().reverse();
  return result;
}
