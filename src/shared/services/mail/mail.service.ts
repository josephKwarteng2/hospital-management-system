import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { mailConfig } from 'src/config/mail.config';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendInvitationEmail(
    email: string,
    firstName: string,
    lastName: string,
    invitationLink: string,
    defaultPassword: string,
  ): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      from: mailConfig.from,
      subject: mailConfig.invitationSubject,
      html: this.generateInvitationTemplate(
        firstName,
        lastName,
        invitationLink,
        defaultPassword,
      ),
    });
  }

  private generateInvitationTemplate(
    firstName: string,
    lastName: string,
    invitationLink: string,
    defaultPassword: string,
  ): string {
    return `
      <p>Hello ${firstName} ${lastName},</p>
      <p>You have been invited to join our platform. Please click the link below to complete your account setup:</p>
      <a href="${invitationLink}">Register</a>
      <p>Your default password is: <b>${defaultPassword}</b></p>
      <p>Please use this password during registration and change it to your preferred one.</p>
    `;
  }
}
