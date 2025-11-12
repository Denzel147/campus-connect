# CampusConnect - Admin System Guide

## 📊 Admin Dashboard Overview

The admin system allows administrators to view and manage all book requests, transactions, users, and system statistics.

## 🎯 Features

### 1. Dashboard Statistics
- **Total Transactions**: View all book lending/borrowing transactions
- **Pending Requests**: See how many requests are waiting for approval
- **Active Borrowings**: Track currently borrowed books
- **Completed Transactions**: View history of completed transactions
- **Total Books**: Monitor all books in the system
- **Total Users**: Track registered users

### 2. Book Request Management
- View all book requests with details
- Filter by status (pending, active, completed, overdue)
- See borrower information
- Track request dates
- Monitor book availability

### 3. Book-Specific Analytics
- See how many users requested a specific book
- View all requesters for a particular book
- Track book popularity
- Monitor lending history

## 🌐 Frontend Access

### Navigation
1. Open: `http://localhost:3000`
2. Look at bottom navigation bar
3. Click the **"Admin"** tab (🛡️ shield icon)

### Dashboard View
The admin dashboard shows:
- **Statistics Cards**: Key metrics at a glance
- **Recent Requests Table**: Latest book requests
- **Status Indicators**: Visual status badges

## 🔧 Backend API Endpoints

### Base URL: `http://localhost:3001/api/admin`

### 1. Get Dashboard Statistics
```http
GET /api/admin/dashboard
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transactions": {
      "total": 150,
      "pending": 12,
      "active": 28,
      "completed": 95,
      "overdue": 15
    },
    "items": {
      "total": 320,
      "available": 245,
      "borrowed": 60,
      "reserved": 15
    },
    "users": {
      "total": 450,
      "active": 420,
      "verified": 380
    }
  }
}
```

### 2. Get All Book Requests
```http
GET /api/admin/requests?status=all&page=1&limit=20
```

**Query Parameters:**
- `status`: Filter by status (all, pending, active, completed, cancelled, overdue)
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 20)
- `sortBy`: Sort field (default: date_created)
- `order`: Sort order (ASC/DESC, default: DESC)

**Response:**
```json
{
  "success": true,
  "data": {
    "requests": [
      {
        "transaction_id": 1,
        "book_title": "Introduction to Algorithms",
        "borrower_name": "John Doe",
        "borrower_email": "john@university.edu",
        "borrower_phone": "+1234567890",
        "lender_name": "Jane Smith",
        "transaction_status": "pending",
        "start_date": "2024-11-10",
        "expected_return_date": "2024-11-20",
        "created_at": "2024-11-10T10:00:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 8,
      "totalCount": 150,
      "limit": 20
    }
  }
}
```

### 3. Get Book Statistics
```http
GET /api/admin/books/:itemId/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "item_id": 1,
    "title": "Introduction to Algorithms",
    "owner_name": "Jane Smith",
    "total_requests": 15,
    "pending_requests": 3,
    "active_borrows": 1,
    "completed_borrows": 10,
    "late_returns": 1
  }
}
```

### 4. Get All Users Who Requested a Book
```http
GET /api/admin/books/:itemId/requesters
```

**Response:**
```json
{
  "success": true,
  "data": {
    "itemId": 1,
    "totalRequesters": 15,
    "requesters": [
      {
        "transaction_id": 1,
        "transaction_status": "completed",
        "request_date": "2024-11-01T10:00:00Z",
        "user_id": 5,
        "full_name": "John Doe",
        "email": "john@university.edu",
        "phone_number": "+1234567890",
        "department": "Computer Science",
        "student_id": "CS2024001",
        "rating": 4.5
      }
    ]
  }
}
```

### 5. Get User Activity
```http
GET /api/admin/users/:userId/activity
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user_id": 5,
    "full_name": "John Doe",
    "email": "john@university.edu",
    "books_listed": 3,
    "active_lendings": 1,
    "active_borrowings": 2,
    "completed_lendings": 5,
    "completed_borrowings": 8
  }
}
```

