import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ReservationsService {
  constructor(private prisma: PrismaService) { }

  async create(dto: CreateReservationDto) {
    const now = new Date();
    const starts = new Date(dto.startsAt);
    const ends = new Date(dto.endsAt);

    if (starts < now)
      throw new BadRequestException('startsAt must be in the future');

    if (ends <= starts)
      throw new BadRequestException('endsAt must be after startsAt');

    const overlap = await this.prisma.reservation.findFirst({
      where: {
        roomId: dto.roomId,
        OR: [{ startsAt: { lt: ends }, endsAt: { gt: starts } }],
      },
    });

    if (overlap)
      throw new BadRequestException(
        'Time slot not available, overlaps with existing reservation',
      );

    return this.prisma.reservation.create({
      data: {
        ...dto,
        startsAt: starts,
        endsAt: ends,
      },
    });
  }

  findAll() {
    return this.prisma.reservation.findMany({
      orderBy: { startsAt: 'asc' },
      include: { room: true },
    });
  }

  findOne(id: string) {
    return this.prisma.reservation.findUnique({
      where: { id: id },
      include: { room: true },
    });
  }

  update(id: string, updateReservationDto: UpdateReservationDto) {
    return this.prisma.reservation.update({
      where: { id: id },
      data: updateReservationDto,
    });
  }

  remove(id: string) {
    return this.prisma.reservation.delete({ where: { id: id } });
  }
}
