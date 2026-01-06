import { CodeVerifierVO, ValueObjectError } from "@domain";

describe('CodeVerifierVO', () => {
	describe('create', () => {
		it('should create a valid code verifier with valid input', () => {
			const validVerifier = 'a'.repeat(43);
			const result = CodeVerifierVO.create(validVerifier);
			expect(result).toBeInstanceOf(CodeVerifierVO);
			expect(result.getValue()).toBe(validVerifier);
		});

		it('should create a code verifier with minimum length (43 characters)', () => {
			const verifier = 'a'.repeat(43);
			const result = CodeVerifierVO.create(verifier);
			expect(result.getValue()).toBe(verifier);
		});

		it('should create a code verifier with maximum length (128 characters)', () => {
			const verifier = 'a'.repeat(128);
			const result = CodeVerifierVO.create(verifier);
			expect(result.getValue()).toBe(verifier);
		});

		it('should accept base64url characters (A-Z, a-z, 0-9, -, _)', () => {
			const verifier = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'.repeat(2).substring(0, 43);
			const result = CodeVerifierVO.create(verifier);
			expect(result.getValue()).toBe(verifier);
		});

		it('should throw error when code verifier is empty', () => {
			expect(() => CodeVerifierVO.create('')).toThrow(ValueObjectError);
		});

		it('should throw error when code verifier is only whitespace', () => {
			expect(() => CodeVerifierVO.create('   ')).toThrow(ValueObjectError);
		});

		it('should throw error when code verifier is shorter than 43 characters', () => {
			const verifier = 'a'.repeat(42);
			expect(() => CodeVerifierVO.create(verifier)).toThrow(ValueObjectError);
		});

		it('should throw error when code verifier is longer than 128 characters', () => {
			const verifier = 'a'.repeat(129);
			expect(() => CodeVerifierVO.create(verifier)).toThrow(ValueObjectError);
		});

		it('should throw error when code verifier contains invalid characters', () => {
			const verifier = 'a'.repeat(40) + '!@#';
			expect(() => CodeVerifierVO.create(verifier)).toThrow(ValueObjectError);
		});

		it('should throw error when code verifier contains spaces', () => {
			const verifier = 'a'.repeat(42) + ' ';
			expect(() => CodeVerifierVO.create(verifier)).toThrow(ValueObjectError);
		});
	});

	describe('getValue', () => {
		it('should return the underlying value', () => {
			const verifier = 'a'.repeat(43);
			const result = CodeVerifierVO.create(verifier);
			expect(result.getValue()).toBe(verifier);
		});
	});
});
