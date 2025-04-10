import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { MoviesModule } from './movies/movies.module';
import { ReservationModule } from './reservation/reservation.module';
import { Reservation } from './reservation/reservation.entity';
import { User } from './auth/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'dpg-cvrtfvjuibrs73bqq8v0-a.frankfurt-postgres.render.com',
      port: 5432,
      username: 'exercice_nest_user',
      password: 'uDq0WQf73PnKDNbO3qn1F2rKEzn2J7mu',
      database: 'exercice_nest',
      entities: [Reservation, User],
      synchronize: true,
      ssl: true,
    }),
    AuthModule,
    MoviesModule,
    ReservationModule,
  ],
})
export class AppModule {}
