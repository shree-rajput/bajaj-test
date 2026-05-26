import React, { useState } from 'react';
import { useTickets } from './hooks/useTickets';
import StatsStrip from './components/StatsStrip';
import FiltersSection from './components/FiltersSection';
import KanbanBoard from './components/KanbanBoard';
import CreateTicketForm from './components/CreateTicketForm';
import ThemeToggle from './components/ThemeToggle';
import { KanbanSquare, Plus, X, RefreshCw } from 'lucide-react';

export const App = () => {
  const {
    tickets,
    stats,
    filters,
    setFilters,
    loading,
    error,
    refreshTickets,
    addTicket,
    changeTicketStatus,
    removeTicket,
  } = useTickets();

  // Local state for toast notification list
  const [toasts, setToasts] = useState([]);
  // Local state to toggle showing Create Ticket panel on smaller screens
  const [showCreatePanel, setShowCreatePanel] = useState(false);
  // Status filter state (activated when user clicks stat cards)
  const [statusFilter, setStatusFilter] = useState('');

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const handleStatusFilterClick = (statusId) => {
    if (statusId === 'breached') {
      // If clicking breached stats card, toggle breached filter in search
      setFilters((prev) => ({
        ...prev,
        breached: prev.breached === true ? null : true,
      }));
      setStatusFilter('');
    } else {
      // If clicking standard status card, toggle status filter
      setStatusFilter((prev) => (prev === statusId ? '' : statusId));
      // Clear breached filter if it was active
      setFilters((prev) => ({ ...prev, breached: null }));
    }
  };

  const handleDeleteTicket = async (id) => {
    const res = await removeTicket(id);
    if (res.success) {
      showToast('Ticket deleted successfully.', 'success');
    } else {
      showToast(res.error, 'error');
    }
  };

  // Filter tickets in memory based on the status card clicked (if any)
  const displayedTickets = statusFilter
    ? tickets.filter((t) => t.status === statusFilter)
    : tickets;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* HEADER SECTION */}
      <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand rounded-xl text-white shadow-md shadow-brand/20">
            <KanbanSquare className="h-5.5 w-5.5" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-brand to-indigo-500 dark:from-brand-light dark:to-indigo-400 bg-clip-text text-transparent">
              DeskFlow
            </h1>
            <p className="text-[10px] sm:text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider -mt-0.5">
              Support Ticket Triage Board
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh Action */}
          <button
            onClick={() => {
              refreshTickets();
              showToast('Tickets refreshed successfully.', 'info');
            }}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-all shadow-sm cursor-pointer"
            title="Refresh Board"
            id="refresh-board-btn"
          >
            <RefreshCw className="h-4.5 w-4.5" />
          </button>

          {/* Quick Create Toggle for Mobile */}
          <button
            onClick={() => setShowCreatePanel(!showCreatePanel)}
            className="md:hidden p-2.5 rounded-xl border border-transparent bg-brand hover:bg-brand-dark text-white transition-all shadow-sm flex items-center justify-center cursor-pointer"
            title="Create Ticket"
            id="mobile-create-toggle-btn"
          >
            {showCreatePanel ? <X className="h-4.5 w-4.5" /> : <Plus className="h-4.5 w-4.5" />}
          </button>

          {/* Theme Toggle */}
          <ThemeToggle />
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
        
        {/* STATS STRIP */}
        <StatsStrip
          stats={stats}
          activeStatusFilter={statusFilter || (filters.breached === true ? 'breached' : '')}
          onStatusFilterClick={handleStatusFilterClick}
        />

        {/* FILTERS SECTION */}
        <FiltersSection filters={filters} setFilters={setFilters} />

        {error && (
          <div className="p-4 rounded-xl border border-rose-100 dark:border-rose-950/40 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-sm font-semibold shadow-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={refreshTickets} className="underline text-xs hover:text-rose-700 dark:hover:text-rose-300">
              Retry
            </button>
          </div>
        )}

        {/* TRIAGE BOARD & CREATION WRAPPER */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          {/* Kanban Triage Board */}
          <div className="flex-1 w-full order-2 lg:order-1">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Triage Kanban Board {statusFilter && `(${statusFilter.replace('_', ' ')} only)`}
              </h2>
              {statusFilter && (
                <button
                  onClick={() => setStatusFilter('')}
                  className="text-xs font-semibold text-brand dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  Clear Status Filter
                </button>
              )}
            </div>
            <KanbanBoard
              tickets={displayedTickets}
              onMoveStatus={changeTicketStatus}
              onDeleteTicket={handleDeleteTicket}
              loading={loading}
              showToast={showToast}
            />
          </div>

          {/* Create Ticket Panel - Sidebar on Desktop */}
          <div
            className={`w-full lg:w-[350px] shrink-0 order-1 lg:order-2 ${
              showCreatePanel ? 'block' : 'hidden lg:block'
            }`}
          >
            <CreateTicketForm onSubmitTicket={addTicket} showToast={showToast} />
          </div>
        </div>
      </main>

      {/* CUSTOM TOAST SYSTEM */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-[90%] sm:w-full">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`p-4 rounded-xl shadow-xl text-xs sm:text-sm font-semibold border flex items-center justify-between gap-3 text-white transition-all duration-300 transform translate-y-0 scale-100 ${
              t.type === 'success'
                ? 'bg-emerald-600 border-emerald-500 shadow-emerald-500/10'
                : t.type === 'error'
                ? 'bg-rose-600 border-rose-500 shadow-rose-500/10'
                : t.type === 'warning'
                ? 'bg-amber-600 border-amber-500 shadow-amber-500/10'
                : 'bg-slate-800 border-slate-700 dark:bg-slate-900 dark:border-slate-800 shadow-slate-900/20'
            }`}
          >
            <span>{t.message}</span>
            <button
              onClick={() => setToasts((prev) => prev.filter((toast) => toast.id !== t.id))}
              className="text-white/80 hover:text-white font-extrabold focus:outline-none shrink-0 cursor-pointer p-0.5"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
