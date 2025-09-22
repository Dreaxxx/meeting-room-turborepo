import { Module } from '@nestjs/common';
import { RoomsModule } from './rooms/rooms.module';
import { ReservationsModule } from './reservations/reservations.module';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [RoomsModule, ReservationsModule, PrismaModule],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule { }
