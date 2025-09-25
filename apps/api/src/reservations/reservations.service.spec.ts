import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReservationsService } from './reservations.service';

describe('ReservationsService (unit)', () => {
  let service: ReservationsService;
  let prisma: {
    reservation: {
      findUnique: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
      create: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      reservation: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
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
    startsAt: new Date('2025-11-22T09:00:00Z').toISOString(),
    endsAt: new Date('2025-11-22T10:00:00Z').toISOString(),
    userId: 'user-1',
  };

  it('should findAll reservations', async () => {
    prisma.reservation.findMany = jest
      .fn()
      .mockResolvedValue([{ id: '1', ...baseDto }]);

    console.log('[reservations:findAll] Calling service.findAll()');

    const out = await service.findAll();

    console.log(
      '[reservations:findAll] Reservations:',
      JSON.stringify(prisma.reservation.findMany.mock.calls[0][0]),
    );

    expect(out).toEqual([{ id: '1', ...baseDto }]);
  });

  it('should findOne reservation by ID', async () => {
    prisma.reservation.findUnique = jest
      .fn()
      .mockResolvedValue({ id: '1', ...baseDto });

    console.log('[reservations:findOne] Calling service.findOne("1")');

    const out = await service.findOne('1');

    console.log(
      '[reservations:findOne] Reservation:',
      JSON.stringify(prisma.reservation.findUnique.mock.calls[0][0]),
    );

    expect(out).toEqual({ id: '1', ...baseDto });
  });

  it('should reject when startsAt is in the past', async () => {
    console.log('[reservations:validation] Testing startsAt in the past');

    await expect(
      service.create({
        ...baseDto,
        startsAt: new Date('2020-09-22T09:00:00Z').toISOString(),
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    console.log(
      '[reservations:validation] Rejected as expected, startsAt must be in the future',
    );
  });

  it('should reject when endsAt <= startsAt', async () => {
    console.log('[reservations:validation] Testing endsAt <= startsAt');

    await expect(
      service.create({
        ...baseDto,
        endsAt: new Date('2025-09-22T08:00:00Z').toISOString(),
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    await expect(
      service.create({
        ...baseDto,
        endsAt: baseDto.startsAt,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    console.log(
      '[reservations:validation] Rejected as expected, endsAt must be after startsAt',
    );
  });

  it('should reject on overlap', async () => {
    console.log('[reservations:overlap] Simulating overlap');

    prisma.reservation.findFirst.mockResolvedValue({ id: 'existing' });
    await expect(service.create(baseDto)).rejects.toBeInstanceOf(
      BadRequestException,
    );

    console.log(
      '[reservations:overlap] Rejected as expected due to overlap with existing reservation',
    );
  });

  it('should create when no overlap', async () => {
    prisma.reservation.findFirst.mockResolvedValue(null);

    console.log('[reservations:create] No overlap -> creating');

    prisma.reservation.create.mockResolvedValue({ id: 'new', ...baseDto });

    const out = await service.create(baseDto);

    console.log('[reservations:create] Created reservation:', out);

    expect(out).toEqual({ id: 'new', ...baseDto });
  });

  it('should update when no overlap', async () => {
    prisma.reservation.findFirst.mockResolvedValue(null);

    console.log('[reservations:update] No overlap -> updating');

    prisma.reservation.update = jest
      .fn()
      .mockResolvedValue({
        id: 'to-update',
        ...baseDto,
        title: 'Updated Title',
      });

    const out = await service.update('to-update', { title: 'Updated Title' });
    console.log('[reservations:update] Updated reservation:', out);

    expect(out).toEqual({
      id: 'to-update',
      ...baseDto,
      title: 'Updated Title',
    });
  });

  it('should delete reservation', async () => {
    prisma.reservation.delete = jest
      .fn()
      .mockResolvedValue({ id: 'to-delete', ...baseDto });

    console.log('[reservations:delete] Deleting reservation "to-delete"');

    const out = await service.remove('to-delete');
    console.log('[reservations:delete] Deleted reservation:', out);

    expect(out).toEqual({ id: 'to-delete', ...baseDto });
  });
});
