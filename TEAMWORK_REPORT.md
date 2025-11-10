# CampusConnect Teamwork & Project Management Report

**Institution:** African Leadership University  
**Course:** Foundations Project  
**Project:** CampusConnect – A Peer-to-Peer Campus Resource Sharing Platform  
**GitHub Repository:** https://github.com/Denzel147/campus-connect

---

## 1. Project Management Tools

The team utilized **Trello** as the primary project management tool to organize tasks, assign roles, and monitor progress across all sprints. Trello enabled effective sprint planning and tracking, with lists such as 'To Do', 'In Progress', and 'Done' ensuring transparency and accountability. Each team member updated their progress weekly to maintain alignment with project goals.

**Tool Used:** Trello  
**Purpose:** Task management, progress tracking, and sprint coordination.  
**Evidence:** *(Insert Trello Board Screenshot Here)*

**Key Features Utilized:**
- Sprint planning boards for each development phase
- Card assignments with team member tags
- Due dates and priority labels
- Progress tracking through card movement

---

## 2. Team Collaboration

The CampusConnect team primarily communicated via **WhatsApp** for daily coordination and updates. **Weekly Google Meet sessions** were held for progress reviews and decision-making. **GitHub** was used for version control and collaborative development of the system's backend and frontend components. Each member pushed commits regularly to the shared repository.

**Tools Used:** 
- WhatsApp (daily communication)
- GitHub (version control and code collaboration)
- Google Meet (weekly meetings)

**Evidence:** *(Insert Screenshots of WhatsApp Chats or Meeting Notes Here)*

### GitHub Collaboration Statistics
- **Repository:** https://github.com/Denzel147/campus-connect
- **Recent Commits:**
  - `0af91d7` - implementing core tables and relationships
  - `c78f96b` - moving changes to the data architecture branch
  - `0a40a04` - refactor: change api-docs port
  - `7e06d3d` - feat: add main server application with comprehensive middleware stack
  - `048098f` - feat: add Category and Notification routes
  - `2ccd01c` - feat: add Transaction routes for complete lending workflow
  - `cbe7e68` - feat: add Items routes with advanced search and filtering
  - `239375a` - feat: add Authentication routes with comprehensive Swagger documentation

**Branch Strategy:**
- `main` - Production-ready code
- `data_architecture` - Database schema and migration work
- Feature branches for individual components

---

## 3. Progress Documentation

### Evidence Type: Figma Design
**Description:** UI/UX prototypes created by Gedeon  
**Evidence:** *(Insert Figma Link or Screenshot Here)*

**Design Components:**
- User registration and login interfaces
- Book browsing and search interface
- Book listing form
- User profile dashboard
- Notification system UI
- Mobile-responsive layouts

---

### Evidence Type: Database Schema
**Description:** PostgreSQL ERD and schema developed by Agnes  
**Evidence:** *(Insert Database ERD Diagram Screenshot Here)*

**Database Architecture:**
- **Technology:** PostgreSQL 15+
- **Schema Location:** `backend/src/utils/migrate.js` and `database/schema.sql`
- **Total Tables:** 6 core entities

**Database Structure:**

#### 1. Users Table
- Primary key: `user_id`
- Authentication: Email/password with bcrypt hashing
- User profile fields: full_name, phone_number, institution, department, student_id
- Rating and activity tracking: rating, total_lends, total_borrows
- Status management: account_status, verification_status

#### 2. Categories Table
- Primary key: `category_id`
- Fields: category_name, description, icon
- Active status flag for category management

#### 3. Items Table
- Primary key: `item_id`
- Foreign keys: owner_id → users, category → categories
- Book details: item_name, description, condition, isbn, author, publication_year
- Availability: availability_status, sharing_type, location, due_date
- Timestamps: date_listed, date_updated

#### 4. Transactions Table
- Primary key: `transaction_id`
- Foreign keys: item_id → items, lender_id → users, borrower_id → users
- Transaction lifecycle: transaction_type, transaction_status
- Date tracking: borrow_date, due_date, return_date
- Late tracking: late_return, days_overdue

#### 5. Reviews Table
- Primary key: `review_id`
- Foreign keys: transaction_id → transactions, reviewer_id → users, reviewee_id → users
- Rating system: rating (1-5), comment, review_type

