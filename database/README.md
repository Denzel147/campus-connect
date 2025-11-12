# CampusConnect Database

This directory contains the database schema and related files for the CampusConnect application.

## Files

- `schema.sql` - Complete database schema including all tables, indexes, and initial data

## Database Setup

### Prerequisites

- PostgreSQL 12 or higher installed
- Access to a PostgreSQL server

### Setup Instructions

1. Create the database:
```bash
createdb campus_connect_db
```

2. Run the schema file:
```bash
psql -d campus_connect_db -f schema.sql
```

3. Verify the tables were created:
```bash
psql -d campus_connect_db -c "\dt"
```

## Database Structure

### Tables

- **users** - User accounts and profiles
- **categories** - Item categories (Books, Electronics, etc.)
- **items** - Lending items posted by users
- **transactions** - Borrowing transactions between users
- **reviews** - User reviews and ratings
- **notifications** - System notifications for users

### Relationships

- Items belong to Users (owner) and Categories
- Transactions link Items with Lenders and Borrowers
- Reviews are associated with Transactions
- Notifications belong to Users

## Environment Configuration

Make sure to configure the database connection in the backend `.env` file:

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=campus_connect_db
DB_USER=postgres
DB_PASSWORD=your_password_here
```
