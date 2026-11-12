/**
 * AX Production — Google Apps Script Data Bridge
 * 
 * Deployment Instructions:
 * 1. Open https://script.google.com and click "New Project"
 * 2. Name it "AX Production API Bridge"
 * 3. Paste this entire code into Code.gs
 * 4. Click "Deploy" -> "New deployment"
 * 5. Select type: "Web app"
 * 6. Set Description: "AX Production Live API"
 * 7. Set "Execute as": "Me"
 * 8. Set "Who has access": "Anyone" (or Anyone within your organization)
 * 9. Click "Deploy" and authorize access when prompted
 * 10. Copy the Web app URL and set it as APPS_SCRIPT_URL in your .env or Vercel Environment Variables
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
    const taskCols = [];
    for (let c = 25; c < row1.length; c++) {
      const header = row1[c];
      const minColIdx = c - 15; // Minute column index (K is col 11, index 10)
      const minDateVal = minColIdx >= 10 ? row1[minColIdx] : null;

      let isoDate = null;
      if (minDateVal instanceof Date && !isNaN(minDateVal.getTime())) {
        isoDate = Utilities.formatDate(minDateVal, "GMT+05:30", "yyyy-MM-dd");
      } else if (header && typeof header === "string") {
        const match = header.match(/(\d{1,2})\s+([A-Za-z]{3})/i);
        if (match) {
          const day = ("0" + match[1]).slice(-2);
          const months = { jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06", jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12" };
          const m = months[match[2].toLowerCase()];
          if (m) isoDate = "2026-" + m + "-" + day;
        }
      }

      if (isoDate) {
        datesSet[isoDate] = true;
        const r2Val = Number(row2[c]) || 0;
        taskCols.push({ colIndex: c, date: isoDate, row2Total: r2Val });
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
      for (let t = 0; t < taskCols.length; t++) {
        const tCol = taskCols[t];
        const count = Number(row[tCol.colIndex]) || 0;
        tasksByDate[tCol.date] = count > 0 ? count : 0;
      }

      annotators.push({
        id: email || ("ann_" + r),
        name: name,
        email: email,
        tasksByDate: tasksByDate
      });
    }

    // Summaries & Discrepancy validation
    const summariesByDate = {};
    for (let t = 0; t < taskCols.length; t++) {
      const tCol = taskCols[t];
      const date = tCol.date;
      let calculated = 0;
      let active = 0;

      for (let a = 0; a < annotators.length; a++) {
        const c = annotators[a].tasksByDate[date] || 0;
        calculated += c;
        if (c > 0) active++;
      }

      const hasDiscrepancy = calculated !== tCol.row2Total;
      if (hasDiscrepancy) {
        result.discrepancies.push({
          podId: pod.id,
          podName: pod.name,
          date: date,
          sourceRow2Total: tCol.row2Total,
          calculatedTotal: calculated
        });
      }

      summariesByDate[date] = {
        date: date,
        totalTasks: calculated,
        sourceRow2Total: tCol.row2Total,
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
