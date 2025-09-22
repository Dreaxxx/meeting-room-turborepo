import { Injectable } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RoomsService {
  constructor(private readonly prismaService: PrismaService) {
    if (!prismaService) {
      throw new Error('PrismaService is required');
    }
  }
  
  create(dto: CreateRoomDto) {
    return this.prismaService.room.create({
      data: {
        name: dto.name,
        capacity: dto.capacity,
      },
    });
  }

  findAll() {
    return this.prismaService.room.findMany({ orderBy: { name: 'asc' } });
  }

  findOne(id: string) {
    return this.prismaService.room.findUnique({ where: { id: id } });
  }
}
