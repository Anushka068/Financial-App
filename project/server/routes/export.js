import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import Transaction from '../models/Transaction.js';
import createCsvWriter from 'csv-writer';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Export transactions as CSV
router.get('/transactions/csv', authenticateToken, async (req, res, next) => {
  try {
    const { 
      startDate, 
      endDate, 
      type, 
      category,
      search 
    } = req.query;

    // Build query
    const query = { userId: req.user.id };

    if (type && ['income', 'expense'].includes(type)) {
      query.type = type;
    }

    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    const transactions = await Transaction.find(query)
      .sort({ date: -1 })
      .lean();

    // Create CSV content
    const csvHeader = 'Date,Type,Amount,Description,Category,Notes\n';
    const csvData = transactions.map(t => {
      const date = new Date(t.date).toLocaleDateString();
      const amount = t.type === 'expense' ? -t.amount : t.amount;
      const description = `"${(t.description || '').replace(/"/g, '""')}"`;
      const category = `"${(t.category || '').replace(/"/g, '""')}"`;
      const notes = `"${(t.notes || '').replace(/"/g, '""')}"`;
      
      return `${date},${t.type},${amount},${description},${category},${notes}`;
    }).join('\n');
    
    const csv = csvHeader + csvData;
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
    res.send(csv);
  } catch (error) {
    next(error);
  }
});

// Export dashboard data as JSON
router.get('/dashboard/json', authenticateToken, async (req, res, next) => {
  try {
    const { period = 'monthly' } = req.query;
    
    // Get all user transactions
    const transactions = await Transaction.find({ userId: req.user.id })
      .sort({ date: -1 })
      .lean();

    // Calculate summary statistics
    const totalRevenue = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const netProfit = totalRevenue - totalExpenses;

    // Category breakdown
    const categoryBreakdown = transactions.reduce((acc, t) => {
      if (!acc[t.category]) {
        acc[t.category] = { income: 0, expense: 0 };
      }
      acc[t.category][t.type] += t.amount;
      return acc;
    }, {});

    const exportData = {
      summary: {
        totalRevenue,
        totalExpenses,
        netProfit,
        profitMargin: totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0,
        transactionCount: transactions.length
      },
      categoryBreakdown,
      transactions,
      exportedAt: new Date().toISOString(),
      userId: req.user.id,
      period
    };
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=dashboard-data.json');
    res.json(exportData);
  } catch (error) {
    next(error);
  }
});

// Generate custom report
router.post('/report', authenticateToken, async (req, res, next) => {
  try {
    const { 
      startDate, 
      endDate, 
      format = 'json',
      includeCategories = [],
      excludeCategories = [],
      types = ['income', 'expense']
    } = req.body;
    
    // Build query
    const query = { userId: req.user.id };

    if (types.length > 0) {
      query.type = { $in: types };
    }

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (includeCategories.length > 0) {
      query.category = { $in: includeCategories };
    }

    if (excludeCategories.length > 0) {
      query.category = { $nin: excludeCategories };
    }

    const transactions = await Transaction.find(query)
      .sort({ date: -1 })
      .lean();
    
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const report = {
      period: { startDate, endDate },
      filters: {
        includeCategories,
        excludeCategories,
        types
      },
      summary: {
        totalIncome,
        totalExpenses,
        netProfit: totalIncome - totalExpenses,
        transactionCount: transactions.length
      },
      transactions,
      generatedAt: new Date().toISOString()
    };
    
    if (format === 'csv') {
      const csvHeader = 'Date,Type,Amount,Description,Category,Notes\n';
      const csvData = transactions.map(t => {
        const date = new Date(t.date).toLocaleDateString();
        const amount = t.type === 'expense' ? -t.amount : t.amount;
        const description = `"${(t.description || '').replace(/"/g, '""')}"`;
        const category = `"${(t.category || '').replace(/"/g, '""')}"`;
        const notes = `"${(t.notes || '').replace(/"/g, '""')}"`;
        
        return `${date},${t.type},${amount},${description},${category},${notes}`;
      }).join('\n');
      
      const csv = csvHeader + csvData;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=custom-report.csv');
      res.send(csv);
    } else {
      res.json(report);
    }
  } catch (error) {
    next(error);
  }
});

export default router;