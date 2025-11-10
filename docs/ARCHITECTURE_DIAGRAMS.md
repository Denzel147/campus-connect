# CampusConnect System Architecture

## 1. System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  React Frontend                         │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐            │   │
│  │  │  Home    │  │  Browse  │  │  Profile  │  ...        │   │
│  │  │  Tab     │  │  Tab     │  │  Tab     │            │   │
│  │  └──────────┘  └──────────┘  └──────────┘            │   │
│  │         │             │             │                 │   │
│  │         └─────────────┴─────────────┘                 │   │
│  │                      │                                 │   │
│  │              API Service Layer                          │   │
│  └──────────────────────┼─────────────────────────────────┘   │
└─────────────────────────┼───────────────────────────────────────┘
                          │ HTTP/REST
                          │ JSON
┌─────────────────────────▼───────────────────────────────────────┐
│                      API GATEWAY LAYER                           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Express.js Server (Port 3001)               │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │   │
│  │  │  Helmet      │  │  CORS        │  │ Rate Limit   │  │   │
│  │  │  Security    │  │  Policy      │  │  Protection   │  │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  │   │
│  │                                                           │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │   │
│  │  │  JWT Auth    │  │ Validation    │  │ Error Handler │  │   │
│  │  │  Middleware  │  │  Middleware   │  │  Middleware   │  │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                      │                                           │
│  ┌───────────────────┴───────────────────────────────────────┐ │
│  │                    ROUTING LAYER                           │ │
│  │  /api/auth  │  /api/items  │  /api/transactions  │  ...   │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────┼───────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│                   BUSINESS LOGIC LAYER                           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Controllers                           │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │   │
│  │  │   Auth   │ │   Item   │ │Transaction│ │Category  │ │   │
│  │  │Controller│ │Controller│ │Controller│ │Controller│ │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ │   │
│  │         │            │             │            │        │   │
│  │         └────────────┴─────────────┴────────────┘        │   │
│  │                      │                                     │   │
│  │                    Models                                  │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │   │
│  │  │   User   │ │   Item   │ │Transaction│ │Notification││   │
│  │  │  Model   │ │  Model   │ │  Model    │ │  Model    │ │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ │   │
│  └──────────────────────┼──────────────────────────────────┘   │
└─────────────────────────┼───────────────────────────────────────┘
                          │ SQL Queries
                          │ Connection Pool
┌─────────────────────────▼───────────────────────────────────────┐
│                      DATA LAYER                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              PostgreSQL Database                         │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐     │   │
│  │  │  Users  │ │ Items   │ │Transactions│ Reviews│     │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘     │   │
│  │  ┌─────────┐ ┌─────────┐                              │   │
│  │  │Categories│ │Notifications│                          │   │
│  │  └─────────┘ └─────────┘                              │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    SUPPORTING SERVICES                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │   Winston    │  │   Swagger    │  │  Migration    │        │
│  │   Logging    │  │  API Docs    │  │   Utils       │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

## 2. Database Entity Relationship Diagram (ERD)

