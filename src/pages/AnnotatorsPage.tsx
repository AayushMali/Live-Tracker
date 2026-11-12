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
} from 'lucide-react';
import { AnnotatorResponse } from '../types';

interface AnnotatorsPageProps {
  data: AnnotatorResponse | null;
  isLoading: boolean;
  selectedPod: string;
  onSelectPod: (pod: string) => void;
  showAll: boolean;
  onToggleShowAll: (show: boolean) => void;
}

export const AnnotatorsPage: React.FC<AnnotatorsPageProps> = ({
  data,
  isLoading,
  selectedPod,
  onSelectPod,
  showAll,
  onToggleShowAll,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

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

  return (
    <div className="space-y-6">
      {/* Page Title & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#F4F6FB]">Annotator Production</h2>
          <p className="text-xs text-[#9CA8BD] mt-1">
            Individual task output for <span className="text-[#F4F6FB] font-medium">{data.humanDate}</span>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total Tasks for selected filter */}
        <div className="p-4 rounded-xl bg-[#20283D] border border-[#2A3650] flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-[#9CA8BD] uppercase tracking-wider">
              {activeFilterName} Total Tasks
            </div>
            <div className="mt-1 flex items-baseline space-x-2">
              <span className="font-mono text-3xl font-extrabold text-[#9DDB00]">
                {data.podTotalTasks.toLocaleString()}
              </span>
              <span className="text-xs text-[#9CA8BD]">tasks</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#9DDB00]/10 border border-[#9DDB00]/20 flex items-center justify-center">
            <span className="font-mono font-bold text-xs text-[#9DDB00]">
              {selectedPod === 'all' ? 'ALL' : `P${selectedPod}`}
            </span>
          </div>
        </div>

        {/* Active Annotators Count */}
        <div className="p-4 rounded-xl bg-[#20283D] border border-[#2A3650] flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-[#9CA8BD] uppercase tracking-wider">
              Active Annotators
            </div>
            <div className="mt-1 flex items-baseline space-x-2">
              <span className="font-mono text-3xl font-extrabold text-[#5689FF]">
                {data.activeAnnotators}
              </span>
              <span className="text-xs text-[#9CA8BD]">annotators</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#5689FF]/10 border border-[#5689FF]/20 flex items-center justify-center">
            <Users className="w-5 h-5 text-[#5689FF]" />
          </div>
        </div>

        {/* Filter / Toggle Bar */}
        <div className="p-4 rounded-xl bg-[#20283D] border border-[#2A3650] flex items-center justify-between sm:col-span-2 lg:col-span-1">
          <div>
            <div className="text-[11px] font-semibold text-[#9CA8BD] uppercase tracking-wider">
              Display Mode
            </div>
            <div className="mt-1 text-xs text-[#F4F6FB] font-medium">
              {showAll ? 'Showing All Annotators' : 'Active Only (Tasks > 0)'}
            </div>
          </div>
          <button
            onClick={() => onToggleShowAll(!showAll)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#191F30] border border-[#2A3650] hover:border-[#9DDB00]/50 text-xs font-medium text-[#9CA8BD] hover:text-[#F4F6FB] transition-colors"
          >
            {showAll ? (
              <>
                <EyeOff className="w-3.5 h-3.5 text-[#FF9B52]" />
                <span>Hide Zero Tasks</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-[#9DDB00]" />
                <span>Show All</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`Search ${activeFilterName} annotators by name...`}
          className="w-full px-4 py-2.5 pl-10 rounded-xl bg-[#191F30] border border-[#2A3650] focus:border-[#9DDB00] text-sm text-[#F4F6FB] placeholder-[#9CA8BD]/50 focus:outline-none transition-colors"
        />
        <Search className="w-4 h-4 text-[#9CA8BD] absolute left-3.5 top-3" />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-2.5 text-xs text-[#9CA8BD] hover:text-[#F4F6FB]"
          >
            Clear
          </button>
        )}
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
                <th className="py-3.5 px-5 text-right">Tasks Completed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A3650]/40 text-sm">
              {filteredAnnotators.length > 0 ? (
                filteredAnnotators.map((ann, idx) => (
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
                    <td className="py-3.5 px-5 text-right font-mono text-base font-bold text-[#9DDB00]">
                      {ann.tasksCompleted}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-xs text-[#9CA8BD]">
                    {searchQuery
                      ? `No annotators found matching "${searchQuery}" in ${activeFilterName}`
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
            {filteredAnnotators.length === 1 ? '' : 's'}
          </span>
          <span className="font-mono text-[11px]">
            Sorted descending by task count
          </span>
        </div>
      </div>
    </div>
  );
};
