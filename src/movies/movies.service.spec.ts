import { Test, TestingModule } from '@nestjs/testing';
import { MoviesService } from './movies.service';
import { ConfigService } from '@nestjs/config';

describe('MoviesService', () => {
  let service: MoviesService;

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      if (key === 'TMDB_API_URL') return 'https://api.themoviedb.org/3';
      return 'mock_value';
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoviesService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<MoviesService>(MoviesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
