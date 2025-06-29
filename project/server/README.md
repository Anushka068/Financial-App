# Financial Dashboard Server

Backend API server for the Financial Analytics Dashboard application.

## Features

- User authentication (login/register)
- JWT token-based authorization
- Dashboard data endpoints
- Transaction management
- Data export functionality
- User profile management
- Rate limiting and security middleware

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

3. Update the `.env` file with your configuration

4. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Dashboard
- `GET /api/dashboard/overview` - Get dashboard overview data
- `GET /api/dashboard/revenue` - Get revenue data
- `GET /api/dashboard/expenses` - Get expense data
- `GET /api/dashboard/profit-loss` - Get profit/loss data

### Transactions
- `GET /api/transactions` - Get user transactions (with pagination)
- `POST /api/transactions` - Create new transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Export
- `GET /api/export/transactions/csv` - Export transactions as CSV
- `GET /api/export/dashboard/json` - Export dashboard data as JSON
- `POST /api/export/report` - Generate custom report

### Users
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users` - Get all users (admin only)

## Default Test Credentials

- Email: `john@example.com`
- Password: `password123`

## Environment Variables

- `PORT` - Server port (default: 3001)
- `JWT_SECRET` - Secret key for JWT tokens
- `NODE_ENV` - Environment (development/production)

## Security Features

- Rate limiting (100 requests per 15 minutes per IP)
- JWT token authentication
- Password hashing with bcrypt
- Input validation
- CORS configuration
- Error handling middleware