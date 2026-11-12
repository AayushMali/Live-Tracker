import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Download,
  FileSpreadsheet,
  MessageSquare,
  Sparkles,
  Share2,
} from 'lucide-react';
import { AnnotatorItem } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  humanDate: string;
  podName: string;
  annotators: AnnotatorItem[];
  totalTasks: number;
  totalMinutes: number;
}

type ExportMode = 'chat' | 'tsv' | 'csv';

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  date,
  humanDate,
  podName,
  annotators,
  totalTasks,
  totalMinutes,
}) => {
  const [activeTab, setActiveTab] = useState<ExportMode>('chat');
  const [copied, setCopied] = useState<boolean>(false);
  const [filterScope, setFilterScope] = useState<'all' | 'active' | 'met'>('active');

  if (!isOpen) return null;

  // Filter based on scope
  const scopedAnnotators = annotators.filter((ann) => {
    if (filterScope === 'met') return (ann.minutesWorked || 0) >= 100;
    if (filterScope === 'active') return ann.tasksCompleted > 0 || (ann.minutesWorked || 0) > 0;
    return true;
  });

  const targetMetCount = annotators.filter((a) => (a.minutesWorked || 0) >= 100).length;
  const activeCount = annotators.filter((a) => a.tasksCompleted > 0 || (a.minutesWorked || 0) > 0).length;

  // 1. Generate Chat Formatted Text
  const generateChatText = () => {
    const lines: string[] = [];
    lines.push(`📊 *AX PRODUCTION REPORT — ${humanDate.toUpperCase()}*`);
    lines.push(`🏢 *Scope:* ${podName}`);
    lines.push(`🎯 *Daily Target:* 100 mins / annotator`);
    lines.push(`📈 *Total Production:* ${totalTasks.toLocaleString()} tasks • ${totalMinutes.toLocaleString()} mins`);
    lines.push(`👥 *Active Members:* ${activeCount} active (${targetMetCount} met target)`);
    lines.push(``);

    const metList = scopedAnnotators.filter((a) => (a.minutesWorked || 0) >= 100);
    const inProgressList = scopedAnnotators.filter((a) => (a.minutesWorked || 0) < 100);

    if (metList.length > 0) {
      lines.push(`✅ *TARGET MET (≥100 mins):*`);
      metList.forEach((a) => {
        const mins = a.minutesWorked || 0;
        lines.push(`• *${a.name}* — ${a.tasksCompleted} tasks | ${mins} mins (${mins}% of target)`);
      });
      lines.push(``);
    }

    if (inProgressList.length > 0) {
      lines.push(`⏳ *IN PROGRESS (<100 mins):*`);
      inProgressList.forEach((a) => {
        const mins = a.minutesWorked || 0;
        const pct = Math.min(Math.round((mins / 100) * 100), 100);
        lines.push(`• *${a.name}* — ${a.tasksCompleted} tasks | ${mins} mins (${pct}% of target)`);
      });
    }

    if (scopedAnnotators.length === 0) {
      lines.push(`No annotator records found for this selection.`);
    }

    return lines.join('\n');
  };

  // 2. Generate TSV (Tab Separated Values - Best for pasting into Google Sheets/Excel)
  const generateTSVText = () => {
    const headers = ['#', 'Annotator Name', 'Pod', 'Tasks Completed', 'Minutes Worked', 'Daily Target', 'Target Met', '% Completed'];
    const rows = scopedAnnotators.map((a, i) => {
      const mins = a.minutesWorked || 0;
      const met = mins >= 100 ? 'YES' : 'NO';
      const pct = `${Math.round((mins / 100) * 100)}%`;
      return [i + 1, a.name, a.podName, a.tasksCompleted, mins, 100, met, pct].join('\t');
    });
    return [headers.join('\t'), ...rows].join('\n');
  };

  // 3. Generate CSV Text
  const generateCSVText = () => {
    const headers = ['"Rank"', '"Annotator Name"', '"Pod"', '"Tasks Completed"', '"Minutes Worked"', '"Daily Target"', '"Target Met"', '"Percent Completed"'];
    const rows = scopedAnnotators.map((a, i) => {
      const mins = a.minutesWorked || 0;
      const met = mins >= 100 ? 'YES' : 'NO';
      const pct = `${Math.round((mins / 100) * 100)}%`;
      return [i + 1, `"${a.name}"`, `"${a.podName}"`, a.tasksCompleted, mins, 100, `"${met}"`, `"${pct}"`].join(',');
    });
    return [headers.join(','), ...rows].join('\n');
  };

  const getExportContent = () => {
    if (activeTab === 'chat') return generateChatText();
    if (activeTab === 'tsv') return generateTSVText();
    return generateCSVText();
  };

  const handleCopy = () => {
    const content = getExportContent();
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownloadCSV = () => {
    const content = generateCSVText();
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safePod = podName.replace(/\s+/g, '_');
    link.href = url;
    link.setAttribute('download', `AX_Production_${date}_${safePod}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const previewText = getExportContent();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-[#191F30] border border-[#2A3650] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#2A3650] flex items-center justify-between bg-[#111522]/60">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#9DDB00]/10 border border-[#9DDB00]/30 flex items-center justify-center text-[#9DDB00]">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#F4F6FB] flex items-center space-x-2">
                <span>Export Target Production</span>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#20283D] text-[#9DDB00] border border-[#9DDB00]/30">
                  {podName}
                </span>
              </h3>
              <p className="text-xs text-[#9CA8BD]">
                Formatted for chat groups, Slack, WhatsApp, Google Sheets & CSV
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

        {/* Filter & Tab Selection */}
        <div className="p-4 border-b border-[#2A3650] bg-[#191F30] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Format Tabs */}
          <div className="flex items-center space-x-1 p-1 rounded-xl bg-[#111522] border border-[#2A3650] self-start">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                activeTab === 'chat'
                  ? 'bg-[#20283D] text-[#9DDB00] border border-[#9DDB00]/30'
                  : 'text-[#9CA8BD] hover:text-[#F4F6FB]'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Chat / Slack</span>
            </button>

            <button
              onClick={() => setActiveTab('tsv')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                activeTab === 'tsv'
                  ? 'bg-[#20283D] text-[#5689FF] border border-[#5689FF]/30'
                  : 'text-[#9CA8BD] hover:text-[#F4F6FB]'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>TSV (Sheets)</span>
            </button>

            <button
              onClick={() => setActiveTab('csv')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                activeTab === 'csv'
                  ? 'bg-[#20283D] text-[#FF9B52] border border-[#FF9B52]/30'
                  : 'text-[#9CA8BD] hover:text-[#F4F6FB]'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV File</span>
            </button>
          </div>

          {/* Member Scope Toggle */}
          <div className="flex items-center space-x-1 text-xs text-[#9CA8BD]">
            <span className="text-[11px] mr-1">Include:</span>
            <button
              onClick={() => setFilterScope('active')}
              className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                filterScope === 'active'
                  ? 'bg-[#20283D] text-[#F4F6FB] border border-[#2A3650]'
                  : 'hover:text-[#F4F6FB]'
              }`}
            >
              Active ({activeCount})
            </button>
            <button
              onClick={() => setFilterScope('met')}
              className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                filterScope === 'met'
                  ? 'bg-[#9DDB00]/10 text-[#9DDB00] border border-[#9DDB00]/30'
                  : 'hover:text-[#F4F6FB]'
              }`}
            >
              Target Met ({targetMetCount})
            </button>
            <button
              onClick={() => setFilterScope('all')}
              className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                filterScope === 'all'
                  ? 'bg-[#20283D] text-[#F4F6FB] border border-[#2A3650]'
                  : 'hover:text-[#F4F6FB]'
              }`}
            >
              All ({annotators.length})
            </button>
          </div>
        </div>

        {/* Preview Code Box */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="relative rounded-xl bg-[#111522] border border-[#2A3650] p-4 font-mono text-xs text-[#F4F6FB] leading-relaxed max-h-[380px] overflow-auto select-all whitespace-pre">
            {previewText}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#2A3650] bg-[#111522]/50 flex items-center justify-between">
          <div className="text-xs text-[#9CA8BD]">
            {activeTab === 'chat' && 'Ready to paste into WhatsApp, Slack, Teams or Discord'}
            {activeTab === 'tsv' && 'Copy and paste directly into Google Sheets or Excel'}
            {activeTab === 'csv' && 'Download standard .csv file for spreadsheet analysis'}
          </div>

          <div className="flex items-center space-x-2">
            {activeTab === 'csv' ? (
              <button
                onClick={handleDownloadCSV}
                className="px-4 py-2 rounded-xl bg-[#FF9B52] hover:bg-[#FF9B52]/90 text-[#111522] font-bold text-xs flex items-center space-x-2 shadow-lg transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download .CSV</span>
              </button>
            ) : null}

            <button
              onClick={handleCopy}
              className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center space-x-2 shadow-lg transition-all ${
                copied
                  ? 'bg-[#9DDB00] text-[#111522]'
                  : 'bg-[#20283D] hover:bg-[#2A3650] text-[#F4F6FB] border border-[#2A3650] hover:border-[#9DDB00]/50'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-[#111522]" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-[#9DDB00]" />
                  <span>Copy {activeTab === 'chat' ? 'Message' : 'TSV Data'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
