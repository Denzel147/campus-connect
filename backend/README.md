# Campus Connect Backend

This is the backend API for the CampusConnect book lending platform.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Configure your database and other environment variables in `.env`

4. Run database migrations:
```bash
npm run db:migrate
```

5. Seed the database (optional):
```bash
npm run db:seed
```

6. Start the development server:
```bash
npm run dev
```

## API Documentation

Once the server is running, visit `http://localhost:3001/api-docs` for Swagger documentation.

## Database Schema

The application uses PostgreSQL with the following main entities:
- Users (students)
- Categories (book categories)
- Items (books)
- Transactions (lending/borrowing)
- Reviews
- Notifications

## Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data
