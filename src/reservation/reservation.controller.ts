import { Controller, Post, Body, Get, Param, Delete } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { CreateReservationDto } from './dto/create-reservation.dto';

@Controller('reservations')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Post()
  async createReservation(@Body() createReservationDto: CreateReservationDto) {
    return this.reservationService.createReservation(createReservationDto);
  }

  @Get(':userId')
  async getUserReservations(@Param('userId') userId: number) {
    return this.reservationService.getUserReservations(userId);
  }

  @Delete(':id')
  async cancelReservation(@Param('id') id: number) {
    return this.reservationService.cancelReservation(id);
  }
}