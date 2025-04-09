import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { MoviesModule } from './movies/movies.module';
import { User } from './auth/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'dragon',
      database: 'exercice_nest',
      entities: [User],
      synchronize: true,
    }),
    AuthModule,
    MoviesModule,
    TypeOrmModule.forFeature([User]),
  ],
})
export class AppModule {}
