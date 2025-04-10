import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation } from './reservation.entity';
import { User } from '../auth/user.entity';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ReservationService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  async createReservation(createReservationDto: any) {
    const { userId, movieId, reservationDate } = createReservationDto;
    const movieDetails = await this.getMovieDetails(movieId);
    const movieDuration = movieDetails.runtime;
    const now = new Date();
    const reservationTime = new Date(reservationDate);
    const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    if (reservationTime < twoHoursLater) {
      throw new Error('La réservation doit être effectuée au moins 2 heures à l\'avance.');
    }

    const newReservation = this.reservationRepository.create({
      userId,
      movieId,
      reservationDate: reservationTime,
      status: 'Confirmed',
    });

    await this.reservationRepository.save(newReservation);
    return newReservation;
  }

  async cancelReservation(id: number) {
    const reservation = await this.reservationRepository.findOne({ where: { id } });
    if (reservation) {
      await this.reservationRepository.remove(reservation);
      return { message: 'Reservation canceled successfully' };
    }
    return { message: 'Reservation not found' };
  }

  async getUserReservations(userId: number) {
      const reservations = await this.reservationRepository.find({ where: { userId } });
      return reservations;
  }

  private async getMovieDetails(movieId: number) {
    const apiUrl = this.configService.get('TMDB_API_URL');
    const apiKey = this.configService.get('TMDB_API_KEY');
    const url = `${apiUrl}/movie/${movieId}?api_key=${apiKey}`;

    try {
      const response = await axios.get(url);
      console.log("film :", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching movie details:", error.response?.data || error.message);
      throw new Error('Impossible de récupérer les détails du film.');
    }
  }  
}
