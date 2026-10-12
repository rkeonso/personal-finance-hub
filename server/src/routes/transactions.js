import express from 'express';
import multer from 'multer';
import { parse } from 'csv-parse';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
});

// Get all transactions for the logged-in user
router.get('/', requireAuth, async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId: req.user.userId },
      orderBy: { date: 'desc' },
    });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a single transaction
router.post('/', requireAuth, async (req, res) => {
  try {
    const { description, amount, type, category, date } = req.body;
    if (!description || !amount || !category) {
      return res.status(400).json({ error: 'Missing required transaction fields' });
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId: req.user.userId,
        description,
        amount: parseFloat(amount),
        type: (type || 'EXPENSE').toUpperCase(),
        category,
        date: date ? new Date(date) : new Date(),
      },
    });

    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Aggregate monthly category totals for Recharts
router.get('/monthly-summary', requireAuth, async (req, res) => {
  try {
    const { year } = req.query;
    const targetYear = parseInt(year) || new Date().getFullYear();

    const aggregations = await prisma.transaction.groupBy({
      by: ['category', 'type'],
      where: {
        userId: req.user.userId,
        date: {
          gte: new Date(`${targetYear}-01-01`),
          lt: new Date(`${targetYear + 1}-01-01`),
        },
      },
      _sum: {
        amount: true,
      },
    });

    res.json(aggregations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bulk import transactions via CSV upload
router.post('/upload-csv', requireAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No CSV file provided' });
    }

    const records = [];
    const parser = parse({
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    parser.on('readable', () => {
      let record;
      while ((record = parser.read()) !== null) {
        const rawAmount = parseFloat(record.Amount || record.amount || 0);
        const rawType = (record.Type || record.type || (rawAmount >= 0 ? 'INCOME' : 'EXPENSE')).toUpperCase();

        records.push({
          userId: req.user.userId,
          description: record.Description || record.description || 'Imported Transaction',
          amount: Math.abs(rawAmount),
          type: rawType,
          category: record.Category || record.category || 'Uncategorized',
          date: record.Date || record.date ? new Date(record.Date || record.date) : new Date(),
        });
      }
    });

    parser.on('error', (err) => {
      res.status(400).json({ error: `CSV Parsing error: ${err.message}` });
    });

    parser.on('end', async () => {
      if (records.length === 0) {
        return res.status(400).json({ error: 'CSV file contains no valid rows' });
      }

      const result = await prisma.transaction.createMany({
        data: records,
        skipDuplicates: true,
      });

      return res.status(201).json({
        message: 'CSV imported successfully',
        count: result.count,
      });
    });

    // Feed file buffer into the stream parser
    parser.write(req.file.buffer);
    parser.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
export default router;