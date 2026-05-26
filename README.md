# DeskFlow — Support Ticket Triage Board

DeskFlow is a production-level, full-stack MERN support ticket management and triage board. It provides a real-time Kanban interface for support agents to manage ticket lifecycles, enforce strict status transition rules, and monitor Service Level Agreement (SLA) response breaches.

---

## 🚀 Key Features

*   **Kanban Triage Board**: Move tickets smoothly through columns: **Open**, **In Progress**, **Resolved**, and **Closed**.
*   **Drag-and-Drop + Quick Actions**: Drag tickets between columns (using `@hello-pangea/dnd`) with validation and instant snaps on invalid moves, plus quick-action arrows for mobile and keyboard usability.
*   **Strict Transition Constraints**: Enforces status rules (e.g. no skipping statuses) on both front and back ends.
*   **Dynamic Derived Metrics**: Real-time ticket age and SLA breach state tracking. Calculation stops once resolved. Derived fields are calculated on-the-fly and never stored stale in MongoDB.
*   **Stats Strip & Multi-Filters**: Interactive counters summarizing counts. Filter board cards by Priority and SLA breach status instantly.
*   **Create Ticket Form**: High-quality submission widget with inline error highlighting and instant updates.
*   **Theme Engine**: Fluid transition toggle for light/dark mode.
*   **Optimistic UI with Transaction Rollbacks**: Instant frontend placement with state revert safety if backend saves fail.

---

## 📁 Project Structure

```text
DeskFlow/
│
├── backend/
│   ├── src/
│   │   ├── config/          # Database configuration (Mongoose connection)
│   │   ├── controllers/     # Controller methods for ticket endpoints
│   │   ├── middleware/      # Schema validation and global error handling
│   │   ├── models/          # Ticket Mongoose Schema (virtual fields for SLA/age)
│   │   ├── routes/          # Express API route bindings
│   │   ├── utils/           # Database-level SLA breach query builders
│   │   ├── app.js           # Express app configuring CORS and routers
│   │   └── server.js        # Server bootloader & uncaught error handlers
│   ├── package.json
│   └── .env                 # Environment config (Port, MongoDB URI)
│
└── frontend/
    ├── src/
    │   ├── api/             # Axios API instance and endpoints abstraction
    │   ├── components/      # UI components (KanbanBoard, StatsStrip, Filters, etc.)
    │   ├── hooks/           # useTickets state hook (optimistic transitions, fetchers)
    │   ├── styles/          # Tailwind setup and index.css base styles
    │   ├── App.jsx          # Shell layout, Toast alerts engine
    │   └── main.jsx         # Client bootstrapper
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── package.json
    └── index.html
```

---

## 🛠️ Installation & Setup

### Prerequisites
*   Node.js (v18+)
*   npm (v9+)
*   MongoDB Instance (Local Community Server or Atlas URL)

### 1. Backend Configuration
1.  Navigate to the backend folder:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the `backend/` directory:
    ```env
    PORT=5000
    MONGODB_URI=mongodb://127.0.0.1:27017/deskflow
    NODE_ENV=development
    ```
4.  Start development server:
    ```bash
    npm run dev
    ```

### 2. Frontend Configuration
1.  Navigate to the frontend folder:
    ```bash
    cd ../frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start Vite dev server:
    ```bash
    npm run dev
    ```
4.  Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔌 API Documentation & Test Examples

All API endpoints are mounted on `/tickets`.

### 1. Create Ticket
*   **Endpoint**: `POST /tickets`
*   **Body**:
    ```json
    {
      "subject": "Unable to login to portal",
      "description": "Getting a 500 error when clicking the login button on my profile.",
      "customerEmail": "customer@example.com",
      "priority": "high"
    }
    ```
*   **Example curl**:
    ```bash
    curl -X POST http://localhost:5000/tickets \
      -H "Content-Type: application/json" \
      -d '{"subject":"Portal login failing","description":"500 error on profile login.","customerEmail":"customer@example.com","priority":"high"}'
    ```

### 2. Get All Tickets (with dynamic filters)
*   **Endpoint**: `GET /tickets`
*   **Query Parameters** (combinable):
    *   `status`: `open` | `in_progress` | `resolved` | `closed`
    *   `priority`: `low` | `medium` | `high` | `urgent`
    *   `breached`: `true`
*   **Example curl**:
    ```bash
    curl -X GET "http://localhost:5000/tickets?priority=high&breached=true"
    ```

### 3. Update Status (Transition Rule Enforced)
*   **Endpoint**: `PATCH /tickets/:id`
*   **Body**:
    ```json
    {
      "status": "in_progress"
    }
    ```
*   **Rules Matrix**:
    *   `open` ➔ `in_progress` (Allowed)
    *   `in_progress` ➔ `open` | `resolved` (Allowed)
    *   `resolved` ➔ `in_progress` | `closed` (Allowed)
    *   `closed` ➔ `resolved` (Allowed)
    *   *All other jumps (e.g. `open` ➔ `resolved`) will return HTTP 400 with a detailed error.*
*   **Example curl**:
    ```bash
    curl -X PATCH http://localhost:5000/tickets/TICKET_ID_HERE \
      -H "Content-Type: application/json" \
      -d '{"status":"in_progress"}'
    ```

### 4. Delete Ticket
*   **Endpoint**: `DELETE /tickets/:id`
*   **Example curl**:
    ```bash
    curl -X DELETE http://localhost:5000/tickets/TICKET_ID_HERE
    ```

### 5. Fetch Board Stats
*   **Endpoint**: `GET /tickets/stats`
*   **Example curl**:
    ```bash
    curl -X GET http://localhost:5000/tickets/stats
    ```

---

## ⏱️ SLA Priority Resolution Targets
*   `urgent` ➔ 1 hour
*   `high` ➔ 4 hours
*   `medium` ➔ 24 hours
*   `low` ➔ 72 hours

*Note: If unresolved, `slaBreached` evaluates to `true` when age exceeds limits. When status changes to `resolved`, age calculation stops and the breach state freezes (based on time taken to resolve).*

---

## 🌐 Production Cloud Deployment

### Backend Deployment (Render / Railway)
1.  Push the code to a Git repository.
2.  Set Root Directory to `backend`.
3.  Set Build Command to `npm install`.
4.  Set Start Command to `npm start`.
5.  Set Environment Variables in the cloud dashboard:
    *   `NODE_ENV=production`
    *   `PORT=8080`
    *   `MONGODB_URI=your_mongodb_atlas_connection_string`

### Frontend Deployment (Vercel / Netlify)
1.  Push the code to a Git repository.
2.  Set Root Directory to `frontend`.
3.  Set Framework Preset to `Vite`.
4.  Set Build Command to `npm run build`.
5.  Set Output Directory to `dist`.
6.  Set Environment Variables:
    *   `VITE_API_BASE_URL=https://your-backend-url.com/tickets`
