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
  const [currentTab, setCurrentTab] = useState('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState(2);

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
      alert('Please fill in all required fields');
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

    alert('Book listed successfully!');
    
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

  const filteredBooks = availableBooks.filter(book =>
    book.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const BrowseTab = () => (
    <div className="space-y-4">
      <div className="card">
        <div className="search-container">
          <Icon name="search" size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search for books..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="card">
        <h3 className="section-title">Available Books to Borrow</h3>
        {filteredBooks.length === 0 ? (
          <p className="empty-state">No books found matching your search.</p>
        ) : (
          <div className="book-list">
            {filteredBooks.map((book, index) => (
              <div key={index} className="book-item">
                <div className="book-item-content">
                  <Icon name="book-open" size={20} className="book-icon" />
                  <span className="book-title">{book}</span>
                </div>
                <button
                  onClick={() => alert(`Contact request sent for "${book}". The book owner will reach out to you soon!`)}
                  className="btn btn-primary btn-sm"
                >
                  Request
                </button>
              </div>
            ))}
          </div>
        )}
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

        <div className="form-container">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                Your Name <span className="required">*</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter your full name"
                value={lendForm.studentName}
                onChange={(e) => setLendForm({...lendForm, studentName: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Email <span className="required">*</span>
              </label>
              <input
                type="email"
                className="form-input"
                placeholder="your.email@university.edu"
                value={lendForm.email}
                onChange={(e) => setLendForm({...lendForm, email: e.target.value})}
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                className="form-input"
                placeholder="+234 800 000 0000"
                value={lendForm.phoneNumber}
                onChange={(e) => setLendForm({...lendForm, phoneNumber: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Department</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Computer Science"
                value={lendForm.department}
                onChange={(e) => setLendForm({...lendForm, department: e.target.value})}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              Book Title <span className="required">*</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter the book title"
              value={lendForm.bookTitle}
              onChange={(e) => setLendForm({...lendForm, bookTitle: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Book Condition</label>
            <select
              className="form-input"
              value={lendForm.condition}
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
              <label className="form-label">Available From</label>
              <input
                type="date"
                className="form-input"
                value={lendForm.availableFrom}
                onChange={(e) => setLendForm({...lendForm, availableFrom: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Available Until</label>
              <input
                type="date"
                className="form-input"
                value={lendForm.availableUntil}
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
      <header className="header">
        <div className="header-content">
          <div className="header-logo">
            <Icon name="book" size={32} />
            <h1 className="app-title">CampusConnect</h1>
          </div>
          <div className="notification-icon">
            <Icon name="bell" size={24} />
            {notifications > 0 && (
              <span className="notification-badge">{notifications}</span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {currentTab === 'browse' && <BrowseTab />}
        {currentTab === 'lend' && <LendBookTab />}
        {currentTab === 'profile' && <ProfileTab />}
      </main>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <div className="nav-content">
          <button
            onClick={() => setCurrentTab('browse')}
            className={`nav-item ${currentTab === 'browse' ? 'nav-item-active' : ''}`}
          >
            <Icon name="home" size={24} />
            <span className="nav-label">Browse Books</span>
          </button>
          <button
            onClick={() => setCurrentTab('lend')}
            className={`nav-item ${currentTab === 'lend' ? 'nav-item-active' : ''}`}
          >
            <Icon name="plus" size={24} />
            <span className="nav-label">Lend a Book</span>
          </button>
          <button
            onClick={() => setCurrentTab('profile')}
            className={`nav-item ${currentTab === 'profile' ? 'nav-item-active' : ''}`}
          >
            <Icon name="user" size={24} />
            <span className="nav-label">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

// Render the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<CampusConnect />);
