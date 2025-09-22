import { Injectable } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RoomsService {
  constructor(private readonly prismaService: PrismaService) { }

  create(createRoomDto: CreateRoomDto) {
    return this.prismaService.room.create({ data: createRoomDto });
  }

  findAll() {
    return this.prismaService.room.findMany({ orderBy: { name: 'asc' } });
  }

  findOne(id: number) {
    return this.prismaService.room.findUnique({ where: { id: id } });
  }

  update(id: number, updateRoomDto: UpdateRoomDto) {
    return this.prismaService.room.update({
      where: { id: id },
      data: updateRoomDto,
    });
  }
}
