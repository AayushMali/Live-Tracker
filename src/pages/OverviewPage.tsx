import React from 'react';
import {
  CheckCircle,
  TrendingUp,
  Users,
  Layers,
  ArrowUpRight,
  AlertTriangle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { ProductionOverview } from '../types';

interface OverviewPageProps {
  overview: ProductionOverview | null;
  isLoading: boolean;
  onNavigateToPod: (podId: string) => void;
  onOpenIntegrityModal?: () => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  overview,
  isLoading,
  onNavigateToPod,
  onOpenIntegrityModal,
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
    grandTotalMinutes,
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

      {/* Top 4 High-Level Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Tasks Completed */}
        <div className="p-5 rounded-2xl bg-[#20283D] border border-[#2A3650] relative overflow-hidden group hover:border-[#9DDB00]/40 transition-colors">
          <div className="flex items-center justify-between text-xs font-semibold text-[#9CA8BD] uppercase tracking-wider mb-2">
            <span>{overview.isAllTime ? 'All-Time Tasks' : 'Tasks Completed'}</span>
            <div className="w-8 h-8 rounded-lg bg-[#9DDB00]/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-[#9DDB00]" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="font-mono text-3xl sm:text-4xl font-extrabold text-[#9DDB00]">
              {grandTotal.toLocaleString()}
            </span>
            <span className="text-xs text-[#9CA8BD] font-medium">tasks</span>
          </div>
          {overview.allTimeGrandTotal !== undefined && !overview.isAllTime ? (
            <div className="mt-2.5 pt-2 border-t border-[#2A3650]/60 flex items-center justify-between text-[11px] font-mono">
              <span className="text-[#9CA8BD]">All-Time Total:</span>
              <span className="text-[#F4F6FB] font-semibold">{overview.allTimeGrandTotal.toLocaleString()} tasks</span>
            </div>
          ) : (
            <div className="mt-3 flex items-center space-x-2 text-[11px] text-[#9CA8BD]">
              <CheckCircle className="w-3.5 h-3.5 text-[#9DDB00]" />
              <span>All 4 pods combined</span>
            </div>
          )}
        </div>

        {/* Metric 2: Total Minutes Logged */}
        <div className="p-5 rounded-2xl bg-[#20283D] border border-[#2A3650] relative overflow-hidden group hover:border-[#5689FF]/40 transition-colors">
          <div className="flex items-center justify-between text-xs font-semibold text-[#9CA8BD] uppercase tracking-wider mb-2">
            <span>{overview.isAllTime ? 'All-Time Minutes' : 'Video Minutes'}</span>
            <div className="w-8 h-8 rounded-lg bg-[#5689FF]/10 flex items-center justify-center">
              <Clock className="w-4 h-4 text-[#5689FF]" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="font-mono text-3xl sm:text-4xl font-extrabold text-[#5689FF]">
              {(grandTotalMinutes || 0).toLocaleString()}
            </span>
            <span className="text-xs text-[#9CA8BD] font-medium">mins</span>
          </div>
          {overview.allTimeGrandTotalMinutes !== undefined && !overview.isAllTime ? (
            <div className="mt-2.5 pt-2 border-t border-[#2A3650]/60 flex items-center justify-between text-[11px] font-mono">
              <span className="text-[#9CA8BD]">All-Time Total:</span>
              <span className="text-[#5689FF] font-semibold">{(overview.allTimeGrandTotalMinutes || 0).toLocaleString()} mins</span>
            </div>
          ) : (
            <div className="mt-3 flex items-center space-x-2 text-[11px] text-[#9CA8BD]">
              <span className="w-2 h-2 rounded-full bg-[#5689FF]"></span>
              <span>Target: 100m / annotator</span>
            </div>
          )}
        </div>

        {/* Metric 3: Active Pods */}
        <div className="p-5 rounded-2xl bg-[#20283D] border border-[#2A3650] relative overflow-hidden group hover:border-[#FF9B52]/40 transition-colors">
          <div className="flex items-center justify-between text-xs font-semibold text-[#9CA8BD] uppercase tracking-wider mb-2">
            <span>Active Pods</span>
            <div className="w-8 h-8 rounded-lg bg-[#FF9B52]/10 flex items-center justify-center">
              <Layers className="w-4 h-4 text-[#FF9B52]" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="font-mono text-3xl sm:text-4xl font-extrabold text-[#FF9B52]">
              {activePods}
            </span>
            <span className="text-sm text-[#9CA8BD] font-medium">/ {totalPods} pods</span>
          </div>
          <div className="mt-3 flex items-center space-x-2 text-[11px] text-[#9CA8BD]">
            <span className="w-2 h-2 rounded-full bg-[#FF9B52]"></span>
            <span>With logged activity</span>
          </div>
        </div>

        {/* Metric 4: Active Annotators */}
        <div className="p-5 rounded-2xl bg-[#20283D] border border-[#2A3650] relative overflow-hidden group hover:border-[#9DDB00]/40 transition-colors">
          <div className="flex items-center justify-between text-xs font-semibold text-[#9CA8BD] uppercase tracking-wider mb-2">
            <span>Active Annotators</span>
            <div className="w-8 h-8 rounded-lg bg-[#9DDB00]/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-[#9DDB00]" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="font-mono text-3xl sm:text-4xl font-extrabold text-[#F4F6FB]">
              {activeAnnotators}
            </span>
            <span className="text-xs text-[#9CA8BD] font-medium">members</span>
          </div>
          <div className="mt-3 flex items-center space-x-2 text-[11px] text-[#9CA8BD]">
            <span className="w-2 h-2 rounded-full bg-[#9DDB00]"></span>
            <span>Logged tasks or minutes</span>
          </div>
        </div>
      </div>

      {/* Discrepancy & Reconciliation Status Bar */}
      <div className="p-4 rounded-2xl bg-[#191F30] border border-[#2A3650] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            discrepancies.length > 0
              ? 'bg-[#FF9B52]/10 text-[#FF9B52] border border-[#FF9B52]/20'
              : 'bg-[#9DDB00]/10 text-[#9DDB00] border border-[#9DDB00]/20'
          }`}>
            <CheckCircle className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-xs text-[#F4F6FB]">Data Integrity & Reconciliation</span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                discrepancies.length > 0
                  ? 'bg-orange-500/10 text-[#FF9B52] border border-[#FF9B52]/20 font-bold'
                  : 'bg-[#9DDB00]/10 text-[#9DDB00] border border-[#9DDB00]/20 font-bold'
              }`}>
                {discrepancies.length > 0 ? `${discrepancies.length} Discrepancy Detected` : '100% Match (0 Discrepancy)'}
              </span>
            </div>
            <p className="text-[11px] text-[#9CA8BD] mt-0.5">
              Live Source Row 2 Pod Totals match individual annotator sums across all 4 pods for {humanDate}.
            </p>
          </div>
        </div>

        {onOpenIntegrityModal && (
          <button
            onClick={onOpenIntegrityModal}
            className="px-3 py-1.5 rounded-lg bg-[#20283D] hover:bg-[#2A3650] text-xs font-medium text-[#F4F6FB] border border-[#2A3650] hover:border-[#9DDB00]/50 transition-colors whitespace-nowrap self-start sm:self-center"
          >
            Audit Pod Totals
          </button>
        )}
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

                  {/* Tasks count & Minutes */}
                  <div className="space-y-2">
                    <div className="flex items-baseline justify-between">
                      <div className="flex items-baseline space-x-1.5">
                        <span className="font-mono text-3xl font-extrabold text-[#9DDB00]">
                          {pod.totalTasks.toLocaleString()}
                        </span>
                        <span className="text-xs text-[#9CA8BD] font-medium">tasks</span>
                      </div>
                      <div className="flex items-baseline space-x-1 font-mono text-xs px-2 py-0.5 rounded-md bg-[#5689FF]/10 text-[#5689FF] border border-[#5689FF]/20 font-bold">
                        <span>{pod.totalMinutes ? pod.totalMinutes.toLocaleString() : 0}</span>
                        <span className="text-[10px] text-[#5689FF]/80 font-sans">mins</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#9CA8BD] pt-1">
                      <span>
                        <strong className="text-[#F4F6FB] font-semibold">{pod.activeAnnotators}</strong>{' '}
                        active
                      </span>
                      {pod.allTimeTotalTasks !== undefined && !overview.isAllTime && (
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#191F30] border border-[#2A3650] text-[#9CA8BD]">
                          All-Time: <strong className="text-[#F4F6FB]">{pod.allTimeTotalTasks.toLocaleString()}t</strong>
                          {pod.allTimeTotalMinutes ? ` • ${(pod.allTimeTotalMinutes || 0).toLocaleString()}m` : ''}
                        </span>
                      )}
                    </div>
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
