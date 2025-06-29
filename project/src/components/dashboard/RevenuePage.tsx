import React, { useState, useEffect } from 'react';
import { TrendingUp, Calendar, Filter, Download } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
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

const RevenuePage: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [viewType, setViewType] = useState('line');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [avgDailyRevenue, setAvgDailyRevenue] = useState(0);
  const [revenueGrowth, setRevenueGrowth] = useState(0);

  useEffect(() => {
    loadRevenueData();
  }, []);

  const loadRevenueData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getSampleTransactions({
        limit: 1000,
        sortBy: 'date',
        sortOrder: 'desc'
      }) as any;

      const allTransactions = response.transactions || [];
      const revenueTransactions = allTransactions.filter((t: Transaction) => t.category === 'Revenue');
      setTransactions(revenueTransactions);

      // Calculate total revenue
      const total = revenueTransactions.reduce((sum: number, t: Transaction) => sum + t.amount, 0);
      setTotalRevenue(total);

      // Generate daily revenue data
      const dailyData = generateDailyRevenueData(revenueTransactions);
      setRevenueData(dailyData);

      // Calculate average daily revenue
      const avgDaily = total / Math.max(dailyData.length, 1);
      setAvgDailyRevenue(avgDaily);

      // Calculate growth (simple calculation)
      if (dailyData.length > 1) {
        const firstDay = dailyData[0].revenue;
        const lastDay = dailyData[dailyData.length - 1].revenue;
        const growth = ((lastDay - firstDay) / firstDay) * 100;
        setRevenueGrowth(growth);
      }

    } catch (error) {
      console.error('Error loading revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateDailyRevenueData = (transactions: Transaction[]) => {
    const dailyMap = new Map<string, number>();
    
    transactions.forEach(transaction => {
      const date = format(new Date(transaction.date), 'yyyy-MM-dd');
      const current = dailyMap.get(date) || 0;
      dailyMap.set(date, current + transaction.amount);
    });

    return Array.from(dailyMap.entries())
      .map(([date, revenue]) => ({
        date,
        revenue,
        recurring: revenue * 0.7, // Assume 70% is recurring
        oneTime: revenue * 0.3 // Assume 30% is one-time
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-7); // Last 7 days
  };

  const revenueStreams = [
    { name: 'Subscription Services', amount: totalRevenue * 0.6, change: 15.2, color: '#3B82F6' },
    { name: 'Consulting', amount: totalRevenue * 0.25, change: 8.7, color: '#10B981' },
    { name: 'Product Sales', amount: totalRevenue * 0.1, change: -3.1, color: '#F59E0B' },
    { name: 'Licensing', amount: totalRevenue * 0.05, change: 22.5, color: '#8B5CF6' },
  ];

  const topClients = transactions
    .slice(0, 5)
    .map((t, index) => ({
      name: `Client ${t.userId}`,
      revenue: t.amount,
      growth: Math.random() * 30 - 5 // Random growth between -5% and 25%
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Revenue Analysis</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track and analyze your revenue streams and performance
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
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

      {/* Revenue Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-green-600 font-medium">+{revenueGrowth.toFixed(1)}%</span>
            <span className="text-sm text-gray-500 ml-2">vs previous period</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Daily Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(avgDailyRevenue)}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-blue-600 font-medium">+8.2%</span>
            <span className="text-sm text-gray-500 ml-2">vs previous period</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Recurring Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue * 0.6)}</p>
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
      </div>

      {/* Revenue Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setViewType('line')}
              className={`px-3 py-1 text-sm rounded-md ${
                viewType === 'line' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Line
            </button>
            <button
              onClick={() => setViewType('bar')}
              className={`px-3 py-1 text-sm rounded-md ${
                viewType === 'bar' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Bar
            </button>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={400}>
          {viewType === 'line' ? (
            <LineChart data={revenueData}>
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
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#3B82F6" 
                strokeWidth={3} 
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                name="Total Revenue"
              />
              <Line 
                type="monotone" 
                dataKey="recurring" 
                stroke="#10B981" 
                strokeWidth={2} 
                strokeDasharray="5 5"
                name="Recurring Revenue"
              />
            </LineChart>
          ) : (
            <BarChart data={revenueData}>
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
              <Bar dataKey="recurring" stackId="a" fill="#10B981" name="Recurring Revenue" />
              <Bar dataKey="oneTime" stackId="a" fill="#3B82F6" name="One-time Revenue" />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Revenue Streams & Top Clients */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Streams */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Streams</h3>
          <div className="space-y-4">
            {revenueStreams.map((stream, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center">
                  <div 
                    className="w-4 h-4 rounded-full mr-3" 
                    style={{ backgroundColor: stream.color }}
                  ></div>
                  <div>
                    <p className="font-medium text-gray-900">{stream.name}</p>
                    <p className="text-sm text-gray-500">{formatCurrency(stream.amount)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-medium ${
                    stream.change > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stream.change > 0 ? '+' : ''}{stream.change.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Clients */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Revenue Clients</h3>
          <div className="space-y-4">
            {topClients.map((client, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{client.name}</p>
                  <p className="text-sm text-gray-500">{formatCurrency(client.revenue)} this month</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-green-600">
                    +{client.growth.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenuePage;