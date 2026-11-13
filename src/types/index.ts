export type PodId = 1 | 2 | 3 | 4;

export interface PodSummary {
  id: number;
  name: string;
  sheetId: string;
  totalTasks: number;
  sourceRow2Total: number;
  totalMinutes?: number;
  sourceRow2Minutes?: number;
  activeAnnotators: number;
  totalAnnotators: number;
  hasDiscrepancy: boolean;
  allTimeTotalTasks?: number;
  allTimeTotalMinutes?: number;
}

export interface DiscrepancyInfo {
  podId: number;
  podName: string;
  date: string;
  sourceRow2Total: number;
  calculatedTotal: number;
  difference?: number;
  message?: string;
}

export interface ProductionOverview {
  date: string;
  humanDate: string;
  isAllTime?: boolean;
  grandTotal: number;
  grandTotalMinutes?: number;
  allTimeGrandTotal?: number;
  allTimeGrandTotalMinutes?: number;
  activePods: number;
  totalPods: number;
  activeAnnotators: number;
  pods: PodSummary[];
  discrepancies: DiscrepancyInfo[];
  lastUpdated: string;
  dataSourceMode: string;
}

export interface AnnotatorItem {
  id: string;
  name: string;
  podId: number;
  podName: string;
  tasksCompleted: number;
  minutesWorked?: number;
  dailyTargetMinutes?: number;
  targetMet?: boolean;
  totalTasksAllTime?: number;
  totalMinutesAllTime?: number;
  daysWorked?: number;
}

export interface AnnotatorResponse {
  date: string;
  humanDate: string;
  isAllTime?: boolean;
  podFilter: string;
  statusFilter?: 'active' | 'zero' | 'all';
  podTotalTasks: number;
  podTotalMinutes?: number;
  allTimePodTotalTasks?: number;
  allTimePodTotalMinutes?: number;
  dailyTargetMinutes?: number;
  totalMembers?: number;
  activeAnnotators: number;
  zeroTaskAnnotators?: number;
  totalListed: number;
  annotators: AnnotatorItem[];
  lastUpdated: string;
}

export interface DateItem {
  date: string;
  humanDate: string;
  grandTotal: number;
  activeAnnotators: number;
  activePods: number;
  isAllTime?: boolean;
}

export interface DailyProductionPod {
  podId: number;
  podName: string;
  totalTasks: number;
  totalMinutes?: number;
  sourceRow2Total: number;
  hasDiscrepancy: boolean;
  activeAnnotators: number;
  annotators: { name: string; tasks: number; minutes?: number }[];
}

export interface DailyProductionResponse {
  date: string;
  humanDate: string;
  isAllTime?: boolean;
  grandTotal: number;
  grandTotalMinutes?: number;
  activePods: number;
  grandActiveAnnotators: number;
  pods: DailyProductionPod[];
  lastUpdated: string;
}
