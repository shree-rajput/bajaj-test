import { useState } from "react";
import { useTickets } from "./hooks/useTickets";
import StatsStrip from "./components/StatsStrip";
import FiltersSection from "./components/FiltersSection";
import KanbanBoard from "./components/KanbanBoard";
import CreateTicketForm from "./components/CreateTicketForm";
import ThemeToggle from "./components/ThemeToggle";
import { KanbanSquare, Plus, X, RefreshCw } from "lucide-react";

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

  const [toasts, setToasts] = useState([]);
  const [showCreatePanel, setShowCreatePanel] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");

  const showToast = (message, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const handleStatusFilterClick = (statusId) => {
    if (statusId === "breached") {
      setFilters((prev) => ({
        ...prev,
        breached: prev.breached === true ? null : true,
      }));
      setStatusFilter("");
      return;
    }

    setStatusFilter((prev) => (prev === statusId ? "" : statusId));
    setFilters((prev) => ({ ...prev, breached: null }));
  };

  const handleDeleteTicket = async (id) => {
    const res = await removeTicket(id);
    showToast(
      res.success ? "Ticket deleted successfully." : res.error,
      res.success ? "success" : "error",
    );
  };

  const displayedTickets = statusFilter
    ? tickets.filter((ticket) => ticket.status === statusFilter)
    : tickets;

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand-area">
          <div className="brand-mark">
            <KanbanSquare size={22} />
          </div>
          <div>
            <h1 className="brand-title">DeskFlow</h1>
            <p className="brand-subtitle">Support Ticket Triage Board</p>
          </div>
        </div>

        <div className="header-actions">
          <button
            onClick={() => {
              refreshTickets();
              showToast("Tickets refreshed successfully.", "info");
            }}
            className="icon-button"
            title="Refresh Board"
            id="refresh-board-btn"
          >
            <RefreshCw size={18} />
          </button>

          <button
            onClick={() => setShowCreatePanel(!showCreatePanel)}
            className="icon-button primary-button mobile-only"
            title="Create Ticket"
            id="mobile-create-toggle-btn"
          >
            {showCreatePanel ? <X size={18} /> : <Plus size={18} />}
          </button>

          <ThemeToggle />
        </div>
      </header>

      <main className="app-main main-stack">
        <StatsStrip
          stats={stats}
          activeStatusFilter={
            statusFilter || (filters.breached === true ? "breached" : "")
          }
          onStatusFilterClick={handleStatusFilterClick}
        />

        <FiltersSection filters={filters} setFilters={setFilters} />

        {error && (
          <div className="alert">
            <span>{error}</span>
            <button onClick={refreshTickets} className="link-button">
              Retry
            </button>
          </div>
        )}

        <div className="work-area">
          <div className="board-area">
            <div className="board-heading">
              <h2 className="section-label">
                Triage Kanban Board{" "}
                {statusFilter && `(${statusFilter.replace("_", " ")} only)`}
              </h2>
              {statusFilter && (
                <button
                  onClick={() => setStatusFilter("")}
                  className="link-button"
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

          <div className={`create-panel ${showCreatePanel ? "" : "is-hidden"}`}>
            <CreateTicketForm
              onSubmitTicket={addTicket}
              showToast={showToast}
            />
          </div>
        </div>
      </main>

      <div className="toast-stack">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            <span>{toast.message}</span>
            <button
              onClick={() =>
                setToasts((prev) => prev.filter((item) => item.id !== toast.id))
              }
              className="toast-close"
            >
              x
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
