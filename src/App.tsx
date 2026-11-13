import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { AuthModal } from './components/AuthModal';
import { IntegrityModal } from './components/IntegrityModal';
import { OverviewPage } from './pages/OverviewPage';
import { AnnotatorsPage } from './pages/AnnotatorsPage';
import { DailyProductionPage } from './pages/DailyProductionPage';
import {
  ProductionOverview,
  AnnotatorResponse,
  DailyProductionResponse,
  DateItem,
} from './types';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'overview' | 'annotators' | 'daily'>('overview');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [dates, setDates] = useState<DateItem[]>([]);
  const [selectedPodFilter, setSelectedPodFilter] = useState<string>('all');
  const [annotatorStatusFilter, setAnnotatorStatusFilter] = useState<'active' | 'zero' | 'all'>('active');

  // Data states
  const [overviewData, setOverviewData] = useState<ProductionOverview | null>(null);
  const [annotatorsData, setAnnotatorsData] = useState<AnnotatorResponse | null>(null);
  const [dailyData, setDailyData] = useState<DailyProductionResponse | null>(null);

  // Loading and refreshing states
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toISOString());
  const [dataSourceMode, setDataSourceMode] = useState<string>('verified_sheet_snapshot');

  // UI state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isIntegrityModalOpen, setIsIntegrityModalOpen] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem('ax_prod_auth_token');
  });

  // Fetch available dates and return latest date
  const fetchDates = useCallback(async () => {
    try {
      const res = await fetch('/api/dates');
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json = await res.json();
      if (json && json.dates) {
        setDates(json.dates);
        if (json.lastUpdated) {
          setLastUpdated(json.lastUpdated);
        }
        if (json.dataSourceMode) {
          setDataSourceMode(json.dataSourceMode);
        }
        const latest = json.latestDate || (json.dates[0] ? json.dates[0].date : '');
        return latest;
      }
    } catch (err: any) {
      console.warn('Failed to fetch dates:', err.message);
    }
    return '';
  }, []);

  // Fetch data for Overview Page
  const fetchOverview = useCallback(async (date: string) => {
    try {
      const res = await fetch(`/api/production?date=${date}`);
      if (!res.ok) throw new Error(`Failed to fetch overview (${res.status})`);
      const json: ProductionOverview = await res.json();
      setOverviewData(json);
      setLastUpdated(json.lastUpdated || new Date().toISOString());
      if (json.dataSourceMode) setDataSourceMode(json.dataSourceMode);
      setErrorMessage(null);
    } catch (err: any) {
      setErrorMessage(`Error loading overview: ${err.message}`);
    }
  }, []);

  // Fetch data for Annotators Page
  const fetchAnnotators = useCallback(async (date: string, pod: string, status: 'active' | 'zero' | 'all') => {
    try {
      const res = await fetch(`/api/annotators?date=${date}&pod=${pod}&status=${status}`);
      if (!res.ok) throw new Error(`Failed to fetch annotators (${res.status})`);
      const json: AnnotatorResponse = await res.json();
      setAnnotatorsData(json);
      setLastUpdated(json.lastUpdated || new Date().toISOString());
      setErrorMessage(null);
    } catch (err: any) {
      setErrorMessage(`Error loading annotator data: ${err.message}`);
    }
  }, []);

  // Fetch data for Daily Production Page
  const fetchDaily = useCallback(async (date: string) => {
    try {
      const res = await fetch(`/api/daily-production?date=${date}`);
      if (!res.ok) throw new Error(`Failed to fetch daily production (${res.status})`);
      const json: DailyProductionResponse = await res.json();
      setDailyData(json);
      setLastUpdated(json.lastUpdated || new Date().toISOString());
      setErrorMessage(null);
    } catch (err: any) {
      setErrorMessage(`Error loading daily breakdown: ${err.message}`);
    }
  }, []);

  // Load appropriate page data whenever dependencies change
  useEffect(() => {
    let mounted = true;
    const loadCurrent = async () => {
      setIsLoading(true);
      let activeDate = selectedDate;
      if (!activeDate) {
        const latest = await fetchDates();
        if (latest) {
          activeDate = latest;
          setSelectedDate(latest);
        }
      } else {
        await fetchDates();
      }

      if (!activeDate) {
        if (mounted) setIsLoading(false);
        return;
      }

      if (currentPage === 'overview') {
        await fetchOverview(activeDate);
      } else if (currentPage === 'annotators') {
        await fetchAnnotators(activeDate, selectedPodFilter, annotatorStatusFilter);
      } else if (currentPage === 'daily') {
        await fetchDaily(activeDate);
      }
      if (mounted) setIsLoading(false);
    };

    loadCurrent();
    return () => {
      mounted = false;
    };
  }, [currentPage, selectedDate, selectedPodFilter, annotatorStatusFilter, fetchDates, fetchOverview, fetchAnnotators, fetchDaily]);

  // Automatic refresh every 5 minutes (300,000 ms)
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔄 Triggering 5-minute auto-refresh in frontend...');
      handleRefresh(false);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [currentPage, selectedDate, selectedPodFilter, annotatorStatusFilter]);

  // Manual refresh handler
  const handleRefresh = async (isManual = true) => {
    if (isManual) setIsRefreshing(true);
    try {
      await fetch('/api/refresh', { method: 'POST' });
      const latest = await fetchDates();
      const activeDate = selectedDate || latest;
      if (currentPage === 'overview') {
        await fetchOverview(activeDate);
      } else if (currentPage === 'annotators') {
        await fetchAnnotators(activeDate, selectedPodFilter, annotatorStatusFilter);
      } else if (currentPage === 'daily') {
        await fetchDaily(activeDate);
      }
    } catch (err: any) {
      console.error('Refresh failed:', err.message);
    } finally {
      if (isManual) {
        setTimeout(() => setIsRefreshing(false), 400);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ax_prod_auth_token');
    setIsAuthenticated(false);
  };

  const handleNavigateToPod = (podId: string) => {
    setSelectedPodFilter(podId);
    setCurrentPage('annotators');
  };

  return (
    <div className="min-h-screen bg-[#111522] flex text-[#F4F6FB]">
      {/* Team Access Authentication Gate */}
      {!isAuthenticated && (
        <AuthModal onSuccess={() => setIsAuthenticated(true)} />
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={(page) => setCurrentPage(page)}
        onSelectPodFilter={handleNavigateToPod}
        pods={overviewData?.pods || []}
        selectedDate={selectedDate}
        dataSourceMode={dataSourceMode}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          selectedDate={selectedDate}
          onDateChange={(d) => setSelectedDate(d)}
          dates={dates}
          lastUpdated={lastUpdated}
          isRefreshing={isRefreshing}
          onRefresh={() => handleRefresh(true)}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          isAuthenticated={isAuthenticated}
          onLogout={handleLogout}
          discrepancyCount={overviewData?.discrepancies?.length || 0}
          onOpenIntegrityModal={() => setIsIntegrityModalOpen(true)}
        />

        {/* Data Integrity Audit Modal */}
        <IntegrityModal
          isOpen={isIntegrityModalOpen}
          onClose={() => setIsIntegrityModalOpen(false)}
          selectedDate={selectedDate}
          humanDate={overviewData?.humanDate || selectedDate}
          pods={overviewData?.pods || []}
          discrepancies={overviewData?.discrepancies || []}
          lastUpdated={lastUpdated}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* Error alert banner */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-500/40 flex items-center justify-between text-xs text-red-300">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
              <button
                onClick={() => handleRefresh(true)}
                className="px-2.5 py-1 rounded bg-[#20283D] border border-[#2A3650] text-[#F4F6FB] hover:bg-[#2A3650]"
              >
                Retry
              </button>
            </div>
          )}

          {/* Page Routing */}
          {currentPage === 'overview' && (
            <OverviewPage
              overview={overviewData}
              isLoading={isLoading}
              onNavigateToPod={handleNavigateToPod}
              onOpenIntegrityModal={() => setIsIntegrityModalOpen(true)}
            />
          )}

          {currentPage === 'annotators' && (
            <AnnotatorsPage
              data={annotatorsData}
              isLoading={isLoading}
              selectedPod={selectedPodFilter}
              onSelectPod={(p) => setSelectedPodFilter(p)}
              statusFilter={annotatorStatusFilter}
              onSelectStatusFilter={(s) => setAnnotatorStatusFilter(s)}
            />
          )}

          {currentPage === 'daily' && (
            <DailyProductionPage
              data={dailyData}
              isLoading={isLoading}
              dates={dates}
              selectedDate={selectedDate}
              onSelectDate={(d) => setSelectedDate(d)}
            />
          )}
        </main>
      </div>
    </div>
  );
};
