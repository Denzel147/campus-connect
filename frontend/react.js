const { useState, useEffect, useCallback, useMemo } = React;

// Icon components using Lucide
const Icon = ({ name, size = 24, ...props }) => {
  const iconRef = React.useRef(null);
  
  React.useEffect(() => {
    // Only initialize icons for this specific element
    if (iconRef.current && window.lucide) {
      try { 
        window.lucide.createIcons({ icons: window.lucide, nameAttr: 'data-lucide' });
      } catch {}
    }
  }, [name]);
  
  return React.createElement('i', { 
    ref: iconRef,
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
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('notificationSettings');
      return saved ? JSON.parse(saved) : {
        emailNotifications: true,
        pushNotifications: true,
        bookRequests: true,
        newBooks: true,
        messages: true
      };
    } catch {
      return {
        emailNotifications: true,
        pushNotifications: true,
        bookRequests: true,
        newBooks: true,
        messages: true
      };
    }
  });
  const [privacySettings, setPrivacySettings] = useState(() => {
    try {
      const saved = localStorage.getItem('privacySettings');
      return saved ? JSON.parse(saved) : {
        profileVisible: true,
        showEmail: false,
        showPhone: false,
        showDepartment: true,
        allowMessages: true
      };
    } catch {
      return {
        profileVisible: true,
        showEmail: false,
        showPhone: false,
        showDepartment: true,
        allowMessages: true
      };
    }
  });

  // Apply theme immediately on mount
  React.useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }
  }, []);

  // Update theme when it changes
  React.useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
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
  React.useEffect(() => { try { localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings)); } catch {} }, [notificationSettings]);
  React.useEffect(() => { try { localStorage.setItem('privacySettings', JSON.stringify(privacySettings)); } catch {} }, [privacySettings]);

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

  // removed duplicate favorites persistence effect

  // Enhanced sample data with more details
  const [availableBooks, setAvailableBooks] = useState([
    { title: 'Introduction to Algorithms', condition: 'Excellent', price: 25, date: '2025-11-01', author: 'Cormen et al.', category: 'Computer Science' },
    { title: 'Organic Chemistry', condition: 'Good', price: 30, date: '2025-11-05', author: 'Wade', category: 'Chemistry' },
    { title: 'Calculus: Early Transcendentals', condition: 'Fair', price: 20, date: '2025-11-10', author: 'Stewart', category: 'Mathematics' },
    { title: 'Principles of Economics', condition: 'Excellent', price: 35, date: '2025-11-08', author: 'Mankiw', category: 'Economics' },
    { title: 'Data Structures and Algorithms', condition: 'Good', price: 28, date: '2025-11-03', author: 'Goodrich', category: 'Computer Science' },
    { title: 'Physics for Scientists and Engineers', condition: 'Excellent', price: 40, date: '2025-11-12', author: 'Serway', category: 'Physics' },
    { title: 'Biology: The Unity and Diversity of Life', condition: 'Fair', price: 22, date: '2025-11-06', author: 'Starr', category: 'Biology' },
    { title: 'Microeconomics', condition: 'Good', price: 26, date: '2025-11-09', author: 'Pindyck', category: 'Economics' },
    { title: 'Linear Algebra and Its Applications', condition: 'Excellent', price: 32, date: '2025-11-04', author: 'Lay', category: 'Mathematics' },
    { title: 'Modern Operating Systems', condition: 'Good', price: 29, date: '2025-11-11', author: 'Tanenbaum', category: 'Computer Science' }
  ]);

  // Books the current user has listed
  const [myListedBooks, setMyListedBooks] = useState([]);
  
  // Enhanced filters and sorting
  const [sortBy, setSortBy] = useState('title'); // title, date, condition
  const [filterCondition, setFilterCondition] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  
  // Form validation states
  const [formErrors, setFormErrors] = useState({});
  const [formTouched, setFormTouched] = useState({});
  
  // Track all book requests (shared state that admin can see)
  const [bookRequests, setBookRequests] = useState(() => {
    try {
      const saved = localStorage.getItem('bookRequests');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  
  // Function to create a book request
  const requestBook = (bookTitle) => {
    const newRequest = {
      id: Date.now(),
      bookTitle: bookTitle,
      borrowerName: userName,
      borrowerEmail: profile.email || `${userName.toLowerCase()}@university.edu`,
      borrowerDepartment: profile.department || 'Not specified',
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
      requestedAt: new Date().toLocaleString()
    };
    
    const updatedRequests = [...bookRequests, newRequest];
    setBookRequests(updatedRequests);
    
    // Save to localStorage so admin can see it
    try {
      localStorage.setItem('bookRequests', JSON.stringify(updatedRequests));
    } catch (e) {
      console.error('Failed to save request:', e);
    }
    
    showToast(`Book request sent for "${bookTitle}"`, 'success');
  };

  // Enhanced filtering and sorting logic
  const filteredBooks = useMemo(() => {
    let books = availableBooks.filter(book => 
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    // Filter by condition
    if (filterCondition !== 'all') {
      books = books.filter(book => book.condition === filterCondition);
    }
    
    // Filter by price range
    books = books.filter(book => book.price >= priceRange[0] && book.price <= priceRange[1]);
    
    // Filter by saved only
    if (savedOnly) {
      books = books.filter(book => favorites.includes(book.title));
    }
    
    // Sort books
    books.sort((a, b) => {
      switch(sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'date-new':
          return new Date(b.date) - new Date(a.date);
        case 'date-old':
          return new Date(a.date) - new Date(b.date);
        case 'condition':
          const conditionOrder = { 'Excellent': 1, 'Good': 2, 'Fair': 3, 'Poor': 4 };
          return conditionOrder[a.condition] - conditionOrder[b.condition];
        case 'title':
        default:
          return a.title.localeCompare(b.title);
      }
    });
    
    return books;
  }, [availableBooks, searchQuery, filterCondition, priceRange, savedOnly, favorites, sortBy]);
  
  const displayBooks = filteredBooks;

  const BrowseTab = () => (
    <div className="space-y-4">
      <div className="card">
        <h3 className="section-title">Available Books to Borrow</h3>
        
        {/* Enhanced Filters and Search */}
        <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <select 
              className="form-input" 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              style={{ flex: '1', minWidth: '150px' }}
            >
              <option value="title">Sort: A-Z</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="date-new">Newest First</option>
              <option value="date-old">Oldest First</option>
              <option value="condition">Best Condition</option>
            </select>
            
            <select 
              className="form-input" 
              value={filterCondition} 
              onChange={(e) => setFilterCondition(e.target.value)}
              style={{ flex: '1', minWidth: '150px' }}
            >
              <option value="all">All Conditions</option>
              <option value="Excellent">⭐ Excellent</option>
              <option value="Good">✓ Good</option>
              <option value="Fair">○ Fair</option>
              <option value="Poor">△ Poor</option>
            </select>
            
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button
                className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Grid View"
              >
                <Icon name="grid" size={16} />
              </button>
              <button
                className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : ''}`}
                onClick={() => setViewMode('list')}
                title="List View"
              >
                <Icon name="list" size={16} />
              </button>
            </div>
          </div>
          
          <div style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>
            Showing {displayBooks.length} of {availableBooks.length} books
          </div>
        </div>
        
        {loading ? (
          <div className={viewMode === 'grid' ? 'book-grid' : 'book-list'} aria-hidden="true">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="book-card">
                <div className="skeleton-avatar" />
                <div style={{ width: '80%' }} className="skeleton skeleton-line" />
                <div className="skeleton skeleton-btn" />
              </div>
            ))}
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="empty-state">
            <Icon name="search-x" size={48} style={{ color: 'var(--muted)', marginBottom: '1rem' }} />
            <p style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>No books found</p>
            <p style={{ color: 'var(--muted)' }}>Try adjusting your filters or search query</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'book-grid' : 'book-list'} role="list" aria-label="Available books">
            {displayBooks.map((book, index) => (
              <div key={index} className={viewMode === 'grid' ? 'book-card' : 'book-item-enhanced'} role="listitem">
                <div className="book-condition-badge" data-condition={book.condition.toLowerCase()}>
                  {book.condition === 'Excellent' && '⭐'}
                  {book.condition === 'Good' && '✓'}
                  {book.condition === 'Fair' && '○'}
                  {book.condition === 'Poor' && '△'}
                  {' '}{book.condition}
                </div>
                <div className="book-card-content">
                  <Icon name="book-open" size={24} className="book-icon" />
                  <div style={{ flex: 1 }}>
                    <h4 className="book-card-title">{book.title}</h4>
                    <p className="book-card-author">by {book.author}</p>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                      <span className="badge" style={{ fontSize: '0.75rem' }}>{book.category}</span>
                      <span className="badge" style={{ fontSize: '0.75rem', background: 'var(--success-bg)' }}>
                        ${book.price}/week
                      </span>
                    </div>
                  </div>
                </div>
                <div className="book-card-actions">
                  <button
                    onClick={() => { 
                      const wasSaved = favorites.includes(book.title); 
                      toggleFavorite(book.title); 
                      showToast(wasSaved ? 'Removed from saved' : 'Saved to favorites', 'info'); 
                    }}
                    className="btn btn-sm"
                    aria-pressed={favorites.includes(book.title)}
                    title={favorites.includes(book.title) ? 'Saved' : 'Save'}
                    style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                  >
                    <Icon name={'heart'} size={16} style={{ color: favorites.includes(book.title) ? 'crimson' : 'var(--muted)' }} />
                  </button>
                  <button
                    onClick={() => { requestBook(book.title); saveSearch(searchQuery); }}
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1 }}
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
          <button 
            className="settings-item"
            onClick={() => setNotificationsOpen(true)}
          >
            Notification Preferences
          </button>
          <button 
            className="settings-item"
            onClick={() => setPrivacyOpen(true)}
          >
            Privacy Settings
          </button>
          <button 
            className="settings-item settings-logout"
            onClick={() => {
              if (window.confirm('Are you sure you want to logout?')) {
                showToast('Logged out successfully', 'info');
                // In a real app, you would clear auth tokens and redirect
              }
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Notification Preferences Modal */}
      {notificationsOpen && (
        <div className="modal-backdrop" onClick={() => setNotificationsOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Notification Preferences</div>
              <button 
                className="btn" 
                style={{ border: '1px solid var(--border)', background: 'transparent' }} 
                onClick={() => setNotificationsOpen(false)}
                aria-label="Close"
              >
                <Icon name="x" size={16} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                  <span className="form-label" style={{ marginBottom: 0 }}>Email Notifications</span>
                  <input
                    type="checkbox"
                    checked={notificationSettings.emailNotifications}
                    onChange={(e) => setNotificationSettings(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                </label>
                <p className="about-text" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  Receive notifications via email
                </p>
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                  <span className="form-label" style={{ marginBottom: 0 }}>Push Notifications</span>
                  <input
                    type="checkbox"
                    checked={notificationSettings.pushNotifications}
                    onChange={(e) => setNotificationSettings(prev => ({ ...prev, pushNotifications: e.target.checked }))}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                </label>
                <p className="about-text" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  Receive browser push notifications
                </p>
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                  <span className="form-label" style={{ marginBottom: 0 }}>Book Requests</span>
                  <input
                    type="checkbox"
                    checked={notificationSettings.bookRequests}
                    onChange={(e) => setNotificationSettings(prev => ({ ...prev, bookRequests: e.target.checked }))}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                </label>
                <p className="about-text" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  Get notified when someone requests your book
                </p>
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                  <span className="form-label" style={{ marginBottom: 0 }}>New Books Available</span>
                  <input
                    type="checkbox"
                    checked={notificationSettings.newBooks}
                    onChange={(e) => setNotificationSettings(prev => ({ ...prev, newBooks: e.target.checked }))}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                </label>
                <p className="about-text" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  Notify me when new books matching my interests are listed
                </p>
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                  <span className="form-label" style={{ marginBottom: 0 }}>Messages</span>
                  <input
                    type="checkbox"
                    checked={notificationSettings.messages}
                    onChange={(e) => setNotificationSettings(prev => ({ ...prev, messages: e.target.checked }))}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                </label>
                <p className="about-text" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  Get notified when you receive messages
                </p>
              </div>

              <div className="modal-actions">
                <button 
                  className="btn btn-primary" 
                  onClick={() => {
                    setNotificationsOpen(false);
                    showToast('Notification preferences saved', 'success');
                  }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Settings Modal */}
      {privacyOpen && (
        <div className="modal-backdrop" onClick={() => setPrivacyOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Privacy Settings</div>
              <button 
                className="btn" 
                style={{ border: '1px solid var(--border)', background: 'transparent' }} 
                onClick={() => setPrivacyOpen(false)}
                aria-label="Close"
              >
                <Icon name="x" size={16} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                  <span className="form-label" style={{ marginBottom: 0 }}>Profile Visible</span>
                  <input
                    type="checkbox"
                    checked={privacySettings.profileVisible}
                    onChange={(e) => setPrivacySettings(prev => ({ ...prev, profileVisible: e.target.checked }))}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                </label>
                <p className="about-text" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  Allow others to view your profile
                </p>
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                  <span className="form-label" style={{ marginBottom: 0 }}>Show Email Address</span>
                  <input
                    type="checkbox"
                    checked={privacySettings.showEmail}
                    onChange={(e) => setPrivacySettings(prev => ({ ...prev, showEmail: e.target.checked }))}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                </label>
                <p className="about-text" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  Display your email address on your listings
                </p>
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                  <span className="form-label" style={{ marginBottom: 0 }}>Show Phone Number</span>
                  <input
                    type="checkbox"
                    checked={privacySettings.showPhone}
                    onChange={(e) => setPrivacySettings(prev => ({ ...prev, showPhone: e.target.checked }))}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                </label>
                <p className="about-text" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  Display your phone number on your listings
                </p>
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                  <span className="form-label" style={{ marginBottom: 0 }}>Show Department</span>
                  <input
                    type="checkbox"
                    checked={privacySettings.showDepartment}
                    onChange={(e) => setPrivacySettings(prev => ({ ...prev, showDepartment: e.target.checked }))}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                </label>
                <p className="about-text" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  Display your department on your profile
                </p>
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                  <span className="form-label" style={{ marginBottom: 0 }}>Allow Messages</span>
                  <input
                    type="checkbox"
                    checked={privacySettings.allowMessages}
                    onChange={(e) => setPrivacySettings(prev => ({ ...prev, allowMessages: e.target.checked }))}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                </label>
                <p className="about-text" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  Allow other users to send you messages
                </p>
              </div>

              <div className="modal-actions">
                <button 
                  className="btn btn-primary" 
                  onClick={() => {
                    setPrivacyOpen(false);
                    showToast('Privacy settings saved', 'success');
                  }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Form validation function
  const validateForm = (formData) => {
    const errors = {};
    
    if (!formData.bookTitle || formData.bookTitle.trim().length < 3) {
      errors.bookTitle = 'Book title must be at least 3 characters';
    }
    
    if (formData.deposit && (isNaN(formData.deposit) || formData.deposit < 0)) {
      errors.deposit = 'Deposit must be a positive number';
    }
    
    if (formData.duration && (isNaN(formData.duration) || formData.duration < 1 || formData.duration > 365)) {
      errors.duration = 'Duration must be between 1 and 365 days';
    }
    
    if (formData.availableFrom && formData.availableTo) {
      const from = new Date(formData.availableFrom);
      const to = new Date(formData.availableTo);
      if (from > to) {
        errors.availableTo = 'End date must be after start date';
      }
    }
    
    return errors;
  };

  const LendBookPage = () => {
    const [localFormData, setLocalFormData] = React.useState({
      bookTitle: '',
      author: '',
      condition: 'Excellent',
      description: '',
      deposit: '0',
      duration: '7',
      availableFrom: '',
      availableTo: '',
      category: 'Computer Science'
    });
    
    const handleInputChange = (field, value) => {
      setLocalFormData(prev => ({ ...prev, [field]: value }));
      setFormTouched(prev => ({ ...prev, [field]: true }));
      
      // Real-time validation
      const updatedData = { ...localFormData, [field]: value };
      const errors = validateForm(updatedData);
      setFormErrors(errors);
    };
    
    const handleSubmit = (e) => {
      e.preventDefault();
      
      // Final validation
      const errors = validateForm(localFormData);
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        showToast('Please fix form errors', 'error');
        return;
      }
      
      const newListing = {
        id: Date.now(),
        title: localFormData.bookTitle,
        author: localFormData.author || 'Unknown',
        condition: localFormData.condition,
        description: localFormData.description,
        category: localFormData.category,
        deposit_amount: parseFloat(localFormData.deposit) || 0,
        lending_duration_days: parseInt(localFormData.duration) || 7,
        available_from: localFormData.availableFrom,
        available_to: localFormData.availableTo,
        lenderName: userName,
        lenderEmail: profile.email || `${userName.toLowerCase()}@university.edu`,
        lenderDepartment: profile.department || 'Not specified',
        status: 'available',
        date: new Date().toISOString().split('T')[0],
        listedAt: new Date().toLocaleString(),
        type: 'lend'
      };
      
      // Save to localStorage for admin to see
      try {
        const existingListings = localStorage.getItem('bookListings');
        const listings = existingListings ? JSON.parse(existingListings) : [];
        listings.push(newListing);
        localStorage.setItem('bookListings', JSON.stringify(listings));
        
        // Also add to myListedBooks
        setMyListedBooks(prev => [...prev, newListing]);
      } catch (e) {
        console.error('Failed to save listing:', e);
      }
      
      showToast('📚 Book listed successfully! Admin can now see it.', 'success');
      
      // Reset form
      setLocalFormData({
        bookTitle: '',
        author: '',
        condition: 'Excellent',
        description: '',
        deposit: '0',
        duration: '7',
        availableFrom: '',
        availableTo: '',
        category: 'Computer Science'
      });
      setFormErrors({});
      setFormTouched({});
    };
    
    return React.createElement('div', { className: 'space-y-4' },
      React.createElement('div', { className: 'card' },
        React.createElement('h2', { className: 'page-title' },
          React.createElement(Icon, { name: 'plus', size: 24, className: 'title-icon' }),
          ' Lend a Book'
        ),
        React.createElement('p', { style: { marginBottom: '20px', color: 'var(--muted)' } },
          'List your book for other students to borrow'
        ),
        React.createElement('form', {
          id: 'lendBookForm',
          onSubmit: handleSubmit
        },
          React.createElement('div', { className: 'form-grid' },
            React.createElement('div', { className: 'form-group' },
              React.createElement('label', { className: 'form-label', htmlFor: 'bookTitle' },
                'Book Title ',
                React.createElement('span', { className: 'required' }, '*')
              ),
              React.createElement('input', {
                type: 'text',
                className: `form-input ${formErrors.bookTitle && formTouched.bookTitle ? 'input-error' : ''}`,
                id: 'bookTitle',
                name: 'bookTitle',
                placeholder: 'Enter book title',
                value: localFormData.bookTitle,
                onChange: (e) => handleInputChange('bookTitle', e.target.value),
                required: true
              }),
              formErrors.bookTitle && formTouched.bookTitle && 
                React.createElement('span', { className: 'error-message' }, 
                  React.createElement(Icon, { name: 'alert-circle', size: 14 }),
                  ' ', formErrors.bookTitle
                )
            ),
            React.createElement('div', { className: 'form-group' },
              React.createElement('label', { className: 'form-label', htmlFor: 'author' },
                'Author'
              ),
              React.createElement('input', {
                type: 'text',
                className: 'form-input',
                id: 'author',
                name: 'author',
                placeholder: 'Enter author name',
                value: localFormData.author,
                onChange: (e) => handleInputChange('author', e.target.value)
              })
            )
          ),
          React.createElement('div', { className: 'form-grid' },
            React.createElement('div', { className: 'form-group' },
              React.createElement('label', { className: 'form-label', htmlFor: 'condition' },
                'Condition ',
                React.createElement('span', { className: 'required' }, '*')
              ),
              React.createElement('select', {
                className: 'form-input',
                id: 'condition',
                name: 'condition',
                value: localFormData.condition,
                onChange: (e) => handleInputChange('condition', e.target.value)
              },
                React.createElement('option', { value: 'Excellent' }, '⭐ Excellent - Like New'),
                React.createElement('option', { value: 'Good' }, '✓ Good - Minor Wear'),
                React.createElement('option', { value: 'Fair' }, '○ Fair - Visible Wear'),
                React.createElement('option', { value: 'Poor' }, '△ Poor - Heavy Wear')
              ),
              React.createElement('small', { style: { color: 'var(--muted)', marginTop: '0.25rem', display: 'block' } },
                localFormData.condition === 'Excellent' && 'Perfect condition, no marks or wear',
                localFormData.condition === 'Good' && 'Some minor highlighting or notes',
                localFormData.condition === 'Fair' && 'Noticeable wear but fully functional',
                localFormData.condition === 'Poor' && 'Heavy wear, may have missing pages'
              )
            ),
            React.createElement('div', { className: 'form-group' },
              React.createElement('label', { className: 'form-label', htmlFor: 'category' },
                'Category'
              ),
              React.createElement('select', {
                className: 'form-input',
                id: 'category',
                name: 'category',
                value: localFormData.category,
                onChange: (e) => handleInputChange('category', e.target.value)
              },
                React.createElement('option', { value: 'Computer Science' }, 'Computer Science'),
                React.createElement('option', { value: 'Mathematics' }, 'Mathematics'),
                React.createElement('option', { value: 'Physics' }, 'Physics'),
                React.createElement('option', { value: 'Chemistry' }, 'Chemistry'),
                React.createElement('option', { value: 'Biology' }, 'Biology'),
                React.createElement('option', { value: 'Economics' }, 'Economics'),
                React.createElement('option', { value: 'Engineering' }, 'Engineering'),
                React.createElement('option', { value: 'Other' }, 'Other')
              )
            )
          ),
          React.createElement('div', { className: 'form-group' },
            React.createElement('label', { className: 'form-label', htmlFor: 'description' },
              'Description'
            ),
            React.createElement('textarea', {
              className: 'form-input',
              id: 'description',
              name: 'description',
              rows: 4,
              placeholder: 'Describe your book, any highlights, notes, etc.',
              value: localFormData.description,
              onChange: (e) => handleInputChange('description', e.target.value)
            }),
            React.createElement('small', { style: { color: 'var(--muted)', marginTop: '0.25rem', display: 'block' } },
              `${localFormData.description.length}/500 characters`
            )
          ),
          React.createElement('div', { className: 'form-grid' },
            React.createElement('div', { className: 'form-group' },
              React.createElement('label', { className: 'form-label', htmlFor: 'deposit' },
                'Deposit Amount ($)'
              ),
              React.createElement('input', {
                type: 'number',
                className: `form-input ${formErrors.deposit && formTouched.deposit ? 'input-error' : ''}`,
                id: 'deposit',
                name: 'deposit',
                min: '0',
                step: '0.01',
                value: localFormData.deposit,
                onChange: (e) => handleInputChange('deposit', e.target.value),
                placeholder: '0.00'
              }),
              formErrors.deposit && formTouched.deposit && 
                React.createElement('span', { className: 'error-message' }, 
                  React.createElement(Icon, { name: 'alert-circle', size: 14 }),
                  ' ', formErrors.deposit
                )
            ),
            React.createElement('div', { className: 'form-group' },
              React.createElement('label', { className: 'form-label', htmlFor: 'duration' },
                'Lending Duration (days)'
              ),
              React.createElement('input', {
                type: 'number',
                className: `form-input ${formErrors.duration && formTouched.duration ? 'input-error' : ''}`,
                id: 'duration',
                name: 'duration',
                min: '1',
                max: '365',
                value: localFormData.duration,
                onChange: (e) => handleInputChange('duration', e.target.value),
                placeholder: '7'
              }),
              formErrors.duration && formTouched.duration && 
                React.createElement('span', { className: 'error-message' }, 
                  React.createElement(Icon, { name: 'alert-circle', size: 14 }),
                  ' ', formErrors.duration
                )
            )
          ),
          React.createElement('div', { className: 'form-grid' },
            React.createElement('div', { className: 'form-group' },
              React.createElement('label', { className: 'form-label', htmlFor: 'availableFrom' },
                'Available From'
              ),
              React.createElement('input', {
                type: 'date',
                className: 'form-input',
                id: 'availableFrom',
                name: 'availableFrom',
                value: localFormData.availableFrom,
                onChange: (e) => handleInputChange('availableFrom', e.target.value),
                min: new Date().toISOString().split('T')[0]
              })
            ),
            React.createElement('div', { className: 'form-group' },
              React.createElement('label', { className: 'form-label', htmlFor: 'availableTo' },
                'Available To'
              ),
              React.createElement('input', {
                type: 'date',
                className: `form-input ${formErrors.availableTo && formTouched.availableTo ? 'input-error' : ''}`,
                id: 'availableTo',
                name: 'availableTo',
                value: localFormData.availableTo,
                onChange: (e) => handleInputChange('availableTo', e.target.value),
                min: localFormData.availableFrom || new Date().toISOString().split('T')[0]
              }),
              formErrors.availableTo && formTouched.availableTo && 
                React.createElement('span', { className: 'error-message' }, 
                  React.createElement(Icon, { name: 'alert-circle', size: 14 }),
                  ' ', formErrors.availableTo
                )
            )
          ),
          React.createElement('button', {
            type: 'submit',
            className: 'btn btn-primary',
            style: { width: '100%', marginTop: '20px' }
          }, '📚 List Book for Lending')
        )
      ),
      
      // Status Tracking Section
      myListedBooks.length > 0 && React.createElement('div', { className: 'card', style: { marginTop: '1.5rem' } },
        React.createElement('h3', { className: 'section-title' },
          React.createElement(Icon, { name: 'activity', size: 20, className: 'title-icon' }),
          ' Your Lending Activity'
        ),
        React.createElement('div', { className: 'activity-stats', style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem', marginBottom: '1.5rem' } },
          React.createElement('div', { className: 'activity-stat-card' },
            React.createElement('div', { className: 'activity-stat-number', style: { fontSize: '2rem', fontWeight: 'bold', color: '#2563eb' } }, 
              myListedBooks.length
            ),
            React.createElement('div', { className: 'activity-stat-label', style: { fontSize: '0.875rem', color: 'var(--muted)' } }, 
              'Total Listed'
            )
          ),
          React.createElement('div', { className: 'activity-stat-card' },
            React.createElement('div', { className: 'activity-stat-number', style: { fontSize: '2rem', fontWeight: 'bold', color: '#059669' } }, 
              myListedBooks.filter(b => b.status === 'available').length
            ),
            React.createElement('div', { className: 'activity-stat-label', style: { fontSize: '0.875rem', color: 'var(--muted)' } }, 
              'Available'
            )
          ),
          React.createElement('div', { className: 'activity-stat-card' },
            React.createElement('div', { className: 'activity-stat-number', style: { fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' } }, 
              myListedBooks.filter(b => b.status === 'pending').length
            ),
            React.createElement('div', { className: 'activity-stat-label', style: { fontSize: '0.875rem', color: 'var(--muted)' } }, 
              'Pending'
            )
          ),
          React.createElement('div', { className: 'activity-stat-card' },
            React.createElement('div', { className: 'activity-stat-number', style: { fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6' } }, 
              myListedBooks.filter(b => b.status === 'borrowed').length
            ),
            React.createElement('div', { className: 'activity-stat-label', style: { fontSize: '0.875rem', color: 'var(--muted)' } }, 
              'On Loan'
            )
          )
        ),
        
        React.createElement('div', { className: 'listings-list' },
          myListedBooks.map((book, idx) => 
            React.createElement('div', { key: book.id || idx, className: 'listing-item', style: { display: 'flex', alignItems: 'center', padding: '1rem', background: 'var(--bg)', borderRadius: 'var(--radius)', marginBottom: '0.75rem', border: '1px solid var(--border)' } },
              React.createElement('div', { style: { flex: 1 } },
                React.createElement('h4', { style: { fontWeight: '600', marginBottom: '0.25rem' } }, book.title),
                React.createElement('p', { style: { fontSize: '0.875rem', color: 'var(--muted)', marginBottom: '0.5rem' } }, 
                  `${book.author} • ${book.condition} • $${book.deposit_amount}/week`
                ),
                React.createElement('div', { style: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' } },
                  React.createElement('span', { 
                    className: 'badge',
                    style: { 
                      background: book.status === 'available' ? '#dcfce7' : 
                                 book.status === 'pending' ? '#fef3c7' : 
                                 book.status === 'borrowed' ? '#ddd6fe' : '#fee2e2',
                      color: book.status === 'available' ? '#166534' : 
                             book.status === 'pending' ? '#92400e' : 
                             book.status === 'borrowed' ? '#5b21b6' : '#991b1b'
                    }
                  }, 
                    book.status === 'available' ? '✓ Available' :
                    book.status === 'pending' ? '⏳ Pending' :
                    book.status === 'borrowed' ? '📚 On Loan' : book.status
                  ),
                  book.available_from && React.createElement('span', { className: 'badge', style: { fontSize: '0.75rem' } },
                    `${book.available_from} → ${book.available_to || 'Ongoing'}`
                  )
                )
              ),
              React.createElement('div', { style: { display: 'flex', gap: '0.5rem' } },
                React.createElement('button', { 
                  className: 'btn btn-sm',
                  style: { border: '1px solid var(--border)' },
                  onClick: () => showToast('Edit feature coming soon!', 'info')
                },
                  React.createElement(Icon, { name: 'edit', size: 16 })
                ),
                React.createElement('button', { 
                  className: 'btn btn-sm',
                  style: { border: '1px solid #ef4444', color: '#ef4444' },
                  onClick: () => {
                    if (confirm(`Remove "${book.title}" from your listings?`)) {
                      setMyListedBooks(prev => prev.filter(b => b.id !== book.id));
                      showToast('Book removed from listings', 'success');
                    }
                  }
                },
                  React.createElement(Icon, { name: 'trash-2', size: 16 })
                )
              )
            )
          )
        )
      )
    );
  };

  const AdminDashboard = () => {
    const [stats, setStats] = React.useState({ transactions: {}, items: {}, users: {} });
    const [requests, setRequests] = React.useState([]);
    const [listings, setListings] = React.useState([]);
    const [allItems, setAllItems] = React.useState([]);
    const [statusFilter, setStatusFilter] = React.useState('all');
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
      // Load real book requests and listings from localStorage
      try {
        // Load book requests (borrow requests)
        const savedRequests = localStorage.getItem('bookRequests');
        const allRequests = savedRequests ? JSON.parse(savedRequests) : [];
        
        // Load book listings (lend listings)
        const savedListings = localStorage.getItem('bookListings');
        const allListings = savedListings ? JSON.parse(savedListings) : [];
        
        setRequests(allRequests);
        setListings(allListings);
        
        // Combine both for display
        const combined = [
          ...allRequests.map(r => ({ ...r, type: 'request' })),
          ...allListings.map(l => ({ ...l, type: 'listing' }))
        ];
        setAllItems(combined);
        
        // Calculate real statistics
        const allTransactions = combined;
        const pendingCount = allTransactions.filter(r => r.status === 'pending').length;
        const approvedCount = allTransactions.filter(r => r.status === 'approved').length;
        const cancelledCount = allTransactions.filter(r => r.status === 'cancelled').length;
        const activeCount = allTransactions.filter(r => r.status === 'active').length;
        const completedCount = allTransactions.filter(r => r.status === 'completed').length;
        
        setStats({
          transactions: { 
            total: allTransactions.length, 
            pending: pendingCount,
            approved: approvedCount,
            cancelled: cancelledCount,
            active: activeCount, 
            completed: completedCount, 
            overdue: 0 
          },
          items: { 
            total: allListings.length, 
            available: allListings.filter(l => l.status === 'approved').length, 
            borrowed: activeCount, 
            reserved: 0 
          },
          users: { total: 1, active: 1, verified: 1 }
        });
      } catch (e) {
        console.error('Failed to load data:', e);
        setRequests([]);
        setListings([]);
        setAllItems([]);
      }
      
      setLoading(false);
    }, []);
    
    // Filter items by status
    const filteredItems = statusFilter === 'all' 
      ? allItems 
      : allItems.filter(item => item.status === statusFilter);

    return React.createElement('div', { className: 'space-y-4' },
      React.createElement('div', { className: 'card' },
        React.createElement('h2', { className: 'page-title' },
          React.createElement(Icon, { name: 'shield', size: 24, className: 'title-icon' }),
          ' Admin Dashboard'
        ),
        
        // Statistics Cards
        React.createElement('div', { 
          style: { 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '20px', 
            marginTop: '20px' 
          } 
        },
          // Transactions Stats
          React.createElement('div', { 
            style: { 
              padding: '20px', 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
              borderRadius: '8px', 
              color: 'white' 
            } 
          },
            React.createElement('div', { style: { fontSize: '14px', opacity: 0.9 } }, 'Total Transactions'),
            React.createElement('div', { style: { fontSize: '32px', fontWeight: 'bold', marginTop: '8px' } }, stats.transactions.total || 0),
            React.createElement('div', { style: { marginTop: '12px', fontSize: '12px' } },
              `Pending: ${stats.transactions.pending || 0} | Active: ${stats.transactions.active || 0}`
            )
          ),
          
          // Items Stats
          React.createElement('div', { 
            style: { 
              padding: '20px', 
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 
              borderRadius: '8px', 
              color: 'white' 
            } 
          },
            React.createElement('div', { style: { fontSize: '14px', opacity: 0.9 } }, 'Total Books'),
            React.createElement('div', { style: { fontSize: '32px', fontWeight: 'bold', marginTop: '8px' } }, stats.items.total || 0),
            React.createElement('div', { style: { marginTop: '12px', fontSize: '12px' } },
              `Available: ${stats.items.available || 0} | Borrowed: ${stats.items.borrowed || 0}`
            )
          ),
          
          // Users Stats
          React.createElement('div', { 
            style: { 
              padding: '20px', 
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', 
              borderRadius: '8px', 
              color: 'white' 
            } 
          },
            React.createElement('div', { style: { fontSize: '14px', opacity: 0.9 } }, 'Total Users'),
            React.createElement('div', { style: { fontSize: '32px', fontWeight: 'bold', marginTop: '8px' } }, stats.users.total || 0),
            React.createElement('div', { style: { marginTop: '12px', fontSize: '12px' } },
              `Active: ${stats.users.active || 0} | Verified: ${stats.users.verified || 0}`
            )
          )
        ),
        
        // Filter Buttons
        React.createElement('div', { style: { marginTop: '30px' } },
          React.createElement('div', { 
            style: { 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '15px',
              flexWrap: 'wrap',
              gap: '10px'
            } 
          },
            React.createElement('h3', { style: { fontSize: '18px', fontWeight: '600', margin: 0 } }, 
              `📚 All Activities (${filteredItems.length})`
            ),
            React.createElement('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } },
              React.createElement('button', {
                onClick: () => setStatusFilter('all'),
                className: 'btn btn-sm',
                style: {
                  background: statusFilter === 'all' ? '#667eea' : '#f8f9fa',
                  color: statusFilter === 'all' ? 'white' : '#333',
                  border: 'none',
                  padding: '6px 16px',
                  fontSize: '13px',
                  fontWeight: '500'
                }
              }, 'All'),
              React.createElement('button', {
                onClick: () => setStatusFilter('pending'),
                className: 'btn btn-sm',
                style: {
                  background: statusFilter === 'pending' ? '#ffc107' : '#f8f9fa',
                  color: statusFilter === 'pending' ? 'white' : '#333',
                  border: 'none',
                  padding: '6px 16px',
                  fontSize: '13px',
                  fontWeight: '500'
                }
              }, `Pending (${stats.transactions.pending || 0})`),
              React.createElement('button', {
                onClick: () => setStatusFilter('approved'),
                className: 'btn btn-sm',
                style: {
                  background: statusFilter === 'approved' ? '#28a745' : '#f8f9fa',
                  color: statusFilter === 'approved' ? 'white' : '#333',
                  border: 'none',
                  padding: '6px 16px',
                  fontSize: '13px',
                  fontWeight: '500'
                }
              }, `Approved (${stats.transactions.approved || 0})`),
              React.createElement('button', {
                onClick: () => setStatusFilter('cancelled'),
                className: 'btn btn-sm',
                style: {
                  background: statusFilter === 'cancelled' ? '#dc3545' : '#f8f9fa',
                  color: statusFilter === 'cancelled' ? 'white' : '#333',
                  border: 'none',
                  padding: '6px 16px',
                  fontSize: '13px',
                  fontWeight: '500'
                }
              }, `Cancelled (${stats.transactions.cancelled || 0})`)
            )
          )
        ),
        
        // Activities Table
        React.createElement('div', { style: { marginTop: '15px' } },
          
          filteredItems.length === 0 ? 
            React.createElement('div', { 
              style: { 
                padding: '40px', 
                textAlign: 'center', 
                color: '#999',
                background: '#f8f9fa',
                borderRadius: '8px'
              } 
            },
              React.createElement('p', { style: { fontSize: '16px', marginBottom: '8px' } }, '📭 No book requests yet'),
              React.createElement('p', { style: { fontSize: '14px' } }, 'When users request books, they will appear here.')
            )
          :
          React.createElement('div', { style: { overflowX: 'auto' } },
            React.createElement('table', { 
              style: { 
                width: '100%', 
                borderCollapse: 'collapse',
                fontSize: '14px'
              } 
            },
              React.createElement('thead', {},
                React.createElement('tr', { style: { borderBottom: '2px solid #e0e0e0' } },
                  React.createElement('th', { style: { padding: '12px', textAlign: 'left' } }, 'Type'),
                  React.createElement('th', { style: { padding: '12px', textAlign: 'left' } }, 'Book Title'),
                  React.createElement('th', { style: { padding: '12px', textAlign: 'left' } }, 'User'),
                  React.createElement('th', { style: { padding: '12px', textAlign: 'left' } }, 'Email'),
                  React.createElement('th', { style: { padding: '12px', textAlign: 'left' } }, 'Status'),
                  React.createElement('th', { style: { padding: '12px', textAlign: 'left' } }, 'Date'),
                  React.createElement('th', { style: { padding: '12px', textAlign: 'left' } }, 'Actions')
                )
              ),
              React.createElement('tbody', {},
                filteredItems.map(item =>
                  React.createElement('tr', { 
                    key: item.id,
                    style: { borderBottom: '1px solid #f0f0f0' }
                  },
                    React.createElement('td', { style: { padding: '12px' } },
                      React.createElement('span', {
                        style: {
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '600',
                          background: item.type === 'request' ? '#e3f2fd' : '#fff3e0',
                          color: item.type === 'request' ? '#1976d2' : '#f57c00'
                        }
                      }, item.type === 'request' ? 'REQUEST' : 'LEND')
                    ),
                    React.createElement('td', { style: { padding: '12px', fontWeight: '500' } }, item.bookTitle || item.title),
                    React.createElement('td', { style: { padding: '12px' } }, item.borrowerName || item.lenderName),
                    React.createElement('td', { style: { padding: '12px', fontSize: '12px', color: '#666' } }, item.borrowerEmail || item.lenderEmail || 'N/A'),
                    React.createElement('td', { style: { padding: '12px' } },
                      React.createElement('span', {
                        style: {
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600',
                          background: item.status === 'pending' ? '#fff3cd' : 
                                     item.status === 'approved' ? '#d4edda' :
                                     item.status === 'cancelled' ? '#f8d7da' :
                                     item.status === 'active' ? '#d1ecf1' : '#e2e3e5',
                          color: item.status === 'pending' ? '#856404' : 
                                item.status === 'approved' ? '#155724' :
                                item.status === 'cancelled' ? '#721c24' :
                                item.status === 'active' ? '#0c5460' : '#383d41'
                        }
                      }, item.status.charAt(0).toUpperCase() + item.status.slice(1))
                    ),
                    React.createElement('td', { style: { padding: '12px', fontSize: '13px' } }, item.date),
                    React.createElement('td', { style: { padding: '12px' } },
                      React.createElement('div', { style: { display: 'flex', gap: '8px' } },
                        item.status === 'pending' && React.createElement('button', {
                          onClick: () => {
                            // Update status to approved
                            try {
                              if (item.type === 'request') {
                                const savedRequests = localStorage.getItem('bookRequests');
                                const allRequests = savedRequests ? JSON.parse(savedRequests) : [];
                                const updated = allRequests.map(r => 
                                  r.id === item.id ? { ...r, status: 'approved' } : r
                                );
                                localStorage.setItem('bookRequests', JSON.stringify(updated));
                              } else {
                                const savedListings = localStorage.getItem('bookListings');
                                const allListings = savedListings ? JSON.parse(savedListings) : [];
                                const updated = allListings.map(l => 
                                  l.id === item.id ? { ...l, status: 'approved' } : l
                                );
                                localStorage.setItem('bookListings', JSON.stringify(updated));
                              }
                              showToast('Status updated to Approved!', 'success');
                              window.location.reload();
                            } catch (e) {
                              showToast('Failed to update status', 'error');
                            }
                          },
                          className: 'btn btn-sm',
                          style: {
                            background: '#28a745',
                            color: 'white',
                            border: 'none',
                            padding: '4px 12px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }
                        }, '✓ Approve'),
                        item.status === 'pending' && React.createElement('button', {
                          onClick: () => {
                            // Update status to cancelled
                            try {
                              if (item.type === 'request') {
                                const savedRequests = localStorage.getItem('bookRequests');
                                const allRequests = savedRequests ? JSON.parse(savedRequests) : [];
                                const updated = allRequests.map(r => 
                                  r.id === item.id ? { ...r, status: 'cancelled' } : r
                                );
                                localStorage.setItem('bookRequests', JSON.stringify(updated));
                              } else {
                                const savedListings = localStorage.getItem('bookListings');
                                const allListings = savedListings ? JSON.parse(savedListings) : [];
                                const updated = allListings.map(l => 
                                  l.id === item.id ? { ...l, status: 'cancelled' } : l
                                );
                                localStorage.setItem('bookListings', JSON.stringify(updated));
                              }
                              showToast('Status updated to Cancelled', 'info');
                              window.location.reload();
                            } catch (e) {
                              showToast('Failed to update status', 'error');
                            }
                          },
                          className: 'btn btn-sm',
                          style: {
                            background: '#dc3545',
                            color: 'white',
                            border: 'none',
                            padding: '4px 12px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }
                        }, '✗ Cancel')
                      )
                    )
                  )
                )
              )
            )
          )
        ),
        
        // Info Box
        React.createElement('div', { 
          style: { 
            marginTop: '20px', 
            padding: '15px', 
            background: '#f8f9fa', 
            borderRadius: '6px',
            borderLeft: '4px solid #667eea'
          } 
        },
          React.createElement('p', { style: { fontSize: '14px', color: '#666' } },
            '💡 This dashboard shows real-time statistics. Click on any book title to see all users who requested that specific book.'
          )
        )
      )
    );
  };

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
            <button
              className="notification-icon"
              onClick={() => {
                showToast(`You have ${notifications} notification${notifications !== 1 ? 's' : ''}`, 'info');
              }}
              aria-label={`Notifications (${notifications} unread)`}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', position: 'relative' }}
            >
              <Icon name="bell" size={24} />
              {notifications > 0 && (
                <span className="notification-badge">{notifications}</span>
              )}
            </button>
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
        {currentTab === 'lend' && React.createElement(LendBookPage)}
        {currentTab === 'profile' && <ProfileTab />}
        {currentTab === 'admin' && React.createElement(AdminDashboard)}
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
            <span className="nav-label">Lend Book</span>
          </button>
          <button
            onClick={() => setCurrentTab('profile')}
            className={`nav-item ${currentTab === 'profile' ? 'nav-item-active' : ''}`}
            aria-current={currentTab === 'profile' ? 'page' : undefined}
          >
            <Icon name="user" size={24} />
            <span className="nav-label">Profile</span>
          </button>
          <button
            onClick={() => setCurrentTab('admin')}
            className={`nav-item ${currentTab === 'admin' ? 'nav-item-active' : ''}`}
            aria-current={currentTab === 'admin' ? 'page' : undefined}
          >
            <Icon name="shield" size={24} />
            <span className="nav-label">Admin</span>
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
