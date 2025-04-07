import { Injectable } from '@nestjs/common';
import { UserDto } from './dto/user.dto';
import * as jwt from 'jsonwebtoken';

const SECRET = 'secret_key';
const users: UserDto[] = [];

@Injectable()
export class AuthService {
  register(user: UserDto) {
    users.push(user);
    return { message: 'Utilisateur enregistré avec succès' };
  }

  login(user: UserDto) {
    const found = users.find(u => u.username === user.username && u.password === user.password);
    if (!found) {
      return { message: 'Identifiants invalides' };
    }
    const token = jwt.sign({ username: found.username }, SECRET);
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
