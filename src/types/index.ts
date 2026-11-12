export type PodId = 1 | 2 | 3 | 4;

export interface PodSummary {
  id: number;
  name: string;
  sheetId: string;
  totalTasks: number;
  sourceRow2Total: number;
  activeAnnotators: number;
  totalAnnotators: number;
  hasDiscrepancy: boolean;
}

export interface DiscrepancyInfo {
  podId: number;
  podName: string;
  date: string;
  sourceRow2Total: number;
  calculatedTotal: number;
  message?: string;
}

export interface ProductionOverview {
  date: string;
  humanDate: string;
  grandTotal: number;
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
}

export interface AnnotatorResponse {
  date: string;
  humanDate: string;
  podFilter: string;
  podTotalTasks: number;
  activeAnnotators: number;
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
}

export interface DailyProductionPod {
  podId: number;
  podName: string;
  totalTasks: number;
  sourceRow2Total: number;
  hasDiscrepancy: boolean;
  activeAnnotators: number;
  annotators: { name: string; tasks: number }[];
}

export interface DailyProductionResponse {
  date: string;
  humanDate: string;
  grandTotal: number;
  activePods: number;
  grandActiveAnnotators: number;
  pods: DailyProductionPod[];
  lastUpdated: string;
}
