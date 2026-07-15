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

  async fetchMovieById(id: number) {
    const apiUrl = this.config.get('TMDB_API_URL');
    const token = this.config.get('TMDB_ACCESS_TOKEN');
    const apiKey = this.config.get('TMDB_API_KEY');

    const url = `${apiUrl}/movie/${id}`;
    const headers: any = {};
    const params: any = {};

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    } else if (apiKey) {
      params.api_key = apiKey;
    }

    try {
      const response = await axios.get(url, { headers, params });
      return response.data;
    } catch (error) {
      console.error(`Error fetching movie ${id} from TMDB:`, error.message);
      throw new Error('TMDB API call failed');
    }
  }
}
