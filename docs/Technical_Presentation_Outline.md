## Campus Connect — Technical Presentation Outline (7 + 3 minutes)

Note: Keep slides visual. Prefer diagrams over dense text. Use consistent fonts/colors.

### 1) Title & Project Overview (Slide 1 — 20s)
- Team name, members, roles (Gedeon — UX/UI)
- Problem statement: Fragmented campus engagement; hard to discover events, clubs, services
- Proposed solution: A centralized web platform connecting students, clubs, and services

### 2) Implemented Features & Tool Justification (Slides 2-3 — 60s)
- Features (Planned vs Implemented)
  - Planned: Auth, event discovery, club pages, announcements, messaging, profiles, admin tools
  - Implemented (so far): Static frontend scaffold (HTML/CSS/JS), event feed UI, responsive layout
- Core tech choices
  - Frontend: Vanilla HTML/CSS/JS for fast iteration; migrate to React if time permits
  - Styling: `frontend/style.css`, mobile-first; utility classes for spacing/typography
  - Alternatives considered: React/Next.js vs Vanilla; Tailwind vs custom CSS; rationale: simplicity, deadlines

### 3) Database & Data Management (Slide 4 — 60s)
- Current state: Designing schema; API stubs planned
- Proposed schema (diagram on slide)
  - Users(userId, name, role, email, createdAt)
  - Clubs(clubId, name, description, ownerId)
  - Events(eventId, clubId, title, description, startAt, endAt, location, tags)
  - Follows(userId, clubId)
  - Announcements(announcementId, clubId, title, body, createdAt)
- Data strategies
  - Indexes on `Events.startAt`, `Events.tags` for discovery
  - Soft deletes for content moderation
  - Security: hashed passwords, role-based access (admin/club lead/student)

### 4) System Architecture (Slides 5-6 — 70s)
- Diagram: Client (browser) → API Gateway → Services (Auth, Events, Clubs) → DB
- Pattern: Modular services with clear boundaries; REST APIs; future-ready for SSR or SPA
- Scalability: Stateless services, CDN for assets, pagination for feeds
- Rationale: Independent evolution of features; easier testing and ownership

### 5) Code Quality & Testing (Slide 7 — 45s)
- Standards: Semantic HTML, accessible components, BEM-like CSS naming, linting (planned)
- Testing approach
  - Unit tests (utils), component smoke tests, API contract tests (planned)
  - Visual regression (manual → automated later)

### 6) Technical Challenges & Solutions (Slide 8 — 45s)
- Challenge: Responsive layout consistency across devices
  - Solution: Mobile-first CSS grid/flex; standardized spacing scale
- Challenge: Feature creep vs timeline
  - Solution: Prioritized event discovery MVP; deferred messaging

### 7) Feedback Integration (Slide 9 — 30s)
- Prior feedback: Emphasize clear information architecture and simpler nav
- Changes made: Consolidated navigation, card-based event listings, improved contrast

### 8) Next Technical Steps & Roles (Slide 10 — 60s)
- Milestones
  - Week 1: Finalize schema, scaffold API endpoints
  - Week 2: Implement Events list/detail, club CRUD
  - Week 3: Auth + role guards, deploy preview
- Roles
  - Gedeon (UX/UI): High-fidelity designs, design tokens, handoff specs
  - Devs: API + integration; QA: test plans

### 9) References (Slide 11 — 20s)
- Libraries/APIs/resources with links

### Timing (7 minutes)
- Overview 0:20, Features 1:00, DB 1:00, Arch 1:10, Quality 0:45, Challenges 0:45, Feedback 0:30, Next steps 1:00, References 0:20

### Visuals to Include
- Architecture diagram
- ERD/schema diagram
- UI screenshots from `frontend/index.html` with `frontend/style.css`


