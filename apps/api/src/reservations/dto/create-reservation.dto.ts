import { ApiProperty } from '@nestjs/swagger';
import { IsISO8601, IsNotEmpty, IsString } from 'class-validator';
export class CreateReservationDto {
  @ApiProperty({
    example: 'roomId1234',
  })
  @IsString()
  roomId: string;

  @ApiProperty({
    example: 'Team Meeting',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: '2025-09-22T09:00:00Z',
  })
  @IsISO8601()
  startsAt: string;

  @ApiProperty({
    example: '2025-09-22T10:00:00Z',
  })
  @IsISO8601()
  endsAt: string;

  @ApiProperty({
    example: 'userId1234name',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;
}
