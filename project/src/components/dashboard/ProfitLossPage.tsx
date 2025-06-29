import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Calendar, Download, Target } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, ComposedChart } from 'recharts';
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

const ProfitLossPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [viewType, setViewType] = useState('monthly');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [profitLossData, setProfitLossData] = useState<any[]>([]);
  const [profitMetrics, setProfitMetrics] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    grossProfit: 0,
    netProfit: 0,
    profitMargin: 0,
    revenueGrowth: 0,
    expenseGrowth: 0,
    profitGrowth: 0
  });

  useEffect(() => {
    loadProfitLossData();
  }, []);

  const loadProfitLossData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getSampleTransactions({
        limit: 1000,
        sortBy: 'date',
        sortOrder: 'desc'
      }) as any;

      const allTransactions = response.transactions || [];
      setTransactions(allTransactions);

      // Calculate totals
      const revenue = allTransactions
        .filter((t: Transaction) => t.category === 'Revenue')
        .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

      const expenses = allTransactions
        .filter((t: Transaction) => t.category === 'Expense')
        .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

      const grossProfit = revenue - expenses;
      const netProfit = grossProfit * 0.8; // Assume 20% taxes/other deductions
      const profitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

      setProfitMetrics({
        totalRevenue: revenue,
        totalExpenses: expenses,
        grossProfit,
        netProfit,
        profitMargin,
        revenueGrowth: 12.5, // Mock growth
        expenseGrowth: 8.3, // Mock growth
        profitGrowth: 18.7 // Mock growth
      });

      // Generate daily P&L data
      const dailyData = generateDailyProfitLossData(allTransactions);
      setProfitLossData(dailyData);

    } catch (error) {
      console.error('Error loading profit/loss data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateDailyProfitLossData = (transactions: Transaction[]) => {
    const dailyMap = new Map<string, { revenue: number; expenses: number }>();
    
    transactions.forEach(transaction => {
      const date = format(new Date(transaction.date), 'yyyy-MM-dd');
      const current = dailyMap.get(date) || { revenue: 0, expenses: 0 };
      
      if (transaction.category === 'Revenue') {
        current.revenue += transaction.amount;
      } else if (transaction.category === 'Expense') {
        current.expenses += transaction.amount;
      }
      
      dailyMap.set(date, current);
    });

    return Array.from(dailyMap.entries())
      .map(([date, data]) => ({
        date,
        revenue: data.revenue,
        expenses: data.expenses,
        grossProfit: data.revenue - data.expenses,
        netProfit: (data.revenue - data.expenses) * 0.8,
        margin: data.revenue > 0 ? ((data.revenue - data.expenses) / data.revenue) * 100 : 0
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-7); // Last 7 days
  };

  const monthlyComparison = [
    { month: 'Oct 2023', revenue: profitMetrics.totalRevenue * 0.8, expenses: profitMetrics.totalExpenses * 0.8, profit: profitMetrics.netProfit * 0.8, margin: profitMetrics.profitMargin * 0.9 },
    { month: 'Nov 2023', revenue: profitMetrics.totalRevenue * 0.85, expenses: profitMetrics.totalExpenses * 0.85, profit: profitMetrics.netProfit * 0.85, margin: profitMetrics.profitMargin * 0.95 },
    { month: 'Dec 2023', revenue: profitMetrics.totalRevenue * 0.9, expenses: profitMetrics.totalExpenses * 0.9, profit: profitMetrics.netProfit * 0.9, margin: profitMetrics.profitMargin * 0.98 },
    { month: 'Jan 2024', revenue: profitMetrics.totalRevenue, expenses: profitMetrics.totalExpenses, profit: profitMetrics.netProfit, margin: profitMetrics.profitMargin },
  ];

  const profitTargets = [
    { metric: 'Monthly Revenue Target', actual: profitMetrics.totalRevenue, target: profitMetrics.totalRevenue * 1.2, percentage: (profitMetrics.totalRevenue / (profitMetrics.totalRevenue * 1.2)) * 100 },
    { metric: 'Profit Margin Target', actual: profitMetrics.profitMargin, target: 30, percentage: (profitMetrics.profitMargin / 30) * 100 },
    { metric: 'Cost Control Target', actual: profitMetrics.totalExpenses, target: profitMetrics.totalExpenses * 0.9, percentage: (profitMetrics.totalExpenses / (profitMetrics.totalExpenses * 0.9)) * 100 },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="space-y-6 flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profit & Loss Statement</h1>
          <p className="mt-1 text-sm text-gray-500">
            Comprehensive view of your financial performance and profitability
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <select
            value={viewType}
            onChange={(e) => setViewType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="daily">Daily View</option>
            <option value="monthly">Monthly View</option>
            <option value="quarterly">Quarterly View</option>
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
            Export P&L
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Net Profit</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(profitMetrics.netProfit)}</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-green-600 font-medium">+{formatPercentage(profitMetrics.profitGrowth)}</span>
            <span className="text-sm text-gray-500 ml-2">vs previous period</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Profit Margin</p>
              <p className="text-2xl font-bold text-gray-900">{formatPercentage(profitMetrics.profitMargin)}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-blue-600 font-medium">+2.3%</span>
            <span className="text-sm text-gray-500 ml-2">vs previous period</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Gross Profit</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(profitMetrics.grossProfit)}</p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-purple-600 font-medium">+15.2%</span>
            <span className="text-sm text-gray-500 ml-2">vs previous period</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(profitMetrics.totalRevenue)}</p>
            </div>
            <div className="h-12 w-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-amber-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-amber-600 font-medium">+{formatPercentage(profitMetrics.revenueGrowth)}</span>
            <span className="text-sm text-gray-500 ml-2">vs previous period</span>
          </div>
        </div>
      </div>

      {/* Profit Trend Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Profit & Loss Trend</h3>
          <div className="flex space-x-4 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span>Revenue</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <span>Expenses</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span>Net Profit</span>
            </div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={profitLossData}>
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
            <Bar dataKey="revenue" fill="#10B981" name="Revenue" />
            <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
            <Line 
              type="monotone" 
              dataKey="netProfit" 
              stroke="#3B82F6" 
              strokeWidth={3} 
              dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
              name="Net Profit"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly Comparison & Targets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Comparison */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Performance</h3>
          
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyComparison}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Bar dataKey="profit" fill="#10B981" name="Profit" />
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-4 space-y-2">
            {monthlyComparison.map((month, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{month.month}</span>
                <div className="flex items-center space-x-4">
                  <span className="text-gray-900">{formatCurrency(month.profit)}</span>
                  <span className="text-blue-600">{formatPercentage(month.margin)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Targets */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Performance Targets</h3>
            <Target className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="space-y-6">
            {profitTargets.map((target, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{target.metric}</span>
                  <span className={`text-sm font-semibold ${
                    target.percentage >= 100 ? 'text-green-600' : 
                    target.percentage >= 80 ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    {target.percentage.toFixed(1)}%
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      target.percentage >= 100 ? 'bg-green-500' : 
                      target.percentage >= 80 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(target.percentage, 100)}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between text-xs text-gray-500">
                  <span>
                    {target.metric.includes('Margin') ? 
                      formatPercentage(target.actual) : 
                      formatCurrency(target.actual)
                    }
                  </span>
                  <span>
                    Target: {target.metric.includes('Margin') ? 
                      formatPercentage(target.target) : 
                      formatCurrency(target.target)
                    }
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Financial Ratios */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Financial Ratios</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{formatPercentage(profitMetrics.profitMargin)}</p>
            <p className="text-sm text-gray-600 mt-1">Net Profit Margin</p>
            <p className="text-xs text-gray-500 mt-2">Industry avg: 22.5%</p>
          </div>
          
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <p className="text-2xl font-bold text-green-600">34.3%</p>
            <p className="text-sm text-gray-600 mt-1">Gross Profit Margin</p>
            <p className="text-xs text-gray-500 mt-2">Industry avg: 32.1%</p>
          </div>
          
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">65.7%</p>
            <p className="text-sm text-gray-600 mt-1">Operating Ratio</p>
            <p className="text-xs text-gray-500 mt-2">Industry avg: 68.2%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfitLossPage;