import { UserEntity } from '@domain';
import { describe, it, expect, beforeEach } from 'vitest';

describe('UserEntity', () => {
	const baseProps = {
		id: '123',
		email: 'USER@EXAMPLE.COM',
		username: 'user123',
		passwordHash: 'hashedPassword',
		fullName: 'User Example',
		roles: ['user'],
		isActive: true,
		emailVerified: false,
	};

	describe('create', () => {
		it('should create a user with provided properties', () => {
			const user = UserEntity.create(baseProps);

			expect(user.id).toBe('123');
			expect(user.email).toBe('user@example.com');
			expect(user.username).toBe('user123');
			expect(user.passwordHash).toBe('hashedPassword');
		});

		it('should normalize email to lowercase and trim whitespace', () => {
			const user = UserEntity.create({ ...baseProps, email: '  USER@EXAMPLE.COM  ' });

			expect(user.email).toBe('user@example.com');
		});

		it('should default username to null if not provided', () => {
			const user = UserEntity.create({ ...baseProps, username: null });

			expect(user.username).toBeNull();
		});

		it('should default fullName to null if not provided', () => {
			const user = UserEntity.create({ ...baseProps, fullName: null });

			expect(user.fullName).toBeNull();
		});

		it('should default roles to ["user"] if not provided', () => {
			const user = UserEntity.create({ ...baseProps, roles: [] });

			expect(user.roles).toEqual([]);
		});

		it('should default isActive to true if not provided', () => {
			const user = UserEntity.create({ ...baseProps, isActive: false });

			expect(user.isActive).toBe(false);
		});

		it('should default emailVerified to false if not provided', () => {
			const user = UserEntity.create(baseProps);

			expect(user.emailVerified).toBe(false);
		});

		it('should set createdAt and updatedAt to current date if not provided', () => {
			const beforeCreation = new Date();
			const user = UserEntity.create(baseProps);
			const afterCreation = new Date();

			expect(user.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
			expect(user.createdAt.getTime()).toBeLessThanOrEqual(afterCreation.getTime());
			expect(user.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
			expect(user.updatedAt.getTime()).toBeLessThanOrEqual(afterCreation.getTime());
		});

		it('should use provided createdAt and updatedAt dates', () => {
			const createdAt = new Date('2023-01-01');
			const updatedAt = new Date('2023-01-02');
			const user = UserEntity.create({ ...baseProps, createdAt, updatedAt });

			expect(user.createdAt).toEqual(createdAt);
			expect(user.updatedAt).toEqual(updatedAt);
		});
	});

	describe('hasRole', () => {
		let user: UserEntity;

		beforeEach(() => {
			user = UserEntity.create({ ...baseProps, roles: ['user', 'admin'] });
		});

		it('should return true if user has the specified role', () => {
			expect(user.hasRole('admin')).toBe(true);
			expect(user.hasRole('user')).toBe(true);
		});

		it('should return false if user does not have the specified role', () => {
			expect(user.hasRole('moderator')).toBe(false);
		});
	});

	describe('hasAnyRoles', () => {
		let user: UserEntity;

		beforeEach(() => {
			user = UserEntity.create({ ...baseProps, roles: ['user'] });
		});

		it('should return true if user has at least one of the specified roles', () => {
			expect(user.hasAnyRoles(['admin', 'user'])).toBe(true);
			expect(user.hasAnyRoles(['user', 'moderator'])).toBe(true);
		});

		it('should return false if user has none of the specified roles', () => {
			expect(user.hasAnyRoles(['admin', 'moderator'])).toBe(false);
		});

		it('should return false for empty roles array', () => {
			expect(user.hasAnyRoles([])).toBe(false);
		});
	});

	describe('canLogin', () => {
		it('should return true if user is active', () => {
			const user = UserEntity.create({ ...baseProps, isActive: true });

			expect(user.canLogin()).toBe(true);
		});

		it('should return false if user is inactive', () => {
			const user = UserEntity.create({ ...baseProps, isActive: false });

			expect(user.canLogin()).toBe(false);
		});
	});

	describe('toPublic', () => {
		it('should return user data without passwordHash', () => {
			const user = UserEntity.create(baseProps);
			const publicUser = user.toPublic();

			expect(publicUser).not.toHaveProperty('passwordHash');
			expect(publicUser.id).toBe('123');
			expect(publicUser.email).toBe('user@example.com');
			expect(publicUser.username).toBe('user123');
			expect(publicUser.fullName).toBe('User Example');
			expect(publicUser.roles).toEqual(['user']);
			expect(publicUser.isActive).toBe(true);
			expect(publicUser.emailVerified).toBe(false);
		});
	});
});
