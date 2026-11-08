// src/lib/prisma.js
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pkg from 'pg';
const { Pool } = pkg;

// Only spin up the real pool
const isTest = process.env.VITEST === 'true' || process.env.NODE_ENV === 'test';

const pool = !isTest 
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    })
  : null;

const adapter = pool ? new PrismaPg(pool) : null;

export const prisma = pool 
  ? new PrismaClient({ adapter }) 
  : new PrismaClient(); // Fallback for mocking in test environments

