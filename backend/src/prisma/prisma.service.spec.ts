// src/prisma/prisma.service.spec.ts
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('PrismaService (unit)', () => {
  it('onModuleInit should call $connect', async () => {
    const svc = new PrismaService();
    svc.$connect = jest.fn().mockResolvedValue(undefined);
    await svc.onModuleInit();
    expect(svc.$connect).toHaveBeenCalledTimes(1);
  });

  it('enableShutdownHooks should register process.beforeExit and close app', () => {
    const svc = new PrismaService();
    const app = {
      close: jest.fn().mockResolvedValue(undefined),
    } as unknown as INestApplication;

    const originalProcessOn = process.on;
    const callbacks: Record<string, Function> = {};
    process.on = jest.fn((event: string, cb: Function) => {
      callbacks[event] = cb;
      return process as any;
    });

    try {
      svc.enableShutdownHooks(app);
      expect(process.on).toHaveBeenCalledWith(
        'beforeExit',
        expect.any(Function),
      );

      callbacks['beforeExit']?.();
      expect(app.close).toHaveBeenCalledTimes(1);
    } finally {
      process.on = originalProcessOn;
    }
  });
});
