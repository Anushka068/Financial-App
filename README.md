# Financial Dashboard - Full Stack Application

A modern, responsive financial dashboard built with React, TypeScript, Node.js, and Express. This application provides comprehensive financial management features including transaction tracking, analytics, and reporting.

## 🚀 Features

### Frontend (React + TypeScript)
- **Modern UI/UX**: Dark theme with responsive design
- **Dashboard Overview**: KPI cards, charts, and recent transactions
- **Transaction Management**: Full CRUD operations with search and filtering
- **Analytics**: Revenue, expenses, and profit/loss analysis
- **Export Functionality**: CSV export with customizable columns
- **Real-time Search**: Search across all transaction fields
- **Responsive Design**: Works on desktop, tablet, and mobile

### Backend (Node.js + Express)
- **RESTful API**: Complete API for all operations
- **Authentication**: JWT-based authentication system
- **Data Management**: Sample data integration with transactions.json
- **Search & Filtering**: Advanced search across all columns
- **Export Services**: CSV and JSON export capabilities
- **Error Handling**: Comprehensive error handling and validation

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Recharts** for data visualization
- **Date-fns** for date manipulation

### Backend
- **Node.js** with Express
- **MongoDB** (with Mongoose models)
- **JWT** for authentication
- **CORS** enabled
- **CSV export** functionality

## 📁 Project Structure

```
project-financial/
├── project/
│   ├── src/                    # Frontend source code
│   │   ├── components/         # React components
│   │   ├── context/           # React context providers
│   │   ├── services/          # API services
│   │   └── main.tsx           # Entry point
│   ├── server/                # Backend source code
│   │   ├── routes/            # API routes
│   │   ├── models/            # Database models
│   │   ├── middleware/        # Express middleware
│   │   ├── data/              # Sample data
│   │   └── server.js          # Server entry point
│   ├── package.json           # Frontend dependencies
│   └── vite.config.ts         # Vite configuration
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd project-bolt-sb1-dkgxf71u
   ```

2. **Install Frontend Dependencies**
   ```bash
   cd project
   npm install
   ```

3. **Install Backend Dependencies**
   ```bash
   cd server
   npm install
   ```

### Running the Application

1. **Start the Backend Server**
   ```bash
   cd project/server
   npm start
   ```
   The backend will run on `http://localhost:3001`

2. **Start the Frontend Development Server**
   ```bash
   cd project
   npm run dev
   ```
   The frontend will run on `http://localhost:5173`

3. **Open your browser**
   Navigate to `http://localhost:5173` to view the application

## 📊 Features Overview

### Dashboard
- **KPI Cards**: Balance, Revenue, Expenses, and Savings
- **Interactive Charts**: Monthly revenue and expense trends
- **Recent Transactions**: Latest 5 transactions with user details
- **Quick Actions**: Navigation to different sections

### Transactions Management
- **Search & Filter**: Search across all columns (user_id, status, amount, date, etc.)
- **Real-time Search**: Instant results as you type
- **Advanced Filtering**: By type, category, date range
- **CRUD Operations**: Add, edit, delete transactions
- **Export**: CSV export with column selection

### Analytics
- **Revenue Analysis**: Monthly revenue trends and breakdown
- **Expense Tracking**: Category-wise expense analysis
- **Profit/Loss**: Comprehensive P&L statements
- **Visual Charts**: Interactive charts and graphs

## 🔍 Search Functionality

The application supports comprehensive search across all transaction fields:

- **User IDs**: `user_001`, `user_004`, etc.
- **Status**: `Paid`, `Pending`
- **Categories**: `Revenue`, `Expense`
- **Amounts**: Any numeric value
- **Dates**: Formatted dates
- **Transaction IDs**: Any ID number

## 📁 Sample Data

The application includes a comprehensive `transactions.json` file with 200+ sample transactions featuring:
- Multiple users (user_001 through user_004)
- Various transaction types (Revenue/Expense)
- Different statuses (Paid/Pending)
- Realistic amounts and dates
- User profile images

## 🛠️ Development

### Available Scripts

**Frontend (in project directory):**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

**Backend (in project/server directory):**
```bash
npm start            # Start production server
npm run dev          # Start development server with nodemon
```

### API Endpoints

- `GET /api/transactions/sample` - Get sample transactions
- `POST /api/transactions` - Create new transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `GET /api/dashboard/overview` - Get dashboard data
- `GET /api/export/transactions/csv` - Export transactions as CSV

## 🚀 Deployment

### Frontend Deployment
1. Build the project: `npm run build`
2. Deploy the `dist` folder to your hosting service

### Backend Deployment
1. Set up environment variables
2. Deploy to your preferred hosting service (Heroku, Vercel, etc.)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues or have questions, please:
1. Check the existing issues
2. Create a new issue with detailed information
3. Include steps to reproduce the problem

---

**Built with ❤️ using React, TypeScript, Node.js, and Express** 
