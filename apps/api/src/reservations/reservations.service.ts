import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';

@Injectable()
export class ReservationsService {
  constructor(private prisma: PrismaService) { }

  async create(dto: CreateReservationDto, userId: string) {
    const now = new Date();
    const starts = new Date(dto.startsAt);
    const ends = new Date(dto.endsAt);

    if (starts < now) {
      throw new BadRequestException('startsAt must be in the future');
    }
    if (ends <= starts) {
      throw new BadRequestException('endsAt must be after startsAt');
    }

    try {
      const reservation = await this.prisma.$transaction(async (tx) => {
        return tx.reservation.create({
          data: {
            roomId: dto.roomId,
            title: dto.title,
            startsAt: starts,
            endsAt: ends,
            userId,
          },
        });
      });

      return reservation;
    } catch (e: any) {
      const code = e?.meta?.code ?? e?.code;
      const msg = String(e?.meta?.message || e?.message || '');

      const isConstraint =
        (typeof code === 'string' && code.startsWith('23')) ||
        msg.includes('reservation_no_overlap');

      if (isConstraint) {
        throw new BadRequestException('Time slot not available, overlaps with existing reservation');
      }

      throw new InternalServerErrorException('Unexpected error');
    }
  }

  findAll() {
    return this.prisma.reservation.findMany({
      orderBy: { startsAt: 'asc' },
      include: { room: true },
    });
  }

  findOne(id: string) {
    return this.prisma.reservation.findUnique({
      where: { id },
      include: { room: true },
    });
  }

  update(id: string, dto: UpdateReservationDto) {
    return this.prisma.reservation.update({
      where: { id },
      data: dto,
    });
  }

  remove(id: string) {
    return this.prisma.reservation.delete({ where: { id } });
  }
}