#### 6. Notifications Table
- Primary key: `notification_id`
- Foreign keys: user_id → users, related_item_id → items, related_transaction_id → transactions
- Notification management: notification_type, message, is_read, priority

**Database Optimizations:**
- Indexes on frequently queried columns (owner_id, category, availability_status)
- Foreign key constraints with CASCADE and SET NULL where appropriate
- Unique constraints on email addresses
- Check constraints on rating values (1-5)

---

### Evidence Type: Frontend Implementation
**Description:** HTML, CSS, JavaScript/React interfaces by Emeka & Isimbi  
**Evidence:** *(Insert Frontend Screenshot Here)*

**Frontend Technologies:**
- React 18 (via CDN)
- React DOM 18
- Babel Standalone (JSX transformation)
- Lucide Icons
- Vanilla CSS

**Frontend Structure:**
```
frontend/
├── index.html          # Main entry point
├── react.js            # React components and logic (676 lines)
├── style.css          # Complete styling system
└── favicon.svg        # App icon
```

**Implemented Frontend Features:**

1. **Browse Books Tab**
   - Real-time search functionality
   - Book listing with availability status
   - Favorite/save books feature
   - Recent searches tracking
   - Filter by saved items

2. **Home Tab**
   - User welcome dashboard
   - Semester progress tracking
   - Recommended items
   - Quick action buttons

3. **Courses Tab**
   - Course-centric book browsing
   - Course selection dropdown
   - Filtered book listings by course

4. **Lend a Book Tab**
   - Comprehensive form for listing books
   - Student information fields
   - Book details and condition
   - Availability date range
   - Smart suggestions based on course
   - Listed books management

5. **Profile Tab**
   - User statistics dashboard
   - Books listed counter
   - Available books count
   - Settings options
   - About section

**UI/UX Features:**
- Dark/Light theme switching
- Responsive mobile-first design
- Toast notifications for user feedback
- Loading skeletons
- Onboarding flow for new users
- Accessibility features (ARIA labels, semantic HTML)

---

### Evidence Type: Backend/API Implementation
**Description:** Node.js/Express backend developed by Seth  
**Evidence:** *(Insert Backend Code Screenshot Here)*

**Backend Technologies:**
- Node.js 16+
- Express.js 4.18.2
- PostgreSQL 8.16.3
- JWT Authentication (jsonwebtoken 9.0.2)
- Joi validation 17.11.0
- Winston logging 3.11.0
- Swagger/OpenAPI documentation

**Backend Architecture:**
```
backend/
├── src/
│   ├── server.js              # Main Express application
│   ├── config/
│   │   ├── database.js        # PostgreSQL connection pool
│   │   ├── logger.js          # Winston logging configuration
│   │   └── swagger.js         # API documentation setup
│   ├── controllers/
│   │   ├── authController.js      # Authentication logic
│   │   ├── itemController.js      # Item/Book management
│   │   ├── transactionController.js # Transaction management
│   │   ├── categoryController.js   # Category management
│   │   └── notificationController.js # Notification system
│   ├── middleware/
│   │   ├── auth.js            # JWT authentication middleware
│   │   ├── errorHandler.js    # Global error handling
│   │   └── validation.js     # Input validation middleware
│   ├── models/
│   │   ├── User.js            # User data access layer
│   │   ├── Item.js            # Item data access layer
│   │   ├── Transaction.js     # Transaction data access layer
│   │   ├── Category.js        # Category data access layer
│   │   └── Notification.js    # Notification data access layer
│   ├── routes/
│   │   ├── auth.js            # Authentication routes
│   │   ├── items.js           # Item routes
│   │   ├── transactions.js    # Transaction routes
│   │   ├── categories.js      # Category routes
│   │   └── notifications.js  # Notification routes
│   └── utils/
│       ├── migrate.js         # Database migration utility
│       ├── seed.js            # Database seeding utility
│       └── validation.js      # Joi validation schemas
```

**API Endpoints Implemented:**

#### Authentication (`/api/auth`)
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login with JWT
- `POST /api/auth/refresh` - Token refresh
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `GET /api/auth/stats` - User statistics

