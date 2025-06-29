import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import Transaction from '../models/Transaction.js';

const router = express.Router();

// Get dashboard overview
router.get('/overview', authenticateToken, async (req, res, next) => {
  try {
    const { period = 'monthly' } = req.query;
    
    // Calculate date range based on period
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'yearly':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Get overview statistics
    const [revenueStats, expenseStats] = await Promise.all([
      Transaction.aggregate([
        {
          $match: {
            userId: req.user.id,
            type: 'income',
            date: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
            count: { $sum: 1 },
            avg: { $avg: '$amount' }
          }
        }
      ]),
      Transaction.aggregate([
        {
          $match: {
            userId: req.user.id,
            type: 'expense',
            date: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
            count: { $sum: 1 },
            avg: { $avg: '$amount' }
          }
        }
      ])
    ]);

    const totalRevenue = revenueStats[0]?.total || 0;
    const totalExpenses = expenseStats[0]?.total || 0;
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    // Get monthly data for charts
    const monthlyData = await Transaction.aggregate([
      {
        $match: {
          userId: req.user.id,
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type'
          },
          total: { $sum: '$amount' }
        }
      },
      {
        $group: {
          _id: {
            year: '$_id.year',
            month: '$_id.month'
          },
          revenue: {
            $sum: {
              $cond: [{ $eq: ['$_id.type', 'income'] }, '$total', 0]
            }
          },
          expenses: {
            $sum: {
              $cond: [{ $eq: ['$_id.type', 'expense'] }, '$total', 0]
            }
          }
        }
      },
      {
        $addFields: {
          profit: { $subtract: ['$revenue', '$expenses'] }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Get category breakdown
    const categoryBreakdown = await Transaction.aggregate([
      {
        $match: {
          userId: req.user.id,
          type: 'income',
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$category',
          value: { $sum: '$amount' }
        }
      },
      {
        $sort: { value: -1 }
      },
      {
        $limit: 10
      }
    ]);

    const expenseCategories = await Transaction.aggregate([
      {
        $match: {
          userId: req.user.id,
          type: 'expense',
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$category',
          value: { $sum: '$amount' }
        }
      },
      {
        $sort: { value: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.json({
      overview: {
        totalRevenue,
        totalExpenses,
        netProfit,
        profitMargin,
        revenueGrowth: 0, // Calculate based on previous period
        expenseGrowth: 0  // Calculate based on previous period
      },
      monthlyData: monthlyData.map(item => ({
        month: new Date(item._id.year, item._id.month - 1).toLocaleDateString('en-US', { month: 'short' }),
        revenue: item.revenue,
        expenses: item.expenses,
        profit: item.profit
      })),
      categoryBreakdown: categoryBreakdown.map((item, index) => ({
        name: item._id,
        value: item.value,
        color: `hsl(${(index * 137.5) % 360}, 70%, 50%)`
      })),
      expenseCategories: expenseCategories.map((item, index) => ({
        name: item._id,
        value: item.value,
        color: `hsl(${(index * 137.5) % 360}, 70%, 50%)`
      }))
    });
  } catch (error) {
    next(error);
  }
});

// Get revenue data
router.get('/revenue', authenticateToken, async (req, res, next) => {
  try {
    const { period = 'monthly' } = req.query;
    
    let groupBy;
    let startDate = new Date();
    
    if (period === 'yearly') {
      groupBy = { year: { $year: '$date' } };
      startDate.setFullYear(startDate.getFullYear() - 3);
    } else {
      groupBy = { 
        year: { $year: '$date' }, 
        month: { $month: '$date' } 
      };
      startDate.setMonth(startDate.getMonth() - 12);
    }
    
    const data = await Transaction.aggregate([
      {
        $match: {
          userId: req.user.id,
          type: 'income',
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: groupBy,
          revenue: { $sum: '$amount' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);
    
    res.json({ data, period });
  } catch (error) {
    next(error);
  }
});

// Get expense data
router.get('/expenses', authenticateToken, async (req, res, next) => {
  try {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 12);

    const [categories, monthly] = await Promise.all([
      Transaction.aggregate([
        {
          $match: {
            userId: req.user.id,
            type: 'expense',
            date: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: '$category',
            total: { $sum: '$amount' }
          }
        },
        {
          $sort: { total: -1 }
        }
      ]),
      Transaction.aggregate([
        {
          $match: {
            userId: req.user.id,
            type: 'expense',
            date: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$date' },
              month: { $month: '$date' }
            },
            expenses: { $sum: '$amount' }
          }
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1 }
        }
      ])
    ]);

    res.json({
      categories: categories.map(cat => ({
        name: cat._id,
        total: cat.total
      })),
      monthly: monthly.map(item => ({
        month: new Date(item._id.year, item._id.month - 1).toLocaleDateString('en-US', { month: 'short' }),
        expenses: item.expenses
      }))
    });
  } catch (error) {
    next(error);
  }
});

// Get profit/loss data
router.get('/profit-loss', authenticateToken, async (req, res, next) => {
  try {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 12);

    const monthly = await Transaction.aggregate([
      {
        $match: {
          userId: req.user.id,
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type'
          },
          total: { $sum: '$amount' }
        }
      },
      {
        $group: {
          _id: {
            year: '$_id.year',
            month: '$_id.month'
          },
          revenue: {
            $sum: {
              $cond: [{ $eq: ['$_id.type', 'income'] }, '$total', 0]
            }
          },
          expenses: {
            $sum: {
              $cond: [{ $eq: ['$_id.type', 'expense'] }, '$total', 0]
            }
          }
        }
      },
      {
        $addFields: {
          profit: { $subtract: ['$revenue', '$expenses'] }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    const summary = monthly.reduce((acc, item) => {
      acc.totalRevenue += item.revenue;
      acc.totalExpenses += item.expenses;
      acc.netProfit += item.profit;
      return acc;
    }, { totalRevenue: 0, totalExpenses: 0, netProfit: 0 });

    summary.profitMargin = summary.totalRevenue > 0 ? 
      (summary.netProfit / summary.totalRevenue) * 100 : 0;

    res.json({
      monthly: monthly.map(item => ({
        month: new Date(item._id.year, item._id.month - 1).toLocaleDateString('en-US', { month: 'short' }),
        revenue: item.revenue,
        expenses: item.expenses,
        profit: item.profit
      })),
      summary
    });
  } catch (error) {
    next(error);
  }
});

export default router;