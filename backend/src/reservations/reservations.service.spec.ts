import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReservationsService } from './reservations.service';

describe('ReservationsService (unit)', () => {
  let service: ReservationsService;
  let prisma: { reservation: { findFirst: jest.Mock, create: jest.Mock } };

  beforeEach(async () => {
    prisma = {
      reservation: {
        findFirst: jest.fn(),
        create: jest.fn(),
      },
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        ReservationsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = moduleRef.get(ReservationsService);
  });

  const baseDto = {
    roomId: 'room-1',
    title: 'Reunion de test',
    startsAt: new Date('2025-09-22T09:00:00Z').toISOString(),
    endsAt: new Date('2025-09-22T10:00:00Z').toISOString(),
  };

  it('should reject when endsAt <= startsAt', async () => {
    console.log('[reservations:validation] Testing endsAt <= startsAt');

    await expect(service.create({
      ...baseDto,
      endsAt: new Date('2025-09-22T08:00:00Z').toISOString(),
    })).rejects.toBeInstanceOf(BadRequestException);

    await expect(service.create({
      ...baseDto,
      endsAt: baseDto.startsAt,
    })).rejects.toBeInstanceOf(BadRequestException);

    console.log('[reservations:validation] Rejected as expected, endsAt must be after startsAt');
  });

  it('should reject on overlap', async () => {
    console.log('[reservations:overlap] Simulating overlap');

    prisma.reservation.findFirst.mockResolvedValue({ id: 'existing' });
    await expect(service.create(baseDto)).rejects.toBeInstanceOf(BadRequestException);

    console.log('[reservations:overlap] Rejected as expected due to overlap with existing reservation');
  });

  it('should create when no overlap', async () => {
    prisma.reservation.findFirst.mockResolvedValue(null);

    console.log('[reservations:create] No overlap -> creating');

    prisma.reservation.create.mockResolvedValue({ id: 'new', ...baseDto });

    const out = await service.create(baseDto);
    console.log('[reservations:create] Created reservation:', out);

    expect(out).toEqual({ id: 'new', ...baseDto });
  });
});
