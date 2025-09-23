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
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();

    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('rooms', () => {
    it('POST /rooms -> creates a room', async () => {
      const res = await request(app.getHttpServer())
        .post('/rooms')
        .send({ name: 'Orion', capacity: 4 })
        .expect(201);
      expect(res.body).toMatchObject({ name: 'Orion', capacity: 4 });
    });

    it('GET /rooms -> get all rooms', async () => {
      const res = await request(app.getHttpServer()).get('/rooms').expect(200);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('GET /rooms/:id -> get one room', async () => {
      const { body: rooms } = await request(app.getHttpServer())
        .get('/rooms')
        .expect(200);
      const roomsId = rooms[0].id;

      const res = await request(app.getHttpServer())
        .get(`/rooms/${roomsId}`)
        .expect(200);
      expect(res.body).toMatchObject({ name: 'Orion', capacity: 4 });
    });
  });

  describe('reservations', () => {
    it('POST /reservations -> creates then rejects overlap', async () => {
      const { body: rooms } = await request(app.getHttpServer())
        .get('/rooms')
        .expect(200);
      const roomId = rooms[0].id;

      const startsAt = new Date('2025-11-22T09:00:00.000Z').toISOString();
      const startsAt2 = new Date('2025-11-22T09:30:00.000Z').toISOString();
      const endsAt = new Date('2025-11-22T10:00:00.000Z').toISOString();

      await request(app.getHttpServer())
        .post('/reservations')
        .send({ roomId, title: 'Reu 1', startsAt, endsAt })
        .expect(201);

      await request(app.getHttpServer())
        .post('/reservations')
        .send({ roomId, title: 'Reu 2', startsAt2, endsAt })
        .expect(400);
    });

    it('GET /reservations -> get all reservations', async () => {
      const res = await request(app.getHttpServer())
        .get('/reservations')
        .expect(200);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('GET /reservations/:id -> get one reservation', async () => {
      const { body: reservations } = await request(app.getHttpServer())
        .get('/reservations')
        .expect(200);
      const reservationId = reservations[0].id;

      const res = await request(app.getHttpServer())
        .get(`/reservations/${reservationId}`)
        .expect(200);
      expect(res.body).toMatchObject({ id: reservationId });
    });

    it('PATCH /reservations/:id -> updates a reservation', async () => {
      const { body: reservations } = await request(app.getHttpServer())
        .get('/reservations')
        .expect(200);
      const reservationId = reservations[0].id;

      const res = await request(app.getHttpServer())
        .patch(`/reservations/${reservationId}`)
        .send({ title: 'Updated Title' })
        .expect(200);
      expect(res.body).toMatchObject({
        id: reservationId,
        title: 'Updated Title',
      });
    });

    it('DELETE /reservations/:id -> deletes a reservation', async () => {
      const { body: reservations } = await request(app.getHttpServer())
        .get('/reservations')
        .expect(200);
      const reservationId = reservations[0].id;

      await request(app.getHttpServer())
        .delete(`/reservations/${reservationId}`)
        .expect(200);
    });
  });
});
