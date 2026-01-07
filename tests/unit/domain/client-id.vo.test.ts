import { ClientIdVO, ValueObjectError } from '@domain';
import { describe, it, expect } from 'vitest';

describe('ClientIdVO', () => {
	describe('create', () => {
		it('should create a valid ClientIdVO with a valid client ID', () => {
			const clientId = ClientIdVO.create('my-client-id-123');
			expect(clientId).toBeInstanceOf(ClientIdVO);
			expect(clientId.getValue()).toBe('my-client-id-123');
		});

		it('should create a valid ClientIdVO with exactly 8 characters', () => {
			const clientId = ClientIdVO.create('12345678');
			expect(clientId.getValue()).toBe('12345678');
		});

		it('should create a valid ClientIdVO with exactly 128 characters', () => {
			const longId = 'a'.repeat(128);
			const clientId = ClientIdVO.create(longId);
			expect(clientId.getValue()).toBe(longId);
		});

		it('should throw ValueObjectError when client ID is null', () => {
			expect(() => ClientIdVO.create(null as any)).toThrow(ValueObjectError);
			expect(() => ClientIdVO.create(null as any)).toThrow('Client ID cannot be null');
		});

		it('should throw ValueObjectError when client ID is undefined', () => {
			expect(() => ClientIdVO.create(undefined as any)).toThrow(ValueObjectError);
			expect(() => ClientIdVO.create(undefined as any)).toThrow('Client ID cannot be undefined');
		});

		it('should throw ValueObjectError when client ID is empty string', () => {
			expect(() => ClientIdVO.create('')).toThrow(ValueObjectError);
			expect(() => ClientIdVO.create('')).toThrow('Client ID cannot be empty');
		});

		it('should throw ValueObjectError when client ID is only whitespace', () => {
			expect(() => ClientIdVO.create('   ')).toThrow(ValueObjectError);
			expect(() => ClientIdVO.create('   ')).toThrow('Client ID cannot be empty');
		});

		it('should throw ValueObjectError when client ID is less than 8 characters', () => {
			expect(() => ClientIdVO.create('short')).toThrow(ValueObjectError);
			expect(() => ClientIdVO.create('short')).toThrow('Client ID must be between 8 and 128 characters');
		});

		it('should throw ValueObjectError when client ID is more than 128 characters', () => {
			const longId = 'a'.repeat(129);
			expect(() => ClientIdVO.create(longId)).toThrow(ValueObjectError);
			expect(() => ClientIdVO.create(longId)).toThrow('Client ID must be between 8 and 128 characters');
		});
	});

	describe('getValue', () => {
		it('should return the client ID value', () => {
			const value = 'my-client-id-123';
			const clientId = ClientIdVO.create(value);
			expect(clientId.getValue()).toBe(value);
		});
	});

	describe('equals', () => {
		it('should return true when comparing two ClientIdVO instances with the same value', () => {
			const clientId1 = ClientIdVO.create('my-client-id-123');
			const clientId2 = ClientIdVO.create('my-client-id-123');
			expect(clientId1.equals(clientId2)).toBe(true);
		});

		it('should return false when comparing two ClientIdVO instances with different values', () => {
			const clientId1 = ClientIdVO.create('my-client-id-123');
			const clientId2 = ClientIdVO.create('other-client-id');
			expect(clientId1.equals(clientId2)).toBe(false);
		});
	});
});