```
┌─────────────────────────────────────────────────────────────────┐
│                         USERS                                    │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ user_id (PK)         SERIAL                                 │ │
│ │ email                VARCHAR(255) UNIQUE NOT NULL           │ │
│ │ password_hash        VARCHAR(255) NOT NULL                  │ │
│ │ full_name            VARCHAR(100) NOT NULL                  │ │
│ │ phone_number         VARCHAR(15)                            │ │
│ │ institution          VARCHAR(100)                           │ │
│ │ department           VARCHAR(100)                           │ │
│ │ student_id           VARCHAR(50)                           │ │
│ │ profile_picture      TEXT                                   │ │
│ │ verification_status  BOOLEAN DEFAULT FALSE                  │ │
│ │ rating               DECIMAL(3,2) DEFAULT 0.00             │ │
│ │ total_lends          INTEGER DEFAULT 0                       │ │
│ │ total_borrows        INTEGER DEFAULT 0                      │ │
│ │ account_status       VARCHAR(20) DEFAULT 'active'          │ │
│ │ date_joined          TIMESTAMP                              │ │
│ │ last_login           TIMESTAMP                              │ │
│ └─────────────────────────────────────────────────────────────┘ │
└────────────┬──────────────────────┬──────────────────────────────┘
             │                      │
             │ 1                    │ 1
             │                      │
             │ N                    │ N
┌────────────▼──────────┐  ┌────────▼──────────────────────────────┐
│        ITEMS         │  │      TRANSACTIONS                     │
│ ┌──────────────────┐ │  │ ┌──────────────────────────────────┐ │
│ │ item_id (PK)      │ │  │ │ transaction_id (PK)              │ │
│ │ owner_id (FK)─────┼──┼─┤ │ item_id (FK)                     │ │
│ │ item_name         │ │  │ │ lender_id (FK)                   │ │
│ │ category (FK)     │ │  │ │ borrower_id (FK)                 │ │
│ │ description       │ │  │ │ transaction_type                 │ │
│ │ condition         │ │  │ │ transaction_status                │ │
│ │ availability_     │ │  │ │ borrow_date                       │ │
│ │   status          │ │  │ │ due_date                         │ │
│ │ sharing_type      │ │  │ │ return_date                      │ │
│ │ location          │ │  │ │ late_return                       │ │
│ │ isbn              │ │  │ │ days_overdue                      │ │
│ │ author            │ │  │ │ notes                            │ │
│ │ publication_year  │ │  │ │ date_created                     │ │
│ │ due_date          │ │  │ └──────────────────────────────────┘ │
│ │ date_listed       │ │  └──────────────────────────────────────┘
│ └──────────────────┘ │                    │
└──────────┬───────────┘                    │ 1
           │                                 │
           │ N                               │
           │                                 │ N
┌──────────▼───────────┐        ┌───────────▼────────────────────┐
│    CATEGORIES       │        │         REVIEWS                 │
│ ┌──────────────────┐│        │ ┌────────────────────────────┐│
│ │ category_id (PK) ││        │ │ review_id (PK)             ││
│ │ category_name    ││        │ │ transaction_id (FK)         ││
│ │ description      ││        │ │ reviewer_id (FK)            ││
│ │ icon             ││        │ │ reviewee_id (FK)            ││
│ │ is_active        ││        │ │ rating (1-5)                ││
│ └──────────────────┘│        │ │ comment                     ││
└──────────────────────┘        │ │ review_type                 ││
                               │ │ date_created                ││
                               │ └────────────────────────────┘│
                               └────────────────────────────────┘
                                       │
                                       │ 1
                                       │
                                       │ N
                          ┌────────────▼──────────────────────┐
                          │      NOTIFICATIONS               │
                          │ ┌──────────────────────────────┐│
                          │ │ notification_id (PK)          ││
                          │ │ user_id (FK)                  ││
                          │ │ related_item_id (FK)          ││
                          │ │ related_transaction_id (FK)    ││
                          │ │ notification_type             ││
                          │ │ message                       ││
                          │ │ is_read                       ││
                          │ │ priority                      ││
                          │ │ date_created                  ││
                          │ └──────────────────────────────┘│
                          └──────────────────────────────────┘

LEGEND:
PK = Primary Key
FK = Foreign Key
1 = One-to-One or One-to-Many
N = Many
```

## 3. API Request/Response Flow Diagram

