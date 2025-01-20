import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import * as jwt from 'jsonwebtoken';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BasicUserInfo } from './shared/types/types';
import { Invitation } from './shared/entities/invitations.entity';
import { TOAST_MSGS } from './shared/constants/constants';

@Injectable()
export class AppService {
  constructor(
    private readonly mailService: MailerService,
    @InjectRepository(Invitation)
    private readonly invitationRepository: Repository<Invitation>,
  ) {}

  async sendInvitation(userDetails: BasicUserInfo): Promise<string> {
    const token = jwt.sign(userDetails, process.env.JWT_SECRET, {
      expiresIn: '24h',
    });

    const invitation = this.invitationRepository.create({
      email: userDetails.email,
      firstName: userDetails.firstName,
      lastName: userDetails.lastName,
      token,
    });
    await this.invitationRepository.save(invitation);

    const invitationLink = `http://localhost:3000/register?token=${token}`;

    try {
      await this.mailService.sendMail({
        to: userDetails.email,
        from: 'josephkwarteng244@gmail.com',
        subject: 'You’re invited to join the platform',
        html: `<p>Hello ${userDetails.firstName} ${userDetails.lastName},</p>
               <p>You have been invited to join our platform. Please click the link below to complete your account setup:</p>
               <a href="${invitationLink}">Register</a>`,
      });
      return TOAST_MSGS.INVITATION_SENT;
    } catch (error) {
      return TOAST_MSGS.ERROR_SENDING_INVITATION;
    }
  }
}
