import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  CheckCircle2,
  Filter,
  Eye,
  EyeOff,
  Layers,
  ArrowUpDown,
  Sparkles,
  AlertCircle,
  UserX,
  Clock,
  Target,
  Share2,
} from 'lucide-react';
import { AnnotatorResponse } from '../types';
import { ExportModal } from '../components/ExportModal';

interface AnnotatorsPageProps {
  data: AnnotatorResponse | null;
  isLoading: boolean;
  selectedPod: string;
  onSelectPod: (pod: string) => void;
  statusFilter: 'active' | 'zero' | 'all';
  onSelectStatusFilter: (status: 'active' | 'zero' | 'all') => void;
}

export const AnnotatorsPage: React.FC<AnnotatorsPageProps> = ({
  data,
  isLoading,
  selectedPod,
  onSelectPod,
  statusFilter,
  onSelectStatusFilter,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isExportOpen, setIsExportOpen] = useState(false);

  const podFilters = [
    { id: 'all', label: 'All Pods' },
    { id: '1', label: 'Pod 1' },
    { id: '2', label: 'Pod 2' },
    { id: '3', label: 'Pod 3' },
    { id: '4', label: 'Pod 4' },
  ];

  // Client-side search filtering
  const filteredAnnotators = useMemo(() => {
    if (!data?.annotators) return [];
    if (!searchQuery.trim()) return data.annotators;
    const q = searchQuery.toLowerCase().trim();
    return data.annotators.filter((ann) => ann.name.toLowerCase().includes(q));
  }, [data?.annotators, searchQuery]);

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#9DDB00] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-mono text-[#9CA8BD]">Loading annotator records...</span>
        </div>
      </div>
    );
  }

  const activeFilterName =
    podFilters.find((f) => f.id === selectedPod)?.label || 'All Pods';

  const totalMembers = data.totalMembers ?? (data.activeAnnotators + (data.zeroTaskAnnotators ?? 0));
  const zeroCount = data.zeroTaskAnnotators ?? Math.max(0, totalMembers - data.activeAnnotators);
  const totalMinutes = data.podTotalMinutes ?? 0;

  return (
    <div className="space-y-6">
      {/* Page Title & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#F4F6FB]">Annotator Production</h2>
          <p className="text-xs text-[#9CA8BD] mt-1">
            Individual tasks & minutes for <span className="text-[#F4F6FB] font-medium">{data.humanDate}</span> (Daily Target: 100 min)
          </p>
        </div>

        {/* Pod Filter Buttons */}
        <div className="flex items-center space-x-1.5 p-1 rounded-xl bg-[#191F30] border border-[#2A3650] overflow-x-auto">
          {podFilters.map((tab) => {
            const isSelected = selectedPod === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectPod(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-[#20283D] text-[#9DDB00] shadow-sm border border-[#9DDB00]/30'
                    : 'text-[#9CA8BD] hover:text-[#F4F6FB] hover:bg-[#20283D]/50'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Summary KPI Banner for Selected Pod */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tasks for selected filter */}
        <div className="p-4 rounded-xl bg-[#20283D] border border-[#2A3650] flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-[#9CA8BD] uppercase tracking-wider">
              {activeFilterName} {data.isAllTime ? 'All-Time Tasks' : 'Total Tasks'}
            </div>
            <div className="mt-1 flex items-baseline space-x-2">
              <span className="font-mono text-3xl font-extrabold text-[#9DDB00]">
                {data.podTotalTasks.toLocaleString()}
              </span>
              <span className="text-xs text-[#9CA8BD]">tasks</span>
            </div>
            {data.allTimePodTotalTasks !== undefined && !data.isAllTime && (
              <div className="mt-1.5 pt-1.5 border-t border-[#2A3650]/50 text-[10px] font-mono text-[#9CA8BD]">
                All-Time: <span className="text-[#F4F6FB] font-semibold">{data.allTimePodTotalTasks.toLocaleString()}</span> tasks
              </div>
            )}
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#9DDB00]/10 border border-[#9DDB00]/20 flex items-center justify-center">
            <span className="font-mono font-bold text-xs text-[#9DDB00]">
              {selectedPod === 'all' ? 'ALL' : `P${selectedPod}`}
            </span>
          </div>
        </div>

        {/* Total Minutes Logged */}
        <div className="p-4 rounded-xl bg-[#20283D] border border-[#2A3650] flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-[#9CA8BD] uppercase tracking-wider">
              {data.isAllTime ? 'All-Time Minutes' : 'Total Minutes Logged'}
            </div>
            <div className="mt-1 flex items-baseline space-x-2">
              <span className="font-mono text-3xl font-extrabold text-[#5689FF]">
                {totalMinutes.toLocaleString()}
              </span>
              <span className="text-xs text-[#9CA8BD]">mins</span>
            </div>
            {data.allTimePodTotalMinutes !== undefined && !data.isAllTime && (
              <div className="mt-1.5 pt-1.5 border-t border-[#2A3650]/50 text-[10px] font-mono text-[#9CA8BD]">
                All-Time: <span className="text-[#5689FF] font-semibold">{data.allTimePodTotalMinutes.toLocaleString()}</span> mins
              </div>
            )}
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#5689FF]/10 border border-[#5689FF]/20 flex items-center justify-center">
            <Clock className="w-5 h-5 text-[#5689FF]" />
          </div>
        </div>

        {/* Active Annotators (Done Tasks) */}
        <div
          onClick={() => onSelectStatusFilter('active')}
          className={`p-4 rounded-xl bg-[#20283D] border cursor-pointer transition-all hover:border-[#5689FF] ${
            statusFilter === 'active'
              ? 'border-[#5689FF] shadow-md shadow-[#5689FF]/10'
              : 'border-[#2A3650]'
          } flex items-center justify-between`}
        >
          <div>
            <div className="text-[11px] font-semibold text-[#9CA8BD] uppercase tracking-wider flex items-center space-x-1.5">
              <span>Completed</span>
              {statusFilter === 'active' && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#5689FF]"></span>
              )}
            </div>
            <div className="mt-1 flex items-baseline space-x-2">
              <span className="font-mono text-3xl font-extrabold text-[#F4F6FB]">
                {data.activeAnnotators}
              </span>
              <span className="text-xs text-[#9CA8BD]">members</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#2A3650] flex items-center justify-center">
            <Users className="w-5 h-5 text-[#9CA8BD]" />
          </div>
        </div>

        {/* Zero Tasks Annotators (Not Started / Inactive) */}
        <div
          onClick={() => onSelectStatusFilter('zero')}
          className={`p-4 rounded-xl bg-[#20283D] border cursor-pointer transition-all hover:border-[#FF9B52] ${
            statusFilter === 'zero'
              ? 'border-[#FF9B52] shadow-md shadow-[#FF9B52]/10'
              : 'border-[#2A3650]'
          } flex items-center justify-between`}
        >
          <div>
            <div className="text-[11px] font-semibold text-[#9CA8BD] uppercase tracking-wider flex items-center space-x-1.5">
              <span>Zero Tasks</span>
              {statusFilter === 'zero' && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF9B52]"></span>
              )}
            </div>
            <div className="mt-1 flex items-baseline space-x-2">
              <span className="font-mono text-3xl font-extrabold text-[#FF9B52]">
                {zeroCount}
              </span>
              <span className="text-xs text-[#9CA8BD]">members</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#FF9B52]/10 border border-[#FF9B52]/20 flex items-center justify-center">
            <UserX className="w-5 h-5 text-[#FF9B52]" />
          </div>
        </div>
      </div>

      {/* Filter Tabs Bar: Completed Tasks | Zero Tasks | All Members */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2 p-1 rounded-xl bg-[#191F30] border border-[#2A3650] self-start">
          <button
            onClick={() => onSelectStatusFilter('active')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-2 ${
              statusFilter === 'active'
                ? 'bg-[#20283D] text-[#9DDB00] border border-[#9DDB00]/30 shadow-sm'
                : 'text-[#9CA8BD] hover:text-[#F4F6FB]'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[#9DDB00]" />
            <span>Completed Tasks ({data.activeAnnotators})</span>
          </button>

          <button
            onClick={() => onSelectStatusFilter('zero')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-2 ${
              statusFilter === 'zero'
                ? 'bg-[#20283D] text-[#FF9B52] border border-[#FF9B52]/30 shadow-sm'
                : 'text-[#9CA8BD] hover:text-[#F4F6FB]'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5 text-[#FF9B52]" />
            <span>Zero Tasks ({zeroCount})</span>
          </button>

          <button
            onClick={() => onSelectStatusFilter('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-2 ${
              statusFilter === 'all'
                ? 'bg-[#20283D] text-[#5689FF] border border-[#5689FF]/30 shadow-sm'
                : 'text-[#9CA8BD] hover:text-[#F4F6FB]'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-[#5689FF]" />
            <span>All Members ({totalMembers})</span>
          </button>
        </div>

        {/* Export & Search Controls */}
        <div className="flex items-center space-x-2 flex-1 sm:max-w-md justify-end">
          <button
            onClick={() => setIsExportOpen(true)}
            className="px-3 py-2 rounded-xl bg-[#20283D] hover:bg-[#2A3650] text-[#9DDB00] border border-[#2A3650] hover:border-[#9DDB00]/40 text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm whitespace-nowrap"
            title="Export target completion for chat groups, Slack, Sheets or CSV"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Export Target</span>
          </button>

          {/* Search Input Bar */}
          <div className="relative flex-1 sm:max-w-xs">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search annotator...`}
              className="w-full px-4 py-2 pl-9 rounded-xl bg-[#191F30] border border-[#2A3650] focus:border-[#9DDB00] text-xs text-[#F4F6FB] placeholder-[#9CA8BD]/50 focus:outline-none transition-colors"
            />
            <Search className="w-3.5 h-3.5 text-[#9CA8BD] absolute left-3 top-2.5" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2 text-[10px] text-[#9CA8BD] hover:text-[#F4F6FB]"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Production Annotators Table */}
      <div className="rounded-2xl bg-[#20283D] border border-[#2A3650] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#2A3650] bg-[#191F30]/80 text-[11px] font-semibold text-[#9CA8BD] uppercase tracking-wider">
                <th className="py-3.5 px-5">#</th>
                <th className="py-3.5 px-5">Annotator Name</th>
                <th className="py-3.5 px-5">Pod</th>
                <th className="py-3.5 px-5 text-right">{data.isAllTime ? 'Total Tasks' : 'Tasks Today'}</th>
                <th className="py-3.5 px-5 text-right">{data.isAllTime ? 'Total Minutes' : 'Minutes Today'}</th>
                <th className="py-3.5 px-5 text-right">All-Time Output</th>
                <th className="py-3.5 px-5 text-right">{data.isAllTime ? 'Days Active' : 'Daily Target (100 min)'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A3650]/40 text-sm">
              {filteredAnnotators.length > 0 ? (
                filteredAnnotators.map((ann, idx) => {
                  const minutes = ann.minutesWorked ?? 0;
                  const targetMet = minutes >= 100;
                  const progressPct = Math.min(Math.round((minutes / 100) * 100), 100);

                  return (
                    <tr
                      key={ann.id || idx}
                      className="hover:bg-[#191F30]/50 transition-colors group"
                    >
                      {/* Rank / Index */}
                      <td className="py-3.5 px-5 font-mono text-xs text-[#9CA8BD] w-12">
                        {idx + 1}
                      </td>

                      {/* Annotator Name */}
                      <td className="py-3.5 px-5 font-medium text-[#F4F6FB] group-hover:text-[#9DDB00] transition-colors">
                        {ann.name}
                      </td>

                      {/* Pod Name Badge */}
                      <td className="py-3.5 px-5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#5689FF]/10 text-[#5689FF] border border-[#5689FF]/20">
                          {ann.podName}
                        </span>
                      </td>

                      {/* Tasks Completed */}
                      <td className="py-3.5 px-5 text-right">
                        {ann.tasksCompleted > 0 ? (
                          <span className="font-mono text-base font-bold text-[#9DDB00]">
                            {ann.tasksCompleted}
                          </span>
                        ) : (
                          <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#191F30] text-[#9CA8BD] border border-[#2A3650]">
                            0
                          </span>
                        )}
                      </td>

                      {/* Minutes Worked */}
                      <td className="py-3.5 px-5 text-right">
                        {minutes > 0 ? (
                          <span className="font-mono text-sm font-semibold text-[#5689FF]">
                            {minutes} <span className="text-[10px] text-[#9CA8BD] font-normal">min</span>
                          </span>
                        ) : (
                          <span className="font-mono text-xs text-[#9CA8BD]">0 min</span>
                        )}
                      </td>

                      {/* All-Time Cumulative Output */}
                      <td className="py-3.5 px-5 text-right">
                        <div>
                          <span className="font-mono text-xs font-semibold text-[#F4F6FB]">
                            {(ann.totalTasksAllTime ?? ann.tasksCompleted).toLocaleString()} tasks
                          </span>
                          <div className="text-[10px] font-mono text-[#9CA8BD]">
                            {(ann.totalMinutesAllTime ?? minutes).toLocaleString()}m • {ann.daysWorked ?? (ann.tasksCompleted > 0 ? 1 : 0)}d worked
                          </div>
                        </div>
                      </td>

                      {/* Daily Target Progress / Days Active */}
                      <td className="py-3.5 px-5 text-right">
                        {data.isAllTime ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-[#20283D] text-[#9DDB00] border border-[#2A3650]">
                            <span>{ann.daysWorked ?? (ann.tasksCompleted > 0 ? 1 : 0)} days active</span>
                          </span>
                        ) : (
                          <div className="flex items-center justify-end space-x-2.5">
                            <div className="w-24 h-1.5 bg-[#191F30] rounded-full overflow-hidden hidden sm:block">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  targetMet ? 'bg-[#9DDB00]' : 'bg-[#5689FF]'
                                }`}
                                style={{ width: `${progressPct}%` }}
                              />
                            </div>
                            {targetMet ? (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#9DDB00]/10 text-[#9DDB00] border border-[#9DDB00]/30 whitespace-nowrap">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>{minutes}m (Met)</span>
                              </span>
                            ) : (
                              <span className="font-mono text-xs text-[#9CA8BD]">
                                {minutes}/100m
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-[#9CA8BD]">
                    {searchQuery
                      ? `No annotators found matching "${searchQuery}" in ${activeFilterName}`
                      : statusFilter === 'zero'
                      ? `All annotators in ${activeFilterName} completed tasks for ${data.humanDate}!`
                      : `No annotators with recorded tasks for ${data.humanDate} in ${activeFilterName}`}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-4 border-t border-[#2A3650] bg-[#191F30]/50 flex items-center justify-between text-xs text-[#9CA8BD]">
          <span>
            Showing <strong className="text-[#F4F6FB]">{filteredAnnotators.length}</strong> annotator
            {filteredAnnotators.length === 1 ? '' : 's'} ({statusFilter === 'active' ? 'Completed Tasks' : statusFilter === 'zero' ? 'Zero Tasks' : 'All Members'})
          </span>
          <span className="font-mono text-[11px]">
            Sorted descending by task count & minutes
          </span>
        </div>
      </div>

      {/* Export Target Production Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        date={data.date}
        humanDate={data.humanDate}
        podName={activeFilterName}
        annotators={data.annotators || []}
        totalTasks={data.podTotalTasks || 0}
        totalMinutes={totalMinutes || 0}
      />
    </div>
  );
};
