/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest';
import { CodeChallengeVO, ValueObjectError } from '@domain';

describe('CodeChallengeVO', () => {
	describe('create', () => {
		it('should create a valid instance with S256 method', () => {
			const challenge = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';
			const result = CodeChallengeVO.create(challenge, 'S256');

			expect(result).toBeDefined();
			expect(result.getChallenge()).toBe(challenge);
			expect(result.getMethod()).toBe('S256');
		});

		it('should create a valid instance with plain method', () => {
			const challenge = 'E9Mrozoa2owUeER8ZTqVQ5xSXtd7I91AH_XXXXXXXXXXXX';
			const result = CodeChallengeVO.create(challenge, 'plain');

			expect(result).toBeDefined();
			expect(result.getChallenge()).toBe(challenge);
			expect(result.getMethod()).toBe('plain');
		});

		it('should throw error when challenge is empty', () => {
			expect(() => CodeChallengeVO.create('', 'S256')).toThrow(ValueObjectError);
			expect(() => CodeChallengeVO.create('', 'S256')).toThrow('Code challenge cannot be empty');
		});

		it('should throw error when method is empty', () => {
			const challenge = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';
			expect(() => CodeChallengeVO.create(challenge, undefined as any)).toThrow(ValueObjectError);
		});

		it('should throw error when challenge is less than 43 characters', () => {
			const challenge = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWF';
			expect(() => CodeChallengeVO.create(challenge, 'S256')).toThrow(ValueObjectError);
			expect(() => CodeChallengeVO.create(challenge, 'S256')).toThrow('Code challenge must be at least 43 characters long and not empty');
		});

		it('should throw error when challenge contains invalid characters', () => {
			const challenge = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk@';
			expect(() => CodeChallengeVO.create(challenge, 'S256')).toThrow(ValueObjectError);
			expect(() => CodeChallengeVO.create(challenge, 'S256')).toThrow('Code challenge must be base64url encoded');
		});

		it('should throw error when method is invalid', () => {
			const challenge = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';
			expect(() => CodeChallengeVO.create(challenge, 'invalid' as any)).toThrow(ValueObjectError);
			expect(() => CodeChallengeVO.create(challenge, 'invalid' as any)).toThrow('Code challenge method must be S256 or plain');
		});

		it('should throw error when challenge is only whitespace', () => {
			expect(() => CodeChallengeVO.create('   ', 'S256')).toThrow(ValueObjectError);
		});
	});

	describe('isPlainMethod', () => {
		it('should return true when method is plain', () => {
			const challenge = CodeChallengeVO.create('E9Mrozoa2owUeER8ZTqVQ5xSXtd7I91AH_XXXXXXXXXXXX', 'plain');
			expect(challenge.isPlainMethod()).toBe(true);
		});

		it('should return false when method is S256', () => {
			const challenge = CodeChallengeVO.create('dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk', 'S256');
			expect(challenge.isPlainMethod()).toBe(false);
		});
	});

	describe('verifyPlain', () => {
		it('should return true when verifier matches challenge for plain method', () => {
			const verifier = 'E9Mrozoa2owUeER8ZTqVQ5xSXtd7I91AH_XXXXXXXXXXXX';
			const challenge = CodeChallengeVO.create(verifier, 'plain');
			expect(challenge.verifyPlain(verifier)).toBe(true);
		});

		it('should return false when verifier does not match challenge for plain method', () => {
			const challenge = CodeChallengeVO.create('E9Mrozoa2owUeER8ZTqVQ5xSXtd7I91AH_XXXXXXXXXXXX', 'plain');
			expect(challenge.verifyPlain('differentVerifier123456789012345YYYYYYYYYYYYYY')).toBe(false);
		});

		it('should throw error when verifying plain on S256 method', () => {
			const challenge = CodeChallengeVO.create('dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk', 'S256');
			expect(() => challenge.verifyPlain('someVerifier')).toThrow(ValueObjectError);
			expect(() => challenge.verifyPlain('someVerifier')).toThrow('Code challenge only works for plain challenge method');
		});
	});

	describe('getChallenge', () => {
		it('should return the challenge value', () => {
			const challenge = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';
			const result = CodeChallengeVO.create(challenge, 'S256');
			expect(result.getChallenge()).toBe(challenge);
		});
	});

	describe('getMethod', () => {
		it('should return the method value', () => {
			const result = CodeChallengeVO.create('dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk', 'S256');
			expect(result.getMethod()).toBe('S256');
		});
	});
});
