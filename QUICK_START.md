# Quick Start Guide - CampusConnect

## Frontend (React App)
The frontend should now be open in your browser. If not, open:
`frontend/index.html` directly in your web browser.

The frontend works standalone and doesn't require the backend to function for basic UI testing.

## Backend (API Server)

### To Start the Backend:

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create .env file** (copy from .env.example if needed):
   ```env
   PORT=3001
   NODE_ENV=development
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=campus_connect_db
   DB_USER=postgres
   DB_PASSWORD=Mbabazi31?
   JWT_SECRET=your_secret_key_here
   ```

3. **Ensure PostgreSQL is running** and database exists

4. **Start the server:**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

5. **Check if running:**
   - Visit: http://localhost:3001/health
   - API Docs: http://localhost:3001/api-docs

### Backend Status:
- Server Port: 3001
- Health Check: http://localhost:3001/health
- API Docs: http://localhost:3001/api-docs

### Frontend Status:
- Open `frontend/index.html` in browser
- Currently works standalone (no backend connection yet)

