import React, { useState, useEffect } from 'react';
import { TrendingDown, AlertTriangle, Calendar, Filter, Download, Plus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { format } from 'date-fns';
import { apiService } from '../../services/api';

interface Transaction {
  id: number;
  date: string;
  amount: number;
  category: string;
  status: string;
  userId: string;
  userProfile?: string;
}

const ExpensesPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [expenseData, setExpenseData] = useState<any[]>([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [avgDailyExpense, setAvgDailyExpense] = useState(0);
  const [expenseGrowth, setExpenseGrowth] = useState(0);

  useEffect(() => {
    loadExpenseData();
  }, []);

  const loadExpenseData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getSampleTransactions({
        limit: 1000,
        sortBy: 'date',
        sortOrder: 'desc'
      }) as any;

      const allTransactions = response.transactions || [];
      const expenseTransactions = allTransactions.filter((t: Transaction) => t.category === 'Expense');
      setTransactions(expenseTransactions);

      // Calculate total expenses
      const total = expenseTransactions.reduce((sum: number, t: Transaction) => sum + t.amount, 0);
      setTotalExpenses(total);

      // Generate daily expense data
      const dailyData = generateDailyExpenseData(expenseTransactions);
      setExpenseData(dailyData);

      // Calculate average daily expense
      const avgDaily = total / Math.max(dailyData.length, 1);
      setAvgDailyExpense(avgDaily);

      // Calculate growth (simple calculation)
      if (dailyData.length > 1) {
        const firstDay = dailyData[0].total;
        const lastDay = dailyData[dailyData.length - 1].total;
        const growth = ((lastDay - firstDay) / firstDay) * 100;
        setExpenseGrowth(growth);
      }

    } catch (error) {
      console.error('Error loading expense data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateDailyExpenseData = (transactions: Transaction[]) => {
    const dailyMap = new Map<string, { total: number; operations: number; marketing: number; technology: number; hr: number }>();
    
    transactions.forEach(transaction => {
      const date = format(new Date(transaction.date), 'yyyy-MM-dd');
      const current = dailyMap.get(date) || { total: 0, operations: 0, marketing: 0, technology: 0, hr: 0 };
      
      current.total += transaction.amount;
      
      // Categorize expenses (simplified categorization)
      if (transaction.amount > 2000) {
        current.operations += transaction.amount;
      } else if (transaction.amount > 1000) {
        current.marketing += transaction.amount;
      } else if (transaction.amount > 500) {
        current.technology += transaction.amount;
      } else {
        current.hr += transaction.amount;
      }
      
      dailyMap.set(date, current);
    });

    return Array.from(dailyMap.entries())
      .map(([date, data]) => ({
        date,
        ...data
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-7); // Last 7 days
  };

  const expenseCategories = [
    { name: 'Operations', amount: totalExpenses * 0.4, budget: totalExpenses * 0.5, color: '#3B82F6', change: -8.2 },
    { name: 'Marketing', amount: totalExpenses * 0.25, budget: totalExpenses * 0.3, color: '#10B981', change: 12.5 },
    { name: 'Technology', amount: totalExpenses * 0.2, budget: totalExpenses * 0.25, color: '#F59E0B', change: 5.3 },
    { name: 'Human Resources', amount: totalExpenses * 0.15, budget: totalExpenses * 0.2, color: '#EF4444', change: 3.1 },
  ];

  const recentExpenses = transactions
    .slice(0, 5)
    .map((t, index) => ({
      id: t.id,
      description: `Expense ${t.id}`,
      category: 'Operations',
      amount: t.amount,
      date: format(new Date(t.date), 'yyyy-MM-dd'),
      vendor: `Vendor ${t.userId}`
    }));

  const budgetAlerts = expenseCategories
    .filter(cat => (cat.amount / cat.budget) > 0.8)
    .map(cat => ({
      category: cat.name,
      percentage: Math.round((cat.amount / cat.budget) * 100),
      status: (cat.amount / cat.budget) > 0.95 ? 'critical' : 'warning'
    }));

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-6 flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expense Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor and control your business expenses across all categories
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="operations">Operations</option>
            <option value="marketing">Marketing</option>
            <option value="technology">Technology</option>
            <option value="hr">Human Resources</option>
          </select>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Budget Alerts */}
      {budgetAlerts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <AlertTriangle className="h-5 w-5 text-amber-600 mr-2" />
            <h3 className="text-sm font-medium text-amber-800">Budget Alerts</h3>
          </div>
          <div className="space-y-2">
            {budgetAlerts.map((alert, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-amber-700">
                  {alert.category} is at {alert.percentage}% of budget
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  alert.status === 'critical' 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {alert.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expense Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalExpenses)}</p>
            </div>
            <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-red-600 font-medium">+{expenseGrowth.toFixed(1)}%</span>
            <span className="text-sm text-gray-500 ml-2">vs previous period</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Daily Expense</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(avgDailyExpense)}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-blue-600 font-medium">-2.1%</span>
            <span className="text-sm text-gray-500 ml-2">vs previous period</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Budget Utilization</p>
              <p className="text-2xl font-bold text-gray-900">82.4%</p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Filter className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-purple-600 font-medium">+5.2%</span>
            <span className="text-sm text-gray-500 ml-2">vs previous period</span>
          </div>
        </div>
      </div>

      {/* Expense Trend Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Expense Trend by Category</h3>
        </div>

        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={expenseData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(value) => format(new Date(value), 'MMM dd')}
            />
            <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
            <Tooltip 
              formatter={(value: number, name: string) => [formatCurrency(value), name]}
              labelFormatter={(value) => format(new Date(value), 'MMM dd, yyyy')}
            />
            <Bar dataKey="operations" stackId="a" fill="#3B82F6" name="Operations" />
            <Bar dataKey="marketing" stackId="a" fill="#10B981" name="Marketing" />
            <Bar dataKey="technology" stackId="a" fill="#F59E0B" name="Technology" />
            <Bar dataKey="hr" stackId="a" fill="#EF4444" name="Human Resources" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Category Breakdown & Recent Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Expense Categories</h3>
          <div className="space-y-4">
            {expenseCategories.map((category, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded-full mr-3" 
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <span className="font-medium text-gray-900">{category.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(category.amount)}
                    </span>
                    <span className={`text-xs ml-2 ${
                      category.change > 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {category.change > 0 ? '+' : ''}{category.change.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${(category.amount / category.budget) * 100}%`,
                      backgroundColor: category.color 
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{formatCurrency(category.amount)} spent</span>
                  <span>{formatCurrency(category.budget)} budget</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Expenses</h3>
            <button className="inline-flex items-center px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-500">
              <Plus className="h-4 w-4 mr-1" />
              Add Expense
            </button>
          </div>
          <div className="space-y-4">
            {recentExpenses.map((expense) => (
              <div key={expense.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div>
                  <p className="font-medium text-gray-900">{expense.description}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-gray-500">{expense.category}</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">{expense.vendor}</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">{format(new Date(expense.date), 'MMM dd')}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-red-600">{formatCurrency(expense.amount)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpensesPage;