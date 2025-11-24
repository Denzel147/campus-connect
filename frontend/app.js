// Main SPA Application with JavaScript Routing
const { useState, useEffect, useCallback, useMemo } = React;

// Toast Notification System
const ToastContext = React.createContext();

const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random();
    const toast = { id, message, type, duration };
    
    setToasts(prev => [...prev, toast]);
    
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    
    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const showSuccess = (message, duration) => showToast(message, 'success', duration);
  const showError = (message, duration) => showToast(message, 'error', duration);
  const showWarning = (message, duration) => showToast(message, 'warning', duration);
  const showInfo = (message, duration) => showToast(message, 'info', duration);

  return (
    <ToastContext.Provider value={{ 
      showToast, 
      removeToast, 
      showSuccess, 
      showError, 
      showWarning, 
      showInfo 
    }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer = ({ toasts, removeToast }) => (
  <div className="toast-container">
    {toasts.map(toast => (
      <Toast 
        key={toast.id} 
        toast={toast} 
        onClose={() => removeToast(toast.id)} 
      />
    ))}
  </div>
);

const Toast = ({ toast, onClose }) => {
  const getIcon = () => {
    switch (toast.type) {
      case 'success': return 'check-circle';
      case 'error': return 'x-circle';
      case 'warning': return 'alert-triangle';
      default: return 'info';
    }
  };

  return (
    <div className={`toast toast-${toast.type}`}>
      <div className="toast-content">
        <Icon name={getIcon()} size={20} />
        <span className="toast-message">{toast.message}</span>
        <button className="toast-close" onClick={onClose} aria-label="Close notification">
          <Icon name="x" size={16} />
        </button>
      </div>
    </div>
  );
};

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error);
    console.error('Error info:', errorInfo);
    console.error('Stack trace:', error.stack);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-content">
            <Icon name="alert-triangle" size={48} />
            <h2>Something went wrong</h2>
            <p>We're sorry, but an unexpected error occurred.</p>
            {typeof process !== 'undefined' && process.env?.NODE_ENV === 'development' && this.state.error && (
              <details style={{ marginTop: '20px', textAlign: 'left' }}>
                <summary>Error Details (Development Mode)</summary>
                <pre style={{ fontSize: '12px', overflow: 'auto', maxHeight: '200px' }}>
                  <strong>Error:</strong> {this.state.error.toString()}<br />
                  <strong>Stack:</strong> {this.state.error.stack}<br />
                  <strong>Component Stack:</strong> {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            <button 
              className="btn btn-primary" 
              onClick={() => {
                this.setState({ hasError: false, error: null, errorInfo: null });
                globalThis.location.reload();
              }}
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Simple Router Hook
const useRouter = () => {
  const [route, setRoute] = useState(globalThis.location.pathname || '/');

  useEffect(() => {
    const handlePopState = () => {
      setRoute(globalThis.location.pathname);
    };

    globalThis.addEventListener('popstate', handlePopState);
    return () => globalThis.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path) => {
    globalThis.history.pushState({}, '', path);
    setRoute(path);
  };

  return { route, navigate };
};

// Icon component with improved fallbacks
// Simple Icon component using Font Awesome with correct icon styles
const Icon = ({ name, size = 24, className = '', ...props }) => {
  // Font Awesome icon mapping - using correct styles for each icon
  const iconMap = {
    // Navigation & UI - Most use solid (fas) as regular doesn't have them
    'search': 'fas fa-search',
    'menu': 'fas fa-bars',
    'x': 'fas fa-times',
    'plus': 'fas fa-plus',
    'minus': 'fas fa-minus',
    'home': 'fas fa-home',
    'settings': 'fas fa-cog',
    'filter': 'fas fa-filter',
    'refresh-ccw': 'fas fa-sync-alt',
    'edit': 'far fa-edit', // Available in regular
    'trash': 'far fa-trash-alt', // Available in regular
    'eye': 'far fa-eye', // Available in regular
    'eye-off': 'far fa-eye-slash', // Available in regular
    'download': 'fas fa-download',
    'upload': 'fas fa-upload',
    'check': 'fas fa-check',
    'arrow-left': 'fas fa-arrow-left',
    'arrow-right': 'fas fa-arrow-right',
    'chevron-down': 'fas fa-chevron-down',
    'chevron-up': 'fas fa-chevron-up',
    'chevron-left': 'fas fa-chevron-left',
    'chevron-right': 'fas fa-chevron-right',
    'more-vertical': 'fas fa-ellipsis-v',
    'inbox': 'fas fa-inbox',
    
    // User & Social - Many available in regular
    'user': 'far fa-user',
    'users': 'fas fa-users',
    'user-plus': 'fas fa-user-plus',
    'log-out': 'fas fa-sign-out-alt',
    'log-in': 'fas fa-sign-in-alt',
    'heart': 'far fa-heart', // Available in regular
    'message-circle': 'far fa-comment', // Available in regular
    'mail': 'far fa-envelope', // Available in regular
    'phone': 'fas fa-phone',
    'bell': 'far fa-bell', // Available in regular
    
    // Education & Items
    'book-open': 'fas fa-book-open',
    'book': 'fas fa-book',
    'school': 'fas fa-graduation-cap',
    'shopping-bag': 'fas fa-shopping-bag',
    'package': 'fas fa-box',
    'calendar': 'far fa-calendar', // Available in regular
    'clock': 'far fa-clock', // Available in regular
    'map-pin': 'fas fa-map-marker-alt',
    
    // Status & Feedback - Some available in regular
    'star': 'far fa-star', // Available in regular
    'star-outline': 'far fa-star',
    'info': 'fas fa-info-circle',
    'alert-circle': 'fas fa-exclamation-circle',
    'help-circle': 'far fa-question-circle', // Available in regular
    'check-circle': 'far fa-check-circle', // Available in regular
    'x-circle': 'fas fa-times-circle',
    'alert-triangle': 'fas fa-exclamation-triangle',
    'shield': 'fas fa-shield-alt',
    'shield-check': 'fas fa-shield-alt',
    
    // Payment & Finance - Some available in regular
    'credit-card': 'far fa-credit-card', // Available in regular
    'dollar-sign': 'fas fa-dollar-sign',
    'coins': 'fas fa-coins',
    'wallet': 'fas fa-wallet',
    
    // Special
    'flame': 'fas fa-fire',
    'zap': 'fas fa-bolt',
    'loader': 'fas fa-spinner', // Keep solid for spinning animation
    'wifi': 'fas fa-wifi',
    'globe': 'fas fa-globe',
    'lock': 'fas fa-lock',
    'unlock': 'fas fa-unlock',
    'key': 'fas fa-key',
    
    // Media & Files - Some available in regular
    'image': 'far fa-image', // Available in regular
    'file': 'far fa-file', // Available in regular
    'folder': 'far fa-folder', // Available in regular
    'video': 'fas fa-video',
    'music': 'fas fa-music',
    'camera': 'fas fa-camera',
    
    // Actions
    'send': 'far fa-paper-plane', // Available in regular
    'share': 'fas fa-share',
    'copy': 'far fa-copy', // Available in regular
    'save': 'far fa-save', // Available in regular
    'print': 'fas fa-print',
    'link': 'fas fa-link',
    'external-link': 'fas fa-external-link-alt',
    
    // Admin specific
    'layout-dashboard': 'fas fa-th-large',
    'bar-chart-3': 'fas fa-chart-bar',
    'exchange': 'fas fa-exchange-alt'
  };

  const iconClass = iconMap[name] || 'fas fa-question';
  const combinedClassName = `${iconClass} ${className}`.trim();
  
  return (
    <i 
      className={combinedClassName}
      style={{ 
        fontSize: `${size}px`,
        width: `${size}px`,
        height: `${size}px`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      {...props}
    />
  );
};

// Landing Page Component
const LandingPage = ({ navigate }) => {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check if user is already logged in and redirect to app
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('currentUser');
    
    if (token && userData) {
      console.log('User already authenticated, redirecting to /app');
      navigate('/app');
    }
  }, [navigate]);

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false); // Close mobile menu after navigation
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="nav-container">
          <div className="nav-logo">
            <Icon name="book-open" size={28} />
            <span className="nav-logo-text">CampusConnect</span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="nav-links desktop-nav">
            <button className="nav-link" onClick={() => scrollToSection('features')}>
              Features
            </button>
            <button className="nav-link" onClick={() => scrollToSection('how-it-works')}>
              How It Works
            </button>
            <button className="nav-link" onClick={() => scrollToSection('community')}>
              Community
            </button>
            <button className="btn btn-primary" onClick={() => { setAuthMode('login'); setShowAuth(true); }}>
              Get Started
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
            <Icon name={mobileMenuOpen ? "x" : "menu"} size={24} />
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="mobile-nav-overlay" onClick={() => setMobileMenuOpen(false)}>
            <div className="mobile-nav-menu" onClick={(e) => e.stopPropagation()}>
              <button className="nav-link mobile-nav-link" onClick={() => scrollToSection('features')}>
                <Icon name="search" size={20} />
                Features
              </button>
              <button className="nav-link mobile-nav-link" onClick={() => scrollToSection('how-it-works')}>
                <Icon name="help-circle" size={20} />
                How It Works
              </button>
              <button className="nav-link mobile-nav-link" onClick={() => scrollToSection('community')}>
                <Icon name="users" size={20} />
                Community
              </button>
              <div className="mobile-nav-divider"></div>
              <button className="btn btn-primary btn-full" onClick={() => { setAuthMode('login'); setShowAuth(true); setMobileMenuOpen(false); }}>
                <Icon name="log-in" size={20} />
                Sign In
              </button>
              <button className="btn btn-outline btn-full" onClick={() => { setAuthMode('signup'); setShowAuth(true); setMobileMenuOpen(false); }}>
                <Icon name="user-plus" size={20} />
                Join Now
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Share Knowledge, <span className="hero-highlight">Build Community</span>
            </h1>
            <p className="hero-subtitle">
              Connect with fellow ALU students to borrow, lend, and share textbooks. 
              Save money while building lasting academic relationships.
            </p>
            <div className="hero-actions">
              <button className="btn btn-primary btn-lg" onClick={() => { setAuthMode('signup'); setShowAuth(true); }}>
                <Icon name="user-plus" size={20} />
                Join CampusConnect
              </button>
              <button className="btn btn-outline btn-lg" onClick={() => { setAuthMode('login'); setShowAuth(true); }}>
                <Icon name="log-in" size={20} />
                Sign In
              </button>
            </div>
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">500+</span>
                <span className="stat-label">Students</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">1,200+</span>
                <span className="stat-label">Books Shared</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">$50k+</span>
                <span className="stat-label">Saved</span>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-image-container">
              <img
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&h=400&fit=crop&auto=format"
                alt="ALU students collaborating on campus"
                className="hero-image main-image"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/600x400/2563eb/ffffff?text=ALU+Students"
                }}
              />
              <div className="floating-card top-left">
                <div className="card-content">
                  <Icon name="book" size={16} />
                  <span style={{ marginTop: '0.2em' }}>Algorithms textbook</span>
                </div>
              </div>
              <div className="floating-card bottom-right">
                <div className="card-content">
                  <Icon name="users" size={16} />
                  <span>15 students interested</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Everything You Need</h2>
            <p className="section-subtitle">
              Powerful features designed specifically for ALU students
            </p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <Icon name="search" size={24} />
              </div>
              <h3 className="feature-title">Smart Search</h3>
              <p className="feature-description">
                Find textbooks by course, author, or keyword. Filter by condition, price, and availability.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <Icon name="users" size={24} />
              </div>
              <h3 className="feature-title">Campus Community</h3>
              <p className="feature-description">
                Connect with students in your dorm, year, or major. Build your academic network.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <Icon name="shield-check" size={24} />
              </div>
              <h3 className="feature-title">Verified Students</h3>
              <p className="feature-description">
                ALU email verification ensures you're only connecting with fellow students.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <Icon name="message-circle" size={24} />
              </div>
              <h3 className="feature-title">Direct Messaging</h3>
              <p className="feature-description">
                Chat directly with book owners to arrange pickup, discuss condition, and build connections.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <Icon name="star" size={24} />
              </div>
              <h3 className="feature-title">Rating System</h3>
              <p className="feature-description">
                Rate your experience with borrowers and lenders to build trust in the community.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <Icon name="bell" size={24} />
              </div>
              <h3 className="feature-title">Smart Notifications</h3>
              <p className="feature-description">
                Get notified when books you need become available or when someone requests your books.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="how-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">Simple steps to start sharing and saving</p>
          </div>
          <div className="steps-container">
            <div className="step-card">
              <div className="step-number">1</div>
              <div className="step-image">
                <img
                  src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=300&h=200&fit=crop&auto=format"
                  alt="Student signing up"
                  className="step-img"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/300x200/2563eb/ffffff?text=Sign+Up";
                  }}
                />
              </div>
              <h3 className="step-title">Sign Up</h3>
              <p className="step-description">
                Create your account with your ALU email and complete your profile with major, year, and dorm information.
              </p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <div className="step-image">
                <img
                  src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=200&fit=crop&auto=format"
                  alt="Books on shelf"
                  className="step-img"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/300x200/2563eb/ffffff?text=Browse+Books";
                  }}
                />
              </div>
              <h3 className="step-title">List or Browse</h3>
              <p className="step-description">
                List your textbooks for others to borrow or browse available books from your classmates.
              </p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <div className="step-image">
                <img
                  src="https://images.unsplash.com/photo-1521790361543-f645cf042ec4?w=300&h=200&fit=crop&auto=format"
                  alt="Students exchanging books"
                  className="step-img"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/300x200/2563eb/ffffff?text=Connect+Share";
                  }}
                />
              </div>
              <h3 className="step-title">Connect & Share</h3>
              <p className="step-description">
                Message book owners, arrange meetups, and start building your academic community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section id="community" className="community-section">
        <div className="section-container">
          <div className="community-content">
            <div className="community-text">
              <h2 className="section-title">Join the ALU Community</h2>
              <p className="section-subtitle">
                Students across Rwanda and Mauritius are already saving money and building connections.
              </p>
              <div className="testimonials">
                <div className="testimonial">
                  <p className="testimonial-text">
                    "I saved over $200 this semester and made friends in different years. CampusConnect is amazing!"
                  </p>
                  <div className="testimonial-author">
                    <strong>Aisha M.</strong>
                    <span> • Computer Science, Year 2</span>
                  </div>
                </div>
                <div className="testimonial">
                  <p className="testimonial-text">
                    "Found all my engineering textbooks through upperclassmen. The community here is incredible!"
                  </p>
                  <div className="testimonial-author">
                    <strong>David K.</strong>
                    <span> • Engineering, Year 1</span>
                  </div>
                </div>
              </div>
              <button className="btn btn-primary btn-lg" onClick={() => { setAuthMode('signup'); setShowAuth(true); }}>
                Start Sharing Today
              </button>
            </div>
            <div className="community-images">
              <div className="image-grid">
                <img
                  src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=300&h=150&fit=crop&auto=format"
                  alt="ALU students studying together"
                  className="community-img"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/300x150/2563eb/ffffff?text=ALU+Students";
                  }}
                />
                <img
                  src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=300&h=150&fit=crop&auto=format"
                  alt="ALU Rwanda campus collaboration"
                  className="community-img"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/300x150/2563eb/ffffff?text=Rwanda+Campus";
                  }}
                />
                <img
                  src="https://images.unsplash.com/photo-1529390079861-591de354faf5?w=300&h=150&fit=crop&auto=format"
                  alt="Diverse ALU students"
                  className="community-img"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/300x150/2563eb/ffffff?text=Diverse+Students";
                  }}
                />
                <img
                  src="https://images.unsplash.com/photo-1607013251379-e6eecfffe234?w=300&h=150&fit=crop&auto=format"
                  alt="ALU Mauritius students with books"
                  className="community-img"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/300x150/2563eb/ffffff?text=Mauritius+Campus";
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-brand">
              <Icon name="book-open" size={24} />
              <span className="footer-brand-text">CampusConnect</span>
              <p className="footer-tagline">
                Building academic communities, one book at a time.
              </p>
            </div>
            <div className="footer-links">
              <div className="footer-section">
                <h4 className="footer-title">Platform</h4>
                <a href="#" className="footer-link">How It Works</a>
                <a href="#" className="footer-link">Features</a>
                <a href="#" className="footer-link">Pricing</a>
              </div>
              <div className="footer-section">
                <h4 className="footer-title">Support</h4>
                <a href="#" className="footer-link">Help Center</a>
                <a href="#" className="footer-link">Contact Us</a>
                <a href="#" className="footer-link">Safety Guidelines</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p className="footer-copyright">
              © 2024 CampusConnect. Made with ❤️ for ALU students.
            </p>
          </div>
        </div>
      </footer>

      {/* Authentication Modal */}
      {showAuth && (
        <AuthModal
          mode={authMode}
          setMode={setAuthMode}
          onClose={() => setShowAuth(false)}
          onSuccess={() => {
            setShowAuth(false);
            navigate('/app');
          }}
        />
      )}
    </div>
  );
};

