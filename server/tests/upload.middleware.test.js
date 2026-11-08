import { describe, it, expect, vi } from 'vitest';
import { uploadCsv } from '../src/middleware/upload.js';

describe('Upload Middleware (uploadCsv)', () => {
  // Extract fileFilter from the multer instance options
  const { fileFilter } = uploadCsv;

  it('accepts files with mimetype "text/csv"', () => {
    const cb = vi.fn();
    const mockFile = {
      mimetype: 'text/csv',
      originalname: 'report.txt', // Extension doesn't matter if mimetype matches
    };

    fileFilter({}, mockFile, cb);

    expect(cb).toHaveBeenCalledWith(null, true);
  });

  it('accepts files ending with .csv even if mimetype is different', () => {
    const cb = vi.fn();
    const mockFile = {
      mimetype: 'application/octet-stream',
      originalname: 'transactions.csv',
    };

    fileFilter({}, mockFile, cb);

    expect(cb).toHaveBeenCalledWith(null, true);
  });

  it('rejects files with invalid mimetype and non-.csv extension', () => {
    const cb = vi.fn();
    const mockFile = {
      mimetype: 'image/png',
      originalname: 'avatar.png',
    };

    fileFilter({}, mockFile, cb);

    expect(cb).toHaveBeenCalledWith(expect.any(Error), false);
    expect(cb.mock.calls[0][0].message).toBe('Only CSV files are allowed!');
  });

  it('is configured with a 5 MB file size limit', () => {
    expect(uploadCsv.limits.fileSize).toBe(5 * 1024 * 1024);
  });
});