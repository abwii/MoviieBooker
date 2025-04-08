import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class MoviesService {
  constructor(private readonly config: ConfigService) {}

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

    try {
      const response = await axios.get(url, { headers, params });
      return response.data;
    } catch (error) {
      console.error('Error fetching movies from TMDB:', error.message);
      throw new Error('TMDB API call failed');
    }
  }
}