// Enhanced Authentication Modal Component
const AuthModal = ({ mode, setMode, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    fullName: '', email: '', password: '', confirmPassword: '',
    studentId: '', major: '', year: 'Year 1', campus: 'Rwanda',
    dorm: '', roomNumber: '', phoneNumber: '', whatsappNumber: '',
    interests: [], agreeToTerms: false
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const { showError, showSuccess } = useToast();

  const stepTitles = ['Basic Information', 'Academic Details', 'Location & Contact', 'Interests & Terms'];
  const majors = [
    'Computer Science', 'Software Engineering', 'Information Technology',
    'Business Administration', 'Entrepreneurship', 'Finance', 'Economics',
    'Data Science', 'Engineering', 'Other'
  ];
  const years = ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Graduate'];
  const campuses = ['Rwanda', 'Mauritius'];
  const rwandaDorms = ['Kigali Heights', 'Ubumuntu', 'Ubwiyunge', 'Off-Campus'];
  const mauritiusDorms = ['Sunrise', 'Harmony', 'Unity', 'Off-Campus'];
  const interests = [
    'Mathematics', 'Computer Science', 'Business', 'Engineering', 
    'Sciences', 'Languages', 'Arts', 'Economics', 'Finance', 'Data Science'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // For signup, only allow submission on the final step
    if (mode === 'signup' && currentStep !== stepTitles.length) {
      console.log('Form submission blocked - not on final step. Current step:', currentStep, 'Required step:', stepTitles.length);
      console.log('Current form data:', formData);
      showError(`Please complete all ${stepTitles.length} steps before submitting. You are currently on step ${currentStep}.`);
      return;
    }
    
    console.log('=== FORM SUBMISSION START ===');
    console.log('Current step:', currentStep);
    console.log('Total steps:', stepTitles.length);
    console.log('Form data before validation:', formData);
    
    if (!validateForm()) {
      console.log('=== VALIDATION FAILED ===');
      console.log('Errors:', errors);
      return;
    }

    setLoading(true);
    
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      let payload;
      
      if (mode === 'login') {
        payload = { 
          email: formData.email, 
          password: formData.password 
        };
      } else {
        payload = {
          full_name: formData.fullName,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          student_id: formData.studentId,
          major: formData.major,
          year: formData.year,
          campus: formData.campus,
          dorm: formData.dorm || null,
          room_number: formData.roomNumber || null,
          phone_number: formData.phoneNumber || null,
          whatsapp_number: formData.whatsappNumber || null,
          academic_interests: formData.interests || [],
          terms_agreed: formData.agreeToTerms,
          institution: 'African Leadership University'
        };
        
        // Debug logging
        console.log('Registration payload:', payload);
        console.log('Form data:', formData);
      }

      const response = await fetch(`http://localhost:3001${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Registration failed:', data);
        
        // If validation errors, show specific field errors
        if (data.errors && Array.isArray(data.errors)) {
          const errorMessages = data.errors.map(err => `${err.field}: ${err.message}`).join('\n');
          showError(`Validation failed:\n${errorMessages}`);
        } else {
          showError(data.message || 'Authentication failed');
        }
        
        throw new Error(data.message || 'Authentication failed');
      }

      // Save tokens and user data
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      localStorage.setItem('currentUser', JSON.stringify(data.data.user));
      localStorage.setItem('isLoggedIn', 'true');
      
      // Show success message
      showSuccess(mode === 'login' ? 'Login successful!' : 'Registration successful!');
      
      onSuccess();
    } catch (error) {
      // Show error toast instead of setting local error state
      showError(error.message || 'Authentication failed. Please try again.');
      console.error('Authentication error:', error);
      // Don't call onSuccess() when there's an error to prevent navigation
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (mode === 'signup') {
      // Debug logging
      console.log('Validating form with data:', formData);
      
      if (!formData.fullName || !formData.fullName.trim()) {
        newErrors.fullName = 'Full name is required';
        console.log('Full name is missing:', formData.fullName);
      }
      if (!formData.email || !formData.email.includes('@alustudent.com')) {
        newErrors.email = 'Must use ALU email (@alustudent.com)';
        console.log('Email is invalid:', formData.email);
      }
      if (!formData.password || formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
        console.log('Password is invalid:', formData.password?.length);
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
      if (!formData.studentId || !formData.studentId.trim()) {
        newErrors.studentId = 'Student ID is required';
        console.log('Student ID is missing:', formData.studentId);
      }
      if (!formData.major) {
        newErrors.major = 'Major is required';
        console.log('Major is missing:', formData.major);
      }
      if (!formData.year) {
        newErrors.year = 'Year is required';
        console.log('Year is missing:', formData.year);
      }
      if (!formData.campus) {
        newErrors.campus = 'Campus is required';
      }
      if (!formData.agreeToTerms) {
        newErrors.agreeToTerms = 'You must agree to terms';
        console.log('Terms not agreed:', formData.agreeToTerms);
      }
      
      console.log('Validation errors:', newErrors);
    } else {
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      if (!formData.password.trim()) newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateCurrentStep = () => {
    const newErrors = {};
    
    if (currentStep === 1) {
      if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
      if (!formData.email.includes('@alustudent.com')) {
        newErrors.email = 'Must use ALU email (@alustudent.com)';
      }
      if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    } else if (currentStep === 2) {
      if (!formData.studentId.trim()) newErrors.studentId = 'Student ID is required';
      if (!formData.major) newErrors.major = 'Major is required';
      if (!formData.year) newErrors.year = 'Year is required';
    } else if (currentStep === 3) {
      if (!formData.campus) newErrors.campus = 'Campus is required';
    } else if (currentStep === 4) {
      if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to terms';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    console.log('Next step triggered. Current step:', currentStep);
    console.log('Form data at this step:', formData);
    
    if (validateCurrentStep() && currentStep < stepTitles.length) {
      setCurrentStep(currentStep + 1);
      console.log('Advanced to step:', currentStep + 1);
    } else {
      console.log('Cannot advance. Validation failed or already at final step.');
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleInputChange = (field, value) => {
    console.log(`Updating ${field} with value:`, value);
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      console.log('Updated form data:', newData);
      return newData;
    });
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const toggleInterest = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {mode === 'login' ? 'Welcome Back' : stepTitles[currentStep - 1]}
          </h2>
          {mode === 'signup' && (
            <div className="step-indicator">
              {Array.from({ length: stepTitles.length }, (_, i) => (
                <div key={i + 1} className={`step-dot ${currentStep >= i + 1 ? 'active' : ''}`} />
              ))}
            </div>
          )}
          <button className="modal-close" onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}>
            <Icon name="x" size={20} />
          </button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit} className="auth-form"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  // Prevent form submission on Enter key for multi-step signup
                  if (e.key === 'Enter' && mode === 'signup' && currentStep !== stepTitles.length) {
                    e.preventDefault();
                    console.log('Enter key prevented on step', currentStep);
                  }
                }}>
            
            {/* Login Form */}
            {mode === 'login' && (
              <>
                <div className="form-group">
                  <label className="form-label" htmlFor="login-email">Email Address</label>
                  <input
                    id="login-email"
                    type="email"
                    className={`form-input ${errors.email ? 'error' : ''}`}
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="your.email@alustudent.com"
                    autoComplete="email"
                  />
                  {errors.email && <span className="error-text">{errors.email}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="login-password">Password</label>
                  <input
                    id="login-password"
                    type="password"
                    className={`form-input ${errors.password ? 'error' : ''}`}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  {errors.password && <span className="error-text">{errors.password}</span>}
                </div>
              </>
            )}

            {/* Signup Form - Multi-Step */}
            {mode === 'signup' && (
              <>
                {/* Step 1: Basic Information */}
                {currentStep === 1 && (
                  <div className="form-step">
                    <div className="form-group">
                      <label className="form-label" htmlFor="signup-name">Full Name *</label>
                      <input
                        id="signup-name"
                        type="text"
                        className={`form-input ${errors.fullName ? 'error' : ''}`}
                        value={formData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        placeholder="Your full name"
                        autoComplete="name"
                      />
                      {errors.fullName && <span className="error-text">{errors.fullName}</span>}
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="signup-email">ALU Email *</label>
                      <input
                        id="signup-email"
                        type="email"
                        className={`form-input ${errors.email ? 'error' : ''}`}
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="your.name@alustudent.com"
                        autoComplete="email"
                      />
                      {errors.email && <span className="error-text">{errors.email}</span>}
                    </div>
                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label" htmlFor="signup-password">Password *</label>
                        <input
                          id="signup-password"
                          type="password"
                          className={`form-input ${errors.password ? 'error' : ''}`}
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          placeholder="At least 6 characters"
                          autoComplete="new-password"
                        />
                        {errors.password && <span className="error-text">{errors.password}</span>}
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="signup-confirm-password">Confirm Password *</label>
                        <input
                          id="signup-confirm-password"
                          type="password"
                          className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                          placeholder="Confirm your password"
                          autoComplete="new-password"
                        />
                        {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Academic Information */}
                {currentStep === 2 && (
                  <div className="form-step">
                    <div className="form-group">
                      <label className="form-label">Student ID *</label>
                      <input
                        type="text"
                        className={`form-input ${errors.studentId ? 'error' : ''}`}
                        value={formData.studentId}
                        onChange={(e) => handleInputChange('studentId', e.target.value)}
                        placeholder="e.g., 25234"
                      />
                      {errors.studentId && <span className="error-text">{errors.studentId}</span>}
                    </div>
                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label">Major *</label>
                        <select
                          className={`form-input ${errors.major ? 'error' : ''}`}
                          value={formData.major}
                          onChange={(e) => handleInputChange('major', e.target.value)}
                        >
                          <option value="">Select your major</option>
                          {majors.map(major => (
                            <option key={major} value={major}>{major}</option>
                          ))}
                        </select>
                        {errors.major && <span className="error-text">{errors.major}</span>}
                      </div>
                      <div className="form-group">
                        <label className="form-label">Academic Year *</label>
                        <select
                          className={`form-input ${errors.year ? 'error' : ''}`}
                          value={formData.year}
                          onChange={(e) => handleInputChange('year', e.target.value)}
                        >
                          <option value="">Select your year</option>
                          {years.map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                        {errors.year && <span className="error-text">{errors.year}</span>}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Location & Contact */}
                {currentStep === 3 && (
                  <div className="form-step">
                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label">Campus *</label>
                        <select
                          className="form-input"
                          value={formData.campus}
                          onChange={(e) => {
                            handleInputChange('campus', e.target.value);
                            handleInputChange('dorm', '');
                          }}
                        >
                          {campuses.map(campus => (
                            <option key={campus} value={campus}>{campus}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Residence</label>
                        <select
                          className="form-input"
                          value={formData.dorm}
                          onChange={(e) => handleInputChange('dorm', e.target.value)}
                        >
                          <option value="">Select residence</option>
                          {(formData.campus === 'Rwanda' ? rwandaDorms : mauritiusDorms).map(dorm => (
                            <option key={dorm} value={dorm}>{dorm}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    {formData.dorm && formData.dorm !== 'Off-Campus' && (
                      <div className="form-group">
                        <label className="form-label">Room Number</label>
                        <input
                          type="text"
                          className="form-input"
                          value={formData.roomNumber}
                          onChange={(e) => handleInputChange('roomNumber', e.target.value)}
                          placeholder="e.g., 204"
                        />
                      </div>
                    )}
                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label">Phone Number</label>
                        <input
                          type="tel"
                          className="form-input"
                          value={formData.phoneNumber}
                          onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                          placeholder="+250 xxx xxx xxx"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">WhatsApp (if different)</label>
                        <input
                          type="tel"
                          className="form-input"
                          value={formData.whatsappNumber}
                          onChange={(e) => handleInputChange('whatsappNumber', e.target.value)}
                          placeholder="+250 xxx xxx xxx"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Interests & Terms */}
                {currentStep === 4 && (
                  <div className="form-step">
                    <h3 className="section-title">Academic Interests</h3>
                    <p className="section-subtitle">
                      Select subjects you're interested in to get better book recommendations
                    </p>
                    <div className="interests-grid">
                      {interests.map(interest => (
                        <button
                          key={interest}
                          type="button"
                          className={`interest-tag ${formData.interests.includes(interest) ? 'selected' : ''}`}
                          onClick={() => toggleInterest(interest)}
                        >
                          {interest}
                        </button>
                      ))}
                    </div>
                    <div className="checkbox-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={formData.agreeToTerms}
                          onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                        />
                        <span className="checkbox-text">
                          I agree to the <a href="#" className="link">Terms of Service</a> and <a href="#" className="link">Privacy Policy</a>
                        </span>
                      </label>
                      {errors.agreeToTerms && <span className="error-text">{errors.agreeToTerms}</span>}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Error Message */}
            {errors.general && (
              <div className="error-message general">
                <Icon name="alert-circle" size={16} />
                {errors.general}
              </div>
            )}

            {/* Navigation */}
            {mode === 'signup' && (
              <div className="step-navigation">
                {currentStep > 1 && (
                  <button type="button" className="btn btn-outline" onClick={prevStep}>
                    <Icon name="arrow-left" size={16} />
                    Previous
                  </button>
                )}
                {currentStep < stepTitles.length && (
                  <button type="button" className="btn btn-primary" onClick={nextStep}>
                    Next
                    <Icon name="arrow-right" size={16} />
                  </button>
                )}
                {currentStep === stepTitles.length && (
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading && <Icon name="loader" size={16} className="spinning" />}
                    {loading ? 'Creating Account...' : 'Create Account'
                    }
                  </button>
                )}
              </div>
            )}

            {mode === 'login' && (
              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                {loading && <Icon name="loader" size={16} className="spinning" />}
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            )}

            {/* Switch Mode */}
            <div className="auth-switch">
              {mode === 'login' ? (
                <p>
                  New to CampusConnect?{' '}
                  <button type="button" className="link-button" onClick={() => setMode('signup')}>
                    Create an account
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{' '}
                  <button type="button" className="link-button" onClick={() => setMode('login')}>
                    Sign in
                  </button>
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Main App Component 
const MainApp = ({ navigate }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('accessToken');
      const userData = localStorage.getItem('currentUser');
      
      if (token && userData) {
        setUser(JSON.parse(userData));
      } else {
        navigate('/');
        return;
      }
      
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    navigate('/');
  };

  if (loading) {
    return <LoadingScreen />;
  }

  // Render appropriate dashboard based on user role
  if (user?.role === 'admin') {
    return <AdminDashboard user={user} onLogout={handleLogout} navigate={navigate} />;
  } else {
    return <StudentDashboard user={user} onLogout={handleLogout} navigate={navigate} />;
  }
};

// Loading Screen Component
const LoadingScreen = () => (
  <div className="loading-screen">
    <div className="loading-content">
      <div className="loading-spinner">
        <Icon name="loader" className="spinning" size={48} />
      </div>
      <h2>Loading CampusConnect...</h2>
      <p>Please wait while we prepare your dashboard</p>
    </div>
  </div>
);

// API Helper Functions with Loading States
const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showError } = useToast();

  const apiCall = async (endpoint, options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('accessToken');
      
      // Handle FormData uploads
      const headers = {};
      if (!options.isFormData) {
        headers['Content-Type'] = 'application/json';
      }
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      const response = await fetch(`http://localhost:3001${endpoint}`, {
        headers: {
          ...headers,
          ...options.headers,
        },
        ...options,
      });

      // Handle authentication errors specifically
      if (response.status === 401) {
        localStorage.clear();
        showError('Your session has expired. Please log in again.');
        globalThis.location.href = '/';
        throw new Error('Session expired');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      setError(err.message);
      // Only show error toast for non-auth errors (auth errors are handled above)
      if (!err.message.includes('Session expired')) {
        showError(err.message || 'An unexpected error occurred');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { apiCall, loading, error, setError };
};

// Simple API hook with fail-fast error handling
const useApiCall = () => {
  const { apiCall, loading, error, setError } = useApi();
  const { showError, showSuccess } = useToast();

  const makeApiCall = async (endpoint, options = {}) => {
    try {
      const result = await apiCall(endpoint, options);
      return result;
    } catch (error) {
      // Fail fast - no retries for better user experience
      throw error;
    }
  };

  return { makeApiCall, loading, error, setError };
};

// Notification System
const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const { apiCall } = useApi();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await apiCall('/api/notifications');
        console.log('Notifications API response:', data);
        const notificationsData = data.data || [];
        console.log('Setting notifications to:', notificationsData);
        setNotifications(Array.isArray(notificationsData) ? notificationsData : []);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
        setNotifications([]); // Ensure we always set an array
      }
    };

    fetchNotifications();
    
    // Refresh notifications every 2 minutes
    const interval = setInterval(fetchNotifications, 120000);
    return () => clearInterval(interval);
  }, []);

  console.log('useNotifications returning:', notifications);
  return { notifications, setNotifications };
};

