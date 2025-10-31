const { useState } = React;

// Icon components using Lucide
const Icon = ({ name, size = 24, ...props }) => {
  React.useEffect(() => {
    lucide.createIcons();
  });
  return React.createElement('i', { 
    'data-lucide': name, 
    width: size, 
    height: size,
    ...props 
  });
};

const CampusConnect = () => {
  const [currentTab, setCurrentTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState(2);
  const [isCompact, setIsCompact] = useState(false);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState(() => {
    try { const raw = localStorage.getItem('favorites'); return raw ? JSON.parse(raw) : []; } catch { return []; }
  });
  const [recentSearches, setRecentSearches] = useState(() => {
    try { const raw = localStorage.getItem('recentSearches'); return raw ? JSON.parse(raw) : []; } catch { return []; }
  });
  const [savedOnly, setSavedOnly] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [courses, setCourses] = useState(['MATH-101', 'BIO-201', 'CS-202']);
  const [selectedCourse, setSelectedCourse] = useState('MATH-101');
  const [userName, setUserName] = useState('Alex');
  const [onboardingOpen, setOnboardingOpen] = useState(() => {
    try { return localStorage.getItem('onboardingDone') ? false : true; } catch { return true; }
  });
  const [onboardStep, setOnboardStep] = useState(0);
  const [profile, setProfile] = useState(() => {
    try {
      const raw = localStorage.getItem('profile');
      return raw ? JSON.parse(raw) : { email: '', department: '', dorm: '', courses: [] };
    } catch { return { email: '', department: '', dorm: '', courses: [] }; }
  });
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('theme') || 'light';
    } catch { return 'light'; }
  });

  React.useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }
    try { localStorage.setItem('theme', theme); } catch {}
  }, [theme]);

  React.useEffect(() => {
    const onScroll = () => setIsCompact(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);
  React.useEffect(() => { try { localStorage.setItem('favorites', JSON.stringify(favorites)); } catch {} }, [favorites]);

  const toggleFavorite = (title) => {
    setFavorites((prev) => prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]);
    showToast(prevIncludes(title) ? 'Removed from saved' : 'Saved to favorites', 'info');
  };
  const prevIncludes = (title) => favorites.includes(title);

  const saveSearch = (q) => {
    const v = q.trim(); if (!v) return;
    setRecentSearches((prev) => {
      const next = [v, ...prev.filter(p => p !== v)].slice(0, 5);
      try { localStorage.setItem('recentSearches', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const showToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter(t => t.id !== id)), 2200);
  };

  React.useEffect(() => {
    try { localStorage.setItem('favorites', JSON.stringify(favorites)); } catch {}
  }, [favorites]);

  // Sample data - just book titles available for borrowing
  const [availableBooks, setAvailableBooks] = useState([
    'Introduction to Algorithms',
    'Organic Chemistry',
    'Calculus: Early Transcendentals',
    'Principles of Economics',
    'Data Structures and Algorithms',
    'Physics for Scientists and Engineers',
    'Biology: The Unity and Diversity of Life',
    'Microeconomics',
    'Linear Algebra and Its Applications',
    'Modern Operating Systems'
  ]);

  // Books the current user has listed
  const [myListedBooks, setMyListedBooks] = useState([]);

  // Form state for lending a book
  const [lendForm, setLendForm] = useState({
    studentName: '',
    email: '',
    phoneNumber: '',
    department: '',
    bookTitle: '',
    condition: 'Good',
    availableFrom: '',
    availableUntil: ''
  });

  const handleLendSubmit = () => {
    if (!lendForm.studentName || !lendForm.email || !lendForm.bookTitle) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    const newListing = {
      id: Date.now(),
      ...lendForm,
      listedDate: new Date().toISOString().split('T')[0]
    };

    setMyListedBooks([...myListedBooks, newListing]);
    
    // Add to available books if not already there
    if (!availableBooks.includes(lendForm.bookTitle)) {
      setAvailableBooks([...availableBooks, lendForm.bookTitle]);
    }

    showToast('Book listed successfully!', 'success');
    
    // Reset form
    setLendForm({
      studentName: '',
      email: '',
      phoneNumber: '',
      department: '',
      bookTitle: '',
      condition: 'Good',
      availableFrom: '',
      availableUntil: ''
    });
  };

  const filteredBooks = availableBooks.filter(book => book.toLowerCase().includes(searchQuery.toLowerCase()));
  const displayBooks = filteredBooks.filter(b => !savedOnly || favorites.includes(b));

  const BrowseTab = () => (
    <div className="space-y-4">
      <div className="card">
        <h3 className="section-title">Available Books to Borrow</h3>
        {loading ? (
          <div className="book-list" aria-hidden="true">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="book-item">
                <div className="book-item-content">
                  <div className="skeleton-avatar" />
                  <div style={{ width: '200px' }} className="skeleton skeleton-line" />
                </div>
                <div className="skeleton skeleton-btn" />
              </div>
            ))}
          </div>
        ) : filteredBooks.length === 0 ? (
          <p className="empty-state">No books found matching your search.</p>
        ) : (
          <div className="book-list" role="list" aria-label="Available books">
            {displayBooks.map((book, index) => (
              <div key={index} className="book-item" role="listitem">
                <div className="book-item-content">
                  <Icon name="book-open" size={20} className="book-icon" />
                  <span className="book-title">{book}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    onClick={() => { const wasSaved = favorites.includes(book); toggleFavorite(book); showToast(wasSaved ? 'Removed from saved' : 'Saved to favorites', 'info'); }}
                    className="btn btn-sm"
                    aria-pressed={favorites.includes(book)}
                    aria-label={`${favorites.includes(book) ? 'Remove from' : 'Add to'} favorites: ${book}`}
                    title={favorites.includes(book) ? 'Saved' : 'Save'}
                    style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                  >
                    <Icon name={'heart'} size={16} style={{ color: favorites.includes(book) ? 'crimson' : 'var(--muted)' }} />
                  </button>
                  <button
                    onClick={() => { showToast(`Request sent for ${book}`, 'success'); saveSearch(searchQuery); }}
                    className="btn btn-primary btn-sm"
                    aria-label={`Request to borrow ${book}`}
                  >
                    Request
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const HomeTab = () => (
    <div className="space-y-4">
      <div className="card">
        <h2 className="page-title">Welcome back, {userName}!</h2>
        <p className="about-text">Upcoming: Calculus midterm in 2 weeks</p>
        <div className="progress" style={{ marginTop: '0.75rem' }}>
          <div className="progress-bar" style={{ width: '65%' }} />
        </div>
        <p className="about-text" style={{ marginTop: '0.5rem' }}>Semester progress: 65%</p>
      </div>
      <div className="card">
        <h3 className="section-title">Recommended for you</h3>
        <div className="book-list">
          <div className="book-item"><span>Calculator</span><span className="badge">from Maria (Aced Calculus)</span></div>
          <div className="book-item"><span>Lab Coat</span><span className="badge">in your Biology class network</span></div>
          <div className="book-item"><span>Textbook</span><span className="badge">same edition your professor requires</span></div>
        </div>
      </div>
      <div className="card">
        <h3 className="section-title">Quick Actions</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          <button className="btn btn-primary">Borrow for Exam</button>
          <button className="btn" style={{ border: '1px solid var(--border)' }}>Share to Classmates</button>
          <button className="btn" style={{ border: '1px solid var(--border)' }}>Department Requests</button>
        </div>
      </div>
    </div>
  );

  const CoursesTab = () => (
    <div className="space-y-4">
      <div className="card">
        <h2 className="page-title">Course-Centric Browsing</h2>
        <label className="form-label" htmlFor="course-select">Select Course</label>
        <select id="course-select" className="form-input" value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
          {courses.map(c => <option key={c}>{c}</option>)}
        </select>
        <div className="space-y-4" style={{ marginTop: '1rem' }}>
          <h3 className="section-title">What {selectedCourse} students are sharing</h3>
          <BrowseTab />
        </div>
      </div>
    </div>
  );

  const LendBookTab = () => (
    <div className="space-y-4">
      <div className="card">
        <h2 className="page-title">
          <Icon name="plus" size={24} className="title-icon" />
          Lend a Book
        </h2>

        <div className="card" style={{ marginBottom: '1rem' }}>
          <h3 className="section-title">Smart Suggestions</h3>
          <ul className="about-text" style={{ paddingLeft: '1rem' }}>
            <li>Auto-suggest category based on course</li>
            <li>Common for {selectedCourse}</li>
            <li>Smart pricing: Similar items rent for $5–10/week</li>
            <li>Timing tip: Set return before finals week</li>
          </ul>
        </div>

        <div className="form-container">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="lend-name">
                Your Name <span className="required">*</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter your full name"
                value={lendForm.studentName}
                id="lend-name"
                onChange={(e) => setLendForm({...lendForm, studentName: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="lend-email">
                Email <span className="required">*</span>
              </label>
              <input
                type="email"
                className="form-input"
                placeholder="your.email@university.edu"
                value={lendForm.email}
                id="lend-email"
                onChange={(e) => setLendForm({...lendForm, email: e.target.value})}
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="lend-phone">Phone Number</label>
              <input
                type="tel"
                className="form-input"
                placeholder="+234 800 000 0000"
                value={lendForm.phoneNumber}
                id="lend-phone"
                onChange={(e) => setLendForm({...lendForm, phoneNumber: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="lend-dept">Department</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Computer Science"
                value={lendForm.department}
                id="lend-dept"
                onChange={(e) => setLendForm({...lendForm, department: e.target.value})}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="lend-title">
              Book Title <span className="required">*</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter the book title"
              value={lendForm.bookTitle}
              id="lend-title"
              onChange={(e) => setLendForm({...lendForm, bookTitle: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="lend-condition">Book Condition</label>
            <select
              className="form-input"
              value={lendForm.condition}
              id="lend-condition"
              onChange={(e) => setLendForm({...lendForm, condition: e.target.value})}
            >
              <option>Like New</option>
              <option>Good</option>
              <option>Fair</option>
              <option>Poor</option>
            </select>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="lend-from">Available From</label>
              <input
                type="date"
                className="form-input"
                value={lendForm.availableFrom}
                id="lend-from"
                onChange={(e) => setLendForm({...lendForm, availableFrom: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="lend-until">Available Until</label>
              <input
                type="date"
                className="form-input"
                value={lendForm.availableUntil}
                id="lend-until"
                onChange={(e) => setLendForm({...lendForm, availableUntil: e.target.value})}
              />
            </div>
          </div>

          <button
            onClick={handleLendSubmit}
            className="btn btn-primary btn-full"
          >
            List Book for Lending
          </button>
        </div>
      </div>

      {myListedBooks.length > 0 && (
        <div className="card">
          <h3 className="section-title">Your Listed Books</h3>
          <div className="listed-books">
            {myListedBooks.map((book) => (
              <div key={book.id} className="listed-book-item">
                <div className="listed-book-content">
                  <div>
                    <h4 className="listed-book-title">{book.bookTitle}</h4>
                    <p className="listed-book-detail">Condition: {book.condition}</p>
                    <p className="listed-book-detail">Contact: {book.email}</p>
                    {book.availableFrom && book.availableUntil && (
                      <p className="listed-book-date">
                        Available: {book.availableFrom} to {book.availableUntil}
                      </p>
                    )}
                  </div>
                  <span className="badge badge-success">Active</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const ProfileTab = () => (
    <div className="space-y-4">
      <div className="card">
        <div className="profile-header">
          <div className="profile-avatar">
            <Icon name="user" size={40} />
          </div>
          <div>
            <h2 className="profile-name">Your Profile</h2>
            <p className="profile-subtitle">Student Dashboard</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <span className="badge" style={{ background: 'var(--info-bg)' }}>Verified .edu</span>
          <span className="badge" style={{ background: 'var(--success-bg)', color: 'var(--success-text)' }}>Aced Calculus</span>
          <span className="badge" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>Dorm B</span>
        </div>

        <div className="stats-grid">
          <div className="stat-card stat-blue">
            <p className="stat-number">{myListedBooks.length}</p>
            <p className="stat-label">Books Listed</p>
          </div>
          <div className="stat-card stat-green">
            <p className="stat-number">{availableBooks.length}</p>
            <p className="stat-label">Available Books</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="section-title">About CampusConnect</h3>
        <p className="about-text">
          CampusConnect is a platform where university students can share textbooks and academic resources. 
          Browse available books, request to borrow them, or list your own books to help fellow students.
        </p>
      </div>

      <div className="card">
        <h3 className="section-title">Settings</h3>
        <div className="settings-list">
          <button className="settings-item">Notification Preferences</button>
          <button className="settings-item">Privacy Settings</button>
          <button className="settings-item settings-logout">Logout</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="app-container">
      {/* Header */}
      <header className={`header ${isCompact ? 'header-compact' : ''}`}>
        <div className="header-content">
          <div className="header-logo">
            <Icon name="book" size={32} />
            <h1 className="app-title">CampusConnect</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              className="theme-toggle"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label={`Activate ${theme === 'dark' ? 'light' : 'dark'} theme`}
              title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
            >
              <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} />
              <span style={{ fontSize: '0.875rem' }}>{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
            <div className="notification-icon" aria-label="Notifications">
              <Icon name="bell" size={24} />
              {notifications > 0 && (
                <span className="notification-badge">{notifications}</span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {currentTab === 'home' && <HomeTab />}
        {currentTab === 'browse' && (
          <div className="space-y-4">
            <div className="card sticky-search">
              <div className="search-container">
                <Icon name="search" size={20} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search for books..."
                  className="search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search for books"
                />
                {recentSearches.length > 0 && (
                  <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {recentSearches.map((term, i) => (
                      <button key={i} className="btn btn-sm" style={{ background: 'var(--card)', border: '1px solid var(--border)' }} onClick={() => setSearchQuery(term)} aria-label={`Use recent search ${term}`}>
                        {term}
                      </button>
                    ))}
                    <button className="btn btn-sm" style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)' }} onClick={() => { setRecentSearches([]); try { localStorage.removeItem('recentSearches'); } catch {} }} aria-label="Clear recent searches">Clear</button>
                  </div>
                )}
                <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="btn btn-sm"
                    style={{ background: savedOnly ? 'var(--primary)' : 'var(--card)', color: savedOnly ? '#fff' : 'inherit', border: '1px solid var(--border)' }}
                    onClick={() => setSavedOnly(!savedOnly)}
                    aria-pressed={savedOnly}
                  >
                    {savedOnly ? 'Showing Saved' : 'Show Saved'}
                  </button>
                  {savedOnly && (
                    <button className="btn btn-sm" style={{ background: 'transparent', border: '1px solid var(--border)' }} onClick={() => setSavedOnly(false)}>Show All</button>
                  )}
                </div>
              </div>
            </div>
            <BrowseTab />
          </div>
        )}
        {currentTab === 'courses' && <CoursesTab />}
        {currentTab === 'lend' && <LendBookTab />}
        {currentTab === 'profile' && <ProfileTab />}
      </main>

      {/* Bottom Navigation */}
      <nav className="bottom-nav" aria-label="Primary">
        <div className="nav-content">
          <button
            onClick={() => setCurrentTab('home')}
            className={`nav-item ${currentTab === 'home' ? 'nav-item-active' : ''}`}
            aria-current={currentTab === 'home' ? 'page' : undefined}
          >
            <Icon name="house" size={24} />
            <span className="nav-label">Home</span>
          </button>
          <button
            onClick={() => setCurrentTab('browse')}
            className={`nav-item ${currentTab === 'browse' ? 'nav-item-active' : ''}`}
            aria-current={currentTab === 'browse' ? 'page' : undefined}
          >
            <Icon name="search" size={24} />
            <span className="nav-label">Browse</span>
          </button>
          <button
            onClick={() => setCurrentTab('courses')}
            className={`nav-item ${currentTab === 'courses' ? 'nav-item-active' : ''}`}
            aria-current={currentTab === 'courses' ? 'page' : undefined}
          >
            <Icon name="book-open" size={24} />
            <span className="nav-label">Courses</span>
          </button>
          <button
            onClick={() => setCurrentTab('lend')}
            className={`nav-item ${currentTab === 'lend' ? 'nav-item-active' : ''}`}
            aria-current={currentTab === 'lend' ? 'page' : undefined}
          >
            <Icon name="plus" size={24} />
            <span className="nav-label">Lend a Book</span>
          </button>
          <button
            onClick={() => setCurrentTab('profile')}
            className={`nav-item ${currentTab === 'profile' ? 'nav-item-active' : ''}`}
            aria-current={currentTab === 'profile' ? 'page' : undefined}
          >
            <Icon name="user" size={24} />
            <span className="nav-label">Profile</span>
          </button>
        </div>
      </nav>

      {/* Toasts */}
      <div className="toast-container" role="status" aria-live="polite" aria-atomic="true">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>{t.message}</div>
        ))}
      </div>

      {/* Onboarding Modal */}
      {onboardingOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Get started">
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">Let's personalize CampusConnect</div>
              <button className="btn" style={{ border: '1px solid var(--border)', background: 'transparent' }} onClick={() => setOnboardingOpen(false)} aria-label="Close">
                <Icon name="x" size={16} />
                <span style={{ fontSize: '0.875rem', marginLeft: '0.25rem' }}>Close</span>
              </button>
            </div>
            <div className="space-y-4">
              {onboardStep === 0 && (
                <div>
                  <label className="form-label" htmlFor="ob-email">University Email</label>
                  <input id="ob-email" type="email" className="form-input" placeholder="you@university.edu" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
                </div>
              )}
              {onboardStep === 1 && (
                <div>
                  <label className="form-label" htmlFor="ob-dept">Department/Major</label>
                  <input id="ob-dept" className="form-input" placeholder="e.g., Computer Science" value={profile.department} onChange={(e) => setProfile({ ...profile, department: e.target.value })} />
                </div>
              )}
              {onboardStep === 2 && (
                <div>
                  <label className="form-label" htmlFor="ob-dorm">Dorm/Location</label>
                  <input id="ob-dorm" className="form-input" placeholder="e.g., Dorm B, Room 204" value={profile.dorm} onChange={(e) => setProfile({ ...profile, dorm: e.target.value })} />
                </div>
              )}
              {onboardStep === 3 && (
                <div>
                  <label className="form-label" htmlFor="ob-courses">Select Your Courses</label>
                  <div className="space-y-4">
                    {courses.map(c => (
                      <label key={c} className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input type="checkbox" checked={profile.courses.includes(c)} onChange={(e) => {
                          const exists = profile.courses.includes(c);
                          const next = exists ? profile.courses.filter(x => x !== c) : [...profile.courses, c];
                          setProfile({ ...profile, courses: next });
                        }} /> {c}
                      </label>
                    ))}
                  </div>
                </div>
              )}
              <div className="progress"><div className="progress-bar" style={{ width: `${((onboardStep+1)/4)*100}%` }} /></div>
              <div className="modal-actions">
                {onboardStep > 0 && <button className="btn" style={{ border: '1px solid var(--border)' }} onClick={() => setOnboardStep(onboardStep - 1)}>Back</button>}
                {onboardStep < 3 && <button className="btn btn-primary" onClick={() => setOnboardStep(onboardStep + 1)}>Next</button>}
                {onboardStep === 3 && (
                  <button className="btn btn-primary" onClick={() => {
                    try { localStorage.setItem('profile', JSON.stringify(profile)); localStorage.setItem('onboardingDone', '1'); } catch {}
                    setUserName(profile.email.split('@')[0] || 'Student');
                    setOnboardingOpen(false);
                    showToast('Onboarding complete', 'success');
                  }}>Finish</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Render the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<CampusConnect />);
