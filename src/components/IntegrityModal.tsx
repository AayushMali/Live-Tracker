import React from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle2, X, ExternalLink } from 'lucide-react';
import { PodSummary, DiscrepancyInfo } from '../types';

interface IntegrityModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  humanDate: string;
  pods: PodSummary[];
  discrepancies: DiscrepancyInfo[];
  lastUpdated: string;
}

export const IntegrityModal: React.FC<IntegrityModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  humanDate,
  pods,
  discrepancies,
  lastUpdated,
}) => {
  if (!isOpen) return null;

  const hasAnyDiscrepancy = discrepancies && discrepancies.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-[#191F30] border border-[#2A3650] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-[#2A3650] flex items-center justify-between bg-[#111522]/50">
          <div className="flex items-center space-x-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                hasAnyDiscrepancy
                  ? 'bg-orange-500/10 border border-[#FF9B52]/30 text-[#FF9B52]'
                  : 'bg-[#9DDB00]/10 border border-[#9DDB00]/30 text-[#9DDB00]'
              }`}
            >
              {hasAnyDiscrepancy ? (
                <AlertTriangle className="w-5 h-5" />
              ) : (
                <ShieldCheck className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-base text-[#F4F6FB]">
                Data Integrity & Reconciliation Audit
              </h3>
              <p className="text-xs text-[#9CA8BD]">
                Live cross-validation for <span className="text-[#F4F6FB]">{humanDate}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#9CA8BD] hover:text-[#F4F6FB] hover:bg-[#20283D] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1">
          {/* Status summary banner */}
          <div
            className={`p-4 rounded-xl border flex items-start space-x-3 text-xs ${
              hasAnyDiscrepancy
                ? 'bg-orange-950/40 border-[#FF9B52]/40 text-[#FF9B52]'
                : 'bg-[#9DDB00]/10 border-[#9DDB00]/30 text-[#9DDB00]'
            }`}
          >
            {hasAnyDiscrepancy ? (
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-[#FF9B52]" />
            ) : (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-[#9DDB00]" />
            )}
            <div>
              <div className="font-bold text-sm">
                {hasAnyDiscrepancy
                  ? `${discrepancies.length} Discrepancy Detected`
                  : '100% Data Integrity Verified'}
              </div>
              <p className="mt-1 text-[#F4F6FB]/90 leading-relaxed">
                {hasAnyDiscrepancy
                  ? 'A difference was found between the Source Sheet Row 2 Pod Total and the sum of individual annotators. The dashboard logs discrepancies instead of guessing.'
                  : 'Every pod total calculated from individual annotator task counts matches the Source Sheet Row 2 header exactly. Zero discrepancies.'}
              </p>
            </div>
          </div>

          {/* Detailed Pod Reconciliation Table */}
          <div>
            <h4 className="text-xs font-semibold text-[#9CA8BD] uppercase tracking-wider mb-2">
              Pod-by-Pod Reconciliation ({selectedDate})
            </h4>
            <div className="rounded-xl border border-[#2A3650] overflow-hidden bg-[#20283D]">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#2A3650] bg-[#111522]/50 text-[#9CA8BD] font-semibold uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-4">Pod</th>
                    <th className="py-2.5 px-4 text-right">Source Row 2 Total</th>
                    <th className="py-2.5 px-4 text-right">Calculated Sum</th>
                    <th className="py-2.5 px-4 text-center">Reconciliation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A3650]/40">
                  {pods.map((pod) => {
                    const isMismatch = pod.totalTasks !== pod.sourceRow2Total;
                    return (
                      <tr key={pod.id} className="hover:bg-[#191F30]/40 transition-colors">
                        <td className="py-2.5 px-4 font-medium text-[#F4F6FB] flex items-center space-x-2">
                          <span className="w-2 h-2 rounded-full bg-[#5689FF]"></span>
                          <span>{pod.name}</span>
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono text-[#F4F6FB]">
                          {pod.sourceRow2Total}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-[#9DDB00]">
                          {pod.totalTasks}
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          {isMismatch ? (
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono bg-red-900/30 text-red-400 border border-red-500/30">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Mismatch ({pod.totalTasks - pod.sourceRow2Total})</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono bg-[#9DDB00]/10 text-[#9DDB00] border border-[#9DDB00]/20">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>100% Match</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Audit Rule Explanation */}
          <div className="p-3.5 rounded-xl bg-[#20283D]/60 border border-[#2A3650] text-[11px] text-[#9CA8BD] space-y-1.5 leading-relaxed">
            <div className="font-semibold text-[#F4F6FB] text-xs">Integrity Rule:</div>
            <p>
              • Task counts are extracted strictly from Column Z onwards (Columns K:X are duration minutes and excluded).
            </p>
            <p>
              • If an annotator logs a task or a reviewer modifies a record, the reconciliation engine cross-checks Row 2 with individual sums and displays warnings if any formula breaks.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#2A3650] bg-[#111522]/50 flex items-center justify-between text-xs text-[#9CA8BD]">
          <span>Audit Engine Active • Verified on every sync</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#20283D] hover:bg-[#2A3650] text-[#F4F6FB] font-medium border border-[#2A3650] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
