-- CampusConnect Database Schema
-- University Book Lending Platform

-- Drop existing tables if they exist
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS items CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    phone_number VARCHAR(20),
    institution VARCHAR(255),
    department VARCHAR(255),
    student_id VARCHAR(100),
    profile_picture TEXT,
    verification_status VARCHAR(50) DEFAULT 'unverified',
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_lends INTEGER DEFAULT 0,
    total_borrows INTEGER DEFAULT 0,
    account_status VARCHAR(20) DEFAULT 'active',
    date_joined TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_rating CHECK (rating >= 0 AND rating <= 5)
);

-- Categories table
CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Items table
CREATE TABLE items (
    item_id SERIAL PRIMARY KEY,
    owner_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES categories(category_id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    condition VARCHAR(50),
    availability_status VARCHAR(20) DEFAULT 'available',
    location VARCHAR(255),
    lending_duration_days INTEGER DEFAULT 7,
    deposit_amount DECIMAL(10,2) DEFAULT 0.00,
    images TEXT[],
    tags TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_availability CHECK (availability_status IN ('available', 'borrowed', 'reserved', 'unavailable'))
);

-- Transactions table
CREATE TABLE transactions (
    transaction_id SERIAL PRIMARY KEY,
    item_id INTEGER NOT NULL REFERENCES items(item_id) ON DELETE CASCADE,
    lender_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    borrower_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    transaction_status VARCHAR(20) DEFAULT 'pending',
    start_date DATE,
    expected_return_date DATE,
    actual_return_date DATE,
    deposit_paid DECIMAL(10,2) DEFAULT 0.00,
    deposit_returned BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_transaction_status CHECK (transaction_status IN ('pending', 'active', 'completed', 'cancelled', 'overdue'))
);

-- Reviews table
CREATE TABLE reviews (
    review_id SERIAL PRIMARY KEY,
    transaction_id INTEGER NOT NULL REFERENCES transactions(transaction_id) ON DELETE CASCADE,
    reviewer_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    reviewee_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    rating INTEGER NOT NULL,
    review_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_review_rating CHECK (rating >= 1 AND rating <= 5)
);

-- Notifications table
CREATE TABLE notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    related_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_items_owner ON items(owner_id);
CREATE INDEX idx_items_category ON items(category_id);
CREATE INDEX idx_items_status ON items(availability_status);
CREATE INDEX idx_transactions_item ON transactions(item_id);
CREATE INDEX idx_transactions_lender ON transactions(lender_id);
CREATE INDEX idx_transactions_borrower ON transactions(borrower_id);
CREATE INDEX idx_transactions_status ON transactions(transaction_status);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_reviews_transaction ON reviews(transaction_id);
CREATE INDEX idx_reviews_reviewee ON reviews(reviewee_id);

-- Insert default categories
INSERT INTO categories (category_name, description, icon) VALUES
('Books', 'Textbooks, novels, and reference materials', 'book'),
('Electronics', 'Laptops, tablets, calculators, and other electronic devices', 'laptop'),
('Lab Equipment', 'Scientific instruments and laboratory tools', 'flask-conical'),
('Sports Equipment', 'Sports gear, fitness equipment, and athletic accessories', 'dumbbell'),
('Musical Instruments', 'Guitars, keyboards, and other musical instruments', 'music'),
('Art Supplies', 'Painting materials, drawing tools, and craft supplies', 'palette'),
('Tools', 'Workshop tools, repair equipment, and hardware', 'wrench'),
('Other', 'Items that don''t fit into other categories', 'grid')
ON CONFLICT (category_name) DO NOTHING;
