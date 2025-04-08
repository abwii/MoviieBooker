import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as jwt from 'jsonwebtoken';
import { UserDto } from './dto/user.dto';

const SECRET = 'dragon';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async register(userDto: UserDto) {
    const existing = await this.userRepository.findOne({ where: { username: userDto.username } });

    if (existing) {
      return { message: 'Nom d\'utilisateur déjà pris' };
    }

    const user = this.userRepository.create(userDto);
    await this.userRepository.save(user);

    return { message: 'Utilisateur enregistré avec succès' };
  }

  async login(userDto: UserDto) {
    const user = await this.userRepository.findOne({ where: { username: userDto.username } });

    if (!user || user.password !== userDto.password) {
      return { message: 'Identifiants invalides' };
    }

    const token = jwt.sign({ username: user.username }, SECRET);
    return { token };
  }

  verify(token: string) {
    try {
      const decoded = jwt.verify(token, SECRET);
      return decoded;
    } catch {
      return { message: 'Token invalide' };
    }
  }
}
