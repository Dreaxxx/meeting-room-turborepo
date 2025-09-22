import { Injectable } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RoomsService {
  constructor(private readonly prismaService: PrismaService) {}

  create(createRoomDto: CreateRoomDto) {
    return this.prismaService.room.create({ data: createRoomDto });
  }

  findAll() {
    return this.prismaService.room.findMany({ orderBy: { name: 'asc' } });
  }

  findOne(id: string) {
    return this.prismaService.room.findUnique({ where: { id: id } });
  }
}
