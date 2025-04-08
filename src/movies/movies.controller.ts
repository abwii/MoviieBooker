import { Controller, Get, Query } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { ApiTags, ApiQuery } from '@nestjs/swagger';

@ApiTags('movies')
@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get()
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'sort', required: false })
  async getMovies(
    @Query('page') page: number,
    @Query('search') search?: string,
    @Query('sort') sort?: string,
  ) {
    return this.moviesService.fetchMovies(page, search, sort);
  }
}
