import { IsInt, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReservationDto {
  @ApiProperty({ description: 'ID de l\'utilisateur' })
  @IsInt()
  userId: number;

  @ApiProperty({ description: 'ID du film', example: 950387 })
  @IsInt()
  movieId: number;

  @ApiProperty({ description: 'Date de la réservation', example: '2025-04-10T18:00:00Z' })
  @IsDateString()
  reservationDate: string;
}
