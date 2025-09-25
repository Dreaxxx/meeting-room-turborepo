import { ViewStatsDto } from './dto/view-stats.dto';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { startOfDay, endOfDay, startOfWeekMonday, endOfWeekFriday, startOfMonth, endOfMonth, DateRange } from '../helpers/date-helper';

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) { }

  private range(queryDto: ViewStatsDto): DateRange {
    const baseDay = queryDto.from ? new Date(queryDto.from) : new Date();

    switch (queryDto.granularity) {
      case 'daily': {
        return { from: startOfDay(baseDay), to: endOfDay(baseDay) };
      }
      case 'weekly': {
        return { from: startOfWeekMonday(baseDay), to: endOfWeekFriday(baseDay) };
      }
      case 'monthly': {
        return { from: startOfMonth(baseDay), to: endOfMonth(baseDay) };
      }
      default: {
        const from = queryDto.from ? new Date(queryDto.from) : new Date(0);
        const to = queryDto.to ? new Date(queryDto.to) : new Date(8640000000000000);
        return { from, to };
      }
    }
  }

  async topRooms(queryDto: ViewStatsDto) {
    const limit = queryDto?.limit ?? 3;

    const grouped = await this.prisma.reservation.groupBy({
      by: ['roomId'],
      where: queryDto?.roomId ? { roomId: queryDto.roomId } : undefined,
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

  async avgDuration(queryDto: ViewStatsDto) {
    const { from, to } = this.range(queryDto);

    const roomFilter = queryDto.roomId
      ? Prisma.sql`AND "roomId" = ${queryDto.roomId}`
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

  async occupancyRate(queryDto: ViewStatsDto) {
    const { from, to } = this.range(queryDto);

    const [win] = await this.prisma.$queryRaw<{ total_minutes: number }[]>(Prisma.sql`
    SELECT GREATEST(1, ROUND(EXTRACT(EPOCH FROM (${to}::timestamp - ${from}::timestamp)) / 60.0)) AS total_minutes
  `);
    const totalMinutes = win?.total_minutes ?? 1;

    const prismaQuery = Prisma.sql`
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
        ${queryDto.roomId ? Prisma.sql`AND res."roomId" = ${queryDto.roomId}` : Prisma.empty}
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
    ${queryDto.roomId ? Prisma.sql`WHERE r.id = ${queryDto.roomId}` : Prisma.empty}
    GROUP BY r.id
    ${queryDto.roomId ? Prisma.empty : Prisma.sql`ORDER BY "busyMinutes" DESC`}
  `;

    type Row = { roomId: string; busyMinutes: number };
    const rows = await this.prisma.$queryRaw<Row[]>(prismaQuery);

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
