import { Module } from '@nestjs/common';
import { RoomsModule } from './rooms/rooms.module';
import { ReservationsModule } from './reservations/reservations.module';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaService } from './prisma/prisma.service';
import { StatsModule } from './stats/stats.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [RoomsModule, ReservationsModule, PrismaModule, StatsModule, AuthModule],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule { }
