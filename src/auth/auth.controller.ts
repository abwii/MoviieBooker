import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserDto } from './dto/user.dto';
import { ApiTags, ApiBody } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
  @ApiBody({ schema: {
    type: 'object',
    properties: {
      token: { type: 'string' }
    }
  }})
  verify(@Body('token') token: string) {
    return this.authService.verify(token);
  }
}
