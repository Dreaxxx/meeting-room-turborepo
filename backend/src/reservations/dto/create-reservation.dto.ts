import { IsISO8601, IsNotEmpty, IsString } from 'class-validator';
export class CreateReservationDto {
  @IsString() roomId: string;
  @IsString() @IsNotEmpty() title: string;
  @IsISO8601() startsAt: string;
  @IsISO8601() endsAt: string;
}
