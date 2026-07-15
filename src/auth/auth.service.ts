import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { UserDto } from './dto/user.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  private get jwtSecret(): string {
    return this.configService.get<string>(
      'JWT_SECRET',
      'super_secret_jwt_key_change_me_in_production',
    );
  }

  async register(userDto: UserDto) {
    try {
      const existingUser = await this.userRepository.findOne({
        where: { username: userDto.username },
      });
      if (existingUser) {
        return { message: "Nom d'utilisateur déjà pris" };
      }

      const hashedPassword = await bcrypt.hash(userDto.password, 10);
      const user = this.userRepository.create({
        ...userDto,
        password: hashedPassword,
      });

      await this.userRepository.save(user);

      return { message: 'Utilisateur enregistré avec succès' };
    } catch (error) {
      console.error(error);
      return { message: "Erreur lors de l'enregistrement de l'utilisateur" };
    }
  }

  async login(userDto: UserDto) {
    const user = await this.userRepository.findOne({
      where: { username: userDto.username },
    });

    if (!user) {
      return { message: 'Identifiants invalides' };
    }

    const isMatch = await bcrypt.compare(userDto.password, user.password);
    if (!isMatch) {
      return { message: 'Identifiants invalides' };
    }

    const token = jwt.sign(
      { username: user.username, sub: user.id },
      this.jwtSecret,
      { expiresIn: '1d' },
    );
    return {
      token,
      user: { id: user.id, username: user.username },
    };
  }

  verify(token: string) {
    try {
      const decoded = jwt.verify(token, this.jwtSecret);
      return decoded;
    } catch {
      return { message: 'Token invalide' };
    }
  }

  getUserById(id: number) {
    return this.userRepository.findOne({ where: { id } });
  }
}
