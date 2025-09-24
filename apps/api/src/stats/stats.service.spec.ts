import { StatsService } from './stats.service';
import { ViewStatsDto } from './dto/view-stats.dto';

const D_DAILY_FROM = new Date('2025-09-10T00:00:00.000Z');
const D_DAILY_TO = new Date('2025-09-10T23:59:59.999Z');

const W_FROM = new Date('2025-09-08T00:00:00.000Z'); // lundi
const W_TO = new Date('2025-09-12T23:59:59.999Z'); // vendredi

const M_FROM = new Date('2025-09-01T00:00:00.000Z');
const M_TO = new Date('2025-09-30T23:59:59.999Z');

jest.mock('../helpers/date-helper', () => ({
    startOfDay: () => D_DAILY_FROM,
    endOfDay: () => D_DAILY_TO,
    startOfWeekMonday: () => W_FROM,
    endOfWeekFriday: () => W_TO,
    startOfMonth: () => M_FROM,
    endOfMonth: () => M_TO,
}));

class PrismaMock {
    reservation = {
        groupBy: jest.fn(),
    };

    room = {
        findMany: jest.fn(),
    };

    $queryRaw = jest.fn();
}

const makeService = () => {
    const prisma = new PrismaMock();
    const service = new StatsService(prisma as any);
    return { prisma, service };
};

