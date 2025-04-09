import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { UserDto } from './dto/user.dto';

const SECRET = 'secret_key';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async register(userDto: UserDto) {
    try {
      const existingUser = await this.userRepository.findOne({ where: { username: userDto.username } });
      if (existingUser) {
        return { message: 'Nom d\'utilisateur déjà pris' };
      }

      const hashedPassword = await bcrypt.hash(userDto.password, 10);
      const user = this.userRepository.create({ ...userDto, password: hashedPassword });

      await this.userRepository.save(user);

      return { message: 'Utilisateur enregistré avec succès' };
    } catch (error) {
      console.error(error);
      return { message: 'Erreur lors de l\'enregistrement de l\'utilisateur' };
    }
  }

  async login(userDto: UserDto) {
    const user = await this.userRepository.findOne({ where: { username: userDto.username } });

    if (!user) {
      return { message: 'Identifiants invalides' };
    }

    const isMatch = await bcrypt.compare(userDto.password, user.password);
    if (!isMatch) {
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