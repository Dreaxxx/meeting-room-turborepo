import { Test } from '@nestjs/testing';
import { RoomsService } from './rooms.service';
import { PrismaService } from '../prisma/prisma.service';

describe('RoomsService (unit)', () => {
  let service: RoomsService;
  let prisma: { room: { findUnique: jest.Mock, findMany: jest.Mock, create: jest.Mock } };

  beforeEach(async () => {
    prisma = {
      room: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
      },
    };

    console.log("prisma", prisma);

    const moduleRef = await Test.createTestingModule({
      providers: [
        RoomsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    console.log("moduleRef", moduleRef);

    service = moduleRef.get(RoomsService);
  });

  it('constructor should throw when PrismaService is missing', () => {
    // @ts-expect-error
    expect(() => new RoomsService(undefined)).toThrow('PrismaService is required');
  });

  it('constructor should work with a valid PrismaService (covers non-throw branch)', () => {
    const instance = new RoomsService(prisma as unknown as PrismaService);
    expect(instance).toBeInstanceOf(RoomsService);
  });

  it('findOne should return a room by ID', async () => {
    prisma.room.findUnique = jest.fn().mockResolvedValue({ id: '1', name: 'Orion', capacity: 4 });

    console.log('[rooms:findOne] Calling service.findOne("1")');

    const out = await service.findOne('1');

    console.log('[rooms:findOne] Room:', JSON.stringify(prisma.room.findUnique.mock.calls[0][0]));

    expect(out).toEqual({ id: '1', name: 'Orion', capacity: 4 });
  });

  it('findAll should return ordered rooms', async () => {
    prisma.room.findMany.mockResolvedValue([
      { id: '1', name: 'Orion', capacity: 4 },
    ]);

    console.log('[rooms:findAll] Calling service.findAll()');

    const out = await service.findAll();

    console.log('[rooms:findAll] Rooms:', JSON.stringify(prisma.room.findMany.mock.calls[0][0]));

    expect(out).toEqual([{ id: '1', name: 'Orion', capacity: 4 }]);
  });

  it('create should pass data to prisma', async () => {
    const payload = { name: 'Vega', capacity: 8 };

    console.log('[rooms:create] Input DTO:', payload);

    prisma.room.create.mockResolvedValue({ id: '2', ...payload });

    const out = await service.create(payload);

    console.log('[rooms:create] Created room:', out);

    expect(out).toEqual({ id: '2', ...payload });
  });
});
