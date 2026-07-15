import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers['authorization'];

    if (!authHeader) return false;

    const token = authHeader.split(' ')[1];
    if (!token) return false;

    const secret = this.configService.get<string>(
      'JWT_SECRET',
      'super_secret_jwt_key_change_me_in_production',
    );

    try {
      const decoded = jwt.verify(token, secret);
      request['user'] = decoded;
      return true;
    } catch {
      return false;
    }
  }
}
