import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TOAST_MSGS } from 'src/shared/constants/constants';
import { Invitation } from 'src/shared/entities/invitations.entity';
import { UserRegistrationDto } from './dto/user-registration.dto';
import { InvitationDto } from './dto/invitation.dto';
import { User } from 'src/shared/entities/user.entity';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AuthenticationError } from 'src/shared/common/filters/http-exception.filter';
import { EmailService } from 'src/shared/services/mail/mail.service';
import { TokenService } from 'src/shared/services/token/token.service';
import { mailConfig } from 'src/config/mail.config';
import { ProfileCreatorFactory } from './profile-creators/profile-creator.factory';
import { PasswordPolicy } from 'src/shared/validator/password-policy';

@Injectable()
export class AuthService {
  constructor(
    private readonly emailService: EmailService,
    private readonly tokenService: TokenService,
    private readonly passwordPolicy: PasswordPolicy,
    private readonly profileCreatorFactory: ProfileCreatorFactory,
    @InjectRepository(Invitation)
    private readonly invitationRepository: Repository<Invitation>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  public async sendInvitation(userDetails: InvitationDto): Promise<string> {
    try {
      if (!userDetails || !userDetails.email) {
        throw new AuthenticationError(
          'Invalid user details',
          'USER_DETAILS_MISSING',
        );
      }

      const token = this.tokenService.generateToken({
        email: userDetails.email,
        firstName: userDetails.firstName,
        lastName: userDetails.lastName,
        role: userDetails.role,
      });

      if (!token) {
        throw new AuthenticationError(
          TOAST_MSGS.FAILED_TO_GENERATE_TOKEN,
          'TOKEN_GENERATION_FAILED',
        );
      }

      const defaultPassword = this.generateTemporaryPassword();

      const invitation = await this.createInvitation(
        userDetails,
        token,
        defaultPassword,
      );

      const invitationLink = `${mailConfig.baseUrl}/register?token=${token}`;

      await this.emailService.sendInvitationEmail(
        userDetails.email,
        userDetails.firstName,
        userDetails.lastName,
        invitationLink,
        defaultPassword,
      );

      return TOAST_MSGS.INVITATION_SENT;
    } catch (error) {
      throw new AuthenticationError(
        error.message || TOAST_MSGS.FAILED_TO_SEND_INVITATION,
        'INVITATION_FAILED',
      );
    }
  }

  public async changeDefaultPassword(
    token: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<string> {
    const decodedToken = this.tokenService.verifyToken<InvitationDto>(token);
    const invitation = await this.validateInvitation(decodedToken.email);

    await this.passwordPolicy.validate(changePasswordDto.newPassword);

    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);
    invitation.defaultPassword = hashedPassword;

    await this.invitationRepository.save(invitation);
    return TOAST_MSGS.DEFAULT_PASSWORD_CHANGED_SUCCESSFULLY;
  }

  public async register(
    token: string,
    registerDto: UserRegistrationDto,
  ): Promise<{
    message: string;
    user: Partial<User>;
  }> {
    const invitation = await this.validateRegistrationToken(token);
    const decodedToken = this.tokenService.verifyToken<InvitationDto>(token);

    this.validateRegistrationData(decodedToken, registerDto);

    invitation.usedAt = new Date();
    await this.invitationRepository.save(invitation);

    const user = this.userRepository.create({
      email: registerDto.email,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      role: registerDto.role,
      password: invitation.defaultPassword,
    });

    await this.userRepository.save(user);

    await this.createRoleSpecificProfile(registerDto, user);

    return {
      message: TOAST_MSGS.REGISTRATION_SUCCESSFUL,
      user: this.sanitizeUser(user),
    };
  }

  private async createInvitation(
    userDetails: InvitationDto,
    token: string,
    defaultPassword: string,
  ): Promise<Invitation> {
    const invitation = this.invitationRepository.create({
      email: userDetails.email,
      firstName: userDetails.firstName,
      lastName: userDetails.lastName,
      token,
      role: userDetails.role,
      defaultPassword,
    });

    try {
      return await this.invitationRepository.save(invitation);
    } catch (error) {
      throw new AuthenticationError(
        TOAST_MSGS.ERROR_SENDING_INVITATION,
        'INVITATION_ERROR',
      );
    }
  }

  private generateTemporaryPassword(): string {
    return crypto.randomBytes(12).toString('hex');
  }

  private async validateInvitation(email: string): Promise<Invitation> {
    const invitation = await this.invitationRepository.findOne({
      where: { email },
    });

    if (!invitation) {
      throw new AuthenticationError(
        TOAST_MSGS.INVALID_INVITATION_TOKEN,
        'INVALID_INVITATION',
      );
    }

    const validationConditions = [
      {
        condition: invitation.usedAt,
        message: TOAST_MSGS.INVITATION_USED,
        description: 'INVITATION_USED',
      },
    ];

    for (const { condition, message, description } of validationConditions) {
      if (condition) {
        throw new AuthenticationError(message, description);
      }
    }

    return invitation;
  }

  private async validateRegistrationToken(token: string): Promise<Invitation> {
    const invitation = await this.invitationRepository.findOne({
      where: { token },
    });

    if (!invitation) {
      throw new AuthenticationError(
        TOAST_MSGS.INVALID_INVITATION_TOKEN,
        'INVALID_INVITATION',
      );
    }

    const validationConditions = [
      {
        condition: !invitation.defaultPassword,
        message: TOAST_MSGS.DEFAULT_PASSWORD_UNCHANGED,
        code: 'PASSWORD_UNCHANGED',
      },
      {
        condition: invitation.usedAt,
        message: TOAST_MSGS.INVITATION_USED,
        description: 'INVITATION_USED',
      },
    ];

    for (const { condition, message, description } of validationConditions) {
      if (condition) {
        throw new AuthenticationError(message, description);
      }
    }

    return invitation;
  }

  private validateRegistrationData(
    decodedToken: InvitationDto,
    registerDto: UserRegistrationDto,
  ): void {
    if (decodedToken.email !== registerDto.email) {
      throw new AuthenticationError(
        TOAST_MSGS.EMAIL_MISMATCH,
        'EMAIL_MISMATCH',
      );
    }

    if (decodedToken.role !== registerDto.role) {
      throw new AuthenticationError(TOAST_MSGS.ROLE_MISMATCH, 'ROLE_MISMATCH');
    }
  }

  private async createRoleSpecificProfile(
    registerDto: UserRegistrationDto,
    user: User,
  ): Promise<void> {
    const profileCreator = this.profileCreatorFactory.getCreator(
      registerDto.role,
    );
    await profileCreator.createProfile(registerDto, user);
  }

  private sanitizeUser(user: User): Partial<User> {
    return {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };
  }
}
