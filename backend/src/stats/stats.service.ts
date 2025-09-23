import { ViewStatsDto } from './dto/view-stats.dto';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  private range(q: ViewStatsDto) {
    const to = q.to ? new Date(q.to) : new Date();
    const from = q.from
      ? new Date(q.from)
      : new Date(to.getTime() - 7 * 24 * 3600 * 1000);
    return { from, to };
  }

  async topRooms(q: ViewStatsDto) {
    const { from, to } = this.range(q);
    const grouped = await this.prisma.reservation.groupBy({
      by: ['roomId'],
      _count: { roomId: true },
      where: {
        startsAt: { lt: to },
        endsAt: { gt: from },
      },
      orderBy: { _count: { roomId: 'desc' } },
      take: q.limit ?? 3,
    });

    const rooms = await this.prisma.room.findMany({
      where: { id: { in: grouped.map((g) => g.roomId) } },
      select: { id: true, name: true, capacity: true },
    });

    return grouped.map((g) => ({
      roomId: g.roomId,
      count: g._count.roomId,
      room: rooms.find((r) => r.id === g.roomId) ?? null,
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
