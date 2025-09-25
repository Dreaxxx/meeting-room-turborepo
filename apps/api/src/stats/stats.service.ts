import { ViewStatsDto } from './dto/view-stats.dto';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { startOfDay, endOfDay, startOfWeekMonday, endOfWeekFriday, startOfMonth, endOfMonth } from '../helpers/date-helper';

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) { }

  private range(q: ViewStatsDto): { from: Date; to: Date } {
    const base = q.from ? new Date(q.from) : new Date();

    switch (q.granularity) {
      case 'daily': {
        return { from: startOfDay(base), to: endOfDay(base) };
      }
      case 'weekly': {
        return { from: startOfWeekMonday(base), to: endOfWeekFriday(base) };
      }
      case 'monthly': {
        return { from: startOfMonth(base), to: endOfMonth(base) };
      }
      default: {
        const from = q.from ? new Date(q.from) : new Date(0);
        const to = q.to ? new Date(q.to) : new Date(8640000000000000);
        return { from, to };
      }
    }
  }

  async topRooms(q: ViewStatsDto) {
    const limit = q?.limit ?? 3;

    const grouped = await this.prisma.reservation.groupBy({
      by: ['roomId'],
      where: q?.roomId ? { roomId: q.roomId } : undefined,
      _count: { roomId: true, _all: true },
      orderBy: { _count: { roomId: 'desc' } },
      take: limit,
    });

    const ids = grouped.map(g => g.roomId);
    const rooms = ids.length
      ? await this.prisma.room.findMany({ where: { id: { in: ids } } })
      : [];

    return grouped.map(g => ({
      roomId: g.roomId,
      count: g._count._all,
      room: rooms.find(r => r.id === g.roomId) ?? null,
    }));
  }

  async avgDuration(q: ViewStatsDto) {
    const { from, to } = this.range(q);

    const roomFilter = q.roomId
      ? Prisma.sql`AND "roomId" = ${q.roomId}`
      : Prisma.empty;

    const rows = await this.prisma.$queryRaw<{ avg_minutes: number | null }[]>(
      Prisma.sql`
        SELECT AVG(EXTRACT(EPOCH FROM ("endsAt" - "startsAt")) / 60.0) AS avg_minutes
        FROM "Reservation"
        WHERE "startsAt" < ${to}::timestamp
          AND "endsAt"   > ${from}::timestamp
        ${roomFilter}
      `
    );

    return { avgMinutes: rows[0]?.avg_minutes ?? 0 };
  }

  async occupancyRate(q: ViewStatsDto) {
    const { from, to } = this.range(q);

    // calcule la durée de fenêtre côté DB pour éviter tout souci de TZ côté JS
    const [win] = await this.prisma.$queryRaw<{ total_minutes: number }[]>(Prisma.sql`
    SELECT GREATEST(1, ROUND(EXTRACT(EPOCH FROM (${to}::timestamp - ${from}::timestamp)) / 60.0)) AS total_minutes
  `);
    const totalMinutes = win?.total_minutes ?? 1;

    const query = Prisma.sql`
    WITH bounds AS (
      SELECT ${from}::timestamp AS from_ts, ${to}::timestamp AS to_ts
    ),
    spans AS (
      SELECT
        res."roomId",
        GREATEST(res."startsAt", (SELECT from_ts FROM bounds)) AS o_start,
        LEAST(res."endsAt",   (SELECT to_ts   FROM bounds)) AS o_end
      FROM "Reservation" res, bounds
      WHERE res."startsAt" < (SELECT to_ts FROM bounds)
        AND res."endsAt"   > (SELECT from_ts FROM bounds)
        ${q.roomId ? Prisma.sql`AND res."roomId" = ${q.roomId}` : Prisma.empty}
    )
    SELECT
      r.id AS "roomId",
      COALESCE(
        SUM(
          GREATEST(0, EXTRACT(EPOCH FROM (o_end - o_start)) / 60.0)
        ), 0
      )::int AS "busyMinutes"
    FROM "Room" r
    LEFT JOIN spans o ON o."roomId" = r.id
    ${q.roomId ? Prisma.sql`WHERE r.id = ${q.roomId}` : Prisma.empty}
    GROUP BY r.id
    ${q.roomId ? Prisma.empty : Prisma.sql`ORDER BY "busyMinutes" DESC`}
  `;

    type Row = { roomId: string; busyMinutes: number };
    const rows = await this.prisma.$queryRaw<Row[]>(query);

    const ids = rows.map(r => r.roomId);
    const rooms = ids.length
      ? await this.prisma.room.findMany({ where: { id: { in: ids } } })
      : [];

    return rows.map(r => {
      const rate = Math.min(100, Math.max(0, (r.busyMinutes / totalMinutes) * 100));
      return {
        roomId: r.roomId,
        room: rooms.find(x => x.id === r.roomId) ?? null,
        busyMinutes: r.busyMinutes,
        totalMinutes,
        occupancyRate: Number(rate.toFixed(2)),
        from,
        to,
      };
    });
  }
}