```
┌──────────────┐
│   Frontend   │
│   (React)    │
└──────┬───────┘
       │
       │ 1. User Action (e.g., Login)
       │    POST /api/auth/login
       │    { email, password }
       │
       ▼
┌─────────────────────────────────────────────┐
│         Express.js Server                    │
│  ┌────────────────────────────────────────┐ │
│  │ 1. Rate Limiter Middleware             │ │
│  │    - Check request limit (100/15min)   │ │
│  └────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────┐ │
│  │ 2. CORS Middleware                      │ │
│  │    - Validate origin                    │ │
│  └────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────┐ │
│  │ 3. Helmet Security Middleware           │ │
│  │    - Security headers                   │ │
│  └────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────┐ │
│  │ 4. Body Parser Middleware               │ │
│  │    - Parse JSON body                    │ │
│  └────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────┐ │
│  │ 5. Validation Middleware (Joi)          │ │
│  │    - Validate email format               │ │
│  │    - Validate password length            │ │
│  │    - Return 400 if invalid              │ │
│  └────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────┐ │
│  │ 6. Route Handler                        │ │
│  │    POST /api/auth/login                 │ │
│  │    → authController.login()            │ │
│  └────────────────────────────────────────┘ │
│              │                                │
│              ▼                                │
│  ┌────────────────────────────────────────┐ │
│  │ 7. Controller Logic                    │ │
│  │    - Call User.verifyPassword()        │ │
│  │    - Generate JWT tokens              │ │
│  │    - Update last_login                 │ │
│  └────────────────────────────────────────┘ │
│              │                                │
│              ▼                                │
│  ┌────────────────────────────────────────┐ │
│  │ 8. Model Layer                         │ │
│  │    User.findByEmail(email)             │ │
│  │    → Execute SQL query                 │ │
│  └────────────────────────────────────────┘ │
│              │                                │
└──────────────┼────────────────────────────────┘
               │
               │ SQL Query
               │ SELECT * FROM users WHERE email = $1
               │
               ▼
┌─────────────────────────────────────────────┐
│      PostgreSQL Database                     │
│  - Execute query                            │
│  - Return user data                         │
│  - Check indexes for performance            │
└─────────────────────────────────────────────┘
               │
               │ Result Set
               │
               ▼
┌─────────────────────────────────────────────┐
│      Response Flow                          │
│  1. Model returns user data                │
│  2. Controller validates password (bcrypt) │
│  3. Generate JWT tokens                    │
│  4. Log action (Winston)                   │
│  5. Return JSON response                   │
│     {                                      │
│       success: true,                       │
│       data: {                              │
│         user: {...},                       │
│         accessToken: "...",                │
│         refreshToken: "..."                │
│       }                                    │
│     }                                      │
└─────────────────────────────────────────────┘
               │
               │ HTTP 200 OK
               │
               ▼
┌──────────────┐
│   Frontend   │
│   - Store token in memory                  │
│   - Update UI state                       │
│   - Redirect to dashboard                 │
└──────────────┘

AUTHENTICATED REQUEST FLOW:

┌──────────────┐
│   Frontend   │
│   GET /api/items?q=algorithms
│   Header: Authorization: Bearer <token>
└──────┬───────┘
       │
       ▼
┌─────────────────────────────────────────────┐
│         Express.js Server                   │
│  ┌────────────────────────────────────────┐ │
│  │ 1. Authentication Middleware            │ │
│  │    - Extract token from header          │ │
│  │    - Verify JWT signature              │ │
│  │    - Query database for user            │ │
│  │    - Attach user to req.user            │ │
│  │    - Return 401 if invalid             │ │
│  └────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────┐ │
│  │ 2. Query Validation                     │ │
│  │    - Validate search params             │ │
│  └────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────┐ │
│  │ 3. Route Handler                       │ │
│  │    GET /api/items                      │ │
│  │    → itemController.getItems()         │ │
│  └────────────────────────────────────────┘ │
│              │                                │
│              ▼                                │
│  ┌────────────────────────────────────────┐ │
│  │ 4. Controller                          │ │
│  │    - Extract query params              │ │
│  │    - Call Item.search(filters)          │ │
│  └────────────────────────────────────────┘ │
│              │                                │
│              ▼                                │
│  ┌────────────────────────────────────────┐ │
│  │ 5. Model Layer                         │ │
│  │    - Build SQL query with filters       │ │
│  │    - Add pagination                    │ │
│  │    - Execute: SELECT ... WHERE ...      │ │
│  └────────────────────────────────────────┘ │
│              │                                │
└──────────────┼────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│      PostgreSQL Database                     │
│  - Use indexes for fast search              │
│  - Return filtered results                  │
└─────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│      Response                               │
│  {                                          │
│    success: true,                           │
│    data: {                                 │
│      items: [...],                         │
│      totalCount: 25,                       │
│      page: 1,                              │
│      totalPages: 3                         │
│    }                                       │
│  }                                          │
└─────────────────────────────────────────────┘
```

