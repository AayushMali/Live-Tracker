import React, { useState } from 'react';
import {
  Calendar,
  RotateCw,
  Menu,
  Clock,
  Shield,
  LogOut,
  ChevronDown,
  Layers,
  Sparkles,
} from 'lucide-react';
import { DateItem } from '../types';

interface HeaderProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  dates: DateItem[];
  lastUpdated: string;
  isRefreshing: boolean;
  onRefresh: () => void;
  onOpenMobileMenu: () => void;
  isAuthenticated: boolean;
  onLogout: () => void;
  discrepancyCount: number;
  onOpenIntegrityModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedDate,
  onDateChange,
  dates,
  lastUpdated,
  isRefreshing,
  onRefresh,
  onOpenMobileMenu,
  isAuthenticated,
  onLogout,
  discrepancyCount,
  onOpenIntegrityModal,
}) => {
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);

  // Compute relative time string from lastUpdated
  const getRelativeTime = (timestamp: string) => {
    if (!timestamp) return 'Just now';
    const now = new Date().getTime();
    const then = new Date(timestamp).getTime();
    const diffSec = Math.floor((now - then) / 1000);
    if (diffSec < 15) return 'Just now';
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    return `${Math.floor(diffMin / 60)}h ago`;
  };

  const allTimeDateItem = dates.find((d) => d.isAllTime);
  const dailyDateItems = dates.filter((d) => !d.isAllTime);
  const isViewingAllTime = selectedDate === 'all';
  const latestDateItem = dailyDateItems[0];
  const isViewingLatest = dates.length > 0 && !isViewingAllTime && (selectedDate === latestDateItem?.date || !selectedDate);
  const selectedDateObj = dates.find((d) => d.date === selectedDate) || (isViewingAllTime ? allTimeDateItem : latestDateItem) || dates[0];
  const formattedSelectedDate = selectedDateObj ? selectedDateObj.humanDate : selectedDate || 'Latest Date';

  return (
    <header className="sticky top-0 z-30 bg-[#111522]/90 backdrop-blur-md border-b border-[#2A3650] px-4 lg:px-8 py-3.5">
      <div className="flex items-center justify-between">
        {/* Left: Mobile hamburger + Selected Date Dropdown */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-lg text-[#9CA8BD] hover:text-[#F4F6FB] hover:bg-[#20283D] border border-[#2A3650]"
            aria-label="Open Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Date Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDateDropdownOpen(!isDateDropdownOpen)}
              className="flex items-center space-x-2.5 px-3.5 py-2 rounded-lg bg-[#20283D] border border-[#2A3650] hover:border-[#9DDB00]/50 text-sm font-medium text-[#F4F6FB] transition-colors focus:outline-none whitespace-nowrap"
            >
              <Calendar className="w-4 h-4 text-[#9DDB00]" />
              <span className="font-semibold">{formattedSelectedDate}</span>
              {isViewingLatest && (
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#9DDB00]/20 text-[#9DDB00] border border-[#9DDB00]/30 font-bold">
                  Latest
                </span>
              )}
              {isViewingAllTime && (
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#5689FF]/20 text-[#5689FF] border border-[#5689FF]/30 font-bold">
                  All-Time
                </span>
              )}
              {selectedDateObj && (
                <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-[#9DDB00]/10 text-[#9DDB00] border border-[#9DDB00]/20">
                  {selectedDateObj.grandTotal.toLocaleString()} tasks
                </span>
              )}
              <ChevronDown className="w-4 h-4 text-[#9CA8BD]" />
            </button>

            {/* Dropdown Menu */}
            {isDateDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsDateDropdownOpen(false)}
                />
                <div className="absolute left-0 mt-2 w-[390px] sm:w-[430px] max-h-96 overflow-y-auto bg-[#191F30] border border-[#2A3650] rounded-2xl shadow-2xl z-50 p-2 divide-y divide-[#2A3650]/60 backdrop-blur-xl">
                  {/* Cumulative All-Time Section */}
                  {allTimeDateItem && (
                    <div className="pb-2">
                      <div className="px-3 py-1.5 text-[10px] font-bold tracking-wider text-[#9CA8BD] uppercase">
                        Cumulative Summary
                      </div>
                      <button
                        onClick={() => {
                          onDateChange(allTimeDateItem.date);
                          setIsDateDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs text-left transition-all ${
                          allTimeDateItem.date === selectedDate
                            ? 'bg-[#20283D] text-[#5689FF] border border-[#5689FF]/40 shadow-sm'
                            : 'text-[#9CA8BD] hover:text-[#F4F6FB] hover:bg-[#20283D]/60'
                        }`}
                      >
                        <div className="min-w-0 pr-3">
                          <div className="font-semibold text-sm text-[#F4F6FB] flex items-center space-x-2 whitespace-nowrap">
                            <span>{allTimeDateItem.humanDate}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#5689FF]/20 text-[#5689FF] border border-[#5689FF]/30 font-semibold">
                              All-Time
                            </span>
                          </div>
                          <div className="text-[11px] text-[#9CA8BD] mt-0.5 truncate">
                            Overall project output across all dates in sheet
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-[#5689FF]/15 text-[#5689FF] border border-[#5689FF]/30 whitespace-nowrap">
                            {allTimeDateItem.grandTotal.toLocaleString()} tasks
                          </span>
                        </div>
                      </button>
                    </div>
                  )}

                  {/* Daily Dates Section */}
                  <div className="pt-2 space-y-1">
                    <div className="px-3 py-1.5 text-[10px] font-bold tracking-wider text-[#9CA8BD] uppercase">
                      Daily Production Logs
                    </div>
                    {dailyDateItems.map((d) => {
                      const isLatest = d.date === latestDateItem?.date;
                      const isSelected = d.date === selectedDate;
                      return (
                        <button
                          key={d.date}
                          onClick={() => {
                            onDateChange(d.date);
                            setIsDateDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs text-left transition-all ${
                            isSelected
                              ? 'bg-[#20283D] text-[#9DDB00] font-semibold border border-[#9DDB00]/30 shadow-sm'
                              : 'text-[#9CA8BD] hover:text-[#F4F6FB] hover:bg-[#20283D]/50'
                          }`}
                        >
                          <div className="min-w-0 pr-2">
                            <div className="font-medium text-[#F4F6FB] flex items-center space-x-2 whitespace-nowrap">
                              <span>{d.humanDate}</span>
                              {isLatest && (
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#9DDB00]/20 text-[#9DDB00] border border-[#9DDB00]/30 font-semibold">
                                  Latest
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-[#9CA8BD] font-mono mt-0.5">
                              {d.date} • {d.activePods} active pods
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span
                              className={`font-mono text-xs font-semibold px-2.5 py-1 rounded-lg whitespace-nowrap ${
                                d.grandTotal > 0
                                  ? 'bg-[#9DDB00]/10 text-[#9DDB00] border border-[#9DDB00]/20'
                                  : 'bg-[#20283D] text-[#9CA8BD]'
                              }`}
                            >
                              {d.grandTotal.toLocaleString()} tasks
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right: Integrity Badge + Last Updated + Refresh Button + User Auth Status */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Data Integrity Audit Button */}
          <button
            onClick={onOpenIntegrityModal}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              discrepancyCount > 0
                ? 'bg-orange-950/40 border-[#FF9B52] text-[#FF9B52] hover:bg-orange-900/50 animate-pulse'
                : 'bg-[#20283D] border-[#2A3650] hover:border-[#9DDB00]/60 text-[#F4F6FB]'
            }`}
            title="Inspect Data Reconciliation and Discrepancy Checks"
          >
            <Shield className={`w-3.5 h-3.5 ${discrepancyCount > 0 ? 'text-[#FF9B52]' : 'text-[#9DDB00]'}`} />
            <span className="hidden sm:inline">Integrity:</span>
            <span className={`font-mono font-semibold ${discrepancyCount > 0 ? 'text-[#FF9B52]' : 'text-[#9DDB00]'}`}>
              {discrepancyCount > 0 ? `${discrepancyCount} Alert` : '100% Match'}
            </span>
          </button>

          {/* Last Updated badge */}
          <div className="hidden md:flex items-center space-x-1.5 text-xs text-[#9CA8BD] font-mono bg-[#191F30] px-3 py-1.5 rounded-lg border border-[#2A3650]">
            <Clock className="w-3.5 h-3.5 text-[#5689FF]" />
            <span>{getRelativeTime(lastUpdated)}</span>
            <span className="text-[#9CA8BD]/40">•</span>
            <span className="text-[10px] text-[#9CA8BD]">5m</span>
          </div>

          {/* Manual Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg bg-[#20283D] border border-[#2A3650] hover:border-[#9DDB00]/60 text-xs font-medium text-[#F4F6FB] transition-all hover:bg-[#2A3650]/80 active:scale-95 disabled:opacity-50 ${
              isRefreshing ? 'pointer-events-none' : ''
            }`}
            title="Refresh live data from Google Sheets"
          >
            <RotateCw
              className={`w-3.5 h-3.5 text-[#9DDB00] ${
                isRefreshing ? 'animate-spin' : ''
              }`}
            />
            <span className="hidden md:inline">
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </span>
          </button>

          {/* Team Access badge */}
          {isAuthenticated && (
            <div className="flex items-center space-x-2 pl-2 border-l border-[#2A3650]">
              <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded bg-[#5689FF]/10 border border-[#5689FF]/20 text-xs font-medium text-[#5689FF]">
                <Shield className="w-3.5 h-3.5" />
                <span>Team Access</span>
              </div>
              <button
                onClick={onLogout}
                className="p-2 rounded-lg text-[#9CA8BD] hover:text-[#FF9B52] hover:bg-[#20283D] border border-[#2A3650] transition-colors"
                title="Lock Dashboard / Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
