import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const POD_CONFIG = [
  { id: 1, name: 'Pod 1', sheetId: '1vjaFLjCEY-arc_-ubwsLQYgL-0CpbvZD1WKGGsLP1ko', fileName: 'pod1.xlsx' },
  { id: 2, name: 'Pod 2', sheetId: '1g4Z_kc_Kwx22-TYr2Jy9volaIWJy3KlOi-4MchPZrP8', fileName: 'pod2.xlsx' },
  { id: 3, name: 'Pod 3', sheetId: '1LiZ3dUqo-fQ0Yc5nSAxxazQWDd6IUaOYVIXYgQGXnB4', fileName: 'pod3.xlsx' },
  { id: 4, name: 'Pod 4', sheetId: '12kymnvHA8Pc_uBA0UbrGKjffyRZIKoro1zLqFtJhsUI', fileName: 'pod4.xlsx' }
];

/**
 * Normalizes date to YYYY-MM-DD
 */
export function normalizeDate(dateVal, fallbackHeader = '') {
  if (!dateVal && !fallbackHeader) return null;

  // If already Date object
  if (dateVal instanceof Date && !isNaN(dateVal.getTime())) {
    return dateVal.toISOString().split('T')[0];
  }

  // If object with result
  if (dateVal && typeof dateVal === 'object' && dateVal.result instanceof Date) {
    return dateVal.result.toISOString().split('T')[0];
  }

  const str = String(dateVal || fallbackHeader || '').trim();

  // Pattern like "2026-11-12"
  const isoMatch = str.match(/\b(202\d)-(\d{2})-(\d{2})\b/);
  if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;

  // Pattern like "12 Nov tasks" or "31 Oct tasks" or "12 Nov"
  const headerMatch = str.match(/(\d{1,2})\s+([A-Za-z]{3})/i);
  if (headerMatch) {
    const day = headerMatch[1].padStart(2, '0');
    const monthNames = { jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06', jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12' };
    const month = monthNames[headerMatch[2].toLowerCase()];
    if (month) {
      // Default to 2026
      return `2026-${month}-${day}`;
    }
  }

  const parsed = new Date(str);
  if (!isNaN(parsed.getTime()) && parsed.getFullYear() > 2000) {
    return parsed.toISOString().split('T')[0];
  }

  return null;
}

/**
 * Formats YYYY-MM-DD to human friendly string: "12 November 2026"
 */
export function formatHumanDate(isoDate) {
  if (!isoDate) return '';
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  const year = parts[0];
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `${day} ${months[monthIdx]} ${year}`;
}

/**
 * Parses all 4 Pod spreadsheets
 */
export async function parseAllPods(baseDir = path.resolve(__dirname, '../data/sheets')) {
  const result = {
    timestamp: new Date().toISOString(),
    pods: {},
    dates: new Set(),
    discrepancies: []
  };

  for (const pod of POD_CONFIG) {
    const filePath = path.join(baseDir, pod.fileName);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Spreadsheet file not found for ${pod.name} at ${filePath}`);
    }

    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile(filePath);

    const sheet = wb.getWorksheet('Daily output');
    if (!sheet) {
      throw new Error(`Worksheet 'Daily output' not found in ${pod.fileName}`);
    }

    const r1 = sheet.getRow(1);
    const r2 = sheet.getRow(2);

    // Identify task columns starting from Col 26 (Z) to sheet.columnCount
    const taskColumns = [];
    for (let c = 26; c <= sheet.columnCount; c++) {
      const taskHeaderCell = r1.getCell(c).value;
      const minCol = c - 15; // Corresponding minute column (11 = K for 26 = Z)
      const minDateCell = minCol >= 11 ? r1.getCell(minCol).value : null;

      let isoDate = normalizeDate(minDateCell, typeof taskHeaderCell === 'string' ? taskHeaderCell : '');
      if (!isoDate && typeof taskHeaderCell === 'string') {
        isoDate = normalizeDate(null, taskHeaderCell);
      }

      if (isoDate) {
        result.dates.add(isoDate);
        const row2Val = Number(r2.getCell(c).value) || 0;
        taskColumns.push({
          colIndex: c,
          date: isoDate,
          header: typeof taskHeaderCell === 'string' ? taskHeaderCell : `${isoDate} tasks`,
          row2Total: row2Val
        });
      }
    }

    // Parse annotators from Row 3 onwards
    const annotators = [];
    for (let r = 3; r <= sheet.rowCount; r++) {
      const row = sheet.getRow(r);
      
      let rawEmail = row.getCell(1).value;
      if (rawEmail && typeof rawEmail === 'object') {
        rawEmail = rawEmail.result !== undefined ? rawEmail.result : (rawEmail.text || '');
      }
      const email = String(rawEmail || '').trim();

      let rawName = row.getCell(2).value;
      if (rawName && typeof rawName === 'object') {
        rawName = rawName.result !== undefined ? rawName.result : (rawName.text || '');
      }
      let name = String(rawName || '').trim();

      // If no name or email, skip row
      if (!name && !email) continue;
      // If name is blank but email exists, format username
      if (!name && email) {
        name = email.split('@')[0].replace(/_/g, ' ');
      }

      const tasksByDate = {};
      for (const tCol of taskColumns) {
        const cellVal = row.getCell(tCol.colIndex).value;
        let count = 0;
        if (typeof cellVal === 'number') {
          count = cellVal;
        } else if (cellVal && typeof cellVal === 'object') {
          if (typeof cellVal.result === 'number') count = cellVal.result;
          else if (!isNaN(Number(cellVal.result))) count = Number(cellVal.result);
        } else if (typeof cellVal === 'string' && !isNaN(Number(cellVal))) {
          count = Number(cellVal);
        }
        tasksByDate[tCol.date] = count > 0 ? count : 0;
      }

      annotators.push({
        id: email || `annotator_${pod.id}_${r}`,
        name: name || `Annotator ${r}`,
        email,
        tasksByDate
      });
    }

    // Verify integrity per date for this pod
    const podDateSummaries = {};
    for (const tCol of taskColumns) {
      const date = tCol.date;
      let calculatedTotal = 0;
      let activeAnnotatorCount = 0;

      for (const ann of annotators) {
        const count = ann.tasksByDate[date] || 0;
        calculatedTotal += count;
        if (count > 0) activeAnnotatorCount++;
      }

      const discrepancy = calculatedTotal !== tCol.row2Total;
      if (discrepancy) {
        result.discrepancies.push({
          podId: pod.id,
          podName: pod.name,
          date,
          sourceRow2Total: tCol.row2Total,
          calculatedTotal,
          message: `Discrepancy detected in ${pod.name} on ${date}: Source Row 2 = ${tCol.row2Total}, Calculated Sum = ${calculatedTotal}`
        });
      }

      podDateSummaries[date] = {
        date,
        totalTasks: calculatedTotal,
        sourceRow2Total: tCol.row2Total,
        activeAnnotators: activeAnnotatorCount,
        hasDiscrepancy: discrepancy
      };
    }

    result.pods[pod.id] = {
      id: pod.id,
      name: pod.name,
      sheetId: pod.sheetId,
      annotators,
      summariesByDate: podDateSummaries
    };
  }

  // Convert Set of dates to sorted list (descending)
  result.sortedDates = Array.from(result.dates).sort((a, b) => b.localeCompare(a));
  return result;
}
