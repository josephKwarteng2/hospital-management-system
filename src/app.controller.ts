import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { TOAST_MSGS } from './shared/constants/constants';
import { BasicUserInfo } from './shared/types/types';
import { InvitationDto } from './auth/dto/invitation.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('send-invitation')
  async sendMail(@Query() query: InvitationDto): Promise<string> {
    const { email, firstName, lastName } = query;

    if (!email || !firstName || !lastName) {
      throw new Error(TOAST_MSGS.MISSING_PARAMETERS);
    }

    const userDetails: BasicUserInfo = { email, firstName, lastName };
    return await this.appService.sendInvitation(userDetails);
  }
}
