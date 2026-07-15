import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

jest.mock('typeorm', () => {
  const original = jest.requireActual('typeorm');
  return {
    ...original,
    DataSource: class MockDataSource {
      options = {
        entities: [],
      };
      entityMetadatas = [];
      manager = {
        connection: this,
      };
      initialize() {
        return Promise.resolve(this);
      }
      getRepository() {
        return {
          findOne: jest.fn(),
          create: jest.fn(),
          save: jest.fn(),
          remove: jest.fn(),
          find: jest.fn(),
        };
      }
    },
  };
});

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});
