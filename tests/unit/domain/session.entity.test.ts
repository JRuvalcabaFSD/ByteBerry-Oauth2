import { SessionEntity } from '@domain';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('SessionEntity', () => {
	let mockDate: Date;

	beforeEach(() => {
		mockDate = new Date('2024-01-15T10:00:00Z');
		vi.useFakeTimers();
		vi.setSystemTime(mockDate);
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe('create', () => {
		it('should create a session with required properties', () => {
			const session = SessionEntity.create({
				id: 'session-123',
				userId: 'user-456',
			});

			expect(session.id).toBe('session-123');
			expect(session.userId).toBe('user-456');
			expect(session.createdAt).toEqual(mockDate);
			expect(session.userAgent).toBeNull();
			expect(session.ipAddress).toBeNull();
			expect(session.metadata).toEqual({});
		});

		it('should use default ttl of 3600 seconds', () => {
			const session = SessionEntity.create({
				id: 'session-123',
				userId: 'user-456',
			});

			const expectedExpiry = new Date(mockDate.getTime() + 3600 * 1000);
			expect(session.expiresAt).toEqual(expectedExpiry);
		});

		it('should use custom ttl when provided', () => {
			const session = SessionEntity.create({
				id: 'session-123',
				userId: 'user-456',
				ttlSeconds: 7200,
			});

			const expectedExpiry = new Date(mockDate.getTime() + 7200 * 1000);
			expect(session.expiresAt).toEqual(expectedExpiry);
		});

		it('should set optional properties when provided', () => {
			const metadata = { theme: 'dark', locale: 'en' };
			const session = SessionEntity.create({
				id: 'session-123',
				userId: 'user-456',
				userAgent: 'Mozilla/5.0',
				ipAddress: '192.168.1.1',
				metadata,
			});

			expect(session.userAgent).toBe('Mozilla/5.0');
			expect(session.ipAddress).toBe('192.168.1.1');
			expect(session.metadata).toEqual(metadata);
		});

		it('should use custom createdAt when provided', () => {
			const customDate = new Date('2024-01-14T10:00:00Z');
			const session = SessionEntity.create({
				id: 'session-123',
				userId: 'user-456',
				createdAt: customDate,
			});

			expect(session.createdAt).toEqual(customDate);
		});

		it('should use custom expiresAt when provided', () => {
			const customExpiry = new Date('2024-01-16T10:00:00Z');
			const session = SessionEntity.create({
				id: 'session-123',
				userId: 'user-456',
				expiresAt: customExpiry,
			});

			expect(session.expiresAt).toEqual(customExpiry);
		});
	});

	describe('isExpired', () => {
		it('should return false for valid session', () => {
			const session = SessionEntity.create({
				id: 'session-123',
				userId: 'user-456',
				ttlSeconds: 3600,
			});

			expect(session.isExpired()).toBe(false);
		});

		it('should return true for expired session', () => {
			const session = SessionEntity.create({
				id: 'session-123',
				userId: 'user-456',
				expiresAt: new Date(mockDate.getTime() - 1000),
			});

			expect(session.isExpired()).toBe(true);
		});

		it('should return true when current time equals expiration time', () => {
			const session = SessionEntity.create({
				id: 'session-123',
				userId: 'user-456',
				expiresAt: mockDate,
			});

			expect(session.isExpired()).toBe(true);
		});
	});

	describe('isValid', () => {
		it('should return true for valid session', () => {
			const session = SessionEntity.create({
				id: 'session-123',
				userId: 'user-456',
				ttlSeconds: 3600,
			});

			expect(session.isValid()).toBe(true);
		});

		it('should return false for expired session', () => {
			const session = SessionEntity.create({
				id: 'session-123',
				userId: 'user-456',
				expiresAt: new Date(mockDate.getTime() - 1000),
			});

			expect(session.isValid()).toBe(false);
		});
	});

	describe('getRemainingSeconds', () => {
		it('should return correct remaining seconds', () => {
			const session = SessionEntity.create({
				id: 'session-123',
				userId: 'user-456',
				ttlSeconds: 3600,
			});

			const remaining = session.getRemainingSeconds();
			expect(remaining).toBe(3600);
		});

		it('should return 0 for expired session', () => {
			const session = SessionEntity.create({
				id: 'session-123',
				userId: 'user-456',
				expiresAt: new Date(mockDate.getTime() - 1000),
			});

			expect(session.getRemainingSeconds()).toBe(0);
		});

		it('should return rounded down seconds', () => {
			const session = SessionEntity.create({
				id: 'session-123',
				userId: 'user-456',
				expiresAt: new Date(mockDate.getTime() + 3650500),
			});

			expect(session.getRemainingSeconds()).toBe(3650);
		});
	});

	describe('extend', () => {
		it('should extend session expiration time', () => {
			const session = SessionEntity.create({
				id: 'session-123',
				userId: 'user-456',
				ttlSeconds: 3600,
			});

			const extended = session.extend(1800);
			const expectedExpiry = new Date(mockDate.getTime() + 1800 * 1000);

			expect(extended.expiresAt).toEqual(expectedExpiry);
		});

		it('should preserve other properties after extension', () => {
			const session = SessionEntity.create({
				id: 'session-123',
				userId: 'user-456',
				userAgent: 'Mozilla/5.0',
				ipAddress: '192.168.1.1',
				metadata: { test: true },
			});

			const extended = session.extend(1800);

			expect(extended.id).toBe(session.id);
			expect(extended.userId).toBe(session.userId);
			expect(extended.createdAt).toEqual(session.createdAt);
			expect(extended.userAgent).toBe(session.userAgent);
			expect(extended.ipAddress).toBe(session.ipAddress);
			expect(extended.metadata).toEqual(session.metadata);
		});

		it('should return a new instance', () => {
			const session = SessionEntity.create({
				id: 'session-123',
				userId: 'user-456',
			});

			const extended = session.extend(1800);

			expect(extended).not.toBe(session);
			expect(extended.expiresAt).not.toEqual(session.expiresAt);
		});
	});

	describe('toObject', () => {
		it('should convert session to plain object', () => {
			const metadata = { test: true };
			const session = SessionEntity.create({
				id: 'session-123',
				userId: 'user-456',
				userAgent: 'Mozilla/5.0',
				ipAddress: '192.168.1.1',
				metadata,
			});

			const obj = session.toObject();

			expect(obj).toEqual({
				id: 'session-123',
				userId: 'user-456',
				createdAt: mockDate,
				expiresAt: session.expiresAt,
				userAgent: 'Mozilla/5.0',
				ipAddress: '192.168.1.1',
				metadata,
			});
		});

		it('should include null values in object', () => {
			const session = SessionEntity.create({
				id: 'session-123',
				userId: 'user-456',
			});

			const obj = session.toObject();

			expect(obj.userAgent).toBeNull();
			expect(obj.ipAddress).toBeNull();
		});
	});
});
