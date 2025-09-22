import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Rooms')
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) { }

  @ApiOkResponse({ description: 'The room has been successfully created.' })
  @Post()
  create(@Body() createRoomDto: CreateRoomDto) {
    return this.roomsService.create(createRoomDto);
  }

  @ApiOkResponse({ description: 'List of all rooms' })
  @Get()
  findAll() {
    return this.roomsService.findAll();
  }

  @ApiOkResponse({ description: 'Get room by ID' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roomsService.findOne(id);
  }
}