// Admin Dashboard Component
const AdminDashboard = ({ user, onLogout, navigate }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const { apiCall, loading, error } = useApi();
  const { notifications } = useNotifications();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsResponse, usersResponse, itemsResponse, transactionsResponse] = await Promise.all([
          apiCall('/api/admin/dashboard'),
          apiCall('/api/admin/users?limit=50'),
          apiCall('/api/admin/items?limit=50'),
          apiCall('/api/admin/transactions?limit=50'),
        ]);

        setDashboardData({
          stats: statsResponse.data,
          users: usersResponse.data.users || usersResponse.data,
          items: itemsResponse.data.items || itemsResponse.data,
          transactions: transactionsResponse.data.transactions || transactionsResponse.data,
          recentActivities: statsResponse.data.recentActivity
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading && !dashboardData) {
    return <LoadingScreen />;
  }

  return (
    <div className={`admin-dashboard ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <AdminNavbar 
        user={user} 
        onLogout={onLogout} 
        notifications={notifications}
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      
      <div className="admin-layout">
        <AdminSidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        
        <main className="admin-main">
          <div className="admin-content">
            {activeTab === 'overview' && <AdminOverview data={dashboardData} />}
            {activeTab === 'users' && <AdminUsers users={dashboardData?.users} />}
            {activeTab === 'items' && <AdminItems items={dashboardData?.items} />}
            {activeTab === 'transactions' && <AdminTransactions transactions={dashboardData?.transactions} />}
            {activeTab === 'analytics' && <AdminAnalytics data={dashboardData} />}
          </div>
        </main>
      </div>
      
      {sidebarOpen && <div className="admin-overlay" onClick={() => setSidebarOpen(false)}></div>}
    </div>
  );
};

// Student Dashboard Component
const StudentDashboard = ({ user, onLogout, navigate }) => {
  // Initialize activeTab from localStorage or default to 'dashboard'
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('campusConnectActiveTab') || 'dashboard';
  });
  const [dashboardData, setDashboardData] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { apiCall, loading, error } = useApi();
  const { notifications } = useNotifications();

  // Save activeTab to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('campusConnectActiveTab', activeTab);
  }, [activeTab]);

  // Listen for tab change events from quick actions
  useEffect(() => {
    const handleTabChange = (event) => {
      setActiveTab(event.detail);
    };

    window.addEventListener('changeTab', handleTabChange);
    return () => window.removeEventListener('changeTab', handleTabChange);
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [itemsResponse, requestsResponse, statsResponse] = await Promise.all([
          apiCall('/api/items'),
          apiCall('/api/transactions/my-requests'),
          apiCall('/api/users/stats'),
        ]);

        console.log('Dashboard data responses:', { itemsResponse, requestsResponse, statsResponse });

        setDashboardData({
          publicItems: itemsResponse.data?.items || itemsResponse.data || [],
          myRequests: requestsResponse.data?.transactions || [],
        });
        setUserStats(statsResponse.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading && !dashboardData) {
    return <LoadingScreen />;
  }

  return (
    <div className={`dashboard-container ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <StudentNavbar 
        user={user} 
        onLogout={onLogout} 
        notifications={notifications}
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      
      <div className="dashboard-content">
        <StudentSidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        
        {sidebarOpen && <div className="dashboard-overlay" onClick={() => setSidebarOpen(false)}></div>}
        
        <main className="dashboard-main">
          {activeTab === 'dashboard' && <StudentOverview user={user} stats={userStats} />}
          {activeTab === 'browse' && <BrowseItems items={dashboardData?.publicItems} user={user} />}
          {activeTab === 'my-items' && <MyItems />}
          {activeTab === 'requests' && <MyRequests requests={dashboardData?.myRequests} />}
          {activeTab === 'received-requests' && <ReceivedRequests />}
          {activeTab === 'classrooms' && <Classrooms />}
          {activeTab === 'payments' && <Payments />}
        </main>
      </div>
    </div>
  );
};

// Notification Handler Component
const NotificationHandler = () => {
  const { showSuccess, showError, showInfo, showWarning } = useToast();

  useEffect(() => {
    // Listen for WebSocket notifications
    const handleWebSocketNotification = (event) => {
      const notification = event.detail;
      
      switch (notification.type) {
        case 'success':
          showSuccess(notification.message, notification.duration);
          break;
        case 'error':
          showError(notification.message, notification.duration);
          break;
        case 'warning':
          showWarning(notification.message, notification.duration);
          break;
        case 'info':
        default:
          showInfo(notification.message, notification.duration);
          break;
      }
    };

    // Listen for transaction updates
    const handleTransactionUpdate = (event) => {
      const transaction = event.detail;
      showInfo(`Transaction ${transaction.status}: ${transaction.item_name}`, 5000);
    };

    // Listen for new messages
    const handleNewMessage = (event) => {
      const message = event.detail;
      showInfo(`New message from ${message.sender_name}`, 4000);
    };

    // Listen for user status updates
    const handleUserStatusUpdate = (event) => {
      const user = event.detail;
      showInfo(`${user.name} is now ${user.status}`, 3000);
    };

    // Add event listeners
    window.addEventListener('websocket-notification', handleWebSocketNotification);
    window.addEventListener('transaction-update', handleTransactionUpdate);
    window.addEventListener('new-message', handleNewMessage);
    window.addEventListener('user-status-update', handleUserStatusUpdate);

    // Cleanup event listeners
    return () => {
      window.removeEventListener('websocket-notification', handleWebSocketNotification);
      window.removeEventListener('transaction-update', handleTransactionUpdate);
      window.removeEventListener('new-message', handleNewMessage);
      window.removeEventListener('user-status-update', handleUserStatusUpdate);
    };
  }, [showSuccess, showError, showInfo, showWarning]);

  // This component doesn't render anything visible
  return null;
};

// Main App Router
const App = () => {
  const { route, navigate } = useRouter();

  console.log('App component rendering, route:', route);

  const renderRoute = () => {
    try {
      console.log('renderRoute called with route:', route);
      switch (route) {
        case '/':
          console.log('Rendering LandingPage');
          return <LandingPage navigate={navigate} />;
        case '/app':
          console.log('Rendering MainApp');
          return <MainApp navigate={navigate} />;
        default:
          console.log('Rendering default LandingPage');
          return <LandingPage navigate={navigate} />;
      }
    } catch (error) {
      console.error('Error in renderRoute:', error);
      throw error;
    }
  };

  return (
    <ErrorBoundary>
      <ToastProvider>
        <NotificationHandler />
        {renderRoute()}
      </ToastProvider>
    </ErrorBoundary>
  );
};

// Admin Navigation Component
const AdminNavbar = ({ user, onLogout, notifications = [], onMenuToggle }) => {
  const unreadCount = Array.isArray(notifications) ? notifications.filter(n => !n.read).length : 0;
  
  return (
    <nav className="admin-navbar">
      <div className="navbar-left">
        <button className="mobile-menu-toggle" onClick={onMenuToggle}>
          <Icon name="menu" size={24} />
        </button>
        <div className="navbar-brand">
          <Icon name="shield" size={28} />
          <span className="brand-text">CampusConnect Admin</span>
        </div>
      </div>
      
      <div className="navbar-actions">
        <div className="notifications-dropdown">
          <button className="notification-btn">
            <Icon name="bell" size={20} />
            {unreadCount > 0 && (
              <span className="notification-badge pulse">{unreadCount}</span>
            )}
          </button>
        </div>
        
        <div className="user-profile">
          <div className="user-info">
            <span className="user-name">{user.full_name}</span>
            <span className="user-subtitle">Administrator</span>
          </div>
          <div className="user-avatar admin">
            {user.full_name.split(' ').map(name => name[0]).join('').toUpperCase()}
          </div>
        </div>
        
        <button className="logout-btn" onClick={onLogout} title="Logout">
          <Icon name="log-out" size={18} />
        </button>
      </div>
    </nav>
  );
};

// Admin Sidebar Component
const AdminSidebar = ({ activeTab, setActiveTab, isOpen, onClose }) => {
  const menuItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: 'layout-dashboard' },
    { id: 'users', label: 'User Management', icon: 'users' },
    { id: 'items', label: 'Items & Inventory', icon: 'package' },
    { id: 'transactions', label: 'Transactions', icon: 'exchange' },
    { id: 'analytics', label: 'Analytics', icon: 'bar-chart-3' },
  ];

  return (
    <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => {
              setActiveTab(item.id);
              if (onClose) onClose();
            }}
          >
            <Icon name={item.icon} size={20} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};

