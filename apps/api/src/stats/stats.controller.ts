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
  topRooms(@Query() q: ViewStatsDto) {
    console.log('topRooms types:', q.from as any instanceof Date, q.to as any instanceof Date, q.from, q.to);

    return this.stats.topRooms(q);
  }

  @ApiOkResponse({ description: 'Durée moyenne des réunions' })
  @Get('avg-meeting-duration')
  avgDuration(@Query() q: ViewStatsDto) {
    return this.stats.avgDuration(q);
  }
}
