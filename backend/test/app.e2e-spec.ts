import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /rooms -> creates a room', async () => {
    const res = await request(app.getHttpServer())
      .post('/rooms')
      .send({ name: 'Orion', capacity: 4 })
      .expect(201);
    expect(res.body).toMatchObject({ name: 'Orion', capacity: 4 });
  });

  it('POST /reservations -> creates then rejects overlap', async () => {
    const { body: rooms } = await request(app.getHttpServer()).get('/rooms').expect(200);
    const roomId = rooms[0].id;

    const startsAt = new Date('2025-09-22T09:00:00.000Z').toISOString();
    const startsAt2 = new Date('2025-09-22T09:30:00.000Z').toISOString();
    const endsAt = new Date('2025-09-22T10:00:00.000Z').toISOString();

    await request(app.getHttpServer())
      .post('/reservations')
      .send({ roomId, title: 'Reu 1', startsAt, endsAt })
      .expect(201);

    await request(app.getHttpServer())
      .post('/reservations')
      .send({ roomId, title: 'Reu 2', startsAt2, endsAt })
      .expect(400);
  });
});
