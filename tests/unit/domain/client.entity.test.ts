import { ClientEntity } from '@domain';
import { describe, it, expect, beforeEach } from 'vitest';

describe('ClientEntity', () => {
	const mockClientData = {
		id: '1',
		clientId: 'test-client-id',
		clientSecret: 'test-secret',
		clientName: 'Test Client',
		redirectUris: ['http://localhost:3000/callback'],
		grantTypes: ['authorization_code', 'refresh_token'],
		isPublic: false,
		isActive: true,
		userId: 'user-1',
	};

	describe('create', () => {
		it('should create a new ClientEntity instance', () => {
			const client = ClientEntity.create(mockClientData);
			expect(client).toBeInstanceOf(ClientEntity);
		});

		it('should set isPublic to false by default', () => {
			const client = ClientEntity.create({
				...mockClientData,
				isPublic: undefined as any,
			});
			expect(client.isPublic).toBe(false);
		});

		it('should set isActive to true by default', () => {
			const client = ClientEntity.create({
				...mockClientData,
				isActive: undefined as any,
			});
			expect(client.isActive).toBe(true);
		});

		it('should set createdAt and updatedAt to current date by default', () => {
			const client = ClientEntity.create(mockClientData);
			expect(client.createdAt).toBeInstanceOf(Date);
			expect(client.updatedAt).toBeInstanceOf(Date);
		});

		it('should preserve provided values', () => {
			const client = ClientEntity.create(mockClientData);
			expect(client.clientId).toBe(mockClientData.clientId);
			expect(client.clientSecret).toBe(mockClientData.clientSecret);
			expect(client.clientName).toBe(mockClientData.clientName);
		});
	});

	describe('isOwnedBy', () => {
		let client: ClientEntity;

		beforeEach(() => {
			client = ClientEntity.create(mockClientData);
		});

		it('should return true when userId matches', () => {
			expect(client.isOwnedBy('user-1')).toBe(true);
		});

		it('should return false when userId does not match', () => {
			expect(client.isOwnedBy('user-2')).toBe(false);
		});
	});

	describe('isClientActive', () => {
		it('should return true when client is active', () => {
			const client = ClientEntity.create(mockClientData);
			expect(client.isClientActive()).toBe(true);
		});

		it('should return false when client is inactive', () => {
			const client = ClientEntity.create({
				...mockClientData,
				isActive: false,
			});
			expect(client.isClientActive()).toBe(false);
		});
	});

	describe('isValidRedirectUri', () => {
		let client: ClientEntity;

		beforeEach(() => {
			client = ClientEntity.create(mockClientData);
		});

		it('should return true for a valid redirect URI', () => {
			expect(client.isValidRedirectUri('http://localhost:3000/callback')).toBe(
				true
			);
		});

		it('should return false for an invalid redirect URI', () => {
			expect(client.isValidRedirectUri('http://localhost:4000/callback')).toBe(
				false
			);
		});
	});

	describe('supportsGrandType', () => {
		let client: ClientEntity;

		beforeEach(() => {
			client = ClientEntity.create(mockClientData);
		});

		it('should return true for a supported grant type', () => {
			expect(client.supportsGrandType('authorization_code')).toBe(true);
		});

		it('should return false for an unsupported grant type', () => {
			expect(client.supportsGrandType('client_credentials')).toBe(false);
		});
	});

	describe('toPublic', () => {
		it('should return client data without clientSecret', () => {
			const client = ClientEntity.create(mockClientData);
			const publicData = client.toPublic();

			expect(publicData).not.toHaveProperty('clientSecret');
			expect(publicData.clientId).toBe(mockClientData.clientId);
			expect(publicData.clientName).toBe(mockClientData.clientName);
		});

		it('should include all other properties', () => {
			const client = ClientEntity.create(mockClientData);
			const publicData = client.toPublic();

			expect(publicData).toHaveProperty('id');
			expect(publicData).toHaveProperty('clientId');
			expect(publicData).toHaveProperty('clientName');
			expect(publicData).toHaveProperty('redirectUris');
			expect(publicData).toHaveProperty('grantTypes');
			expect(publicData).toHaveProperty('isPublic');
			expect(publicData).toHaveProperty('isActive');
			expect(publicData).toHaveProperty('createdAt');
			expect(publicData).toHaveProperty('updatedAt');
			expect(publicData).toHaveProperty('userId');
		});
	});
});
