import React from 'react';
import {
  CheckCircle,
  TrendingUp,
  Users,
  Layers,
  ArrowUpRight,
  AlertTriangle,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { ProductionOverview } from '../types';

interface OverviewPageProps {
  overview: ProductionOverview | null;
  isLoading: boolean;
  onNavigateToPod: (podId: string) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  overview,
  isLoading,
  onNavigateToPod,
}) => {
  if (isLoading || !overview) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#9DDB00] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-mono text-[#9CA8BD]">Loading production data...</span>
        </div>
      </div>
    );
  }

  const {
    date,
    humanDate,
    grandTotal,
    activePods,
    totalPods,
    activeAnnotators,
    pods,
    discrepancies,
  } = overview;

  return (
    <div className="space-y-6">
      {/* Discrepancy Alert Banner (if any) */}
      {discrepancies && discrepancies.length > 0 && (
        <div className="p-4 rounded-xl bg-orange-950/40 border border-[#FF9B52]/40 flex items-start space-x-3 text-xs text-[#FF9B52]">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-[#FF9B52]" />
          <div>
            <div className="font-semibold text-sm">Data Integrity Warning</div>
            <div className="mt-1 space-y-1 text-[#F4F6FB]/90">
              {discrepancies.map((d, i) => (
                <div key={i}>
                  • {d.podName}: Source sheet Row 2 total is{' '}
                  <strong className="text-[#FF9B52]">{d.sourceRow2Total}</strong>, but calculated
                  sum of individual annotators is{' '}
                  <strong className="text-[#9DDB00]">{d.calculatedTotal}</strong>. (Logged for inspection)
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Top Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#F4F6FB]">Production Overview</h2>
          <p className="text-xs text-[#9CA8BD] mt-1">
            Real-time daily output summary for <span className="text-[#F4F6FB] font-medium">{humanDate}</span>
          </p>
        </div>
      </div>

      {/* Top 3 High-Level Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric 1: Total Tasks Completed */}
        <div className="p-5 rounded-2xl bg-[#20283D] border border-[#2A3650] relative overflow-hidden group hover:border-[#9DDB00]/40 transition-colors">
          <div className="flex items-center justify-between text-xs font-semibold text-[#9CA8BD] uppercase tracking-wider mb-2">
            <span>Total Tasks Completed</span>
            <div className="w-8 h-8 rounded-lg bg-[#9DDB00]/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-[#9DDB00]" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="font-mono text-4xl sm:text-5xl font-extrabold text-[#9DDB00]">
              {grandTotal.toLocaleString()}
            </span>
            <span className="text-xs text-[#9CA8BD] font-medium">tasks</span>
          </div>
          <div className="mt-3 flex items-center space-x-2 text-[11px] text-[#9CA8BD]">
            <CheckCircle className="w-3.5 h-3.5 text-[#9DDB00]" />
            <span>Combined production across all 4 pods</span>
          </div>
        </div>

        {/* Metric 2: Active Pods */}
        <div className="p-5 rounded-2xl bg-[#20283D] border border-[#2A3650] relative overflow-hidden group hover:border-[#5689FF]/40 transition-colors">
          <div className="flex items-center justify-between text-xs font-semibold text-[#9CA8BD] uppercase tracking-wider mb-2">
            <span>Active Pods</span>
            <div className="w-8 h-8 rounded-lg bg-[#5689FF]/10 flex items-center justify-center">
              <Layers className="w-4 h-4 text-[#5689FF]" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="font-mono text-4xl sm:text-5xl font-extrabold text-[#5689FF]">
              {activePods}
            </span>
            <span className="text-sm text-[#9CA8BD] font-medium">/ {totalPods} pods</span>
          </div>
          <div className="mt-3 flex items-center space-x-2 text-[11px] text-[#9CA8BD]">
            <span className="w-2 h-2 rounded-full bg-[#5689FF]"></span>
            <span>Pods with tasks logged on {humanDate}</span>
          </div>
        </div>

        {/* Metric 3: Active Annotators */}
        <div className="p-5 rounded-2xl bg-[#20283D] border border-[#2A3650] relative overflow-hidden group hover:border-[#FF9B52]/40 transition-colors">
          <div className="flex items-center justify-between text-xs font-semibold text-[#9CA8BD] uppercase tracking-wider mb-2">
            <span>Active Annotators</span>
            <div className="w-8 h-8 rounded-lg bg-[#FF9B52]/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-[#FF9B52]" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="font-mono text-4xl sm:text-5xl font-extrabold text-[#FF9B52]">
              {activeAnnotators}
            </span>
            <span className="text-xs text-[#9CA8BD] font-medium">members</span>
          </div>
          <div className="mt-3 flex items-center space-x-2 text-[11px] text-[#9CA8BD]">
            <span className="w-2 h-2 rounded-full bg-[#FF9B52]"></span>
            <span>Completed ≥ 1 task on this date</span>
          </div>
        </div>
      </div>

      {/* Individual Pod Production Cards Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold tracking-wider text-[#9CA8BD] uppercase">
            Pod Production Breakdown
          </h3>
          <span className="text-xs text-[#9CA8BD]">Click any pod to inspect annotators</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {pods.map((pod) => {
            // Calculate percentage share of the day's total tasks
            const percentage = grandTotal > 0 ? Math.round((pod.totalTasks / grandTotal) * 100) : 0;

            return (
              <div
                key={pod.id}
                onClick={() => onNavigateToPod(String(pod.id))}
                className="p-5 rounded-2xl bg-[#20283D] border border-[#2A3650] hover:border-[#9DDB00]/50 cursor-pointer transition-all hover:bg-[#20283D]/80 hover:shadow-xl group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#9DDB00]"></span>
                      <h4 className="font-bold text-base text-[#F4F6FB] group-hover:text-[#9DDB00] transition-colors">
                        {pod.name}
                      </h4>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-[#9CA8BD] group-hover:text-[#9DDB00] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </div>

                  {/* Tasks count in lime green */}
                  <div className="space-y-1">
                    <div className="flex items-baseline space-x-1.5">
                      <span className="font-mono text-3xl font-extrabold text-[#9DDB00]">
                        {pod.totalTasks.toLocaleString()}
                      </span>
                      <span className="text-xs text-[#9CA8BD] font-medium">tasks</span>
                    </div>
                    <p className="text-[11px] text-[#9CA8BD]">
                      <strong className="text-[#F4F6FB] font-semibold">{pod.activeAnnotators}</strong>{' '}
                      annotator{pod.activeAnnotators === 1 ? '' : 's'} completed tasks
                    </p>
                  </div>
                </div>

                {/* Minimal production progress indicator */}
                <div className="mt-5 pt-4 border-t border-[#2A3650]/60">
                  <div className="flex items-center justify-between text-[11px] text-[#9CA8BD] mb-1.5">
                    <span>Pod Share</span>
                    <span className="font-mono font-semibold text-[#F4F6FB]">{percentage}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#191F30] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#9DDB00] rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