## 📊 Use Cases

### Scenario 1: View All Book Requests
**Goal**: Admin wants to see all pending book requests

**Steps**:
1. Navigate to Admin dashboard
2. View "Recent Book Requests" table
3. See all pending requests with borrower details
4. Filter by status if needed

### Scenario 2: Track Popular Books
**Goal**: Admin wants to know which books are most requested

**API Call**:
```bash
curl http://localhost:3001/api/admin/books/1/stats
```

**Result**: See how many users requested the book

### Scenario 3: Find All Users Who Requested a Specific Book
**Goal**: Admin wants to contact all users interested in "Introduction to Algorithms"

**API Call**:
```bash
curl http://localhost:3001/api/admin/books/1/requesters
```

**Result**: Get list of all users with contact information

### Scenario 4: Monitor User Activity
**Goal**: Admin wants to check a user's lending/borrowing history

**API Call**:
```bash
curl http://localhost:3001/api/admin/users/5/activity
```

**Result**: See complete user statistics

## 🔐 Security

### Authentication Required
All admin endpoints require authentication:
```http
Authorization: Bearer <token>
```

### Recommended: Add Admin Role Check
In production, add middleware to verify admin role:
```javascript
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};
```

## 🎨 Frontend Dashboard Features

### Statistics Cards
- **Visual Design**: Gradient backgrounds for each metric
- **Real-time Updates**: Data refreshes automatically
- **Color Coding**:
  - Purple gradient: Transactions
  - Pink gradient: Books
  - Blue gradient: Users

### Recent Requests Table
- **Columns**: Book Title, Borrower, Status, Date
- **Status Badges**:
  - Yellow: Pending
  - Blue: Active
  - Green: Completed
- **Sortable**: Click headers to sort
- **Filterable**: Use status filters

## 🛠️ Testing the Admin System

### 1. Start the Backend
```bash
cd /home/gedeon/Class/campus-connect/backend
npm start
```

### 2. Test API Endpoints
```bash
# Get dashboard stats
curl http://localhost:3001/api/admin/dashboard

# Get all requests
curl http://localhost:3001/api/admin/requests?status=all

# Get book requesters
curl http://localhost:3001/api/admin/books/1/requesters
```

### 3. View Frontend Dashboard
```
1. Open: http://localhost:3000
2. Click "Admin" tab at bottom
3. View statistics and requests
```

## 📈 Data Flow

```
User Requests Book → Transaction Created → Admin Dashboard Updated
                ↓
        Admin Views Request
                ↓
        Admin Sees:
        - Borrower details
        - Book information
        - Request status
        - History
```

## 💡 Future Enhancements

### Planned Features:
1. **Approve/Reject Requests**: Let admin approve/reject book requests
2. **Send Notifications**: Notify users about request status
3. **Export Data**: Download reports as CSV/PDF
4. **Charts & Graphs**: Visual analytics with charts
5. **Search & Filters**: Advanced search functionality
6. **Bulk Actions**: Manage multiple requests at once

## 🚀 Quick Start

### For Admins:
1. **Access Dashboard**: Click Admin tab
2. **View Stats**: See key metrics at top
3. **Check Requests**: Scroll down to see recent requests
4. **Get Details**: Click on any book to see all requesters

### For Developers:
1. **Add to Server**: Admin routes already integrated
2. **Test Endpoints**: Use provided curl commands
3. **Customize**: Modify `adminController.js` as needed
4. **Extend**: Add new admin features in `admin.js` routes

## 📝 Notes

- Current implementation shows mock data in frontend
- Backend API is fully functional
- Connect frontend to backend by replacing mock data with API calls
- Add authentication before deploying to production
- Consider adding admin role verification

## 🔗 Related Files

- Backend Controller: `/backend/src/controllers/adminController.js`
- Backend Routes: `/backend/src/routes/admin.js`
- Frontend Component: `/frontend/react.js` (AdminDashboard function)
- Database Models: `/backend/src/models/Transaction.js`

---

**Built for CampusConnect - Track all book requests and user activity! 📚✨**
