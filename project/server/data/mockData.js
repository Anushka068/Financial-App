export const mockUsers = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    password: '$2a$10$rOzJqZxjwHKUkzJzKzJzKOzJqZxjwHKUkzJzKzJzKOzJqZxjwHKUk', // password: 'password123'
    role: 'admin',
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: '$2a$10$rOzJqZxjwHKUkzJzKzJzKOzJqZxjwHKUkzJzKzJzKOzJqZxjwHKUk', // password: 'password123'
    role: 'user',
    createdAt: '2024-01-20T14:15:00Z'
  }
];

export const mockTransactions = [
  {
    id: 1,
    type: 'income',
    amount: 5000,
    description: 'Monthly Salary',
    category: 'Salary',
    date: '2024-01-01',
    userId: 1
  },
  {
    id: 2,
    type: 'expense',
    amount: 1200,
    description: 'Office Rent',
    category: 'Rent',
    date: '2024-01-02',
    userId: 1
  },
  {
    id: 3,
    type: 'income',
    amount: 2500,
    description: 'Freelance Project',
    category: 'Freelance',
    date: '2024-01-05',
    userId: 1
  },
  {
    id: 4,
    type: 'expense',
    amount: 800,
    description: 'Marketing Campaign',
    category: 'Marketing',
    date: '2024-01-08',
    userId: 1
  },
  {
    id: 5,
    type: 'expense',
    amount: 450,
    description: 'Office Supplies',
    category: 'Supplies',
    date: '2024-01-10',
    userId: 1
  }
];

export const mockDashboardData = {
  overview: {
    totalRevenue: 125000,
    totalExpenses: 87500,
    netProfit: 37500,
    profitMargin: 30,
    revenueGrowth: 12.5,
    expenseGrowth: 8.3
  },
  monthlyData: [
    { month: 'Jan', revenue: 12000, expenses: 8500, profit: 3500 },
    { month: 'Feb', revenue: 15000, expenses: 9200, profit: 5800 },
    { month: 'Mar', revenue: 18000, expenses: 11000, profit: 7000 },
    { month: 'Apr', revenue: 16500, expenses: 10500, profit: 6000 },
    { month: 'May', revenue: 20000, expenses: 12800, profit: 7200 },
    { month: 'Jun', revenue: 22500, expenses: 14000, profit: 8500 }
  ],
  categoryBreakdown: [
    { name: 'Salary', value: 45000, color: '#8884d8' },
    { name: 'Freelance', value: 35000, color: '#82ca9d' },
    { name: 'Products', value: 25000, color: '#ffc658' },
    { name: 'Services', value: 20000, color: '#ff7300' }
  ],
  expenseCategories: [
    { name: 'Rent', value: 25000, color: '#8884d8' },
    { name: 'Marketing', value: 20000, color: '#82ca9d' },
    { name: 'Supplies', value: 15000, color: '#ffc658' },
    { name: 'Utilities', value: 12000, color: '#ff7300' },
    { name: 'Other', value: 15500, color: '#00ff00' }
  ]
};