#### Items (`/api/items`)
- `POST /api/items` - Create new item/book listing
- `GET /api/items` - Get items with search and filtering
- `GET /api/items/my` - Get current user's items
- `GET /api/items/popular` - Get popular items
- `GET /api/items/recent` - Get recently listed items
- `GET /api/items/:id` - Get item by ID
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item
- `POST /api/items/:id/request` - Request to borrow item

#### Transactions (`/api/transactions`)
- `POST /api/transactions` - Create transaction
- `GET /api/transactions` - Get user transactions
- `GET /api/transactions/:id` - Get transaction by ID
- `PUT /api/transactions/:id` - Update transaction status
- `POST /api/transactions/:id/return` - Mark item as returned
- `GET /api/transactions/active` - Get active transactions
- `GET /api/transactions/stats` - Get transaction statistics
- `POST /api/transactions/:id/approve` - Approve transaction
- `POST /api/transactions/:id/reject` - Reject transaction

#### Categories (`/api/categories`)
- `POST /api/categories` - Create category
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category
- `GET /api/categories/popular` - Get popular categories

#### Notifications (`/api/notifications`)
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications/mark-read` - Mark notifications as read
- `POST /api/notifications/mark-all-read` - Mark all as read
- `GET /api/notifications/unread-count` - Get unread count
- `DELETE /api/notifications/:id` - Delete notification

**API Features:**
- Swagger/OpenAPI documentation at `/api-docs`
- JWT-based authentication
- Input validation with Joi schemas
- Comprehensive error handling
- Rate limiting (100 requests per 15 minutes)
- CORS configuration
- Helmet security headers
- Request logging with Morgan
- Winston file logging

**Security Measures:**
- Password hashing with bcrypt (12 rounds)
- JWT token authentication
- Rate limiting to prevent abuse
- Input sanitization and validation
- SQL injection prevention (parameterized queries)
- CORS policy enforcement
- Security headers via Helmet

---

### Evidence Type: GitHub Repository
**Description:** Team repository for collaboration  
**Link:** https://github.com/Denzel147/campus-connect

**Repository Structure:**
```
campus-connect/
├── backend/              # Node.js/Express backend
│   ├── src/              # Source code
│   ├── migrations/       # Sequelize migrations
│   ├── models/           # Sequelize models
│   └── config/           # Configuration files
├── frontend/             # React frontend
│   ├── index.html        # Entry point
│   ├── react.js          # React components
│   └── style.css         # Styling
├── database/             # Database documentation
└── README.md             # Project documentation
```

**Collaboration Evidence:**
- Multiple branches showing parallel development
- Regular commits from team members
- Merge requests showing code review process
- Issue tracking for bugs and features
- Pull requests for feature integration

---

## 4. Team Roles and Contributions

Each member played a key role in ensuring the success of CampusConnect:

| Member | Role | Contributions |
|--------|------|---------------|
| **Olamidimeji** | Project Manager | Coordinated project timeline, led meetings, managed deliverables and schedules, ensured team alignment with project goals |
| **Seth** | Backend Developer | Built complete RESTful API with Node.js/Express, implemented JWT authentication, developed transaction management system, created Swagger API documentation, database query optimization |
| **Gedeon** | UI/UX Designer | Designed Figma prototypes, created UI wireframes, defined visual guidelines, established design system with color scheme and typography |
| **Agnes** | Database Architect | Designed comprehensive PostgreSQL schema with 6 tables, managed data integrity and relationships, created database migrations, implemented indexes for optimization |
| **Aurore** | Documentation Specialist | Compiled project report, research documentation, formatted proposals, maintained project documentation, created README files |
| **Emeka** | Frontend Developer | Developed interactive React interfaces using HTML, CSS, and JavaScript, implemented book browsing and search functionality, created responsive UI components |
| **Isimbi** | Frontend Developer | Tested and refined frontend components, improved responsiveness and accessibility, implemented dark/light theme switching, enhanced user experience features |

**Key Technical Contributions:**

**Backend (Seth):**
- Express.js server with comprehensive middleware stack
- 5 main route modules (auth, items, transactions, categories, notifications)
- JWT authentication and authorization
- Input validation with Joi
- Error handling middleware
- Winston logging system
- Swagger API documentation

**Database (Agnes):**
- 6-table relational database schema
- Foreign key relationships with CASCADE/SET NULL
- Indexes on frequently queried columns
- Data migration utilities
- Database seeding scripts

**Frontend (Emeka & Isimbi):**
- React component architecture
- 5 main tab sections (Home, Browse, Courses, Lend, Profile)
- State management with React hooks
- LocalStorage persistence
- Responsive CSS design
- Theme switching system
- Toast notification system

**Design (Gedeon):**
- Complete UI/UX design system
- Color palette and typography guidelines
- Component wireframes
- User flow diagrams
- Mobile-responsive layouts

---

## 5. Next Technical Steps

The upcoming milestones for the next development phase include:

### Immediate Priorities (Sprint 1)
1. **Testing Implementation** (Seth & Emeka)
   - Write unit tests for backend controllers and models
   - Write integration tests for API endpoints
   - Frontend component testing
   - Test coverage goal: 70%+

2. **Frontend-Backend Integration** (Emeka, Isimbi, Seth)
   - Connect React frontend to Express API
   - Implement API service layer
   - Add loading states and error handling
   - Real-time data fetching

### Short-term Goals (Sprint 2-3)
3. **Real-time Notifications** (Seth)
   - WebSocket integration for live notifications
   - Push notification system
   - In-app notification center enhancements

4. **Enhanced Security** (Seth & Agnes)
   - Implement refresh token rotation
   - Add email verification
   - Enhance password reset functionality
   - Add account recovery options

5. **User Feedback & Testing** (All Team Members)
   - Conduct comprehensive user testing sessions
   - Gather feedback from beta users
   - Iterate based on feedback
   - Performance optimization

### Medium-term Goals (Sprint 4-5)
6. **In-App Chat System** (Seth & Emeka)
   - Real-time messaging between borrowers and lenders
   - Chat history persistence
   - Message notifications

7. **Deployment** (Olamidimeji & Seth)
   - Deploy frontend to Vercel/Netlify
   - Deploy backend to Render/Heroku/AWS
   - Database hosting setup
   - Environment configuration
   - CI/CD pipeline setup

8. **Advanced Features** (All Team)
   - Rating and review system enhancement
   - Book recommendation engine
   - Analytics dashboard
   - Admin panel

### Team Member Assignments

**Seth (Backend Developer):**
- API integration with frontend
- Real-time notification system
- Enhanced authentication features
- Backend testing suite

**Emeka (Frontend Developer):**
- Frontend API integration
- Real-time UI updates
- Chat interface development
- Frontend testing

**Isimbi (Frontend Developer):**
- UI/UX refinements based on feedback
- Performance optimization
- Accessibility improvements
- Component testing

**Agnes (Database Architect):**
- Database optimization
- Query performance tuning
- Backup and recovery procedures
- Database security audits

**Gedeon (UI/UX Designer):**
- Chat interface design
- Notification UI design
- Mobile app wireframes
- Design system updates

**Olamidimeji (Project Manager):**
- Deployment coordination
- Timeline management
- Stakeholder communication
- Quality assurance oversight

**Aurore (Documentation Specialist):**
- API documentation updates
- User guide creation
- Technical documentation
- Deployment guides

---

## 6. Summary

The CampusConnect project demonstrates effective teamwork, coordination, and technical implementation. Through Trello for project management, WhatsApp and GitHub for collaboration, and structured Agile sprints, the team successfully built a functioning academic resource-sharing prototype that addresses accessibility and sustainability challenges across campus communities.

### Key Achievements:
Complete backend RESTful API with 30+ endpoints  
Comprehensive PostgreSQL database with 6 normalized tables  
Responsive React frontend with 5 main feature sections  
JWT authentication and security measures  
Swagger API documentation  
Version control and collaborative development  
Professional UI/UX design system

### Technical Stack Summary:
- **Backend:** Node.js, Express.js, PostgreSQL, JWT, Joi
- **Frontend:** React 18, HTML5, CSS3, JavaScript
- **Tools:** Trello, GitHub, WhatsApp, Google Meet
- **Documentation:** Swagger/OpenAPI, README files

### Project Status:
The project has successfully completed the core development phase with a functional MVP. The system is ready for integration testing, user feedback collection, and deployment preparation. The team is well-positioned to move into the next development phase with clear roles, defined milestones, and a solid technical foundation.

---

**Report Prepared By:** CampusConnect Team  
**Date:** November 2, 2025  
**Version:** 1.0

