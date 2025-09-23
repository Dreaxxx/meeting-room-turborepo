import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsString, Min } from 'class-validator';

export class CreateRoomDto {
  @ApiProperty({
    example: 'Libra',
  })
  @IsString()
  name!: string;

  @ApiProperty({
    example: 8,
    minimum: 2,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  capacity!: number;
}
