import React, { useState } from 'react';
import {
  CalendarDays,
  Layers,
  Users,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  History,
  TrendingUp,
} from 'lucide-react';
import { DailyProductionResponse, DateItem } from '../types';

interface DailyProductionPageProps {
  data: DailyProductionResponse | null;
  isLoading: boolean;
  dates: DateItem[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export const DailyProductionPage: React.FC<DailyProductionPageProps> = ({
  data,
  isLoading,
  dates,
  selectedDate,
  onSelectDate,
}) => {
  // Expanded pod cards state (defaults to all expanded)
  const [expandedPods, setExpandedPods] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
    4: true,
  });

  const togglePod = (podId: number) => {
    setExpandedPods((prev) => ({
      ...prev,
      [podId]: !prev[podId],
    }));
  };

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#9DDB00] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-mono text-[#9CA8BD]">Loading daily production records...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#F4F6FB]">Daily Production History</h2>
          <p className="text-xs text-[#9CA8BD] mt-1">
            Hierarchical production breakdown: <strong className="text-[#F4F6FB]">Date → Pod → Annotator</strong>
          </p>
        </div>

        {/* Quick Date Selector pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto p-1 rounded-xl bg-[#191F30] border border-[#2A3650] max-w-full">
          {dates.slice(0, 6).map((d) => (
            <button
              key={d.date}
              onClick={() => onSelectDate(d.date)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                d.date === selectedDate
                  ? 'bg-[#20283D] text-[#9DDB00] font-semibold border border-[#9DDB00]/30'
                  : 'text-[#9CA8BD] hover:text-[#F4F6FB] hover:bg-[#20283D]/50'
              }`}
            >
              {d.humanDate.split(' ').slice(0, 2).join(' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Date Summary Header Card */}
      <div className="p-5 rounded-2xl bg-[#20283D] border border-[#2A3650] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#9DDB00]/10 border border-[#9DDB00]/30 flex items-center justify-center">
            <CalendarDays className="w-6 h-6 text-[#9DDB00]" />
          </div>
          <div>
            <div className="text-xs font-semibold text-[#9CA8BD] uppercase tracking-wider">
              Selected Inspection Date
            </div>
            <h3 className="text-xl font-bold text-[#F4F6FB] mt-0.5">{data.humanDate}</h3>
          </div>
        </div>

        <div className="flex items-center space-x-6 border-t md:border-t-0 md:border-l border-[#2A3650] pt-3 md:pt-0 md:pl-6">
          <div>
            <div className="text-[11px] font-semibold text-[#9CA8BD] uppercase tracking-wider">
              Total Production
            </div>
            <div className="flex items-baseline space-x-1.5 mt-0.5">
              <span className="font-mono text-2xl font-extrabold text-[#9DDB00]">
                {data.grandTotal}
              </span>
              <span className="text-xs text-[#9CA8BD]">tasks</span>
            </div>
          </div>

          <div>
            <div className="text-[11px] font-semibold text-[#9CA8BD] uppercase tracking-wider">
              Active Pods
            </div>
            <div className="flex items-baseline space-x-1.5 mt-0.5">
              <span className="font-mono text-2xl font-extrabold text-[#5689FF]">
                {data.activePods}
              </span>
              <span className="text-xs text-[#9CA8BD]">/ 4</span>
            </div>
          </div>