## 4. Component Interaction Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                      FRONTEND LAYER                          │
│                                                              │
│  ┌──────────────┐         ┌──────────────┐                │
│  │   HomeTab    │         │  BrowseTab    │                │
│  │              │         │               │                │
│  │ - Welcome    │         │ - Search      │                │
│  │ - Stats      │         │ - Filter      │                │
│  │ - Quick Acts │         │ - Book List   │                │
│  └──────┬───────┘         └──────┬───────┘                │
│         │                        │                          │
│         │                        │                          │
│  ┌──────▼───────────────────────▼───────┐                 │
│  │      CampusConnect (Root)            │                 │
│  │  ┌────────────────────────────────┐  │                 │
│  │  │ State Management               │  │                 │
│  │  │ - currentTab                   │  │                 │
│  │  │ - availableBooks               │  │                 │
│  │  │ - myListedBooks                │  │                 │
│  │  │ - favorites                    │  │                 │
│  │  │ - searchQuery                  │  │                 │
│  │  └────────────────────────────────┘  │                 │
│  │                                        │                 │
│  │  ┌────────────────────────────────┐  │                 │
│  │  │ Event Handlers                 │  │                 │
│  │  │ - handleLendSubmit()           │  │                 │
│  │  │ - toggleFavorite()             │  │                 │
│  │  │ - saveSearch()                 │  │                 │
│  │  │ - showToast()                  │  │                 │
│  │  └────────────────────────────────┘  │                 │
│  └────────────────────────────────────────┘                │
│         │                                                    │
│         │ API Calls (Future Integration)                    │
│         │                                                    │
└─────────┼────────────────────────────────────────────────────┘
          │
          │ HTTP/REST API
          │
┌─────────▼────────────────────────────────────────────────────┐
│                    BACKEND LAYER                              │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │            Express Router                            │   │
│  │  /api/auth  │  /api/items  │  /api/transactions   │   │
│  └──────────────┬──────────────┬───────────────────────┘   │
│                 │              │                            │
│        ┌────────▼─────┐  ┌────▼──────────────┐            │
│        │ AuthController│  │ ItemController    │            │
│        │               │  │                   │            │
│        │ - register() │  │ - createItem()    │            │
│        │ - login()     │  │ - getItems()      │            │
│        │ - getProfile()│  │ - updateItem()   │            │
│        └───────┬───────┘  └──────┬───────────┘            │
│                │                  │                        │
│        ┌───────▼───────┐  ┌───────▼───────────┐           │
│        │ User Model    │  │ Item Model        │           │
│        │               │  │                   │           │
│        │ - create()    │  │ - create()        │           │
│        │ - findByEmail()│ │ - search()        │           │
│        │ - verifyPass()│ │ - findById()       │           │
│        └───────┬───────┘  └───────┬───────────┘           │
│                │                  │                       │
└────────────────┼──────────────────┼───────────────────────┘
                 │                  │
                 │ SQL Queries      │
                 │                  │
