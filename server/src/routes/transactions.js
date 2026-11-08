import express from 'express';
import { uploadCsv } from '../middleware/upload.js';
import { parse } from 'csv-parse/sync';
import prisma from '../prismaClient.js';
import { requireAuth } from '../middleware/auth.js'; // or your auth middleware location

const router = express.Router();

// ... GET / and POST / routes ...
router.get('/', requireAuth, async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId: req.user.userId },
      orderBy: { date: 'desc' },
    });
    return res.status(200).json(transactions);
  } catch (err) {
    console.error('Fetch Transactions Error:', err);
    return res.status(500).json({ error: 'Failed to retrieve transactions' });
  }
});


router.get('/monthly-summary', requireAuth, async (req, res) => {
  try {
    const { year } = req.query;
    const queryYear = year ? parseInt(year) : new Date().getFullYear();

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: req.user.userId,
        date: {
          gte: new Date(`${queryYear}-01-01`),
          lte: new Date(`${queryYear}-12-31`),
        },
      },
    });

    const summary = Array.from({ length: 12 }, (_, i) => ({ month: i + 1, income: 0, expense: 0 }));
    transactions.forEach(t => {
      const month = new Date(t.date).getMonth();
      if (t.type === 'INCOME') summary[month].income += t.amount;
      else if (t.type === 'EXPENSE') summary[month].expense += t.amount;
    });

    return res.status(200).json(summary);
  } catch (err) {
    console.error('Fetch Summary Error:', err);
    return res.status(500).json({ error: 'Failed to calculate monthly summary' });
  }
});


// Add this route to your Express transactions router file:
router.post('/', requireAuth, async (req, res) => {
  try {
    const { description, amount, type, category, date } = req.body;

    // Basic Validation
    if (!description || !amount || !type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId: req.user.userId,
        description,
        amount: Math.abs(parseFloat(amount)),
        type: type.toUpperCase(), // 'INCOME' or 'EXPENSE'
        category: category || 'Uncategorized',
        date: date ? new Date(date) : new Date(),
      },
    });

    return res.status(201).json(transaction);
  } catch (err) {
    console.error('Create Transaction Error:', err);
    return res.status(500).json({ error: 'Failed to create transaction' });
  }
});


router.post('/upload-csv', requireAuth, uploadCsv.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No CSV file provided' });
    }

    if (!req.file.buffer) {
      return res.status(500).json({ error: 'Multer is not configured with memoryStorage' });
    }

    // 1. Synchronously parse CSV from memory buffer
    const parsedRows = parse(req.file.buffer, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    if (!parsedRows || parsedRows.length === 0) {
      return res.status(400).json({ error: 'CSV file contains no valid rows' });
    }

    // 2. Map rows to schema with safe fallbacks
    const records = parsedRows.map((record) => {
      const rawAmount = parseFloat(record.Amount || record.amount || 0);
      const rawType = (
        record.Type || 
        record.type || 
        (rawAmount >= 0 ? 'INCOME' : 'EXPENSE')
      ).toUpperCase();

      const rawDateStr = record.Date || record.date;
      const parsedDate = rawDateStr ? new Date(rawDateStr) : new Date();
      const safeDate = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;

      return {
        userId: req.user.userId,
        description: record.Description || record.description || 'Imported Transaction',
        amount: Math.abs(rawAmount),
        type: rawType,
        category: record.Category || record.category || 'Uncategorized',
        date: safeDate,
      };
    });

    // 3. Batch insert via Prisma
    const result = await prisma.transaction.createMany({
      data: records,
      skipDuplicates: true,
    });

    return res.status(201).json({
      message: 'CSV imported successfully',
      count: result.count,
    });
  } catch (err) {
    console.error('CSV Upload Error:', err);
    return res.status(500).json({ error: err.message || 'Failed to process CSV file' });
  }
});

export default router;