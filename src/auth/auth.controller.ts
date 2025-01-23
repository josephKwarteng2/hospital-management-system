import { Body, Controller, Param, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserRegistrationDto } from './dto/user-registration.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { InvitationDto } from './dto/invitation.dto';
import { LoginDto } from './dto/login.dto';
import { User } from 'src/shared/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('send-invitation')
  async sendInvitation(@Body() sendInvitationDto: InvitationDto) {
    return this.authService.sendInvitation(sendInvitationDto);
  }

  @Post('login')
  public async login(
    @Body() loginDto: LoginDto,
  ): Promise<{ token: string; user: Partial<User> }> {
    return this.authService.login(loginDto);
  }

  @Post('register/:token')
  async register(
    @Param('token') token: string,
    @Body() registerDto: UserRegistrationDto,
  ) {
    return this.authService.register(token, registerDto);
  }

  @Post('change-password/:token')
  async changeDefaultPassword(
    @Param('token') token: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changeDefaultPassword(token, changePasswordDto);
  }
}