          <div>
            <div className="text-[11px] font-semibold text-[#9CA8BD] uppercase tracking-wider">
              Active Annotators
            </div>
            <div className="flex items-baseline space-x-1.5 mt-0.5">
              <span className="font-mono text-2xl font-extrabold text-[#FF9B52]">
                {data.grandActiveAnnotators}
              </span>
              <span className="text-xs text-[#9CA8BD]">members</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pods Breakdown Accordion Group */}
      <div className="space-y-4">
        {data.pods.map((pod) => {
          const isExpanded = !!expandedPods[pod.podId];

          return (
            <div
              key={pod.podId}
              className="rounded-2xl bg-[#20283D] border border-[#2A3650] overflow-hidden shadow-lg transition-colors"
            >
              {/* Pod Header Bar */}
              <div
                onClick={() => togglePod(pod.podId)}
                className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-[#191F30]/40 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-[#5689FF]/10 border border-[#5689FF]/30 flex items-center justify-center">
                    <span className="font-mono font-bold text-xs text-[#5689FF]">
                      P{pod.podId}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-[#F4F6FB] flex items-center space-x-2">
                      <span>{pod.podName}</span>
                      {pod.hasDiscrepancy ? (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono bg-red-900/30 text-red-400 border border-red-500/30">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Discrepancy</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono bg-[#9DDB00]/10 text-[#9DDB00] border border-[#9DDB00]/20">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Verified Total</span>
                        </span>
                      )}
                    </h4>
                    <p className="text-[11px] text-[#9CA8BD] mt-0.5">
                      {pod.activeAnnotators} annotator{pod.activeAnnotators === 1 ? '' : 's'} active
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="font-mono text-xl sm:text-2xl font-extrabold text-[#9DDB00]">
                      {pod.totalTasks}{' '}
                      <span className="text-xs text-[#9CA8BD] font-normal">tasks</span>
                    </div>
                  </div>
                  <button className="p-1 rounded text-[#9CA8BD] hover:text-[#F4F6FB]">
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Collapsible Annotator List */}
              {isExpanded && (
                <div className="border-t border-[#2A3650]/60 bg-[#191F30]/40 p-4 sm:p-5">
                  {pod.annotators.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                      {pod.annotators.map((ann, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-[#20283D] border border-[#2A3650] flex items-center justify-between"
                        >
                          <div className="truncate pr-2">
                            <span className="text-xs font-medium text-[#F4F6FB] truncate block">
                              {ann.name}
                            </span>
                            <span className="text-[10px] text-[#9CA8BD] font-mono">
                              Annotator #{idx + 1}
                            </span>
                          </div>
                          <div className="font-mono text-sm font-bold text-[#9DDB00] flex-shrink-0">
                            {ann.tasks}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-6 text-center text-xs text-[#9CA8BD]">
                      No annotators logged tasks in {pod.podName} on {data.humanDate}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Historical Output Table */}
      <div className="rounded-2xl bg-[#20283D] border border-[#2A3650] overflow-hidden shadow-xl mt-8">
        <div className="p-4 sm:p-5 border-b border-[#2A3650] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <History className="w-4 h-4 text-[#5689FF]" />
            <h3 className="font-bold text-sm text-[#F4F6FB]">
              Historical Production Timeline
            </h3>
          </div>
          <span className="text-xs text-[#9CA8BD] font-mono">
            All 14 recorded days
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#2A3650] bg-[#191F30]/80 text-[11px] font-semibold text-[#9CA8BD] uppercase tracking-wider">
                <th className="py-3 px-5">Date</th>
                <th className="py-3 px-5 text-right">Active Pods</th>
                <th className="py-3 px-5 text-right">Active Annotators</th>
                <th className="py-3 px-5 text-right">Total Tasks</th>
                <th className="py-3 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A3650]/40 text-xs">
              {dates.map((d) => {
                const isSelected = d.date === selectedDate;
                return (
                  <tr
                    key={d.date}
                    className={`hover:bg-[#191F30]/50 transition-colors ${
                      isSelected ? 'bg-[#191F30] font-semibold' : ''
                    }`}
                  >
                    <td className="py-3 px-5 text-[#F4F6FB] font-medium">
                      <div className="flex items-center space-x-2">
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#9DDB00]" />}
                        <span>{d.humanDate}</span>
                      </div>
                    </td>
                    <td className="py-3 px-5 text-right font-mono text-[#5689FF]">
                      {d.activePods} / 4
                    </td>
                    <td className="py-3 px-5 text-right font-mono text-[#FF9B52]">
                      {d.activeAnnotators}
                    </td>
                    <td className="py-3 px-5 text-right font-mono text-sm font-bold text-[#9DDB00]">
                      {d.grandTotal}
                    </td>
                    <td className="py-3 px-5 text-right">
                      <button
                        onClick={() => onSelectDate(d.date)}
                        className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                          isSelected
                            ? 'bg-[#9DDB00] text-[#111522] font-semibold'
                            : 'bg-[#191F30] text-[#9CA8BD] hover:text-[#F4F6FB] hover:bg-[#2A3650]'
                        }`}
                      >
                        {isSelected ? 'Viewing' : 'Inspect'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