┌────────────────▼──────────────────▼───────────────────────┐
│              PostgreSQL Database                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │  users   │  │  items   │  │transactions│            │
│  └──────────┘  └──────────┘  └──────────┘              │
└──────────────────────────────────────────────────────────┘
```

## 5. Data Flow Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                      USER REQUEST                            │
│          "Login with email: user@example.com"              │
└────────────────────────────┬─────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────┐
│            FRONTEND VALIDATION                               │
│  - Validate email format                                     │
│  - Validate password not empty                              │
│  - Show loading state                                       │
└────────────────────────────┬─────────────────────────────────┘
                             │
                             │ HTTP POST /api/auth/login
                             │ { email, password }
                             ▼
┌──────────────────────────────────────────────────────────────┐
│            API MIDDLEWARE STACK                              │
│  1. Rate Limiter → Check IP limit                           │
│  2. CORS → Validate origin                                  │
│  3. Helmet → Add security headers                            │
│  4. Body Parser → Parse JSON                                │
│  5. Validation → Joi schema validation                      │
│  6. Authentication → (Skip for login)                       │
└────────────────────────────┬─────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────┐
│            CONTROLLER LAYER                                  │
│  authController.login()                                      │
│  1. Extract email, password from req.body                   │
│  2. Call User.verifyPassword(email, password)               │
└────────────────────────────┬─────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────┐
│            MODEL LAYER                                       │
│  User.verifyPassword()                                       │
│  1. Call User.findByEmail(email)                            │
│  2. Execute: SELECT * FROM users WHERE email = $1          │
│  3. Compare password with bcrypt.compare()                  │
│  4. Return user object if valid                             │
└────────────────────────────┬─────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────┐
│            DATABASE                                          │
│  PostgreSQL                                                   │
│  - Execute parameterized query                              │
│  - Use index on email (if exists)                           │
│  - Return user record or null                               │
└────────────────────────────┬─────────────────────────────────┘
                             │
                             │ User Data
                             ▼
┌──────────────────────────────────────────────────────────────┐
│            TOKEN GENERATION                                  │
│  generateTokens(userId)                                      │
│  1. Create payload: { userId }                              │
│  2. Sign accessToken (7 days expiry)                        │
│  3. Sign refreshToken (30 days expiry)                       │
│  4. Return both tokens                                       │
└────────────────────────────┬─────────────────────────────────┘
                             │
                             │ Tokens + User Data
                             ▼
┌──────────────────────────────────────────────────────────────┐
│            LOGGING                                           │
│  Winston Logger                                              │
│  - Log successful login                                      │
│  - Log to file: logs/combined.log                            │
│  - Console output (dev mode)                                 │
└────────────────────────────┬─────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────┐
│            RESPONSE                                          │
│  HTTP 200 OK                                                 │
│  {                                                           │
│    success: true,                                            │
│    message: "Login successful",                              │
│    data: {                                                   │
│      user: { user_id, email, full_name, ... },              │
│      accessToken: "eyJhbGc...",                             │
│      refreshToken: "eyJhbGc..."                             │
│    }                                                         │
│  }                                                           │
└────────────────────────────┬─────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────┐
│            FRONTEND                                          │
│  1. Store tokens (future: localStorage or secure cookie)     │
│  2. Update user state                                        │
│  3. Redirect to dashboard                                     │
│  4. Show success toast notification                          │
└──────────────────────────────────────────────────────────────┘
```

## Architecture Patterns Used

### 1. MVC (Model-View-Controller)
- **Models**: Data access layer (`backend/src/models/`)
- **Views**: React components (`frontend/react.js`)
- **Controllers**: Business logic (`backend/src/controllers/`)

### 2. RESTful API Design
- Standard HTTP methods (GET, POST, PUT, DELETE)
- Resource-based URLs (`/api/items/:id`)
- Stateless communication
- JSON data format

### 3. Middleware Pattern
- Request processing pipeline
- Modular, reusable components
- Chain of responsibility pattern

### 4. Repository Pattern (Models)
- Abstraction of data access
- Database-agnostic business logic
- Easy to test and mock

### 5. Dependency Injection
- Controllers depend on models
- Models depend on database config
- Easy to swap implementations

## Scalability Considerations

### Current Architecture Supports:
1. **Horizontal Scaling**: Stateless API allows multiple server instances
2. **Database Connection Pooling**: PostgreSQL pool handles concurrent connections
3. **Caching Ready**: Model layer can be extended with Redis
4. **Load Balancing**: Stateless design supports load balancers
5. **CDN Ready**: Frontend assets can be served via CDN

### Future Enhancements:
1. **Microservices**: Split into auth-service, item-service, etc.
2. **Message Queue**: For notifications (RabbitMQ/AWS SQS)
3. **Caching Layer**: Redis for frequently accessed data
4. **Read Replicas**: Database read replicas for scaling reads
5. **API Gateway**: Kong or AWS API Gateway for advanced routing

