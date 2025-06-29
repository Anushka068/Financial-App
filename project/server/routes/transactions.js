import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import Transaction from '../models/Transaction.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Get all transactions with search, filter, and pagination
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      type, 
      category, 
      search,
      startDate,
      endDate,
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = { userId: req.user.id };

    // Filter by type
    if (type && ['income', 'expense'].includes(type)) {
      query.type = type;
    }

    // Filter by category
    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }

    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }

    // Search in description and notes
    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const [transactions, totalCount] = await Promise.all([
      Transaction.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Transaction.countDocuments(query)
    ]);

    res.json({
      transactions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalItems: totalCount,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get transaction statistics
router.get('/stats', authenticateToken, async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    const matchQuery = { userId: req.user.id };
    
    if (startDate || endDate) {
      matchQuery.date = {};
      if (startDate) matchQuery.date.$gte = new Date(startDate);
      if (endDate) matchQuery.date.$lte = new Date(endDate);
    }

    const stats = await Transaction.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          avgAmount: { $avg: '$amount' }
        }
      }
    ]);

    const categoryStats = await Transaction.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: { type: '$type', category: '$category' },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.type',
          categories: {
            $push: {
              name: '$_id.category',
              total: '$total',
              count: '$count'
            }
          }
        }
      }
    ]);

    res.json({ stats, categoryStats });
  } catch (error) {
    next(error);
  }
});

// Create transaction
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const { type, amount, description, category, date, tags, notes } = req.body;
    
    if (!type || !amount || !description || !category || !date) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    const transaction = await Transaction.create({
      type,
      amount: parseFloat(amount),
      description,
      category,
      date: new Date(date),
      tags: tags || [],
      notes: notes || '',
      userId: req.user.id
    });
    
    res.status(201).json(transaction);
  } catch (error) {
    next(error);
  }
});

// Update transaction
router.put('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { type, amount, description, category, date, tags, notes } = req.body;
    
    const transaction = await Transaction.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      {
        ...(type && { type }),
        ...(amount && { amount: parseFloat(amount) }),
        ...(description && { description }),
        ...(category && { category }),
        ...(date && { date: new Date(date) }),
        ...(tags !== undefined && { tags }),
        ...(notes !== undefined && { notes })
      },
      { new: true, runValidators: true }
    );
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    res.json(transaction);
  } catch (error) {
    next(error);
  }
});

// Delete transaction
router.delete('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const transaction = await Transaction.findOneAndDelete({
      _id: id,
      userId: req.user.id
    });
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Get sample transactions (no authentication required for testing)
router.get('/sample-test', async (req, res, next) => {
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    
    const dataPath = path.join(__dirname, '..', 'data', 'transactions.json');
    const data = await fs.readFile(dataPath, 'utf8');
    const transactions = JSON.parse(data);
    
    res.json({
      transactions: transactions.slice(0, 10), // Return first 10 for testing
      pagination: {
        currentPage: 1,
        totalPages: Math.ceil(transactions.length / 10),
        totalItems: transactions.length,
        itemsPerPage: 10
      }
    });
  } catch (error) {
    console.error('Error reading sample data:', error);
    res.status(500).json({ error: 'Failed to load sample data' });
  }
});

// Get sample transactions data
router.get('/sample', async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      type, 
      category, 
      search,
      startDate,
      endDate,
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.query;

    // Read the sample transactions JSON file
    const dataPath = path.join(__dirname, '../data/transactions.json');
    const rawData = fs.readFileSync(dataPath, 'utf8');
    let transactions = JSON.parse(rawData);

    // Do NOT transform the data; use the original fields from transactions.json
    // Apply filters
    if (type && ['income', 'expense'].includes(type)) {
      transactions = transactions.filter(t => {
        const isIncome = t.category && t.category.toLowerCase() === 'revenue';
        return (type === 'income' && isIncome) || (type === 'expense' && !isIncome);
      });
    }

    if (category) {
      transactions = transactions.filter(t => 
        (t.category?.toLowerCase() || '').includes(category.toLowerCase())
      );
    }

    if (search) {
      const searchLower = search.toLowerCase();
      transactions = transactions.filter(t => 
        (t.id?.toString() || '').includes(search) ||
        (t.date ? new Date(t.date).toLocaleDateString().includes(search) : false) ||
        (t.amount?.toString() || '').includes(search) ||
        (t.category?.toLowerCase() || '').includes(searchLower) ||
        (t.status?.toLowerCase() || '').includes(searchLower) ||
        (t.user_id?.toLowerCase() || '').includes(searchLower) ||
        (t.user_profile?.toLowerCase() || '').includes(searchLower)
      );
    }

    if (startDate || endDate) {
      transactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        if (startDate && transactionDate < new Date(startDate)) return false;
        if (endDate && transactionDate > new Date(endDate)) return false;
        return true;
      });
    }

    // Sort transactions
    transactions.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      if (sortBy === 'date') {
        if (sortOrder === 'desc') {
          return new Date(bValue) - new Date(aValue);
        } else {
          return new Date(aValue) - new Date(bValue);
        }
      } else {
        if (sortOrder === 'desc') {
          return bValue > aValue ? 1 : -1;
        } else {
          return aValue > bValue ? 1 : -1;
        }
      }
    });

    // Apply pagination
    const totalCount = transactions.length;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedTransactions = transactions.slice(skip, skip + parseInt(limit));

    res.json({
      transactions: paginatedTransactions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalItems: totalCount,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;