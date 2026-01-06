import { NodeHashService } from '@infrastructure';
import type { IConfig } from '@interfaces';

describe('NodeHashService', () => {
	let hashService: NodeHashService;
	let mockConfig: IConfig;

	beforeEach(() => {
		mockConfig = {
			bcryptRounds: 10,
		} as IConfig;
		hashService = new NodeHashService(mockConfig);
	});

	describe('constructor', () => {
		it('should use provided bcryptRounds from config', () => {
			const config = { bcryptRounds: 12 } as IConfig;
			const service = new NodeHashService(config);
			expect(service['BCRYPT_ROUNDS']).toBe(12);
		});

		it('should default to 10 rounds if bcryptRounds is not provided', () => {
			const config = {} as IConfig;
			const service = new NodeHashService(config);
			expect(service['BCRYPT_ROUNDS']).toBe(10);
		});
	});

	describe('verifySha256', () => {
		it('should return true for matching SHA-256 hash', () => {
			const value = 'testValue';
			const hash = hashService.verifySha256(value, 'gv4Mg0y-oGkBPF63go5Zmmk-DSQRiH4qsnMnFmKXMII');
			expect(hash).toBe(true);
		});

		it('should return false for non-matching SHA-256 hash', () => {
			const value = 'testValue';
			const result = hashService.verifySha256(value, 'wrongHash');
			expect(result).toBe(false);
		});

		it('should handle empty string', () => {
			const value = '';
			const result = hashService.verifySha256(value, '47DEQpj8HBSa-_TImW-5JCeuQeRkm5NMpJWZG3hSuFU');
			expect(result).toBe(true);
		});
	});

	describe('hashPassword', () => {
		it('should hash a password and return a non-empty string', async () => {
			const password = 'myPassword123';
			const hashedPassword = await hashService.hashPassword(password);
			expect(hashedPassword).toBeDefined();
			expect(typeof hashedPassword).toBe('string');
			expect(hashedPassword.length).toBeGreaterThan(0);
		});

		it('should produce different hashes for the same password', async () => {
			const password = 'myPassword123';
			const hash1 = await hashService.hashPassword(password);
			const hash2 = await hashService.hashPassword(password);
			expect(hash1).not.toBe(hash2);
		});
	});

	describe('verifyPassword', () => {
		it('should return true for matching password', async () => {
			const password = 'myPassword123';
			const hashedPassword = await hashService.hashPassword(password);
			const result = await hashService.verifyPassword(password, hashedPassword);
			expect(result).toBe(true);
		});

		it('should return false for non-matching password', async () => {
			const password = 'myPassword123';
			const hashedPassword = await hashService.hashPassword(password);
			const result = await hashService.verifyPassword('wrongPassword', hashedPassword);
			expect(result).toBe(false);
		});

		it('should return false if comparison throws an error', async () => {
			const result = await hashService.verifyPassword('password', 'invalidHash');
			expect(result).toBe(false);
		});
	});
});
