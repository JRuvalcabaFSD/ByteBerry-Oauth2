import { describe, it, expect, vi } from 'vitest';
import { ValidateRequestError } from '@shared';
import { LoginRequestDTO, LoginResponseDTO } from '@application';

describe('LoginRequestDTO', () => {
	describe('fromBody', () => {
		it('should create a LoginRequestDTO with valid data', () => {
			const body = {
				emailOrUserName: 'user@example.com',
				password: 'securePassword123',
				userAgent: 'Mozilla/5.0',
			};

			const dto = LoginRequestDTO.fromBody(body, '192.168.1.1');

			expect(dto.emailOrUserName).toBe('user@example.com');
			expect(dto.password).toBe('securePassword123');
			expect(dto.userAgent).toBe('Mozilla/5.0');
			expect(dto.ipAddress).toBe('192.168.1.1');
		});

		it('should throw ValidateRequestError on validation failure', () => {
			const body = { emailOrUserName: '', password: '' };

			expect(() => LoginRequestDTO.fromBody(body)).toThrow(ValidateRequestError);
		});

		it('should handle optional rememberMe parameter', () => {
			const body = {
				emailOrUserName: 'test@test.com',
				password: 'pass123'
			};

			const dto = LoginRequestDTO.fromBody(body, '10.0.0.1');

			expect(dto.emailOrUserName).toBe('test@test.com');
			expect(dto.password).toBe('pass123');
			expect(dto.ipAddress).toBe('10.0.0.1');
		});
	});
});

describe('LoginResponseDTO', () => {
	describe('fromEntities', () => {
		it('should create a LoginResponseDTO from user and session entities', () => {
			const mockUser = {
				toPublic: vi.fn().mockReturnValue({
					id: '123',
					email: 'user@example.com',
					username: 'testuser',
					fullName: 'Test User',
					roles: ['user'],
				}),
			};

			const mockSession = {
				id: 'session-123',
				expiresAt: new Date('2025-01-01'),
			};

			const dto = LoginResponseDTO.fromEntities(mockUser as any, mockSession as any);

			expect(dto.sessionId).toBe('session-123');
			expect(dto.user.id).toBe('123');
			expect(dto.user.email).toBe('user@example.com');
			expect(dto.expiresAt).toEqual(new Date('2025-01-01'));
			expect(dto.message).toBe('Login successful');
		});

		it('should call user.toPublic() to get public user data', () => {
			const mockUser = { toPublic: vi.fn().mockReturnValue({ id: '123' }) };
			const mockSession = { id: 'session-123', expiresAt: new Date() };

			LoginResponseDTO.fromEntities(mockUser as any, mockSession as any);

			expect(mockUser.toPublic).toHaveBeenCalled();
		});
	});

	describe('toJson', () => {
		it('should convert expiresAt to ISO string format', () => {
			const expiresAt = new Date('2025-01-01T12:00:00Z');
			const mockUser = {
				toPublic: vi.fn().mockReturnValue({ id: '123', email: 'test@test.com', username: null, fullName: null, roles: [] }),
			};
			const mockSession = { id: 'session-123', expiresAt };

			const dto = LoginResponseDTO.fromEntities(mockUser as any, mockSession as any);
			const json = dto.toJson();

			expect(json.expiresAt).toBe('2025-01-01T12:00:00.000Z');
			expect(typeof json.expiresAt).toBe('string');
		});

		it('should return user and message in json output', () => {
			const user = { id: '123', email: 'test@test.com', username: 'test', fullName: 'Test', roles: ['admin'] };
			const mockUser = { toPublic: vi.fn().mockReturnValue(user) };
			const mockSession = { id: 'session-123', expiresAt: new Date() };

			const dto = LoginResponseDTO.fromEntities(mockUser as any, mockSession as any);
			const json = dto.toJson();

			expect(json.user).toEqual(user);
			expect(json.message).toBe('Login successful');
		});
	});
});
