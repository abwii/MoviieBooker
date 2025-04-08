import { Body, Controller, Post, UseGuards, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserDto } from './dto/user.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ApiTags, ApiBody } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(JwtAuthGuard)
  @Get('protected')
  getProtected() {
    return { message: 'Route protégée' };
  }

  @ApiBody({ type: UserDto })
  @Post('register')
  register(@Body() user: UserDto) {
    return this.authService.register(user);
  }

  @ApiBody({ type: UserDto })
  @Post('login')
  login(@Body() user: UserDto) {
    return this.authService.login(user);
  }

  @Post('verify')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        token: { type: 'string' },
      },
    },
  })
  verify(@Body('token') token: string) {
    return this.authService.verify(token);
  }
}