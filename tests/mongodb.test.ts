import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import mongoose from 'mongoose';

vi.mock('mongoose', () => ({
  default: {
    connect: vi.fn(),
  },
}));

describe('connectToDatabase', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('MONGODB_URI', 'mongodb://localhost:27017/test');

    // Setup global variable to prevent TypeError if not already present
    if (!(globalThis as any).mongoose) {
      (globalThis as any).mongoose = { conn: null, promise: null };
    } else {
      (globalThis as any).mongoose.conn = null;
      (globalThis as any).mongoose.promise = null;
    }
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('throws an error if MONGODB_URI is not defined', async () => {
    vi.stubEnv('MONGODB_URI', '');
    delete process.env.MONGODB_URI;

    // Check if the module load throws an error, or if the function call throws an error.
    // In our implementation, MONGODB_URI is read *inside* the function.
    // But let's handle both cases to be completely safe against different implementations.
    try {
      const { connectToDatabase } = await import('../lib/mongodb');
      await expect(connectToDatabase()).rejects.toThrow(
        'Please define the MONGODB_URI environment variable inside .env.local'
      );
    } catch (e: any) {
      // If it throws during import
      expect(e.message).toContain('Please define the MONGODB_URI environment variable inside .env.local');
    }
  });

  it('connects to mongodb successfully', async () => {
    const mockMongoose = { connection: { readyState: 1 } };
    vi.mocked(mongoose.connect).mockResolvedValueOnce(mockMongoose as any);

    // Import dynamically after changing env var
    const { connectToDatabase } = await import('../lib/mongodb');
    const conn = await connectToDatabase();

    expect(mongoose.connect).toHaveBeenCalledTimes(1);
    expect(mongoose.connect).toHaveBeenCalledWith('mongodb://localhost:27017/test', {
      bufferCommands: false,
    });
    expect(conn).toBe(mockMongoose);
  });

  it('returns cached connection if it exists', async () => {
    const mockMongoose = { connection: { readyState: 1 } };
    (globalThis as any).mongoose.conn = mockMongoose;

    // Import dynamically
    const { connectToDatabase } = await import('../lib/mongodb');
    const conn = await connectToDatabase();

    expect(mongoose.connect).not.toHaveBeenCalled();
    expect(conn).toBe(mockMongoose);
  });

  it('handles connection failure and resets promise', async () => {
    const error = new Error('Connection failed');
    vi.mocked(mongoose.connect).mockRejectedValueOnce(error);

    // Import dynamically
    const { connectToDatabase } = await import('../lib/mongodb');
    await expect(connectToDatabase()).rejects.toThrow('Connection failed');

    // The promise should be set to null after failure
    expect((globalThis as any).mongoose.promise).toBeNull();
  });

  it('reuses the connection promise if connecting is in progress', async () => {
    const mockMongoose = { connection: { readyState: 1 } };

    let resolveConnection: any;
    const connectPromise = new Promise((resolve) => {
      resolveConnection = resolve;
    });

    vi.mocked(mongoose.connect).mockReturnValueOnce(connectPromise as any);

    // Import dynamically
    const { connectToDatabase } = await import('../lib/mongodb');

    // Call connectToDatabase twice
    const p1 = connectToDatabase();
    const p2 = connectToDatabase();

    // Resolve the connection
    resolveConnection(mockMongoose);

    const [conn1, conn2] = await Promise.all([p1, p2]);

    // mongoose.connect should only be called once
    expect(mongoose.connect).toHaveBeenCalledTimes(1);
    expect(conn1).toBe(mockMongoose);
    expect(conn2).toBe(mockMongoose);
  });

  it('initializes globalThis.mongoose if it is not defined', async () => {
    delete (globalThis as any).mongoose;

    const { connectToDatabase } = await import('../lib/mongodb');
    const mockMongoose = { connection: { readyState: 1 } };
    vi.mocked(mongoose.connect).mockResolvedValueOnce(mockMongoose as any);

    await connectToDatabase();

    expect((globalThis as any).mongoose).toBeDefined();
    expect((globalThis as any).mongoose.conn).toBe(mockMongoose);
  });

  it('allows a subsequent connection attempt to succeed after a failure', async () => {
    const error = new Error('Connection failed');
    const mockMongoose = { connection: { readyState: 1 } };

    // First call fails, second call succeeds
    vi.mocked(mongoose.connect)
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce(mockMongoose as any);

    const { connectToDatabase } = await import('../lib/mongodb');

    // First attempt should fail
    await expect(connectToDatabase()).rejects.toThrow('Connection failed');
    expect((globalThis as any).mongoose.promise).toBeNull();

    // Second attempt should succeed
    const conn = await connectToDatabase();

    expect(conn).toBe(mockMongoose);
    expect(mongoose.connect).toHaveBeenCalledTimes(2);
  });
});
