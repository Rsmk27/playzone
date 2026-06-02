import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { signInGlobally, auth } from './config.js';
import { signInAnonymously } from 'firebase/auth';

// Mock firebase/auth
vi.mock('firebase/auth', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    getAuth: vi.fn(() => ({})),
    signInAnonymously: vi.fn()
  };
});

// Mock firebase/app
vi.mock('firebase/app', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    initializeApp: vi.fn(() => ({}))
  };
});

// Mock firebase/firestore
vi.mock('firebase/firestore', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    getFirestore: vi.fn(() => ({}))
  };
});

describe('signInGlobally', () => {
  const originalConsoleError = console.error;

  beforeEach(() => {
    vi.clearAllMocks();
    console.error = vi.fn(); // Mock console.error
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  it('should return user object on successful sign in', async () => {
    const mockUser = { uid: '12345', isAnonymous: true };
    const mockCredential = { user: mockUser };

    // Setup the mock to resolve with our mock credential
    vi.mocked(signInAnonymously).mockResolvedValue(mockCredential);

    const user = await signInGlobally();

    expect(signInAnonymously).toHaveBeenCalledWith(auth);
    expect(user).toEqual(mockUser);
  });

  it('should throw error and log to console on failed sign in', async () => {
    const mockError = new Error('Auth failed');

    // Setup the mock to reject with our mock error
    vi.mocked(signInAnonymously).mockRejectedValue(mockError);

    // Assert that the function throws the error
    await expect(signInGlobally()).rejects.toThrow('Auth failed');

    // Assert that it was logged to console.error
    expect(console.error).toHaveBeenCalledWith("Error signing in anonymously:", mockError);
    expect(signInAnonymously).toHaveBeenCalledWith(auth);
  });
});
