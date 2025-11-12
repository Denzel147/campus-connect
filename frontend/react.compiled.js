const {
  useState,
  useEffect,
  useCallback,
  useMemo
} = React;

// Icon components using Lucide
const Icon = ({
  name,
  size = 24,
  ...props
}) => {
  const iconRef = React.useRef(null);
  React.useEffect(() => {
    // Only initialize icons for this specific element
    if (iconRef.current && window.lucide) {
      try {
        window.lucide.createIcons({
          icons: window.lucide,
          nameAttr: 'data-lucide'
        });
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
    try {
      const raw = localStorage.getItem('favorites');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const raw = localStorage.getItem('recentSearches');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [savedOnly, setSavedOnly] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [courses, setCourses] = useState(['MATH-101', 'BIO-201', 'CS-202']);
  const [selectedCourse, setSelectedCourse] = useState('MATH-101');
  const [userName, setUserName] = useState('Alex');
  const [onboardingOpen, setOnboardingOpen] = useState(() => {
    try {
      return localStorage.getItem('onboardingDone') ? false : true;
    } catch {
      return true;
    }
  });
  const [onboardStep, setOnboardStep] = useState(0);
  const [profile, setProfile] = useState(() => {
    try {
      const raw = localStorage.getItem('profile');
      return raw ? JSON.parse(raw) : {
        email: '',
        department: '',
        dorm: '',
        courses: []
      };
    } catch {
      return {
        email: '',
        department: '',
        dorm: '',
        courses: []
      };
    }
  });
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('theme') || 'light';
    } catch {
      return 'light';
    }
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
    try {
      localStorage.setItem('theme', theme);
    } catch {}
  }, [theme]);
  React.useEffect(() => {
    const onScroll = () => setIsCompact(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, {
      passive: true
    });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);
  React.useEffect(() => {
    try {
      localStorage.setItem('favorites', JSON.stringify(favorites));
    } catch {}
  }, [favorites]);
  React.useEffect(() => {
    try {
      localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings));
    } catch {}
  }, [notificationSettings]);
  React.useEffect(() => {
    try {
      localStorage.setItem('privacySettings', JSON.stringify(privacySettings));
    } catch {}
  }, [privacySettings]);
  const toggleFavorite = title => {
    setFavorites(prev => prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]);
    showToast(prevIncludes(title) ? 'Removed from saved' : 'Saved to favorites', 'info');
  };
  const prevIncludes = title => favorites.includes(title);
  const saveSearch = q => {
    const v = q.trim();
    if (!v) return;
    setRecentSearches(prev => {
      const next = [v, ...prev.filter(p => p !== v)].slice(0, 5);
      try {
        localStorage.setItem('recentSearches', JSON.stringify(next));
      } catch {}
      return next;
    });
  };
  const showToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, {
      id,
      message,
      type
    }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 2200);
  };

  // removed duplicate favorites persistence effect

  // Sample data - just book titles available for borrowing
  const [availableBooks, setAvailableBooks] = useState(['Introduction to Algorithms', 'Organic Chemistry', 'Calculus: Early Transcendentals', 'Principles of Economics', 'Data Structures and Algorithms', 'Physics for Scientists and Engineers', 'Biology: The Unity and Diversity of Life', 'Microeconomics', 'Linear Algebra and Its Applications', 'Modern Operating Systems']);

  // Books the current user has listed
  const [myListedBooks, setMyListedBooks] = useState([]);

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
  const requestBook = bookTitle => {
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
  const filteredBooks = availableBooks.filter(book => book.toLowerCase().includes(searchQuery.toLowerCase()));
  const displayBooks = filteredBooks.filter(b => !savedOnly || favorites.includes(b));
  const BrowseTab = () => /*#__PURE__*/React.createElement("div", {
    className: "space-y-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "section-title"
  }, "Available Books to Borrow"), loading ? /*#__PURE__*/React.createElement("div", {
    className: "book-list",
    "aria-hidden": "true"
  }, Array.from({
    length: 6
  }).map((_, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "book-item"
  }, /*#__PURE__*/React.createElement("div", {
    className: "book-item-content"
  }, /*#__PURE__*/React.createElement("div", {
    className: "skeleton-avatar"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      width: '200px'
    },
    className: "skeleton skeleton-line"
  })), /*#__PURE__*/React.createElement("div", {
    className: "skeleton skeleton-btn"
  })))) : filteredBooks.length === 0 ? /*#__PURE__*/React.createElement("p", {
    className: "empty-state"
  }, "No books found matching your search.") : /*#__PURE__*/React.createElement("div", {
    className: "book-list",
    role: "list",
    "aria-label": "Available books"
  }, displayBooks.map((book, index) => /*#__PURE__*/React.createElement("div", {
    key: index,
    className: "book-item",
    role: "listitem"
  }, /*#__PURE__*/React.createElement("div", {
    className: "book-item-content"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "book-open",
    size: 20,
    className: "book-icon"
  }), /*#__PURE__*/React.createElement("span", {
    className: "book-title"
  }, book)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      const wasSaved = favorites.includes(book);
      toggleFavorite(book);
      showToast(wasSaved ? 'Removed from saved' : 'Saved to favorites', 'info');
    },
    className: "btn btn-sm",
    "aria-pressed": favorites.includes(book),
    "aria-label": `${favorites.includes(book) ? 'Remove from' : 'Add to'} favorites: ${book}`,
    title: favorites.includes(book) ? 'Saved' : 'Save',
    style: {
      background: 'var(--card)',
      border: '1px solid var(--border)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: 'heart',
    size: 16,
    style: {
      color: favorites.includes(book) ? 'crimson' : 'var(--muted)'
    }
  })), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      requestBook(book);
      saveSearch(searchQuery);
    },
    className: "btn btn-primary btn-sm",
    "aria-label": `Request to borrow ${book}`
  }, "Request")))))));
  const HomeTab = () => /*#__PURE__*/React.createElement("div", {
    className: "space-y-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "page-title"
  }, "Welcome back, ", userName, "!"), /*#__PURE__*/React.createElement("p", {
    className: "about-text"
  }, "Upcoming: Calculus midterm in 2 weeks"), /*#__PURE__*/React.createElement("div", {
    className: "progress",
    style: {
      marginTop: '0.75rem'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "progress-bar",
    style: {
      width: '65%'
    }
  })), /*#__PURE__*/React.createElement("p", {
    className: "about-text",
    style: {
      marginTop: '0.5rem'
    }
  }, "Semester progress: 65%")), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "section-title"
  }, "Recommended for you"), /*#__PURE__*/React.createElement("div", {
    className: "book-list"
  }, /*#__PURE__*/React.createElement("div", {
    className: "book-item"
  }, /*#__PURE__*/React.createElement("span", null, "Calculator"), /*#__PURE__*/React.createElement("span", {
    className: "badge"
  }, "from Maria (Aced Calculus)")), /*#__PURE__*/React.createElement("div", {
    className: "book-item"
  }, /*#__PURE__*/React.createElement("span", null, "Lab Coat"), /*#__PURE__*/React.createElement("span", {
    className: "badge"
  }, "in your Biology class network")), /*#__PURE__*/React.createElement("div", {
    className: "book-item"
  }, /*#__PURE__*/React.createElement("span", null, "Textbook"), /*#__PURE__*/React.createElement("span", {
    className: "badge"
  }, "same edition your professor requires")))), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "section-title"
  }, "Quick Actions"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.5rem'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary"
  }, "Borrow for Exam"), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    style: {
      border: '1px solid var(--border)'
    }
  }, "Share to Classmates"), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    style: {
      border: '1px solid var(--border)'
    }
  }, "Department Requests"))));
  const CoursesTab = () => /*#__PURE__*/React.createElement("div", {
    className: "space-y-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "page-title"
  }, "Course-Centric Browsing"), /*#__PURE__*/React.createElement("label", {
    className: "form-label",
    htmlFor: "course-select"
  }, "Select Course"), /*#__PURE__*/React.createElement("select", {
    id: "course-select",
    className: "form-input",
    value: selectedCourse,
    onChange: e => setSelectedCourse(e.target.value)
  }, courses.map(c => /*#__PURE__*/React.createElement("option", {
    key: c
  }, c))), /*#__PURE__*/React.createElement("div", {
    className: "space-y-4",
    style: {
      marginTop: '1rem'
    }
  }, /*#__PURE__*/React.createElement("h3", {
    className: "section-title"
  }, "What ", selectedCourse, " students are sharing"), /*#__PURE__*/React.createElement(BrowseTab, null))));
  const ProfileTab = () => /*#__PURE__*/React.createElement("div", {
    className: "space-y-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "profile-header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "profile-avatar"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "user",
    size: 40
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    className: "profile-name"
  }, "Your Profile"), /*#__PURE__*/React.createElement("p", {
    className: "profile-subtitle"
  }, "Student Dashboard"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '0.5rem',
      flexWrap: 'wrap',
      marginBottom: '1rem'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "badge",
    style: {
      background: 'var(--info-bg)'
    }
  }, "Verified .edu"), /*#__PURE__*/React.createElement("span", {
    className: "badge",
    style: {
      background: 'var(--success-bg)',
      color: 'var(--success-text)'
    }
  }, "Aced Calculus"), /*#__PURE__*/React.createElement("span", {
    className: "badge",
    style: {
      background: 'var(--card)',
      border: '1px solid var(--border)'
    }
  }, "Dorm B")), /*#__PURE__*/React.createElement("div", {
    className: "stats-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat-card stat-blue"
  }, /*#__PURE__*/React.createElement("p", {
    className: "stat-number"
  }, myListedBooks.length), /*#__PURE__*/React.createElement("p", {
    className: "stat-label"
  }, "Books Listed")), /*#__PURE__*/React.createElement("div", {
    className: "stat-card stat-green"
  }, /*#__PURE__*/React.createElement("p", {
    className: "stat-number"
  }, availableBooks.length), /*#__PURE__*/React.createElement("p", {
    className: "stat-label"
  }, "Available Books")))), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "section-title"
  }, "About CampusConnect"), /*#__PURE__*/React.createElement("p", {
    className: "about-text"
  }, "CampusConnect is a platform where university students can share textbooks and academic resources. Browse available books, request to borrow them, or list your own books to help fellow students.")), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "section-title"
  }, "Settings"), /*#__PURE__*/React.createElement("div", {
    className: "settings-list"
  }, /*#__PURE__*/React.createElement("button", {
    className: "settings-item",
    onClick: () => setNotificationsOpen(true)
  }, "Notification Preferences"), /*#__PURE__*/React.createElement("button", {
    className: "settings-item",
    onClick: () => setPrivacyOpen(true)
  }, "Privacy Settings"), /*#__PURE__*/React.createElement("button", {
    className: "settings-item settings-logout",
    onClick: () => {
      if (window.confirm('Are you sure you want to logout?')) {
        showToast('Logged out successfully', 'info');
        // In a real app, you would clear auth tokens and redirect
      }
    }
  }, "Logout"))), notificationsOpen && /*#__PURE__*/React.createElement("div", {
    className: "modal-backdrop",
    onClick: () => setNotificationsOpen(false)
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-title"
  }, "Notification Preferences"), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    style: {
      border: '1px solid var(--border)',
      background: 'transparent'
    },
    onClick: () => setNotificationsOpen(false),
    "aria-label": "Close"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "x",
    size: 16
  }))), /*#__PURE__*/React.createElement("div", {
    className: "space-y-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "form-label",
    style: {
      marginBottom: 0
    }
  }, "Email Notifications"), /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: notificationSettings.emailNotifications,
    onChange: e => setNotificationSettings(prev => ({
      ...prev,
      emailNotifications: e.target.checked
    })),
    style: {
      width: '20px',
      height: '20px',
      cursor: 'pointer'
    }
  })), /*#__PURE__*/React.createElement("p", {
    className: "about-text",
    style: {
      fontSize: '0.75rem',
      marginTop: '0.25rem'
    }
  }, "Receive notifications via email")), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "form-label",
    style: {
      marginBottom: 0
    }
  }, "Push Notifications"), /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: notificationSettings.pushNotifications,
    onChange: e => setNotificationSettings(prev => ({
      ...prev,
      pushNotifications: e.target.checked
    })),
    style: {
      width: '20px',
      height: '20px',
      cursor: 'pointer'
    }
  })), /*#__PURE__*/React.createElement("p", {
    className: "about-text",
    style: {
      fontSize: '0.75rem',
      marginTop: '0.25rem'
    }
  }, "Receive browser push notifications")), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "form-label",
    style: {
      marginBottom: 0
    }
  }, "Book Requests"), /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: notificationSettings.bookRequests,
    onChange: e => setNotificationSettings(prev => ({
      ...prev,
      bookRequests: e.target.checked
    })),
    style: {
      width: '20px',
      height: '20px',
      cursor: 'pointer'
    }
  })), /*#__PURE__*/React.createElement("p", {
    className: "about-text",
    style: {
      fontSize: '0.75rem',
      marginTop: '0.25rem'
    }
  }, "Get notified when someone requests your book")), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "form-label",
    style: {
      marginBottom: 0
    }
  }, "New Books Available"), /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: notificationSettings.newBooks,
    onChange: e => setNotificationSettings(prev => ({
      ...prev,
      newBooks: e.target.checked
    })),
    style: {
      width: '20px',
      height: '20px',
      cursor: 'pointer'
    }
  })), /*#__PURE__*/React.createElement("p", {
    className: "about-text",
    style: {
      fontSize: '0.75rem',
      marginTop: '0.25rem'
    }
  }, "Notify me when new books matching my interests are listed")), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "form-label",
    style: {
      marginBottom: 0
    }
  }, "Messages"), /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: notificationSettings.messages,
    onChange: e => setNotificationSettings(prev => ({
      ...prev,
      messages: e.target.checked
    })),
    style: {
      width: '20px',
      height: '20px',
      cursor: 'pointer'
    }
  })), /*#__PURE__*/React.createElement("p", {
    className: "about-text",
    style: {
      fontSize: '0.75rem',
      marginTop: '0.25rem'
    }
  }, "Get notified when you receive messages")), /*#__PURE__*/React.createElement("div", {
    className: "modal-actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary",
    onClick: () => {
      setNotificationsOpen(false);
      showToast('Notification preferences saved', 'success');
    }
  }, "Save Changes"))))), privacyOpen && /*#__PURE__*/React.createElement("div", {
    className: "modal-backdrop",
    onClick: () => setPrivacyOpen(false)
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-title"
  }, "Privacy Settings"), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    style: {
      border: '1px solid var(--border)',
      background: 'transparent'
    },
    onClick: () => setPrivacyOpen(false),
    "aria-label": "Close"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "x",
    size: 16
  }))), /*#__PURE__*/React.createElement("div", {
    className: "space-y-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "form-label",
    style: {
      marginBottom: 0
    }
  }, "Profile Visible"), /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: privacySettings.profileVisible,
    onChange: e => setPrivacySettings(prev => ({
      ...prev,
      profileVisible: e.target.checked
    })),
    style: {
      width: '20px',
      height: '20px',
      cursor: 'pointer'
    }
  })), /*#__PURE__*/React.createElement("p", {
    className: "about-text",
    style: {
      fontSize: '0.75rem',
      marginTop: '0.25rem'
    }
  }, "Allow others to view your profile")), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "form-label",
    style: {
      marginBottom: 0
    }
  }, "Show Email Address"), /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: privacySettings.showEmail,
    onChange: e => setPrivacySettings(prev => ({
      ...prev,
      showEmail: e.target.checked
    })),
    style: {
      width: '20px',
      height: '20px',
      cursor: 'pointer'
    }
  })), /*#__PURE__*/React.createElement("p", {
    className: "about-text",
    style: {
      fontSize: '0.75rem',
      marginTop: '0.25rem'
    }
  }, "Display your email address on your listings")), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "form-label",
    style: {
      marginBottom: 0
    }
  }, "Show Phone Number"), /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: privacySettings.showPhone,
    onChange: e => setPrivacySettings(prev => ({
      ...prev,
      showPhone: e.target.checked
    })),
    style: {
      width: '20px',
      height: '20px',
      cursor: 'pointer'
    }
  })), /*#__PURE__*/React.createElement("p", {
    className: "about-text",
    style: {
      fontSize: '0.75rem',
      marginTop: '0.25rem'
    }
  }, "Display your phone number on your listings")), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "form-label",
    style: {
      marginBottom: 0
    }
  }, "Show Department"), /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: privacySettings.showDepartment,
    onChange: e => setPrivacySettings(prev => ({
      ...prev,
      showDepartment: e.target.checked
    })),
    style: {
      width: '20px',
      height: '20px',
      cursor: 'pointer'
    }
  })), /*#__PURE__*/React.createElement("p", {
    className: "about-text",
    style: {
      fontSize: '0.75rem',
      marginTop: '0.25rem'
    }
  }, "Display your department on your profile")), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "form-label",
    style: {
      marginBottom: 0
    }
  }, "Allow Messages"), /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: privacySettings.allowMessages,
    onChange: e => setPrivacySettings(prev => ({
      ...prev,
      allowMessages: e.target.checked
    })),
    style: {
      width: '20px',
      height: '20px',
      cursor: 'pointer'
    }
  })), /*#__PURE__*/React.createElement("p", {
    className: "about-text",
    style: {
      fontSize: '0.75rem',
      marginTop: '0.25rem'
    }
  }, "Allow other users to send you messages")), /*#__PURE__*/React.createElement("div", {
    className: "modal-actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary",
    onClick: () => {
      setPrivacyOpen(false);
      showToast('Privacy settings saved', 'success');
    }
  }, "Save Changes"))))));
  const LendBookPage = () => {
    return React.createElement('div', {
      className: 'space-y-4'
    }, React.createElement('div', {
      className: 'card'
    }, React.createElement('h2', {
      className: 'page-title'
    }, React.createElement(Icon, {
      name: 'plus',
      size: 24,
      className: 'title-icon'
    }), ' Lend a Book'), React.createElement('p', {
      style: {
        marginBottom: '20px',
        color: '#666'
      }
    }, 'List your book for other students to borrow'), React.createElement('form', {
      id: 'lendBookForm',
      onSubmit: e => {
        e.preventDefault();
        const form = e.target;
        const newListing = {
          id: Date.now(),
          title: form.elements['bookTitle'].value,
          author: form.elements['author'].value || 'Unknown',
          condition: form.elements['condition'].value,
          description: form.elements['description'].value,
          deposit_amount: parseFloat(form.elements['deposit'].value) || 0,
          lending_duration_days: parseInt(form.elements['duration'].value) || 7,
          lenderName: userName,
          lenderEmail: profile.email || `${userName.toLowerCase()}@university.edu`,
          lenderDepartment: profile.department || 'Not specified',
          status: 'pending',
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
        showToast('Book listed successfully! Admin can now see it.', 'success');
        form.reset();
      }
    }, React.createElement('div', {
      className: 'form-grid'
    }, React.createElement('div', {
      className: 'form-group'
    }, React.createElement('label', {
      className: 'form-label',
      htmlFor: 'bookTitle'
    }, 'Book Title ', React.createElement('span', {
      className: 'required'
    }, '*')), React.createElement('input', {
      type: 'text',
      className: 'form-input',
      id: 'bookTitle',
      name: 'bookTitle',
      placeholder: 'Enter book title',
      required: true
    })), React.createElement('div', {
      className: 'form-group'
    }, React.createElement('label', {
      className: 'form-label',
      htmlFor: 'author'
    }, 'Author'), React.createElement('input', {
      type: 'text',
      className: 'form-input',
      id: 'author',
      name: 'author',
      placeholder: 'Enter author name'
    }))), React.createElement('div', {
      className: 'form-group'
    }, React.createElement('label', {
      className: 'form-label',
      htmlFor: 'condition'
    }, 'Condition'), React.createElement('select', {
      className: 'form-input',
      id: 'condition',
      name: 'condition'
    }, React.createElement('option', {
      value: 'Excellent'
    }, 'Excellent - Like New'), React.createElement('option', {
      value: 'Good'
    }, 'Good - Minor Wear'), React.createElement('option', {
      value: 'Fair'
    }, 'Fair - Visible Wear'), React.createElement('option', {
      value: 'Poor'
    }, 'Poor - Heavy Wear'))), React.createElement('div', {
      className: 'form-group'
    }, React.createElement('label', {
      className: 'form-label',
      htmlFor: 'description'
    }, 'Description'), React.createElement('textarea', {
      className: 'form-input',
      id: 'description',
      name: 'description',
      rows: 4,
      placeholder: 'Describe your book, any highlights, notes, etc.'
    })), React.createElement('div', {
      className: 'form-grid'
    }, React.createElement('div', {
      className: 'form-group'
    }, React.createElement('label', {
      className: 'form-label',
      htmlFor: 'deposit'
    }, 'Deposit Amount ($)'), React.createElement('input', {
      type: 'number',
      className: 'form-input',
      id: 'deposit',
      name: 'deposit',
      min: '0',
      step: '0.01',
      defaultValue: '0',
      placeholder: '0.00'
    })), React.createElement('div', {
      className: 'form-group'
    }, React.createElement('label', {
      className: 'form-label',
      htmlFor: 'duration'
    }, 'Lending Duration (days)'), React.createElement('input', {
      type: 'number',
      className: 'form-input',
      id: 'duration',
      name: 'duration',
      min: '1',
      defaultValue: '7',
      placeholder: '7'
    }))), React.createElement('button', {
      type: 'submit',
      className: 'btn btn-primary',
      style: {
        width: '100%',
        marginTop: '20px'
      }
    }, '📚 List Book for Lending'))));
  };
  const AdminDashboard = () => {
    const [stats, setStats] = React.useState({
      transactions: {},
      items: {},
      users: {}
    });
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
        const combined = [...allRequests.map(r => ({
          ...r,
          type: 'request'
        })), ...allListings.map(l => ({
          ...l,
          type: 'listing'
        }))];
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
          users: {
            total: 1,
            active: 1,
            verified: 1
          }
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
    const filteredItems = statusFilter === 'all' ? allItems : allItems.filter(item => item.status === statusFilter);
    return React.createElement('div', {
      className: 'space-y-4'
    }, React.createElement('div', {
      className: 'card'
    }, React.createElement('h2', {
      className: 'page-title'
    }, React.createElement(Icon, {
      name: 'shield',
      size: 24,
      className: 'title-icon'
    }), ' Admin Dashboard'),
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
    }, React.createElement('div', {
      style: {
        fontSize: '14px',
        opacity: 0.9
      }
    }, 'Total Transactions'), React.createElement('div', {
      style: {
        fontSize: '32px',
        fontWeight: 'bold',
        marginTop: '8px'
      }
    }, stats.transactions.total || 0), React.createElement('div', {
      style: {
        marginTop: '12px',
        fontSize: '12px'
      }
    }, `Pending: ${stats.transactions.pending || 0} | Active: ${stats.transactions.active || 0}`)),
    // Items Stats
    React.createElement('div', {
      style: {
        padding: '20px',
        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        borderRadius: '8px',
        color: 'white'
      }
    }, React.createElement('div', {
      style: {
        fontSize: '14px',
        opacity: 0.9
      }
    }, 'Total Books'), React.createElement('div', {
      style: {
        fontSize: '32px',
        fontWeight: 'bold',
        marginTop: '8px'
      }
    }, stats.items.total || 0), React.createElement('div', {
      style: {
        marginTop: '12px',
        fontSize: '12px'
      }
    }, `Available: ${stats.items.available || 0} | Borrowed: ${stats.items.borrowed || 0}`)),
    // Users Stats
    React.createElement('div', {
      style: {
        padding: '20px',
        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        borderRadius: '8px',
        color: 'white'
      }
    }, React.createElement('div', {
      style: {
        fontSize: '14px',
        opacity: 0.9
      }
    }, 'Total Users'), React.createElement('div', {
      style: {
        fontSize: '32px',
        fontWeight: 'bold',
        marginTop: '8px'
      }
    }, stats.users.total || 0), React.createElement('div', {
      style: {
        marginTop: '12px',
        fontSize: '12px'
      }
    }, `Active: ${stats.users.active || 0} | Verified: ${stats.users.verified || 0}`))),
    // Filter Buttons
    React.createElement('div', {
      style: {
        marginTop: '30px'
      }
    }, React.createElement('div', {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '15px',
        flexWrap: 'wrap',
        gap: '10px'
      }
    }, React.createElement('h3', {
      style: {
        fontSize: '18px',
        fontWeight: '600',
        margin: 0
      }
    }, `📚 All Activities (${filteredItems.length})`), React.createElement('div', {
      style: {
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap'
      }
    }, React.createElement('button', {
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
    }, 'All'), React.createElement('button', {
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
    }, `Pending (${stats.transactions.pending || 0})`), React.createElement('button', {
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
    }, `Approved (${stats.transactions.approved || 0})`), React.createElement('button', {
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
    }, `Cancelled (${stats.transactions.cancelled || 0})`)))),
    // Activities Table
    React.createElement('div', {
      style: {
        marginTop: '15px'
      }
    }, filteredItems.length === 0 ? React.createElement('div', {
      style: {
        padding: '40px',
        textAlign: 'center',
        color: '#999',
        background: '#f8f9fa',
        borderRadius: '8px'
      }
    }, React.createElement('p', {
      style: {
        fontSize: '16px',
        marginBottom: '8px'
      }
    }, '📭 No book requests yet'), React.createElement('p', {
      style: {
        fontSize: '14px'
      }
    }, 'When users request books, they will appear here.')) : React.createElement('div', {
      style: {
        overflowX: 'auto'
      }
    }, React.createElement('table', {
      style: {
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '14px'
      }
    }, React.createElement('thead', {}, React.createElement('tr', {
      style: {
        borderBottom: '2px solid #e0e0e0'
      }
    }, React.createElement('th', {
      style: {
        padding: '12px',
        textAlign: 'left'
      }
    }, 'Type'), React.createElement('th', {
      style: {
        padding: '12px',
        textAlign: 'left'
      }
    }, 'Book Title'), React.createElement('th', {
      style: {
        padding: '12px',
        textAlign: 'left'
      }
    }, 'User'), React.createElement('th', {
      style: {
        padding: '12px',
        textAlign: 'left'
      }
    }, 'Email'), React.createElement('th', {
      style: {
        padding: '12px',
        textAlign: 'left'
      }
    }, 'Status'), React.createElement('th', {
      style: {
        padding: '12px',
        textAlign: 'left'
      }
    }, 'Date'), React.createElement('th', {
      style: {
        padding: '12px',
        textAlign: 'left'
      }
    }, 'Actions'))), React.createElement('tbody', {}, filteredItems.map(item => React.createElement('tr', {
      key: item.id,
      style: {
        borderBottom: '1px solid #f0f0f0'
      }
    }, React.createElement('td', {
      style: {
        padding: '12px'
      }
    }, React.createElement('span', {
      style: {
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '11px',
        fontWeight: '600',
        background: item.type === 'request' ? '#e3f2fd' : '#fff3e0',
        color: item.type === 'request' ? '#1976d2' : '#f57c00'
      }
    }, item.type === 'request' ? 'REQUEST' : 'LEND')), React.createElement('td', {
      style: {
        padding: '12px',
        fontWeight: '500'
      }
    }, item.bookTitle || item.title), React.createElement('td', {
      style: {
        padding: '12px'
      }
    }, item.borrowerName || item.lenderName), React.createElement('td', {
      style: {
        padding: '12px',
        fontSize: '12px',
        color: '#666'
      }
    }, item.borrowerEmail || item.lenderEmail || 'N/A'), React.createElement('td', {
      style: {
        padding: '12px'
      }
    }, React.createElement('span', {
      style: {
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '600',
        background: item.status === 'pending' ? '#fff3cd' : item.status === 'approved' ? '#d4edda' : item.status === 'cancelled' ? '#f8d7da' : item.status === 'active' ? '#d1ecf1' : '#e2e3e5',
        color: item.status === 'pending' ? '#856404' : item.status === 'approved' ? '#155724' : item.status === 'cancelled' ? '#721c24' : item.status === 'active' ? '#0c5460' : '#383d41'
      }
    }, item.status.charAt(0).toUpperCase() + item.status.slice(1))), React.createElement('td', {
      style: {
        padding: '12px',
        fontSize: '13px'
      }
    }, item.date), React.createElement('td', {
      style: {
        padding: '12px'
      }
    }, React.createElement('div', {
      style: {
        display: 'flex',
        gap: '8px'
      }
    }, item.status === 'pending' && React.createElement('button', {
      onClick: () => {
        // Update status to approved
        try {
          if (item.type === 'request') {
            const savedRequests = localStorage.getItem('bookRequests');
            const allRequests = savedRequests ? JSON.parse(savedRequests) : [];
            const updated = allRequests.map(r => r.id === item.id ? {
              ...r,
              status: 'approved'
            } : r);
            localStorage.setItem('bookRequests', JSON.stringify(updated));
          } else {
            const savedListings = localStorage.getItem('bookListings');
            const allListings = savedListings ? JSON.parse(savedListings) : [];
            const updated = allListings.map(l => l.id === item.id ? {
              ...l,
              status: 'approved'
            } : l);
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
    }, '✓ Approve'), item.status === 'pending' && React.createElement('button', {
      onClick: () => {
        // Update status to cancelled
        try {
          if (item.type === 'request') {
            const savedRequests = localStorage.getItem('bookRequests');
            const allRequests = savedRequests ? JSON.parse(savedRequests) : [];
            const updated = allRequests.map(r => r.id === item.id ? {
              ...r,
              status: 'cancelled'
            } : r);
            localStorage.setItem('bookRequests', JSON.stringify(updated));
          } else {
            const savedListings = localStorage.getItem('bookListings');
            const allListings = savedListings ? JSON.parse(savedListings) : [];
            const updated = allListings.map(l => l.id === item.id ? {
              ...l,
              status: 'cancelled'
            } : l);
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
    }, '✗ Cancel'))))))))),
    // Info Box
    React.createElement('div', {
      style: {
        marginTop: '20px',
        padding: '15px',
        background: '#f8f9fa',
        borderRadius: '6px',
        borderLeft: '4px solid #667eea'
      }
    }, React.createElement('p', {
      style: {
        fontSize: '14px',
        color: '#666'
      }
    }, '💡 This dashboard shows real-time statistics. Click on any book title to see all users who requested that specific book.'))));
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "app-container"
  }, /*#__PURE__*/React.createElement("header", {
    className: `header ${isCompact ? 'header-compact' : ''}`
  }, /*#__PURE__*/React.createElement("div", {
    className: "header-content"
  }, /*#__PURE__*/React.createElement("div", {
    className: "header-logo"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "book",
    size: 32
  }), /*#__PURE__*/React.createElement("h1", {
    className: "app-title"
  }, "CampusConnect")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "theme-toggle",
    onClick: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
    "aria-label": `Activate ${theme === 'dark' ? 'light' : 'dark'} theme`,
    title: theme === 'dark' ? 'Switch to light' : 'Switch to dark'
  }, /*#__PURE__*/React.createElement(Icon, {
    name: theme === 'dark' ? 'sun' : 'moon',
    size: 18
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '0.875rem'
    }
  }, theme === 'dark' ? 'Light' : 'Dark')), /*#__PURE__*/React.createElement("button", {
    className: "notification-icon",
    onClick: () => {
      showToast(`You have ${notifications} notification${notifications !== 1 ? 's' : ''}`, 'info');
    },
    "aria-label": `Notifications (${notifications} unread)`,
    style: {
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      padding: 0,
      display: 'flex',
      alignItems: 'center',
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "bell",
    size: 24
  }), notifications > 0 && /*#__PURE__*/React.createElement("span", {
    className: "notification-badge"
  }, notifications))))), /*#__PURE__*/React.createElement("main", {
    className: "main-content"
  }, currentTab === 'home' && /*#__PURE__*/React.createElement(HomeTab, null), currentTab === 'browse' && /*#__PURE__*/React.createElement("div", {
    className: "space-y-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card sticky-search"
  }, /*#__PURE__*/React.createElement("div", {
    className: "search-container"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "search",
    size: 20,
    className: "search-icon"
  }), /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: "Search for books...",
    className: "search-input",
    value: searchQuery,
    onChange: e => setSearchQuery(e.target.value),
    "aria-label": "Search for books"
  }), recentSearches.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '0.5rem',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.5rem'
    }
  }, recentSearches.map((term, i) => /*#__PURE__*/React.createElement("button", {
    key: i,
    className: "btn btn-sm",
    style: {
      background: 'var(--card)',
      border: '1px solid var(--border)'
    },
    onClick: () => setSearchQuery(term),
    "aria-label": `Use recent search ${term}`
  }, term)), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-sm",
    style: {
      background: 'transparent',
      border: '1px solid var(--border)',
      color: 'var(--muted)'
    },
    onClick: () => {
      setRecentSearches([]);
      try {
        localStorage.removeItem('recentSearches');
      } catch {}
    },
    "aria-label": "Clear recent searches"
  }, "Clear")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '0.5rem',
      display: 'flex',
      gap: '0.5rem'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-sm",
    style: {
      background: savedOnly ? 'var(--primary)' : 'var(--card)',
      color: savedOnly ? '#fff' : 'inherit',
      border: '1px solid var(--border)'
    },
    onClick: () => setSavedOnly(!savedOnly),
    "aria-pressed": savedOnly
  }, savedOnly ? 'Showing Saved' : 'Show Saved'), savedOnly && /*#__PURE__*/React.createElement("button", {
    className: "btn btn-sm",
    style: {
      background: 'transparent',
      border: '1px solid var(--border)'
    },
    onClick: () => setSavedOnly(false)
  }, "Show All")))), /*#__PURE__*/React.createElement(BrowseTab, null)), currentTab === 'courses' && /*#__PURE__*/React.createElement(CoursesTab, null), currentTab === 'lend' && React.createElement(LendBookPage), currentTab === 'profile' && /*#__PURE__*/React.createElement(ProfileTab, null), currentTab === 'admin' && React.createElement(AdminDashboard)), /*#__PURE__*/React.createElement("nav", {
    className: "bottom-nav",
    "aria-label": "Primary"
  }, /*#__PURE__*/React.createElement("div", {
    className: "nav-content"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setCurrentTab('home'),
    className: `nav-item ${currentTab === 'home' ? 'nav-item-active' : ''}`,
    "aria-current": currentTab === 'home' ? 'page' : undefined
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "house",
    size: 24
  }), /*#__PURE__*/React.createElement("span", {
    className: "nav-label"
  }, "Home")), /*#__PURE__*/React.createElement("button", {
    onClick: () => setCurrentTab('browse'),
    className: `nav-item ${currentTab === 'browse' ? 'nav-item-active' : ''}`,
    "aria-current": currentTab === 'browse' ? 'page' : undefined
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "search",
    size: 24
  }), /*#__PURE__*/React.createElement("span", {
    className: "nav-label"
  }, "Browse")), /*#__PURE__*/React.createElement("button", {
    onClick: () => setCurrentTab('courses'),
    className: `nav-item ${currentTab === 'courses' ? 'nav-item-active' : ''}`,
    "aria-current": currentTab === 'courses' ? 'page' : undefined
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "book-open",
    size: 24
  }), /*#__PURE__*/React.createElement("span", {
    className: "nav-label"
  }, "Courses")), /*#__PURE__*/React.createElement("button", {
    onClick: () => setCurrentTab('lend'),
    className: `nav-item ${currentTab === 'lend' ? 'nav-item-active' : ''}`,
    "aria-current": currentTab === 'lend' ? 'page' : undefined
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus",
    size: 24
  }), /*#__PURE__*/React.createElement("span", {
    className: "nav-label"
  }, "Lend Book")), /*#__PURE__*/React.createElement("button", {
    onClick: () => setCurrentTab('profile'),
    className: `nav-item ${currentTab === 'profile' ? 'nav-item-active' : ''}`,
    "aria-current": currentTab === 'profile' ? 'page' : undefined
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "user",
    size: 24
  }), /*#__PURE__*/React.createElement("span", {
    className: "nav-label"
  }, "Profile")), /*#__PURE__*/React.createElement("button", {
    onClick: () => setCurrentTab('admin'),
    className: `nav-item ${currentTab === 'admin' ? 'nav-item-active' : ''}`,
    "aria-current": currentTab === 'admin' ? 'page' : undefined
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "shield",
    size: 24
  }), /*#__PURE__*/React.createElement("span", {
    className: "nav-label"
  }, "Admin")))), /*#__PURE__*/React.createElement("div", {
    className: "toast-container",
    role: "status",
    "aria-live": "polite",
    "aria-atomic": "true"
  }, toasts.map(t => /*#__PURE__*/React.createElement("div", {
    key: t.id,
    className: `toast toast-${t.type}`
  }, t.message))), onboardingOpen && /*#__PURE__*/React.createElement("div", {
    className: "modal-backdrop",
    role: "dialog",
    "aria-modal": "true",
    "aria-label": "Get started"
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal"
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-title"
  }, "Let's personalize CampusConnect"), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    style: {
      border: '1px solid var(--border)',
      background: 'transparent'
    },
    onClick: () => setOnboardingOpen(false),
    "aria-label": "Close"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "x",
    size: 16
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '0.875rem',
      marginLeft: '0.25rem'
    }
  }, "Close"))), /*#__PURE__*/React.createElement("div", {
    className: "space-y-4"
  }, onboardStep === 0 && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "form-label",
    htmlFor: "ob-email"
  }, "University Email"), /*#__PURE__*/React.createElement("input", {
    id: "ob-email",
    type: "email",
    className: "form-input",
    placeholder: "you@university.edu",
    value: profile.email,
    onChange: e => setProfile({
      ...profile,
      email: e.target.value
    })
  })), onboardStep === 1 && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "form-label",
    htmlFor: "ob-dept"
  }, "Department/Major"), /*#__PURE__*/React.createElement("input", {
    id: "ob-dept",
    className: "form-input",
    placeholder: "e.g., Computer Science",
    value: profile.department,
    onChange: e => setProfile({
      ...profile,
      department: e.target.value
    })
  })), onboardStep === 2 && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "form-label",
    htmlFor: "ob-dorm"
  }, "Dorm/Location"), /*#__PURE__*/React.createElement("input", {
    id: "ob-dorm",
    className: "form-input",
    placeholder: "e.g., Dorm B, Room 204",
    value: profile.dorm,
    onChange: e => setProfile({
      ...profile,
      dorm: e.target.value
    })
  })), onboardStep === 3 && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "form-label",
    htmlFor: "ob-courses"
  }, "Select Your Courses"), /*#__PURE__*/React.createElement("div", {
    className: "space-y-4"
  }, courses.map(c => /*#__PURE__*/React.createElement("label", {
    key: c,
    className: "form-label",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: profile.courses.includes(c),
    onChange: e => {
      const exists = profile.courses.includes(c);
      const next = exists ? profile.courses.filter(x => x !== c) : [...profile.courses, c];
      setProfile({
        ...profile,
        courses: next
      });
    }
  }), " ", c)))), /*#__PURE__*/React.createElement("div", {
    className: "progress"
  }, /*#__PURE__*/React.createElement("div", {
    className: "progress-bar",
    style: {
      width: `${(onboardStep + 1) / 4 * 100}%`
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "modal-actions"
  }, onboardStep > 0 && /*#__PURE__*/React.createElement("button", {
    className: "btn",
    style: {
      border: '1px solid var(--border)'
    },
    onClick: () => setOnboardStep(onboardStep - 1)
  }, "Back"), onboardStep < 3 && /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary",
    onClick: () => setOnboardStep(onboardStep + 1)
  }, "Next"), onboardStep === 3 && /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary",
    onClick: () => {
      try {
        localStorage.setItem('profile', JSON.stringify(profile));
        localStorage.setItem('onboardingDone', '1');
      } catch {}
      setUserName(profile.email.split('@')[0] || 'Student');
      setOnboardingOpen(false);
      showToast('Onboarding complete', 'success');
    }
  }, "Finish"))))));
};

// Render the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(/*#__PURE__*/React.createElement(CampusConnect, null));