import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { StatsService } from './stats.service';
import { ViewStatsDto } from './dto/view-stats.dto';

@ApiTags('stats')
@Controller('stats')
export class StatsController {
  constructor(private readonly stats: StatsService) { }

  @ApiOkResponse({ description: 'Top N des salles les plus réservées' })
  @Get('top-rooms')
  topRooms(@Query() queryDto: ViewStatsDto) {
    console.log('topRooms types:', queryDto.from as any instanceof Date, queryDto.to as any instanceof Date, queryDto.from, queryDto.to);

    return this.stats.topRooms(queryDto);
  }

  @ApiOkResponse({ description: 'Durée moyenne des réunions' })
  @Get('avg-meeting-duration')
  avgDuration(@Query() queryDto: ViewStatsDto) {
    return this.stats.avgDuration(queryDto);
  }

  @ApiOkResponse({ description: 'Taux d\'occupation des salles' })
  @Get('occupancy-rate')
  occupancyRate(@Query() queryDto: ViewStatsDto) {
    return this.stats.occupancyRate(queryDto);
  }
}