describe('StatsService (unit)', () => {
    afterEach(() => {
        jest.clearAllMocks();
        jest.useRealTimers();
    });

    describe('topRooms', () => {
        it('should return top rooms ordered by count', async () => {
            const { prisma, service } = makeService();

            prisma.reservation.groupBy.mockResolvedValue([
                { roomId: 'A', _count: { roomId: 2, _all: 5 } },
                { roomId: 'B', _count: { roomId: 1, _all: 3 } },
            ]);

            prisma.room.findMany.mockResolvedValue([
                { id: 'A', name: 'Orion', capacity: 4, createdAt: new Date(), updatedAt: new Date() },
                { id: 'B', name: 'Vega', capacity: 6, createdAt: new Date(), updatedAt: new Date() },
            ]);

            const out = await service.topRooms({} as ViewStatsDto);

            expect(prisma.reservation.groupBy).toHaveBeenCalledWith({
                by: ['roomId'],
                where: undefined,
                _count: { roomId: true, _all: true },
                orderBy: { _count: { roomId: 'desc' } },
                take: 3,
            });

            expect(prisma.room.findMany).toHaveBeenCalledWith({
                where: { id: { in: ['A', 'B'] } },
            });

            expect(out).toEqual([
                { roomId: 'A', count: 5, room: expect.objectContaining({ id: 'A', name: 'Orion' }) },
                { roomId: 'B', count: 3, room: expect.objectContaining({ id: 'B', name: 'Vega' }) },
            ]);
        });

        it('return [] and does not call findMany if roomId is specified', async () => {
            const { prisma, service } = makeService();

            prisma.reservation.groupBy.mockResolvedValue([
                { roomId: 'X', _count: { roomId: 1, _all: 7 } },
            ]);

            prisma.room.findMany.mockResolvedValue([]);

            const out = await service.topRooms({ roomId: 'X', limit: 1 } as ViewStatsDto);

            expect(prisma.reservation.groupBy).toHaveBeenCalledWith({
                by: ['roomId'],
                where: { roomId: 'X' },
                _count: { roomId: true, _all: true },
                orderBy: { _count: { roomId: 'desc' } },
                take: 1,
            });

            expect(prisma.room.findMany).toHaveBeenCalledWith({
                where: { id: { in: ['X'] } },
            });

            expect(out).toEqual([{ roomId: 'X', count: 7, room: null }]);
        });

        it('return [] and does not call findMany if groupBy is empty', async () => {
            const { prisma, service } = makeService();

            prisma.reservation.groupBy.mockResolvedValue([]);

            const out = await service.topRooms({ limit: 5 } as ViewStatsDto);

            expect(out).toEqual([]);
            expect(prisma.room.findMany).not.toHaveBeenCalled();
        });
    });

    describe('avgDuration', () => {
        it('daily : use startOfDay et endOfDay and return avgMinutes', async () => {
            const { prisma, service } = makeService();

            prisma.$queryRaw.mockResolvedValue([{ avg_minutes: 42.5 }]);

            const out = await service.avgDuration({
                granularity: 'daily',
                from: '2025-09-10T09:00:00.000Z',
            } as ViewStatsDto);

            expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
            expect(out).toEqual({ avgMinutes: 42.5 });

            const [[sql]] = prisma.$queryRaw.mock.calls;
            if (sql && Array.isArray(sql.values)) {
                expect(sql.values).toEqual(expect.arrayContaining([D_DAILY_TO, D_DAILY_FROM]));
            }
        });

        it('weekly: use monday -> friday and roomId is defined', async () => {
            const { prisma, service } = makeService();

            prisma.$queryRaw.mockResolvedValue([{ avg_minutes: 15 }]);

            const out = await service.avgDuration({
                granularity: 'weekly',
                roomId: 'ROOM-1',
            } as ViewStatsDto);

            expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
            expect(out).toEqual({ avgMinutes: 15 });

            const [[sql]] = prisma.$queryRaw.mock.calls;
            if (sql && Array.isArray(sql.values)) {
                expect(sql.values).toEqual(expect.arrayContaining([W_TO, W_FROM]));
                expect(sql.values).toEqual(expect.arrayContaining(['ROOM-1']));
            }
        });

        it('monthly : use startOfMonth et endOfMonth', async () => {
            const { prisma, service } = makeService();

            prisma.$queryRaw.mockResolvedValue([{ avg_minutes: 0.1 }]);

            const out = await service.avgDuration({
                granularity: 'monthly',
            } as ViewStatsDto);

            expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
            expect(out).toEqual({ avgMinutes: 0.1 });

            const [[sql]] = prisma.$queryRaw.mock.calls;
            if (sql && Array.isArray(sql.values)) {
                expect(sql.values).toEqual(expect.arrayContaining([M_TO, M_FROM]));
            }
        });

        it('default (with from/to explicit) : return 0 if row/valeur is not null', async () => {
            const { prisma, service } = makeService();

            prisma.$queryRaw.mockResolvedValue([]);
            let out = await service.avgDuration({
                from: '2025-01-01T00:00:00.000Z',
                to: '2025-01-31T23:59:59.999Z',
            } as ViewStatsDto);
            expect(out).toEqual({ avgMinutes: 0 });

            prisma.$queryRaw.mockResolvedValue([{ avg_minutes: null }]);
            out = await service.avgDuration({
                from: '2025-01-01T00:00:00.000Z',
                to: '2025-01-31T23:59:59.999Z',
            } as ViewStatsDto);
            expect(out).toEqual({ avgMinutes: 0 });
        });

        it('default (without from/to) : cover epoch->lastDay', async () => {
            const { prisma, service } = makeService();

            prisma.$queryRaw.mockResolvedValue([{ avg_minutes: 7 }]);

            const out = await service.avgDuration({} as ViewStatsDto);

            expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
            expect(out).toEqual({ avgMinutes: 7 });

            const [[sql]] = prisma.$queryRaw.mock.calls;
            if (sql && Array.isArray(sql.values)) {
                const hasEpoch = sql.values.some((v: Date) => v instanceof Date && v.getTime() === 0);
                const hasHuge = sql.values.some(
                    (v: Date) => v instanceof Date && v.getTime() > Date.now() + 1000 * 60 * 60 * 24 * 365 * 100, // now
                );
                expect(hasEpoch).toBe(true);
                expect(hasHuge).toBe(true);
            }
        });
    });
});
