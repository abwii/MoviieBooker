import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class MoviesService {
  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  async fetchMovies(page = 1, search?: string, sort?: string) {
    const apiUrl = this.config.get('TMDB_API_URL');
    const token = this.config.get('TMDB_ACCESS_TOKEN');

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const params: any = {
      page,
    };

    let url = `${apiUrl}/movie/popular`;

    if (search) {
      url = `${apiUrl}/search/movie`;
      params.query = search;
    }

    if (sort) {
      params.sort_by = sort;
    }

    const response$ = this.http.get(url, { headers, params });
    const response = await firstValueFrom(response$);

    return response.data;
  }
}