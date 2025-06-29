import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { format } from 'date-fns';
import { apiService } from '../../services/api';
import { useMenu } from '../../context/MenuContext';

interface Transaction {
  id: number;
  date: string;
  amount: number;
  category: string;
  status: string;
  user_id: string;
  user_profile: string;
}

const OverviewDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState('Monthly');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [kpiData, setKpiData] = useState({
    balance: 0,
    revenue: 0,
    expenses: 0,
    savings: 0,
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const { setActiveMenuItem } = useMenu();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getSampleTransactions({
        limit: 1000, // Get all transactions for calculations
        sortBy: 'date',
        sortOrder: 'desc'
      }) as any;

      const allTransactions = response.transactions || [];
      setTransactions(allTransactions);

      // Calculate KPIs
      const revenue = allTransactions
        .filter((t: Transaction) => t.category === 'Revenue')
        .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

      const expenses = allTransactions
        .filter((t: Transaction) => t.category === 'Expense')
        .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

      const balance = revenue - expenses;
      const savings = balance * 0.2; // Assume 20% savings

      setKpiData({
        balance,
        revenue,
        expenses,
        savings
      });

      // Generate chart data (monthly aggregation)
      const monthlyData = generateMonthlyChartData(allTransactions);
      setChartData(monthlyData);

      // Get recent transactions (last 5)
      const recent = allTransactions.slice(0, 5).map((t: Transaction) => ({
        id: t.id,
        name: `${t.user_id}`,
        amount: t.amount,
        avatar: t.user_profile || 'https://thispersondoesnotexist.com/',
        isPositive: t.category === 'Revenue',
        type: t.category === 'Revenue' ? 'transfer_from' : 'transfer_to',
        date: format(new Date(t.date), 'MMM dd, yyyy'),
        status: t.status
      }));

      setRecentTransactions(recent);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMonthlyChartData = (transactions: Transaction[]) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = months.map(month => ({
      month,
      income: 0,
      expenses: 0
    }));

    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthIndex = date.getMonth();
      
      if (transaction.category === 'Revenue') {
        monthlyData[monthIndex].income += transaction.amount;
      } else if (transaction.category === 'Expense') {
        monthlyData[monthIndex].expenses += transaction.amount;
      }
    });

    return monthlyData;
  };

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
      <div className="h-full w-full bg-gray-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-22 border-b-2 border-green-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="pt-0 px-6 pb-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="h-10 w-10 bg-gray-700 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Balance</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(kpiData.balance)}</p>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 relative">
            <div className="absolute top-4 right-4">
              <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full">Revenue</span>
            </div>
            <div className="flex items-center justify-between mb-4">
              <div className="h-10 w-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Revenue</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(kpiData.revenue)}</p>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="h-10 w-10 bg-gray-700 rounded-lg flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-red-400" />
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Expenses</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(kpiData.expenses)}</p>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="h-10 w-10 bg-gray-700 rounded-lg flex items-center justify-center">
                <PiggyBank className="h-5 w-5 text-green-400" />
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Savings</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(kpiData.savings)}</p>
            </div>
          </div>
        </div>

        {/* Main Content Row */}
        <div className="flex items-start gap-6">
          {/* Overview Chart */}
          <div className="flex-1 min-w-0 bg-gray-800 p-6 rounded-xl border border-gray-700 h-80 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Overview</h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                    <span className="text-gray-400">Revenue</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
                    <span className="text-gray-400">Expenses</span>
                  </div>
                </div>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-green-400"
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Yearly">Yearly</option>
                </select>
              </div>
            </div>

            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <XAxis 
                    dataKey="month" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  />
                  <YAxis 
                    tickFormatter={(value) => `$${value}`}
                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  />
                  <Tooltip 
                    formatter={(value) => [`$${value}`, 'Amount']}
                    labelFormatter={(label) => `Month: ${label}`}
                    contentStyle={{ background: '#22223b', border: 'none', borderRadius: 8, color: '#fff' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="income" 
                    stroke="#10B981" 
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#10B981' }}
                    activeDot={{ r: 6, fill: '#10B981' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="expenses" 
                    stroke="#F59E0B" 
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#F59E0B' }}
                    activeDot={{ r: 6, fill: '#F59E0B' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 flex items-center justify-center">
              <div className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm font-medium">
                {formatCurrency(kpiData.balance)}
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 w-80 h-80 flex flex-col justify-start">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Recent Transaction</h3>
              <button
                className="text-yellow-400 text-sm hover:text-yellow-300"
                onClick={() => setActiveMenuItem('transactions')}
              >
                See all
              </button>
            </div>
            <div className="space-y-4">
              {recentTransactions.slice(0, 3).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={transaction.avatar}
                      alt={transaction.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-sm text-white font-medium">{transaction.name}</p>
                      <p className="text-xs text-gray-400">
                        {transaction.type === 'transfer_from' ? 'Transfer from' : 'Transfer to'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${
                      transaction.isPositive ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {transaction.isPositive ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </p>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium mt-1 block ${
                      transaction.status === 'Paid'
                        ? 'bg-green-900 text-green-400'
                        : 'bg-yellow-900 text-yellow-400'
                    }`}>
                      {transaction.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-gray-800 rounded-xl border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Transactions</h3>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search for anything..."
                    className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg pl-4 pr-10 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <span>10 May - 20 May</span>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Name</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Date</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Amount</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.slice(0, 3).map((transaction) => (
                  <tr key={transaction.id} className="border-b border-gray-700 hover:bg-gray-750">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <img
                          src={transaction.avatar}
                          alt={transaction.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                        <span className="text-white font-medium">{transaction.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-400">{transaction.date}</td>
                    <td className="py-4 px-6">
                      <span className={`font-medium ${
                        transaction.isPositive ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {transaction.isPositive ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        transaction.status === 'Paid'
                          ? 'bg-green-900 text-green-400'
                          : 'bg-yellow-900 text-yellow-400'
                      }`}>
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewDashboard;