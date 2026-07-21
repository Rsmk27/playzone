// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import mongoose from 'mongoose';
import { connectToDatabase } from '../../lib/mongodb';

vi.mock('mongoose', () => {
  return {
    default: {
      connect: vi.fn(),
    },
  };
});

describe('connectToDatabase', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    // Clear globalThis.mongoose to reset cached state
    globalThis.mongoose = undefined;
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should throw an error if MONGODB_URI is not defined', async () => {
    delete process.env.MONGODB_URI;

    await expect(connectToDatabase()).rejects.toThrow(
      'Please define the MONGODB_URI environment variable inside .env.local'
    );
  });

  it('should connect to database successfully and cache the connection', async () => {
    process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
    const mockMongooseInstance = { connection: { readyState: 1 } };
    (mongoose.connect as any).mockResolvedValue(mockMongooseInstance);

    const result = await connectToDatabase();

    expect(mongoose.connect).toHaveBeenCalledWith('mongodb://localhost:27017/test', {
      bufferCommands: false,
    });
    expect(result).toBe(mockMongooseInstance);

    // Test that the cached connection is returned on subsequent calls
    const result2 = await connectToDatabase();
    expect(mongoose.connect).toHaveBeenCalledTimes(1); // Should not call connect again
    expect(result2).toBe(mockMongooseInstance);
  });

  it('should handle mongoose.connect failure, clear promise cache, and throw error', async () => {
    // We need to fetch connectToDatabase freshly so it evaluates `cached` initialization
    // with globalThis.mongoose already cleared out.
    vi.resetModules();

    const { connectToDatabase: freshConnect } = await import('../../lib/mongodb');
    process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
    const mockError = new Error('Connection failed');
    (mongoose.connect as any).mockRejectedValue(mockError);

    await expect(freshConnect()).rejects.toThrow('Connection failed');

    expect(mongoose.connect).toHaveBeenCalledTimes(1);

    // Test that cache promise is cleared, so it tries connecting again on next call
    (mongoose.connect as any).mockResolvedValue({ connection: { readyState: 1 } });
    await freshConnect();

    expect(mongoose.connect).toHaveBeenCalledTimes(2);
  });

  it('should reuse existing globalThis.mongoose if it exists', async () => {
    const mockCache = { conn: { readyState: 1 }, promise: Promise.resolve({ readyState: 1 }) };
    globalThis.mongoose = mockCache as any;

    vi.resetModules();
    const { connectToDatabase: freshConnect } = await import('../../lib/mongodb');

    process.env.MONGODB_URI = 'mongodb://localhost:27017/test';

    const result = await freshConnect();

    expect(result).toBe(mockCache.conn);
    expect(mongoose.connect).not.toHaveBeenCalled();
  });

  it('should handle concurrent calls by returning the same promise', async () => {
    // Reset modules to ensure fresh cache since previous test manipulated globalThis
    vi.resetModules();
    globalThis.mongoose = undefined;
    const { connectToDatabase: freshConnect } = await import('../../lib/mongodb');

    process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
    const mockMongooseInstance = { connection: { readyState: 1 } };

    let resolvePromise: (value: any) => void;
    const connectPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    (mongoose.connect as any).mockReturnValue(connectPromise);

    const promise1 = freshConnect();
    const promise2 = freshConnect();

    resolvePromise!(mockMongooseInstance);

    const [result1, result2] = await Promise.all([promise1, promise2]);

    expect(mongoose.connect).toHaveBeenCalledTimes(1);
    expect(result1).toBe(mockMongooseInstance);
    expect(result2).toBe(mockMongooseInstance);
  });
});
