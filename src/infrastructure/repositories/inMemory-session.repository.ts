import { Injectable } from '@shared';
import { SessionEntity } from '@domain';
import type { IConfig, ISessionRepository } from '@interfaces';

@Injectable({ name: 'SessionRepository' })
export class InMemorySessionRepository implements ISessionRepository {
	private readonly sessions = new Map<string, SessionEntity>();
	private readonly userSessionsIndex = new Map<string, Set<string>>();
	private cleanupInterval: NodeJS.Timeout | null;

	constructor(private readonly config: IConfig) {
		this.cleanupInterval = null;
		this.startAutoCleanup(this.config.autoCleanupIntervalMs);
	}

	public async save(session: SessionEntity): Promise<void> {
		this.sessions.set(session.id, session);

		if (!this.userSessionsIndex.has(session.userId)) {
			this.userSessionsIndex.set(session.userId, new Set());
		}
		this.userSessionsIndex.get(session.userId)!.add(session.id);
	}

	public async findById(sessionId: string): Promise<SessionEntity | null> {
		const session = this.sessions.get(sessionId);
		if (!session) return null;
		if (session.isExpired()) return null;
		return session;
	}

	public async deleteById(sessionId: string): Promise<void> {
		const session = this.sessions.get(sessionId);

		if (!session) return;

		this.sessions.delete(sessionId);

		const userSessions = this.userSessionsIndex.get(session.userId);
		if (userSessions) {
			userSessions.delete(sessionId);
			if (userSessions.size === 0) {
				this.userSessionsIndex.delete(session.userId);
			}
		}
	}
	public async deleteByUserId(userId: string): Promise<void> {
		const sessionIds = this.userSessionsIndex.get(userId);
		if (!sessionIds || sessionIds.size === 0) return;
		for (const sessionId of sessionIds) {
			this.sessions.delete(sessionId);
		}
		this.userSessionsIndex.delete(userId);
	}
	public async cleanup(): Promise<number> {
		const now = new Date();
		let deletedCount = 0;
		const expiredSessionIds: string[] = [];
		for (const [sessionId, session] of this.sessions.entries()) {
			if (session.expiresAt <= now) {
				expiredSessionIds.push(sessionId);
			}
		}
		for (const sessionId of expiredSessionIds) {
			await this.deleteById(sessionId);
			deletedCount++;
		}

		return deletedCount;
	}
	public async findByUserId(_userId: string): Promise<SessionEntity[]> {
		throw new Error('Method not implemented.');
	}
	public async countByUserId(_userId: string): Promise<number> {
		throw new Error('Method not implemented.');
	}
	public async getAuditTrail(_sessionId: string): Promise<unknown[]> {
		throw new Error('Method not implemented.');
	}

	public stopAutoCleanup(): void {
		if (this.cleanupInterval) {
			clearInterval(this.cleanupInterval);
			this.cleanupInterval = null;
		}
	}

	public getStats(): {
		totalSessions: number;
		totalUsers: number;
		expiredSessions: number;
	} {
		const now = new Date();
		let expiredCount = 0;

		for (const session of this.sessions.values()) {
			if (session.expiresAt <= now) {
				expiredCount++;
			}
		}

		return {
			totalSessions: this.sessions.size,
			totalUsers: this.userSessionsIndex.size,
			expiredSessions: expiredCount,
		};
	}

	public async clear(): Promise<void> {
		this.sessions.clear();
		this.userSessionsIndex.clear();
	}

	private startAutoCleanup(intervalMs: number) {
		this.cleanupInterval = setInterval(() => {
			void this.cleanup();
		}, intervalMs);
	}
}
