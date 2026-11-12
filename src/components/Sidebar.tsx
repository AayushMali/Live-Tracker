import React from 'react';
import { LayoutDashboard, Users, CalendarDays, ShieldCheck, Database, CheckCircle2, ChevronRight } from 'lucide-react';
import { PodSummary } from '../types';

interface SidebarProps {
  currentPage: 'overview' | 'annotators' | 'daily';
  onNavigate: (page: 'overview' | 'annotators' | 'daily') => void;
  onSelectPodFilter?: (podId: string) => void;
  pods: PodSummary[];
  selectedDate: string;
  dataSourceMode: string;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  onSelectPodFilter,
  pods,
  selectedDate,
  dataSourceMode,
  isOpen,
  onClose,
}) => {
  const navItems = [
    {
      id: 'overview' as const,
      label: 'Overview',
      icon: LayoutDashboard,
      description: 'Daily Pod Production',
    },
    {
      id: 'annotators' as const,
      label: 'Annotators',
      icon: Users,
      description: 'Individual Output & Pods',
    },
    {
      id: 'daily' as const,
      label: 'Daily Production',
      icon: CalendarDays,
      description: 'History & Discrepancies',
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 left-0 h-full w-64 bg-[#191F30] border-r border-[#2A3650] z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-[#2A3650] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-[#9DDB00]/10 border border-[#9DDB00]/30 flex items-center justify-center">
              <span className="font-mono font-bold text-base text-[#9DDB00]">AX</span>
            </div>
            <div>
              <h1 className="font-semibold text-sm tracking-wider text-[#F4F6FB] uppercase">
                AX Production
              </h1>
              <p className="text-[11px] text-[#9CA8BD] font-mono">Internal Monitor</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded text-[#9CA8BD] hover:text-[#F4F6FB] hover:bg-[#20283D]"
          >
            ✕
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-[#9CA8BD] uppercase">
            Navigation
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onClose();
                }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#20283D] text-[#9DDB00] border border-[#9DDB00]/30 shadow-sm'
                    : 'text-[#9CA8BD] hover:text-[#F4F6FB] hover:bg-[#20283D]/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#9DDB00]' : 'text-[#9CA8BD]'}`} />
                <div className="text-left flex-1">
                  <div className="font-medium text-xs leading-none">{item.label}</div>
                  <div className="text-[10px] text-[#9CA8BD] mt-1">{item.description}</div>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#9DDB00]" />}
              </button>
            );
          })}

          {/* Pod Quick Jump Section */}
          <div className="pt-6 px-3 pb-2 text-[11px] font-semibold tracking-wider text-[#9CA8BD] uppercase">
            Active Pods
          </div>

          <div className="space-y-1">
            {pods.map((pod) => (
              <button
                key={pod.id}
                onClick={() => {
                  if (onSelectPodFilter) {
                    onSelectPodFilter(String(pod.id));
                  }
                  onNavigate('annotators');
                  onClose();
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs hover:bg-[#20283D] text-[#9CA8BD] hover:text-[#F4F6FB] group transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-[#5689FF]"></span>
                  <span className="font-medium">{pod.name}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-mono text-xs font-semibold text-[#9DDB00]">
                    {pod.totalTasks}
                  </span>
                  <span className="text-[10px] text-[#9CA8BD]">tasks</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Integration Status Footer */}
        <div className="p-4 border-t border-[#2A3650] bg-[#111522]/60">
          <div className="flex items-center justify-between text-[11px] text-[#9CA8BD] mb-2">
            <span className="flex items-center space-x-1.5">
              <Database className="w-3.5 h-3.5 text-[#5689FF]" />
              <span>Source Status</span>
            </span>
            <span className="flex items-center space-x-1 text-[#9DDB00]">
              <CheckCircle2 className="w-3 h-3" />
              <span className="capitalize">{dataSourceMode.replace(/_/g, ' ')}</span>
            </span>
          </div>
          <div className="flex items-center space-x-1.5 text-[10px] text-[#9CA8BD]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#9DDB00]" />
            <span>Read-Only Source of Truth</span>
          </div>
        </div>
      </aside>
    </>
  );
};
