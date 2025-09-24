import { ViewStatsDto } from './dto/view-stats.dto';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) { }

  private range(q: ViewStatsDto) {
    const to = q.to ? new Date(q.to) : new Date();
    const from = q.from
      ? new Date(q.from)
      : new Date(to.getTime() - 7 * 24 * 3600 * 1000);
    return { from, to };
  }

  async topRooms(q: ViewStatsDto) {
    const { from, to } = q;

    const rows =
      q.roomId
        ? await this.prisma.$queryRaw<{ roomId: string; totalMinutes: number }[]>`
          SELECT r."roomId" AS "roomId",
                 SUM(EXTRACT(EPOCH FROM (r."endsAt" - r."startsAt")) / 60)::int AS "totalMinutes"
          FROM "Reservation" r
          WHERE r."startsAt" >= ${from}
            AND r."endsAt"   <= ${to}
            AND r."roomId"   = ${q.roomId}
          GROUP BY r."roomId"
        `
        : await this.prisma.$queryRaw<{ roomId: string; totalMinutes: number }[]>`
          SELECT r."roomId" AS "roomId",
                 SUM(EXTRACT(EPOCH FROM (r."endsAt" - r."startsAt")) / 60)::int AS "totalMinutes"
          FROM "Reservation" r
          WHERE r."startsAt" >= ${from}
            AND r."endsAt"   <= ${to}
          GROUP BY r."roomId"
        `;

    const roomIds = rows.map(r => r.roomId);
    const rooms = roomIds.length
      ? await this.prisma.room.findMany({ where: { id: { in: roomIds } } })
      : [];

    return rows.map(r => ({
      roomId: r.roomId,
      room: rooms.find(x => x.id === r.roomId) ?? null,
      totalMinutes: r.totalMinutes ?? 0,
    }));
  }

  async avgDuration(q: ViewStatsDto) {
    const { from, to } = this.range(q);

    const roomFilter = q.roomId
      ? Prisma.sql`AND "roomId" = ${q.roomId}`
      : Prisma.sql``;

    const rows = await this.prisma.$queryRaw<
      { avg_minutes: number | null }[]
    >(Prisma.sql`
    SELECT AVG(EXTRACT(EPOCH FROM ("endsAt" - "startsAt"))/60.0) AS avg_minutes
    FROM "Reservation"
    WHERE "startsAt" < ${to} AND "endsAt" > ${from}
    ${roomFilter}
  `);

    return { avgMinutes: rows[0]?.avg_minutes ?? 0 };
  }
}
