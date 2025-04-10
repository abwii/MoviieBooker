import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservationService } from './reservation.service';
import { ReservationController } from './reservation.controller';
import { Reservation } from './reservation.entity';
import { User } from '../auth/user.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reservation, User]),
    AuthModule,
  ],
  providers: [ReservationService],
  controllers: [ReservationController],
})
export class ReservationModule {}
