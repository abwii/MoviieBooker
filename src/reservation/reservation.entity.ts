import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Reservation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  movieId: number;

  @Column()
  reservationDate: Date;

  @Column()
  userId: number;

  @Column()
  status: string;
}