// Admin Overview Component
const AdminOverview = ({ data }) => {
  if (!data) return <div className="loading-placeholder">Loading overview...</div>;

  const { stats } = data;
  
  return (
    <div className="admin-overview">
      <h1 className="page-title">Admin Dashboard Overview</h1>
      
      <div className="stats-grid">
        <StatCard 
          title="Total Users" 
          value={stats?.users?.total || 0} 
          icon="users" 
          trend="+12%" 
          color="blue"
        />
        <StatCard 
          title="Total Items" 
          value={stats?.items?.total || 0} 
          icon="package" 
          trend="+8%" 
          color="green"
        />
        <StatCard 
          title="Pending Transactions" 
          value={stats?.transactions?.pending || 0} 
          icon="clock" 
          trend="-3%" 
          color="orange"
        />
        <StatCard 
          title="Completed Transactions" 
          value={stats?.transactions?.completed || 0} 
          icon="check-circle" 
          trend="+15%" 
          color="purple"
        />
      </div>

      <div className="dashboard-charts">
        <div className="chart-container">
          <h3>Recent Activity</h3>
          <ActivityChart data={stats?.recentActivity} />
        </div>
        <div className="chart-container">
          <h3>Transaction Status Breakdown</h3>
          <TransactionChart data={stats?.transactions} />
        </div>
      </div>

      <RecentActivitiesList activities={data.recentActivities} />
    </div>
  );
};

// Student Navigation Component
const StudentNavbar = ({ user, onLogout, notifications = [], onMenuToggle }) => {
  // Ensure notifications is an array
  const notificationsArray = Array.isArray(notifications) ? notifications : [];
  const unreadCount = notificationsArray.filter(n => !n.read).length;
  
  // Handle cases where user might be null or undefined
  if (!user || !user.full_name) {
    return (
      <nav className="student-navbar">
        <div className="navbar-left">
          <button className="mobile-menu-toggle" onClick={onMenuToggle}>
            <Icon name="menu" size={24} />
          </button>
          <div className="navbar-brand">
            <Icon name="book-open" size={28} />
            <span className="brand-text">CampusConnect</span>
          </div>
        </div>
        <div className="navbar-actions">
          <div className="user-profile">
            <div className="user-info">
              <span className="user-name">Loading...</span>
              <span className="user-subtitle">Please wait</span>
            </div>
            <div className="user-avatar">?</div>
          </div>
        </div>
      </nav>
    );
  }
  
  return (
    <nav className="student-navbar">
      <div className="navbar-left">
        <button className="mobile-menu-toggle" onClick={onMenuToggle}>
          <Icon name="menu" size={24} />
        </button>
        <div className="navbar-brand">
          <Icon name="book-open" size={28} />
          <span className="brand-text">CampusConnect</span>
        </div>
      </div>
      
      <div className="navbar-actions">
        <div className="notifications-dropdown">
          <button className="notification-btn">
            <Icon name="bell" size={20} />
            {unreadCount > 0 && (
              <span className="notification-badge pulse">{unreadCount}</span>
            )}
          </button>
        </div>
        
        <div className="user-profile">
          <div className="user-info">
            <span className="user-name">{user.full_name}</span>
            <span className="user-subtitle">{user.major || 'Student'} • {user.year || 'Year N/A'}</span>
          </div>
          <div className="user-avatar">
            {user.full_name.split(' ').map(name => name[0]).join('').toUpperCase()}
          </div>
          <button className="logout-btn" onClick={onLogout} title="Logout">
            <Icon name="log-out" size={18} />
          </button>
        </div>
      </div>
    </nav>
  );
};

// Student Sidebar Component
const StudentSidebar = ({ activeTab, setActiveTab, isOpen, onClose }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'home' },
    { id: 'browse', label: 'Browse Items', icon: 'search' },
    { id: 'my-items', label: 'My Listings', icon: 'package' },
    { id: 'requests', label: 'My Requests', icon: 'message-circle' },
    { id: 'received-requests', label: 'Received Requests', icon: 'inbox' },
    { id: 'classrooms', label: 'Classrooms', icon: 'users' },
    { id: 'payments', label: 'Payments', icon: 'credit-card' },
  ];

  return (
    <aside className={`dashboard-sidebar student-sidebar ${isOpen ? 'open' : ''}`}>
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => {
              setActiveTab(item.id);
              if (onClose) onClose();
            }}
          >
            <Icon name={item.icon} size={20} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};

// Student Overview Component
const StudentOverview = ({ user, stats }) => {
  if (!stats) return <div className="loading-placeholder">Loading your stats...</div>;

  return (
    <div className="student-overview">
      <div className="welcome-section">
        <h1 className="welcome-title">Welcome back, {user.full_name.split(' ')[0]}! 👋</h1>
        <p className="welcome-subtitle">Ready to share and discover amazing items?</p>
      </div>

      <div className="streak-section">
        <div className="streak-card">
          <div className="streak-flame">
            <Icon name="flame" size={48} className="flame-icon" />
            <span className="streak-number">{stats.streak || 0}</span>
          </div>
          <div className="streak-info">
            <h3>Your Streak</h3>
            <p>Keep sharing to maintain your streak!</p>
            <div className="streak-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${Math.min((stats.streak || 0) * 10, 100)}%` }}
                />
              </div>
              <span className="progress-text">
                {stats.streak || 0} days • Next milestone: {Math.ceil((stats.streak || 0) / 10) * 10}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard 
          title="Items Shared" 
          value={stats.itemsShared || 0} 
          icon="package" 
          color="green"
        />
        <StatCard 
          title="Items Borrowed" 
          value={stats.itemsBorrowed || 0} 
          icon="book-open" 
          color="blue"
        />
        <StatCard 
          title="Reviews Received" 
          value={stats.reviewsReceived || 0} 
          icon="star" 
          color="yellow"
        />
        <StatCard 
          title="Total Saved" 
          value={`$${stats.moneySaved || 0}`} 
          icon="dollar-sign" 
          color="purple"
        />
      </div>

      <div className="dashboard-sections">
        <RecentActivity activities={stats.recentActivity} />
        <QuickActions />
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon, trend, color }) => (
  <div className={`stat-card stat-${color}`}>
    <div className="stat-content">
      <div className="stat-header">
        <Icon name={icon} size={24} className="stat-icon" />
        {trend && <span className={`stat-trend ${trend.startsWith('+') ? 'positive' : 'negative'}`}>{trend}</span>}
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-title">{title}</div>
    </div>
  </div>
);

