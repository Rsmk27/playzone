import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST } from '../../../../../app/api/webhooks/clerk/route';
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { createUser, updateUser, deleteUser } from '../../../../../lib/actions/user.actions';

// Mock dependencies
vi.mock('svix', () => {
  return {
    Webhook: class {
      verify() {}
    }
  };
});

vi.mock('next/headers', () => {
  return {
    headers: vi.fn(),
  };
});

vi.mock('../../../../../lib/actions/user.actions', () => ({
  createUser: vi.fn(),
  updateUser: vi.fn(),
  deleteUser: vi.fn(),
}));

describe('Clerk Webhook POST', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetAllMocks();
    process.env = { ...originalEnv, CLERK_WEBHOOK_SECRET: 'test_secret' };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should return 400 when webhook verification fails', async () => {
    // Setup request and headers
    const req = new Request('https://example.com/api/webhooks/clerk', {
      method: 'POST',
      body: JSON.stringify({ data: 'test' }),
    });

    const mockHeaders = new Map([
      ['svix-id', 'test_id'],
      ['svix-timestamp', 'test_timestamp'],
      ['svix-signature', 'test_signature'],
    ]);

    vi.mocked(headers).mockReturnValue({
      get: (key: string) => mockHeaders.get(key) || null,
    } as any);

    // Mock Webhook.verify to throw an error
    const mockVerify = vi.fn().mockImplementation(() => {
      throw new Error('Verification failed');
    });
    vi.spyOn(Webhook.prototype, 'verify').mockImplementation(mockVerify);

    // Suppress console.error
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Execute
    const response = await POST(req);

    // Assert
    expect(response.status).toBe(400);
    expect(await response.text()).toBe('Error occurred during verification');
    expect(consoleSpy).toHaveBeenCalledWith('Error verifying webhook:', expect.any(Error));

    // Cleanup
    consoleSpy.mockRestore();
  });
});