// Browse Items Component
const BrowseItems = ({ items, user }) => {
  const [filteredItems, setFilteredItems] = useState(items || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [userRequests, setUserRequests] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
    condition: '',
    sharing_type: '',
    location: ''
  });
  const { apiCall, loading } = useApi();
  const { showError, showSuccess } = useToast();

  // Fetch user requests to check which items are already requested
  useEffect(() => {
    const fetchUserRequests = async () => {
      if (!user) return;
      
      try {
        const response = await apiCall('/api/transactions/my-requests');
        console.log('My requests API response:', response);
        const requests = response.data?.transactions || [];
        // Filter for pending requests
        const pendingRequests = Array.isArray(requests) ? 
          requests.filter(req => req.transaction_status === 'pending').map(req => req.item_id) : [];
        setUserRequests(pendingRequests);
      } catch (error) {
        console.error('Failed to fetch user requests:', error);
      }
    };

    fetchUserRequests();
  }, [user]);

  // Debug logging
  console.log('BrowseItems props.items:', items);
  console.log('BrowseItems filteredItems:', filteredItems);
  console.log('BrowseItems userRequests:', userRequests);

  useEffect(() => {
    console.log('BrowseItems useEffect - items changed:', items);
    if (!items) return;
    
    let filtered = Array.isArray(items) ? items.filter(item => 
      item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
    ) : [];

    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        filtered = filtered.filter(item => item[key] === filters[key]);
      }
    });

    console.log('BrowseItems setting filtered items:', filtered);
    setFilteredItems(filtered);
  }, [items, searchTerm, filters]);

  const handleRequest = async (itemId) => {
    try {
      await apiCall(`/api/items/${itemId}/request`, { method: 'POST' });
      showSuccess('Item requested successfully!');
      // Add the item to user requests to immediately update the UI
      setUserRequests(prev => [...prev, itemId]);
    } catch (error) {
      showError(error.message || 'Failed to request item');
      console.error('Failed to request item:', error);
    }
  };

  return (
    <div className="browse-items">
      <h1 className="page-title">Browse Available Items</h1>
      
      <div className="search-filters">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search items by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filters">
          <FilterSelect
            label="Category"
            value={filters.category}
            onChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
            options={['Books', 'Electronics', 'Clothing', 'Tools', 'Other']}
          />
          <FilterSelect
            label="Condition"
            value={filters.condition}
            onChange={(value) => setFilters(prev => ({ ...prev, condition: value }))}
            options={['Like New', 'Good', 'Fair', 'Poor']}
          />
          <FilterSelect
            label="Type"
            value={filters.sharing_type}
            onChange={(value) => setFilters(prev => ({ ...prev, sharing_type: value }))}
            options={['lend', 'sell', 'exchange']}
          />
          <div className="filters-actions">
            <button 
              className="clear-filters-btn"
              onClick={() => {
                setSearchTerm('');
                setFilters({
                  category: '',
                  condition: '',
                  sharing_type: '',
                  location: ''
                });
              }}
              disabled={!searchTerm && !filters.category && !filters.condition && !filters.sharing_type}
            >
              <Icon name="x" size={16} />
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-grid">
          {Array.from({ length: 6 }, (_, i) => <ItemCardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="items-grid">
          {Array.isArray(filteredItems) && filteredItems.length > 0 ? (
            filteredItems.map(item => {
              // Check if the current user owns this item
              const isOwner = user && (item.owner_id === user.user_id || item.user_id === user.user_id);
              // Check if the user has already requested this item
              const hasRequested = userRequests.includes(item.item_id);
              
              return (
                <ItemCard 
                  key={item.item_id} 
                  item={item} 
                  onRequest={() => handleRequest(item.item_id)}
                  showRequestButton={!isOwner && !hasRequested}
                  hasRequested={hasRequested}
                  isOwner={isOwner}
                />
              );
            })
          ) : (
            <div className="empty-state">
              <Icon name="search" size={48} />
              <h3>No Items Found</h3>
              <p>Try adjusting your search criteria or check back later for new items.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Item Card Component
const ItemCard = ({ item, onRequest, showRequestButton = false, hasRequested = false, isOwner = false }) => {
  const [imageError, setImageError] = useState(false);
  
  // Generate random gradient for placeholder
  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
  ];
  const gradientIndex = item.item_id % gradients.length;
  
  return (
    <div className="item-card">
      <div className="item-image">
        {!imageError && item.image?.medium ? (
          <img 
            src={item.image.medium} 
            alt={item.image.alt || item.item_name}
            onError={() => setImageError(true)}
          />
        ) : (
          <div 
            className="item-image-placeholder"
            style={{ background: gradients[gradientIndex] }}
          >
            <Icon name="book" size={64} />
          </div>
        )}
        <span className={`item-status ${item.availability_status}`}>
          {item.availability_status}
        </span>
      </div>
      
      <div className="item-details">
        <h3 className="item-name">{item.item_name}</h3>
        <p className="item-description">{item.description}</p>
        
        <div className="item-meta">
          <span className="item-condition">{item.condition}</span>
          <span className="item-type">{item.sharing_type}</span>
          {item.price && <span className="item-price">${item.price}</span>}
        </div>
        
        <div className="item-owner">
          <Icon name="user" size={16} />
          <span>{item.owner_name}</span>
          <span className="owner-location">{item.location}</span>
        </div>
        
        {/* Show different button states based on user relationship to item */}
        {isOwner ? (
          <div className="owner-indicator">
            <Icon name="user" size={16} />
            <span>Your Item</span>
          </div>
        ) : hasRequested ? (
          <button className="btn btn-secondary btn-full" disabled>
            <Icon name="clock" size={16} />
            Already Requested
          </button>
        ) : showRequestButton ? (
          <button className="btn btn-primary btn-full" onClick={onRequest}>
            <Icon name="send" size={16} />
            Request Item
          </button>
        ) : null}
      </div>
    </div>
  );
};

// My Items Component  
const MyItems = () => {
  const [items, setItems] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const { apiCall, loading } = useApi();

  useEffect(() => {
    const fetchMyItems = async () => {
      try {
        const response = await apiCall('/api/items/my-items');
        console.log('MyItems API response:', response);
        // The API returns items in response.data.items, not response.data
        const itemsData = response.data?.items || response.data || [];
        setItems(Array.isArray(itemsData) ? itemsData : []);
      } catch (error) {
        console.error('Failed to fetch items:', error);
        setItems([]); // Ensure we always set an array
      }
    };

    fetchMyItems();
  }, []);

  return (
    <div className="my-items">
      <div className="page-header">
        <h1 className="page-title">My Listings</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddForm(true)}
        >
          <Icon name="plus" size={20} />
          Add New Item
        </button>
      </div>

      {loading ? (
        <div className="loading-grid">
          {Array.from({ length: 4 }, (_, i) => <ItemCardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="items-grid">
          {Array.isArray(items) && items.length > 0 ? (
            items.map(item => (
              <MyItemCard key={item.item_id} item={item} setItems={setItems} />
            ))
          ) : (
            <div className="empty-state">
              <Icon name="package" size={48} />
              <h3>No Items Listed Yet</h3>
              <p>Start sharing your textbooks with fellow students!</p>
            </div>
          )}
        </div>
      )}

      {showAddForm && (
        <AddItemModal 
          onClose={() => setShowAddForm(false)}
          onSuccess={(newItem) => {
            setItems(prev => [newItem, ...prev]);
            setShowAddForm(false);
          }}
        />
      )}
    </div>
  );
};

// Classrooms Component
const Classrooms = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [joinedClassrooms, setJoinedClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joiningClassroom, setJoiningClassroom] = useState(null);
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const { apiCall } = useApi();
  const { showError, showSuccess } = useToast();

  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        setLoading(true);
        
        // Fetch all available classrooms and user's joined classrooms
        const [allClassroomsResponse, joinedClassroomsResponse] = await Promise.all([
          apiCall('/api/classrooms'),
          apiCall('/api/classrooms/joined')
        ]);

        if (allClassroomsResponse.success) {
          setClassrooms(allClassroomsResponse.data);
        }

        if (joinedClassroomsResponse.success) {
          setJoinedClassrooms(joinedClassroomsResponse.data);
        }
      } catch (error) {
        console.error('Failed to fetch classrooms:', error);
        showError('Failed to load classrooms');
        setClassrooms([]);
        setJoinedClassrooms([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClassrooms();
  }, []);

  const joinClassroom = async (classroomId) => {
    try {
      setJoiningClassroom(classroomId);
      
      const response = await apiCall(`/api/classrooms/${classroomId}/join`, {
        method: 'POST'
      });
      
      if (response.success) {
        // Move classroom from available to joined
        const classroomToJoin = classrooms.find(c => c.id === classroomId);
        if (classroomToJoin) {
          setJoinedClassrooms(prev => [...prev, { ...classroomToJoin, unread_messages: 0 }]);
          setClassrooms(prev => prev.filter(c => c.id !== classroomId));
          showSuccess(`Successfully joined ${classroomToJoin.name}!`);
        }
      }
    } catch (error) {
      console.error('Failed to join classroom:', error);
      showError('Failed to join classroom');
    } finally {
      setJoiningClassroom(null);
    }
  };

  const openDiscussion = (classroom) => {
    setSelectedDiscussion(classroom);
  };

  const closeDiscussion = () => {
    setSelectedDiscussion(null);
  };

  if (loading) {
    return (
      <div className="classrooms">
        <h1 className="page-title">Study Groups & Classrooms</h1>
        <div className="loading-placeholder">
          <Icon name="loader" className="spinning" size={48} />
          <p>Loading classrooms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="classrooms">
      <h1 className="page-title">Study Groups & Classrooms</h1>
      
      <div className="classroom-sections">
        <section className="joined-classrooms">
          <h2>Your Classrooms ({joinedClassrooms.length})</h2>
          {loading ? (
            <div className="classroom-grid">
              {Array.from({ length: 2 }, (_, i) => <ClassroomCardSkeleton key={i} />)}
            </div>
          ) : (
            <div className="classroom-grid">
              {joinedClassrooms.length > 0 ? (
                joinedClassrooms.map(classroom => (
                  <ClassroomCard 
                    key={classroom.id} 
                    classroom={classroom} 
                    isJoined
                    onOpenDiscussion={() => openDiscussion(classroom)}
                  />
                ))
              ) : (
                <div className="empty-state">
                  <Icon name="users" size={48} />
                  <h3>No Joined Classrooms</h3>
                  <p>Join a study group to start collaborating!</p>
                </div>
              )}
            </div>
          )}
        </section>

        <section className="available-classrooms">
          <h2>Join New Classrooms ({classrooms.filter(classroom => 
            !joinedClassrooms.some(joined => joined.id === classroom.id)
          ).length} available)</h2>
          {loading ? (
            <div className="classroom-grid">
              {Array.from({ length: 3 }, (_, i) => <ClassroomCardSkeleton key={i} />)}
            </div>
          ) : (
            <div className="classroom-grid">
              {classrooms.filter(classroom => 
                !joinedClassrooms.some(joined => joined.id === classroom.id)
              ).length > 0 ? (
                classrooms.filter(classroom => 
                  !joinedClassrooms.some(joined => joined.id === classroom.id)
                ).map(classroom => (
                  <ClassroomCard 
                    key={classroom.id} 
                    classroom={classroom} 
                    onJoin={() => joinClassroom(classroom.id)}
                    isJoining={joiningClassroom === classroom.id}
                  />
                ))
              ) : (
                <div className="empty-state">
                  <Icon name="search" size={48} />
                  <h3>No New Classrooms Available</h3>
                  <p>You've joined all available classrooms! Check back later for new study groups.</p>
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {/* Discussion Modal */}
      {selectedDiscussion && (
        <DiscussionModal 
          classroom={selectedDiscussion} 
          onClose={closeDiscussion}
          apiCall={apiCall}
          showError={showError}
        />
      )}
    </div>
  );
};

// Classroom Card Component
const ClassroomCard = ({ classroom, isJoined, onJoin, onOpenDiscussion, isJoining }) => (
  <div className={`classroom-card ${isJoined ? 'joined' : ''} ${isJoining ? 'joining' : ''}`}>
    <div className="classroom-header">
      <h3 className="classroom-name">{classroom.name}</h3>
      <span className="classroom-code">{classroom.code}</span>
    </div>
    
    <p className="classroom-description">{classroom.description}</p>
    
    <div className="classroom-meta">
      <span className="instructor">
        <Icon name="user" size={14} />
        {classroom.instructor}
      </span>
    </div>
    
    <div className="classroom-stats">
      <span className="stat-item">
        <Icon name="users" size={14} />
        {classroom.members_count || 0} members
      </span>
      <span className="stat-item">
        <Icon name="package" size={14} />
        {classroom.items_count || 0} items
      </span>
      {isJoined && classroom.unread_messages > 0 && (
        <span className="stat-item unread">
          <Icon name="message-circle" size={14} />
          {classroom.unread_messages} new
        </span>
      )}
    </div>
    
    <div className="classroom-actions">
      {isJoined ? (
        <button 
          className="btn btn-outline btn-full"
          onClick={onOpenDiscussion}
        >
          <Icon name="message-circle" size={16} />
          View Discussions
          {classroom.unread_messages > 0 && (
            <span className="unread-badge">{classroom.unread_messages}</span>
          )}
        </button>
      ) : (
        <button 
          className="btn btn-primary btn-full" 
          onClick={onJoin}
          disabled={isJoining}
        >
          {isJoining ? (
            <>
              <Icon name="loader" size={16} className="spinning" />
              Joining...
            </>
          ) : (
            <>
              <Icon name="plus" size={16} />
              Join Classroom
            </>
          )}
        </button>
      )}
    </div>
  </div>
);

// Classroom Card Skeleton Component
const ClassroomCardSkeleton = () => (
  <div className="classroom-card skeleton">
    <div className="classroom-header">
      <div className="skeleton-title"></div>
      <div className="skeleton-code"></div>
    </div>
    <div className="skeleton-description"></div>
    <div className="classroom-stats">
      <div className="skeleton-stat"></div>
      <div className="skeleton-stat"></div>
    </div>
    <div className="classroom-actions">
      <div className="skeleton-button"></div>
    </div>
  </div>
);

// Discussion Modal Component
const DiscussionModal = ({ classroom, onClose, apiCall, showError }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, [classroom.id]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      console.log('Fetching messages for classroom:', classroom.id);
      const response = await apiCall(`/api/classrooms/${classroom.id}/messages`);
      console.log('Messages response:', response);
      if (response.success) {
        setMessages(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      showError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || sendingMessage) return;

    try {
      setSendingMessage(true);
      console.log('Sending message:', newMessage.trim(), 'to classroom:', classroom.id);
      const response = await apiCall(`/api/classrooms/${classroom.id}/messages`, {
        method: 'POST',
        body: JSON.stringify({ message: newMessage.trim() })
      });
      console.log('Send message response:', response);

      if (response.success) {
        setMessages(prev => [response.data, ...prev]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      showError('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const toggleLike = async (messageId) => {
    try {
      const response = await apiCall(`/api/classrooms/messages/${messageId}/like`, {
        method: 'POST'
      });

      if (response.success) {
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, likes_count: response.data.likes_count, is_liked: response.data.is_liked }
            : msg
        ));
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
      showError('Failed to update like');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="discussion-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="classroom-info">
            <h2>{classroom.name}</h2>
            <span className="classroom-code">{classroom.code}</span>
          </div>
          <button className="modal-close" onClick={onClose}>
            <Icon name="x" size={20} />
          </button>
        </div>

        <div className="discussion-content">
          {loading ? (
            <div className="loading-placeholder">
              <Icon name="loader" className="spinning" size={32} />
              <p>Loading discussions...</p>
            </div>
          ) : (
            <>
              <div className="messages-list">
                {messages.map(message => (
                  <div key={message.id} className="message-card">
                    <div className="message-header">
                      <div className="user-avatar">
                        {message.user_name ? message.user_name.substring(0, 2).toUpperCase() : 'U'}
                      </div>
                      <div className="message-info">
                        <span className="user-name">{message.user_name || 'Unknown User'}</span>
                        <span className="message-time">
                          {message.created_at ? new Date(message.created_at).toLocaleString() : 'Just now'}
                        </span>
                      </div>
                    </div>
                    <p className="message-text">{message.message}</p>
                    <div className="message-actions">
                      <button className="reply-btn">
                        <Icon name="message-circle" size={14} />
                        {message.reply_count || 0} replies
                      </button>
                      <button 
                        className={`like-btn ${message.is_liked ? 'liked' : ''}`}
                        onClick={() => toggleLike(message.id)}
                      >
                        <Icon name="heart" size={14} />
                        {message.likes_count || 0} likes
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="message-compose">
                <div className="compose-input">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !sendingMessage && sendMessage()}
                    disabled={sendingMessage}
                  />
                  <button 
                    className="send-btn"
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || sendingMessage}
                  >
                    {sendingMessage ? (
                      <Icon name="loader" size={16} className="spinning" />
                    ) : (
                      <Icon name="send" size={16} />
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Additional Helper Components

// Loading Skeleton for Item Cards
const ItemCardSkeleton = () => (
  <div className="item-card-skeleton">
    <div className="skeleton-image"></div>
    <div className="skeleton-content">
      <div className="skeleton-title"></div>
      <div className="skeleton-description"></div>
      <div className="skeleton-description"></div>
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
        <div style={{ width: '60px', height: '24px', borderRadius: '12px', background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'loading 1.5s infinite' }}></div>
        <div style={{ width: '50px', height: '24px', borderRadius: '12px', background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'loading 1.5s infinite' }}></div>
      </div>
    </div>
  </div>
);

// Filter Select Component
const FilterSelect = ({ label, value, onChange, options }) => (
  <div className="filter-select">
    <label>{label}</label>
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">All {label}s</option>
      {options.map(option => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
  </div>
);

// My Item Card with actions
const MyItemCard = ({ item, setItems }) => {
  const { apiCall, loading } = useApi();
  const { showError, showSuccess } = useToast();
  const [showMenu, setShowMenu] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Generate random gradient for placeholder
  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
  ];
  const gradientIndex = item.item_id % gradients.length;

  const deleteItem = async () => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      await apiCall(`/api/items/${item.item_id}`, { method: 'DELETE' });
      setItems(prev => prev.filter(i => i.item_id !== item.item_id));
      showSuccess('Item deleted successfully!');
    } catch (error) {
      showError(error.message || 'Failed to delete item');
      console.error('Failed to delete item:', error);
    }
  };

  const toggleAvailability = async () => {
    try {
      const newStatus = item.availability_status === 'available' ? 'unavailable' : 'available';
      await apiCall(`/api/items/${item.item_id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ availability_status: newStatus })
      });
      
      setItems(prev => prev.map(i => 
        i.item_id === item.item_id 
          ? { ...i, availability_status: newStatus }
          : i
      ));
      showSuccess(`Item marked as ${newStatus}!`);
    } catch (error) {
      showError(error.message || 'Failed to update item');
      console.error('Failed to update item:', error);
    }
  };

  return (
    <div className="item-card my-item">
      <div className="item-image">
        {!imageError && item.image_url ? (
          <img 
            src={item.image_url} 
            alt={item.item_name}
            onError={() => setImageError(true)}
          />
        ) : (
          <div 
            className="item-image-placeholder"
            style={{ background: gradients[gradientIndex] }}
          >
            <Icon name="book" size={64} />
          </div>
        )}
        <span className={`item-status ${item.availability_status}`}>
          {item.availability_status}
        </span>
        
        <div className="item-actions">
          <button 
            className="action-menu-btn"
            onClick={() => setShowMenu(!showMenu)}
          >
            <Icon name="more-vertical" size={16} />
          </button>
          
          {showMenu && (
            <div className="action-menu">
              <button onClick={toggleAvailability} disabled={loading}>
                <Icon name={item.availability_status === 'available' ? 'eye-off' : 'eye'} size={14} />
                {item.availability_status === 'available' ? 'Hide' : 'Show'}
              </button>
              <button onClick={deleteItem} disabled={loading} className="delete-action">
                <Icon name="trash" size={14} />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="item-details">
        <h3 className="item-name">{item.item_name}</h3>
        <p className="item-description">{item.description}</p>
        
        <div className="item-meta">
          <span className="item-condition">{item.condition}</span>
          <span className="item-type">{item.sharing_type}</span>
          {item.price && <span className="item-price">${item.price}</span>}
        </div>

        <div className="item-stats">
          <span className="stat-item">
            <Icon name="eye" size={14} />
            {item.views || 0} views
          </span>
          <span className="stat-item">
            <Icon name="message-circle" size={14} />
            {item.requests || 0} requests
          </span>
        </div>
      </div>
    </div>
  );
};

// Add Item Modal
const AddItemModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    item_name: '',
    description: '',
    category: '',
    condition: 'Good',
    sharing_type: 'lend',
    price: '',
    location: ''
  });
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  const [errors, setErrors] = useState({});
  const { apiCall, loading } = useApi();

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file types and sizes
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        return false;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        return false;
      }
      return true;
    });

    if (validFiles.length + selectedImages.length > 5) {
      setErrors(prev => ({ ...prev, images: 'Maximum 5 images allowed' }));
      return;
    }

    setSelectedImages(prev => [...prev, ...validFiles]);
    
    // Create preview URLs
    const newPreviewUrls = validFiles.map(file => URL.createObjectURL(file));
    setImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);
    
    // Clear any previous image errors
    if (errors.images) {
      setErrors(prev => ({ ...prev, images: null }));
    }
  };

  const removeImage = (index) => {
    // Revoke the preview URL to prevent memory leaks
    URL.revokeObjectURL(imagePreviewUrls[index]);
    
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Create FormData for file upload
      const submitFormData = new FormData();
      
      // Append text fields
      Object.entries(formData).forEach(([key, value]) => {
        submitFormData.append(key, value);
      });
      
      // Append image files
      selectedImages.forEach(file => {
        submitFormData.append('images', file);
      });

      const response = await apiCall('/api/items', {
        method: 'POST',
        body: submitFormData,
        isFormData: true // This tells our API to not set Content-Type header
      });
      
      // Clean up preview URLs
      imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
      
      onSuccess(response.data.item);
    } catch (error) {
      setErrors({ general: error.message });
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="add-item-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Item</h2>
          <button className="modal-close" onClick={onClose}>
            <Icon name="x" size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="add-item-form">
          <div className="form-group">
            <label className="form-label">Item Name *</label>
            <input
              type="text"
              className={`form-input ${errors.item_name ? 'error' : ''}`}
              value={formData.item_name}
              onChange={(e) => handleChange('item_name', e.target.value)}
              placeholder="What are you sharing?"
            />
            {errors.item_name && <span className="error-text">{errors.item_name}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea
              className={`form-input ${errors.description ? 'error' : ''}`}
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe your item..."
              rows="3"
            />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                className="form-input"
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
              >
                <option value="">Select Category</option>
                <option value="1">Books</option>
                <option value="2">Electronics</option>
                <option value="3">Clothing</option>
                <option value="4">Tools</option>
                <option value="5">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Condition *</label>
              <select
                className="form-input"
                value={formData.condition}
                onChange={(e) => handleChange('condition', e.target.value)}
              >
                <option value="Like New">Like New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Sharing Type *</label>
              <select
                className="form-input"
                value={formData.sharing_type}
                onChange={(e) => handleChange('sharing_type', e.target.value)}
              >
                <option value="lend">Lend (Free)</option>
                <option value="sell">Sell</option>
                <option value="exchange">Exchange</option>
              </select>
            </div>

            {formData.sharing_type === 'sell' && (
              <div className="form-group">
                <label className="form-label">Price ($)</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.price}
                  onChange={(e) => handleChange('price', e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Location</label>
            <input
              type="text"
              className="form-input"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="Where can they find you?"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Images</label>
            <input
              type="file"
              className="form-input"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
            />
            {errors.images && <span className="error-text">{errors.images}</span>}
            <div className="image-previews">
              {imagePreviewUrls.map((url, index) => (
                <div key={index} className="image-preview">
                  <img src={url} alt={`Preview ${index + 1}`} />
                  <button 
                    type="button" 
                    className="remove-image-btn"
                    onClick={() => removeImage(index)}
                  >
                    <Icon name="x" size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {errors.general && (
            <div className="error-message">
              <Icon name="alert-circle" size={16} />
              {errors.general}
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading && <Icon name="loader" size={16} className="spinning" />}
              {loading ? 'Adding...' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// My Requests Component
const MyRequests = ({ requests }) => {
  const [requestList, setRequestList] = useState([]);
  const { apiCall, loading } = useApi();
  const { showError, showSuccess } = useToast();

  useEffect(() => {
    // Always fetch requests from API, don't rely on props
    const fetchRequests = async () => {
      console.log('MyRequests: Starting to fetch requests...');
      try {
        const response = await apiCall('/api/transactions/my-requests');
        console.log('MyRequests API response:', response);
        console.log('MyRequests transactions:', response.data?.transactions);
        setRequestList(response.data?.transactions || []);
      } catch (error) {
        console.error('MyRequests: Failed to fetch requests:', error);
        setRequestList([]);
      }
    };
    
    fetchRequests();
  }, []); // Remove requests dependency

  const cancelRequest = async (requestId) => {
    try {
      await apiCall(`/api/transactions/${requestId}/cancel`, { method: 'PATCH' });
      setRequestList(prev => prev.filter(r => r.transaction_id !== requestId));
      showSuccess('Request cancelled successfully!');
    } catch (error) {
      showError(error.message || 'Failed to cancel request');
    }
  };

  return (
    <div className="my-requests">
      <h1 className="page-title">My Requests</h1>
      
      {loading ? (
        <div className="loading-placeholder">Loading your requests...</div>
      ) : !Array.isArray(requestList) || requestList.length === 0 ? (
        <div className="empty-state">
          <Icon name="inbox" size={48} />
          <h3>No Requests Yet</h3>
          <p>Start browsing items to make your first request!</p>
        </div>
      ) : (
        <div className="requests-list">
          {requestList.map(request => (
            <RequestCard 
              key={request.transaction_id} 
              request={request} 
              onCancel={() => cancelRequest(request.transaction_id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Request Card Component
const RequestCard = ({ request, onCancel }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'orange';
      case 'approved': return 'green';
      case 'rejected': return 'red';
      case 'completed': return 'blue';
      default: return 'gray';
    }
  };

  return (
    <div className="request-card">
      <div className="request-header">
        <h3>{request.item_name}</h3>
        <span className={`status-badge ${getStatusColor(request.transaction_status)}`}>
          {request.transaction_status}
        </span>
      </div>
      
      <div className="request-details">
        <p><strong>Owner:</strong> {request.lender_name || request.owner_name}</p>
        <p><strong>Requested:</strong> {new Date(request.date_created).toLocaleDateString()}</p>
        {request.notes && <p><strong>Message:</strong> {request.notes}</p>}
        {request.price && <p><strong>Price:</strong> ${request.price}</p>}
      </div>
      
      <div className="request-actions">
        {request.transaction_status === 'pending' && (
          <button 
            className="btn btn-secondary" 
            onClick={onCancel}
          >
            Cancel Request
          </button>
        )}
        {request.transaction_status === 'approved' && (
          <button className="btn btn-primary">
            Contact Owner
          </button>
        )}
      </div>
    </div>
  );
};

// Payments Component
const Payments = () => {
  const [transactions, setTransactions] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const { apiCall, loading } = useApi();

  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        const [transactionsResponse, methodsResponse] = await Promise.all([
          apiCall('/api/transactions/payments'),
          apiCall('/api/payments/methods')
        ]);
        setTransactions(Array.isArray(transactionsResponse.data) ? transactionsResponse.data : []);
        setPaymentMethods(Array.isArray(methodsResponse.data) ? methodsResponse.data : []);
      } catch (error) {
        console.error('Failed to fetch payment data:', error);
        setTransactions([]);
        setPaymentMethods([]);
      }
    };

    fetchPaymentData();
  }, []);

  return (
    <div className="payments">
      <h1 className="page-title">Payments & Earnings</h1>
      
      <div className="payment-summary">
        <div className="summary-card">
          <h3>Total Earnings</h3>
          <div className="amount">$0.00</div>
        </div>
        <div className="summary-card">
          <h3>Pending Payments</h3>
          <div className="amount">$0.00</div>
        </div>
        <div className="summary-card">
          <h3>This Month</h3>
          <div className="amount">$0.00</div>
        </div>
      </div>

      <div className="payment-sections">
        <section className="recent-transactions">
          <h2>Recent Transactions</h2>
          {loading ? (
            <div className="loading-placeholder">Loading transactions...</div>
          ) : !Array.isArray(transactions) || transactions.length === 0 ? (
            <div className="empty-state">
              <Icon name="credit-card" size={48} />
              <h3>No Transactions Yet</h3>
              <p>Your payment history will appear here once you start selling items.</p>
            </div>
          ) : (
            <div className="transactions-list">
              {transactions.map(transaction => (
                <TransactionCard key={transaction.id} transaction={transaction} />
              ))}
            </div>
          )}
        </section>

        <section className="payment-methods">
          <h2>Payment Methods</h2>
          <p>Manage your payment methods for receiving payments.</p>
          <button className="btn btn-primary">
            <Icon name="plus" size={16} />
            Add Payment Method
          </button>
        </section>
      </div>
    </div>
  );
};

// Transaction Card Component
const TransactionCard = ({ transaction }) => (
  <div className="transaction-card">
    <div className="transaction-info">
      <h4>{transaction.item_name}</h4>
      <p>with {transaction.other_user_name}</p>
      <span className="transaction-date">
        {new Date(transaction.created_at).toLocaleDateString()}
      </span>
    </div>
    <div className="transaction-amount">
      <span className={transaction.type === 'incoming' ? 'positive' : 'negative'}>
        {transaction.type === 'incoming' ? '+' : '-'}${transaction.amount}
      </span>
    </div>
  </div>
);

// Admin Users Component
const AdminUsers = ({ users }) => {
  const [filteredUsers, setFilteredUsers] = useState(users || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const { apiCall, loading } = useApi();
  const { showError, showSuccess } = useToast();

  useEffect(() => {
    if (!Array.isArray(users)) return;
    
    let filtered = users.filter(user => 
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filterRole) {
      filtered = filtered.filter(user => user.role === filterRole);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, filterRole]);

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      await apiCall(`/api/admin/users/${userId}/toggle-status`, { 
        method: 'PATCH',
        body: JSON.stringify({ active: !currentStatus })
      });
      showSuccess(`User status ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
      // Refresh data would happen here if there was a refresh function
    } catch (error) {
      showError(error.message || 'Failed to toggle user status');
      console.error('Failed to toggle user status:', error);
    }
  };

  return (
    <div className="admin-users">
      <h1 className="page-title">User Management</h1>
      
      <div className="admin-controls">
        <div className="search-bar">
          <Icon name="search" size={20} />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select 
          value={filterRole} 
          onChange={(e) => setFilterRole(e.target.value)}
          className="role-filter"
        >
          <option value="">All Roles</option>
          <option value="student">Students</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {loading ? (
        <div className="loading-placeholder">Loading users...</div>
      ) : !Array.isArray(filteredUsers) || filteredUsers.length === 0 ? (
        <div className="empty-state">
          <Icon name="users" size={48} />
          <h3>No Users Found</h3>
          <p>No users match your search criteria.</p>
        </div>
      ) : (
        <div className="users-table">
          <div className="table-header">
            <span>User</span>
            <span>Role</span>
            <span>Campus</span>
            <span>Items</span>
            <span>Status</span>
            <span>Actions</span>
          </div>
          
          {filteredUsers.map(user => (
            <AdminUserRow 
              key={user.user_id} 
              user={user} 
              onToggleStatus={toggleUserStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Admin User Row Component
const AdminUserRow = ({ user, onToggleStatus }) => (
  <div className="user-row">
    <div className="user-info">
      <div className="user-avatar">
        {user.full_name.charAt(0).toUpperCase()}
      </div>
      <div>
        <div className="user-name">{user.full_name}</div>
        <div className="user-email">{user.email}</div>
      </div>
    </div>
    
    <span className={`role-badge ${user.role}`}>
      {user.role}
    </span>
    
    <span className="user-campus">{user.campus}</span>
    
    <span className="user-items">{user.items_count || 0}</span>
    
    <span className={`status-indicator ${user.active ? 'active' : 'inactive'}`}>
      {user.active ? 'Active' : 'Inactive'}
    </span>
    
    <div className="user-actions">
      <button 
        className="action-btn"
        onClick={() => onToggleStatus(user.user_id, user.active)}
      >
        <Icon name={user.active ? 'user-minus' : 'user-plus'} size={16} />
      </button>
    </div>
  </div>
);

// Admin Items Component
const AdminItems = ({ items }) => {
  const [filteredItems, setFilteredItems] = useState(items || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    if (!items) return;
    
    let filtered = items.filter(item => 
      item.item_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (statusFilter) {
      filtered = filtered.filter(item => item.availability_status === statusFilter);
    }

    setFilteredItems(filtered);
  }, [items, searchTerm, statusFilter]);

  return (
    <div className="admin-items">
      <h1 className="page-title">Items & Inventory</h1>
      
      <div className="admin-controls">
        <div className="search-bar">
          <Icon name="search" size={20} />
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          className="status-filter"
        >
          <option value="">All Status</option>
          <option value="available">Available</option>
          <option value="borrowed">Borrowed</option>
          <option value="unavailable">Unavailable</option>
        </select>
      </div>

      <div className="admin-items-grid">
        {filteredItems.map(item => (
          <AdminItemCard key={item.item_id} item={item} />
        ))}
      </div>
    </div>
  );
};

// Admin Item Card Component
const AdminItemCard = ({ item }) => (
  <div className="admin-item-card">
    <div className="item-image">
      <img 
        src={item.image_url || 'https://via.placeholder.com/200x150?text=No+Image'} 
        alt={item.item_name}
      />
      <span className={`item-status ${item.availability_status}`}>
        {item.availability_status}
      </span>
    </div>
    
    <div className="item-details">
      <h4 className="item-name">{item.item_name}</h4>
      <p className="item-owner">Owner: {item.owner_name}</p>
      
      <div className="item-stats-admin">
        <span><Icon name="eye" size={14} /> {item.views || 0} views</span>
        <span><Icon name="message-circle" size={14} /> {item.requests || 0} requests</span>
      </div>
      
      <div className="item-meta">
        <span className="item-condition">{item.condition}</span>
        <span className="item-type">{item.sharing_type}</span>
        {item.price && <span className="item-price">${item.price}</span>}
      </div>
    </div>
  </div>
);

// Admin Transactions Component
const AdminTransactions = ({ transactions }) => {
  const [filteredTransactions, setFilteredTransactions] = useState(transactions || []);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    if (!transactions) return;
    
    let filtered = transactions;
    if (statusFilter) {
      filtered = transactions.filter(t => t.status === statusFilter);
    }
    
    setFilteredTransactions(filtered);
  }, [transactions, statusFilter]);

  return (
    <div className="admin-transactions">
      <h1 className="page-title">Transaction Management</h1>
      
      <div className="admin-controls">
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          className="status-filter"
        >
          <option value="">All Transactions</option>
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="transactions-table">
        <div className="table-header">
          <span>Item</span>
          <span>Borrower</span>
          <span>Owner</span>
          <span>Date</span>
          <span>Status</span>
          <span>Actions</span>
        </div>
        
        {filteredTransactions.map(transaction => (
          <AdminTransactionRow key={transaction.transaction_id} transaction={transaction} />
        ))}
      </div>
    </div>
  );
};

// Admin Transaction Row Component
const AdminTransactionRow = ({ transaction }) => (
  <div className="transaction-row">
    <div className="transaction-item">
      <strong>{transaction.item_name}</strong>
    </div>
    
    <div className="transaction-user">{transaction.borrower_name}</div>
    <div className="transaction-user">{transaction.owner_name}</div>
    
    <div className="transaction-date">
      {transaction.created_at ? formatTimestamp(transaction.created_at) : 'Unknown date'}
    </div>
    
    <span className={`status-badge ${transaction.status}`}>
      {transaction.status}
    </span>
    
    <div className="transaction-actions">
      <button className="view-btn">
        <Icon name="eye" size={16} />
        View
      </button>
    </div>
  </div>
);

// Admin Analytics Component
const AdminAnalytics = ({ data }) => {
  if (!data) return <div className="loading-placeholder">Loading analytics...</div>;

  return (
    <div className="admin-analytics">
      <h1 className="page-title">Analytics & Insights</h1>
      
      <div className="analytics-grid">
        <div className="analytics-card">
          <h3>Recent Activity</h3>
          <ActivityChart data={data.recentActivity || []} />
        </div>
        
        <div className="analytics-card">
          <h3>Transaction Overview</h3>
          <TransactionChart data={data.transactionStats || {}} />
        </div>
        
        <div className="analytics-card">
          <h3>User Growth</h3>
          <div className="chart-container">
            <div className="growth-metric">
              <div className="growth-number">
                +{data.stats?.newUsersThisMonth || 0}
              </div>
              <div className="growth-label">New Users This Month</div>
              <div className="growth-trend">
                <Icon name="trending-up" size={16} />
                <span>+{data.stats?.userGrowthRate || 0}%</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="analytics-card">
          <h3>Popular Items</h3>
          <div className="popular-items-list">
            {data.popularItems?.slice(0, 5).map((item, index) => (
              <div key={item.item_id} className="popular-item">
                <span className="item-rank">#{index + 1}</span>
                <span className="item-name">{item.item_name}</span>
                <span className="item-requests">{item.request_count} requests</span>
              </div>
            )) || (
              <div className="empty-state-small">
                <Icon name="package" size={24} />
                <p>No popular items data</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="analytics-summary">
        <h3>Key Metrics</h3>
        <div className="metrics-grid">
          <div className="metric-item">
            <span className="metric-value">{data.stats?.averageResponseTime || '0'}h</span>
            <span className="metric-label">Avg Response Time</span>
          </div>
          <div className="metric-item">
            <span className="metric-value">{data.stats?.completionRate || '0'}%</span>
            <span className="metric-label">Completion Rate</span>
          </div>
          <div className="metric-item">
            <span className="metric-value">${data.stats?.totalValueShared || '0'}</span>
            <span className="metric-label">Total Value Shared</span>
          </div>
          <div className="metric-item">
            <span className="metric-value">{data.stats?.activeUsers || '0'}</span>
            <span className="metric-label">Active Users</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Activity Chart Component
const ActivityChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="chart-placeholder">
        <Icon name="bar-chart" size={48} />
        <p>No recent activity data available</p>
      </div>
    );
  }

  return (
    <div className="activity-chart">
      {data.slice(0, 5).map((activity, index) => (
        <div key={activity.id} className="activity-item">
          <div className="activity-icon">
            <Icon name={getActivityIcon(activity.activity_type)} size={20} />
          </div>
          <div className="activity-details">
            <div className="activity-title">
              {activity.user_name} {getActivityText(activity.status)}
            </div>
            <div className="activity-item-name">{activity.item_name}</div>
            <div className="activity-timestamp">
              {formatTimestamp(activity.timestamp)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Transaction Chart Component  
const TransactionChart = ({ data }) => {
  if (!data) {
    return (
      <div className="chart-placeholder">
        <Icon name="pie-chart" size={48} />
        <p>No transaction data available</p>
      </div>
    );
  }

  const total = data.total || 0;
  const pending = data.pending || 0;
  const approved = data.approved || 0;
  const completed = data.completed || 0;
  const rejected = data.rejected || 0;

  return (
    <div className="transaction-chart">
      <div className="chart-stats">
        <div className="stat-item">
          <span className="stat-color pending"></span>
          <span>Pending: {pending}</span>
        </div>
        <div className="stat-item">
          <span className="stat-color approved"></span>
          <span>Approved: {approved}</span>
        </div>
        <div className="stat-item">
          <span className="stat-color completed"></span>
          <span>Completed: {completed}</span>
        </div>
        <div className="stat-item">
          <span className="stat-color rejected"></span>
          <span>Rejected: {rejected}</span>
        </div>
      </div>
      <div className="chart-total">
        <div className="total-number">{total}</div>
        <div className="total-label">Total Transactions</div>
      </div>
    </div>
  );
};

// Helper functions for activities
const getActivityIcon = (type) => {
  switch (type) {
    case 'transaction': return 'exchange';
    case 'user': return 'user-plus';
    case 'item': return 'package';
    default: return 'activity';
  }
};

const getActivityText = (status) => {
  switch (status) {
    case 'pending': return 'requested';
    case 'approved': return 'was approved for';
    case 'completed': return 'completed borrowing';
    case 'rejected': return 'was rejected for';
    default: return 'interacted with';
  }
};

const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'Unknown time';
  
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return 'Invalid date';
  
  const now = new Date();
  const diffMinutes = Math.floor((now - date) / (1000 * 60));
  
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  
  // For older dates, show formatted date
  return date.toLocaleDateString();
};

// Registration Chart Component (placeholder)
const RegistrationChart = ({ data }) => (
  <div className="chart-placeholder">
    <Icon name="users" size={48} />
    <p>Registration trends</p>
    <small>Chart implementation would go here</small>
  </div>
);

// Recent Activities List Component
const RecentActivitiesList = ({ activities }) => (
  <div className="recent-activities-admin">
    <h3>Recent System Activities</h3>
    <div className="activities-list">
      {activities?.slice(0, 10).map((activity, index) => (
        <div key={index} className="admin-activity-item">
          <div className="activity-icon">
            <Icon name={activity.icon || 'activity'} size={16} />
          </div>
          <div className="activity-content">
            <p className="activity-text">{activity.description}</p>
            <span className="activity-meta">
              {activity.user_name} • {new Date(activity.created_at).toLocaleString()}
            </span>
          </div>
        </div>
      )) || (
        <div className="no-activities">
          <Icon name="inbox" size={24} />
          <p>No recent activities</p>
        </div>
      )}
    </div>
  </div>
);

// Recent Activity Component
const RecentActivity = ({ activities }) => (
  <div className="recent-activity">
    <h3>Recent Activity</h3>
    <div className="activity-list">
      {activities?.slice(0, 5).map((activity, index) => (
        <div key={index} className="activity-item">
          <div className="activity-icon">
            <Icon name={activity.icon} size={16} />
          </div>
          <div className="activity-content">
            <p className="activity-text">{activity.text}</p>
            <span className="activity-time">{activity.time}</span>
          </div>
        </div>
      )) || <p className="no-activity">No recent activity</p>}
    </div>
  </div>
);

// Received Requests Component
const ReceivedRequests = () => {
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingRequest, setProcessingRequest] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const { apiCall } = useApi();
  const { showError, showSuccess } = useToast();

  useEffect(() => {
    fetchReceivedRequests();
  }, []);

  const fetchReceivedRequests = async () => {
    try {
      setLoading(true);
      const response = await apiCall('/api/transactions/received');
      console.log('Received requests API response:', response);
      setReceivedRequests(response.data?.transactions || []);
    } catch (error) {
      console.error('Failed to fetch received requests:', error);
      showError('Failed to load received requests');
      setReceivedRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (request) => {
    // For sell transactions, show payment modal first
    if (request.sharing_type === 'sell') {
      setSelectedRequest(request);
      setShowPaymentModal(true);
      return;
    }

    // For lend/exchange, accept directly
    try {
      setProcessingRequest(request.transaction_id);
      const response = await apiCall(`/api/transactions/${request.transaction_id}/accept`, {
        method: 'POST'
      });
      
      if (response.success) {
        setReceivedRequests(prev => 
          prev.map(req => 
            req.transaction_id === request.transaction_id 
              ? { ...req, transaction_status: 'approved' }
              : req
          )
        );
        showSuccess('Request accepted successfully!');
      }
    } catch (error) {
      console.error('Failed to accept request:', error);
      showError('Failed to accept request');
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleRejectRequest = async (requestId) => {
    if (!confirm('Are you sure you want to reject this request?')) return;
    
    try {
      setProcessingRequest(requestId);
      await apiCall(`/api/transactions/${requestId}/reject`, { method: 'POST' });
      
      setReceivedRequests(prev => 
        prev.map(req => 
          req.transaction_id === requestId 
            ? { ...req, transaction_status: 'rejected' }
            : req
        )
      );
      showSuccess('Request rejected');
    } catch (error) {
      console.error('Failed to reject request:', error);
      showError('Failed to reject request');
    } finally {
      setProcessingRequest(null);
    }
  };

  const handlePaymentSuccess = (paymentData) => {
    // Update the request status after successful payment
    setReceivedRequests(prev => 
      prev.map(req => 
        req.transaction_id === selectedRequest.transaction_id 
          ? { ...req, transaction_status: 'approved', payment_status: 'completed' }
          : req
      )
    );
    setShowPaymentModal(false);
    setSelectedRequest(null);
    showSuccess('Payment processed and request accepted!');
  };

  if (loading) {
    return (
      <div className="received-requests">
        <h1 className="page-title">Received Requests</h1>
        <div className="loading-placeholder">
          <Icon name="loader" className="spinning" size={48} />
          <p>Loading received requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="received-requests">
      <h1 className="page-title">Received Requests</h1>
      <p className="page-subtitle">Manage requests from other students for your items</p>
      
      {receivedRequests.length === 0 ? (
        <div className="empty-state">
          <Icon name="inbox" size={48} />
          <h3>No Requests Yet</h3>
          <p>When students request your items, they'll appear here for you to review.</p>
        </div>
      ) : (
        <div className="requests-list">
          {receivedRequests.map(request => (
            <ReceivedRequestCard 
              key={request.transaction_id}
              request={request}
              onAccept={() => handleAcceptRequest(request)}
              onReject={() => handleRejectRequest(request.transaction_id)}
              isProcessing={processingRequest === request.transaction_id}
            />
          ))}
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedRequest && (
        <PaymentModal 
          request={selectedRequest}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedRequest(null);
          }}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

// Received Request Card Component
const ReceivedRequestCard = ({ request, onAccept, onReject, isProcessing }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'orange';
      case 'approved': return 'green'; 
      case 'rejected': return 'red';
      case 'completed': return 'blue';
      default: return 'gray';
    }
  };

  const isPending = request.transaction_status === 'pending';
  const isApproved = request.transaction_status === 'approved';
  const isRejected = request.transaction_status === 'rejected';

  return (
    <div className={`received-request-card ${request.transaction_status}`}>
      <div className="request-header">
        <div className="request-item-info">
          <h3>{request.item_name}</h3>
          <span className={`status-badge ${getStatusColor(request.transaction_status)}`}>
            {request.transaction_status.toUpperCase()}
          </span>
        </div>
        <div className="request-value">
          <span className="sharing-type">{request.sharing_type}</span>
          {request.price && <span className="price">${request.price}</span>}
        </div>
      </div>
      
      <div className="request-details">
        <div className="requester-info">
          <Icon name="user" size={16} />
          <span className="requester-name">{request.requester_name}</span>
          <span className="request-date">
            • {new Date(request.date_created).toLocaleDateString()}
          </span>
        </div>
        
        {request.notes && (
          <div className="request-message">
            <Icon name="message-circle" size={16} />
            <p>"{request.notes}"</p>
          </div>
        )}
        
        <div className="request-meta">
          <span className="item-condition">
            <Icon name="package" size={14} />
            {request.condition}
          </span>
          {request.campus && (
            <span className="campus">
              <Icon name="map-pin" size={14} />
              {request.campus}
            </span>
          )}
        </div>

        {/* Contact Information - Only show for approved requests */}
        {isApproved && (
          <div className="contact-info">
            <h4 className="contact-title">
              <Icon name="phone" size={16} />
              Contact Information
            </h4>
            <div className="contact-details">
              <div className="contact-item">
                <Icon name="mail" size={14} />
                <span>{request.borrower_email}</span>
              </div>
              {request.borrower_phone && (
                <div className="contact-item">
                  <Icon name="phone" size={14} />
                  <span>{request.borrower_phone}</span>
                </div>
              )}
              {request.dorm && (
                <div className="contact-item">
                  <Icon name="home" size={14} />
                  <span>{request.dorm}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Action buttons for pending requests */}
      {isPending && (
        <div className="request-actions">
          <button 
            className="btn btn-outline btn-reject" 
            onClick={onReject}
            disabled={isProcessing}
          >
            <Icon name="x" size={16} />
            Reject
          </button>
          <button 
            className="btn btn-primary" 
            onClick={onAccept}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Icon name="loader" size={16} className="spinning" />
                Processing...
              </>
            ) : (
              <>
                <Icon name="check" size={16} />
                {request.sharing_type === 'sell' ? 'Accept & Process Payment' : 'Accept Request'}
              </>
            )}
          </button>
        </div>
      )}
      
      {/* Status notices */}
      {isApproved && (
        <div className="status-notice approved">
          <Icon name="check-circle" size={16} />
          <span>Request approved - Borrower has your contact details</span>
        </div>
      )}

      {isRejected && (
        <div className="status-notice rejected">
          <Icon name="x-circle" size={16} />
          <span>Request rejected on {new Date(request.date_created).toLocaleDateString()}</span>
        </div>
      )}

      {request.transaction_status === 'completed' && (
        <div className="status-notice completed">
          <Icon name="check-circle-2" size={16} />
          <span>Transaction completed successfully</span>
        </div>
      )}
    </div>
  );
};

// Payment Modal Component
const PaymentModal = ({ request, onClose, onSuccess }) => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    phoneNumber: '',
    accountNumber: ''
  });
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState(1); // 1: Select method, 2: Enter details, 3: Confirm
  const { apiCall } = useApi();
  const { showError } = useToast();

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const response = await apiCall('/api/transactions/payments');
      setPaymentMethods(response.data || []);
    } catch (error) {
      console.error('Failed to fetch payment methods:', error);
    }
  };

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
    setStep(2);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    
    try {
      // Process payment
      const paymentResponse = await apiCall('/api/transactions/payments/process', {
        method: 'POST',
        body: JSON.stringify({
          transactionId: request.transaction_id,
          amount: 25, // Default amount since items don't have prices
          paymentMethod: selectedMethod,
          paymentData: paymentData
        })
      });

      if (paymentResponse.success) {
        setStep(3);
        // Auto-accept the request after successful payment
        setTimeout(() => {
          onSuccess(paymentResponse.data);
        }, 2000);
      }
    } catch (error) {
      console.error('Payment failed:', error);
      showError('Payment processing failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const renderPaymentForm = () => {
    switch (selectedMethod.id) {
      case 1: // Credit/Debit Card
        return (
          <div className="payment-form">
            <div className="form-group">
              <label>Card Number</label>
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                value={paymentData.cardNumber}
                onChange={(e) => setPaymentData(prev => ({ ...prev, cardNumber: e.target.value }))}
                maxLength="19"
              />
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Expiry Date</label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  value={paymentData.expiryDate}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, expiryDate: e.target.value }))}
                  maxLength="5"
                />
              </div>
              <div className="form-group">
                <label>CVV</label>
                <input
                  type="text"
                  placeholder="123"
                  value={paymentData.cvv}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, cvv: e.target.value }))}
                  maxLength="3"
                />
              </div>
            </div>
          </div>
        );
        
      case 2: // MTN MoMo
      case 3: // Airtel Money
        return (
          <div className="payment-form">
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                placeholder="+250 7XX XXX XXX"
                value={paymentData.phoneNumber}
                onChange={(e) => setPaymentData(prev => ({ ...prev, phoneNumber: e.target.value }))}
              />
            </div>
            <div className="momo-notice">
              <Icon name="info" size={16} />
              <p>You will receive a prompt on your phone to complete the payment</p>
            </div>
          </div>
        );
        
      case 4: // Bank Transfer
        return (
          <div className="payment-form">
            <div className="form-group">
              <label>Account Number</label>
              <input
                type="text"
                placeholder="Your bank account number"
                value={paymentData.accountNumber}
                onChange={(e) => setPaymentData(prev => ({ ...prev, accountNumber: e.target.value }))}
              />
            </div>
            <div className="bank-notice">
              <Icon name="info" size={16} />
              <p>Transfer processing may take 1-3 business days</p>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Process Payment</h2>
          <button className="modal-close" onClick={onClose}>
            <Icon name="x" size={20} />
          </button>
        </div>

        <div className="payment-content">
          {step === 1 && (
            <div className="payment-step">
              <div className="payment-summary">
                <h3>Payment for: {request.item_name}</h3>
                <div className="amount-display">
                  <span className="amount">${request.price}</span>
                  <span className="currency">USD</span>
                </div>
                <p className="buyer">From: {request.requester_name}</p>
              </div>
              
              <div className="payment-methods">
                <h4>Select Payment Method</h4>
                {paymentMethods.map(method => (
                  <button
                    key={method.id}
                    className="payment-method-btn"
                    onClick={() => handleMethodSelect(method)}
                  >
                    <Icon name={method.icon} size={24} />
                    <div className="method-info">
                      <span className="method-name">{method.name}</span>
                      <span className="method-desc">{method.description}</span>
                    </div>
                    <Icon name="chevron-right" size={16} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="payment-step">
              <div className="step-header">
                <button className="back-btn" onClick={() => setStep(1)}>
                  <Icon name="arrow-left" size={16} />
                  Back
                </button>
                <h4>{selectedMethod.name}</h4>
              </div>
              
              <form onSubmit={handlePaymentSubmit}>
                {renderPaymentForm()}
                
                <div className="payment-summary-small">
                  <div className="summary-line">
                    <span>Item</span>
                    <span>{request.item_name}</span>
                  </div>
                  <div className="summary-line">
                    <span>Amount</span>
                    <span>${request.price}</span>
                  </div>
                  <div className="summary-line total">
                    <span>Total</span>
                    <span>${request.price}</span>
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  className="btn btn-primary btn-full"
                  disabled={processing}
                >
                  {processing ? (
                    <>
                      <Icon name="loader" size={16} className="spinning" />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <Icon name="credit-card" size={16} />
                      Process Payment ${request.price}
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {step === 3 && (
            <div className="payment-step success">
              <div className="success-icon">
                <Icon name="check-circle" size={64} />
              </div>
              <h3>Payment Successful!</h3>
              <p>Your payment of ${request.price} has been processed successfully.</p>
              <p>The request has been automatically approved.</p>
              
              <div className="success-details">
                <div className="detail-line">
                  <span>Transaction ID:</span>
                  <span>TXN-{Date.now()}</span>
                </div>
                <div className="detail-line">
                  <span>Payment Method:</span>
                  <span>{selectedMethod.name}</span>
                </div>
                <div className="detail-line">
                  <span>Amount:</span>
                  <span>${request.price}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Quick Actions Component
const QuickActions = () => {
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddItem = () => {
    setShowAddForm(true);
  };

  const handleBrowseItems = () => {
    // This would trigger a tab change to browse
    const event = new CustomEvent('changeTab', { detail: 'browse' });
    window.dispatchEvent(event);
  };

  const handleJoinClassroom = () => {
    // This would trigger a tab change to classrooms
    const event = new CustomEvent('changeTab', { detail: 'classrooms' });
    window.dispatchEvent(event);
  };

  const handleMessages = () => {
    // This would open messages/notifications
    alert('Messages feature coming soon!');
  };

  return (
    <div className="quick-actions">
      <h3>Quick Actions</h3>
      <div className="actions-grid">
        <button className="action-card" onClick={handleAddItem}>
          <Icon name="plus" size={24} />
          <span>Add Item</span>
        </button>
        <button className="action-card" onClick={handleBrowseItems}>
          <Icon name="search" size={24} />
          <span>Browse Items</span>
        </button>
        <button className="action-card" onClick={handleJoinClassroom}>
          <Icon name="users" size={24} />
          <span>Join Classroom</span>
        </button>
        <button className="action-card" onClick={handleMessages}>
          <Icon name="message-circle" size={24} />
          <span>Messages</span>
        </button>
      </div>

      {showAddForm && (
        <AddItemModal 
          onClose={() => setShowAddForm(false)}
          onSuccess={() => setShowAddForm(false)}
        />
      )}
    </div>
  );
};

// Main Application Component
const CampusConnectApp = () => {
  return <App />;
};

// Render the application
const root = document.getElementById('root');
if (root) {
  ReactDOM.render(
    React.createElement(ToastProvider, null,
      React.createElement(CampusConnectApp, null)
    ),
    root
  );
} else {
  console.error('Root element not found');
}
